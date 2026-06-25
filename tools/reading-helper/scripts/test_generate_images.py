import unittest
from unittest.mock import MagicMock, patch, mock_open
import os
import json
import sys
import tempfile
import shutil

# Mocking heavy dependencies before they are imported by generate_images
mock_torch = MagicMock()
mock_diffusers = MagicMock()
mock_transformers = MagicMock()
mock_pil = MagicMock()
mock_requests = MagicMock()

sys.modules['torch'] = mock_torch
sys.modules['diffusers'] = mock_diffusers
sys.modules['diffusers.utils'] = MagicMock()
sys.modules['PIL'] = mock_pil
sys.modules['transformers'] = mock_transformers
sys.modules['requests'] = mock_requests

# Add the directory containing generate_images.py to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Now we can safely import the script under test
import generate_images

class TestGenerateImages(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.manifest_path = os.path.join(self.test_dir, 'books_manifest.json')
        self.workspace_root = self.test_dir
        self.images_dir = os.path.join(self.test_dir, 'images')
        os.makedirs(self.images_dir, exist_ok=True)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_manifest_not_found(self):
        with patch('builtins.print') as mocked_print:
            generate_images.main(manifest_path='/non/existent/path', workspace_root=self.workspace_root)
            mocked_print.assert_any_call(f"Manifest not found at /non/existent/path. Please create it to define books and prompts.")

    def test_all_up_to_date(self):
        books = [
            {
                "id": "book1",
                "pages": [
                    {"image": "images/page1.png", "prompt": "prompt1"}
                ]
            }
        ]
        with open(self.manifest_path, 'w') as f:
            json.dump(books, f)

        # Create the image so it's "up to date"
        open(os.path.join(self.workspace_root, "images/page1.png"), 'w').close()

        with patch('builtins.print') as mocked_print:
            generate_images.main(manifest_path=self.manifest_path, workspace_root=self.workspace_root)
            mocked_print.assert_any_call("All book images are up to date. Nothing to generate.")

    @patch('sys.exit')
    def test_missing_openrouter_key(self, mock_exit):
        books = [
            {
                "id": "book1",
                "pages": [
                    {"image": "images/page1.png", "prompt": "prompt1"}
                ]
            }
        ]
        with open(self.manifest_path, 'w') as f:
            json.dump(books, f)

        # Ensure image doesn't exist

        with patch.dict(os.environ, {}, clear=True):
            generate_images.main(manifest_path=self.manifest_path, workspace_root=self.workspace_root)

        mock_exit.assert_called_with(1)

    def test_full_flow(self):
        mock_post = MagicMock()
        mock_get = MagicMock()
        sys.modules['requests'].post = mock_post
        sys.modules['requests'].get = mock_get
        books = [
            {
                "id": "book1",
                "pages": [
                    {"image": "images/page1.png", "prompt": "prompt1", "replace": True}
                ]
            }
        ]
        with open(self.manifest_path, 'w') as f:
            json.dump(books, f)

        # Mock Phase 1 (LLM Enhancement)
        mock_tokenizer = MagicMock()
        mock_model = MagicMock()

        # Mocking transformers classes used in main
        with patch('transformers.AutoTokenizer.from_pretrained', return_value=mock_tokenizer), \
             patch('transformers.AutoModelForCausalLM.from_pretrained', return_value=mock_model):

            # Setup Phase 1 outputs
            mock_tokenizer.apply_chat_template.return_value = "templated text"
            mock_model_inputs = MagicMock()
            mock_model_inputs.input_ids = [MagicMock()]
            mock_tokenizer.return_value.to.return_value = mock_model_inputs
            mock_model.device = "cpu"
            mock_model.generate.return_value = [MagicMock()] # dummy generated ids
            mock_tokenizer.batch_decode.return_value = ['{"enhanced_prompt": "enhanced prompt1", "ip_adapter_scale": 0.5}']

            # Mock Phase 2 (OpenRouter Flux Generation)
            with patch.dict(os.environ, {"OPENROUTER_API_KEY": "fake_key"}):
                # Mock OpenRouter response
                mock_post_resp = MagicMock()
                mock_post_resp.json.return_value = {
                    'choices': [{
                        'message': {
                            'content': 'Check out this image: ![img](https://fakeurl.com/img.png)'
                        }
                    }]
                }
                mock_post.return_value = mock_post_resp

                # Mock Image download
                mock_get_resp = MagicMock()
                mock_get_resp.content = b"fake image data"
                mock_get.return_value = mock_get_resp

                generate_images.main(manifest_path=self.manifest_path, workspace_root=self.workspace_root)

        # Verifications
        self.assertTrue(os.path.exists(os.path.join(self.workspace_root, "images/page1.png")))
        with open(os.path.join(self.workspace_root, "images/page1.png"), 'rb') as f:
            self.assertEqual(f.read(), b"fake image data")

        # Verify manifest was updated (replace flag removed)
        with open(self.manifest_path, 'r') as f:
            updated_books = json.load(f)
            self.assertNotIn('replace', updated_books[0]['pages'][0])

if __name__ == '__main__':
    unittest.main()
