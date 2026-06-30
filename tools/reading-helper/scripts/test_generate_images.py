import base64
import json
import os
import shutil
import sys
import tempfile
import unittest
from unittest.mock import MagicMock, patch

# ---------------------------------------------------------------------------
# Stub out heavy ML dependencies before importing the module under test
# ---------------------------------------------------------------------------
mock_torch = MagicMock()
mock_transformers = MagicMock()
mock_requests = MagicMock()

sys.modules['torch'] = mock_torch
sys.modules['diffusers'] = MagicMock()
sys.modules['diffusers.utils'] = MagicMock()
sys.modules['PIL'] = MagicMock()
sys.modules['transformers'] = mock_transformers
sys.modules['requests'] = mock_requests

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

import generate_images


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
FAKE_IMAGE_BYTES = b"fake image data"
FAKE_B64 = base64.b64encode(FAKE_IMAGE_BYTES).decode()


def _make_api_response(b64: str = FAKE_B64) -> MagicMock:
    """Mimic the /api/v1/images response: { "data": [{ "b64_json": "..." }] }"""
    resp = MagicMock()
    resp.json.return_value = {"data": [{"b64_json": b64}]}
    return resp


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------
class TestGenerateImages(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.manifest_path = os.path.join(self.test_dir, 'books_manifest.json')
        self.workspace_root = self.test_dir
        os.makedirs(os.path.join(self.test_dir, 'images'), exist_ok=True)
        # Reset mocks between tests to prevent call count / side_effect bleed-through
        mock_requests.reset_mock()
        mock_torch.reset_mock()
        mock_transformers.reset_mock()
        mock_requests.post.side_effect = None
        mock_requests.get.side_effect = None

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    # ------------------------------------------------------------------
    # Utility helpers
    # ------------------------------------------------------------------
    def _write_manifest(self, books):
        with open(self.manifest_path, 'w') as f:
            json.dump(books, f)

    def _image_path(self, rel):
        return os.path.join(self.workspace_root, rel)

    def _create_image(self, rel, content=b"existing image"):
        path = self._image_path(rel)
        with open(path, 'wb') as f:
            f.write(content)
        return path

    # ------------------------------------------------------------------
    # Basic flow tests
    # ------------------------------------------------------------------
    def test_manifest_not_found(self):
        with patch('builtins.print') as mock_print:
            generate_images.main(manifest_path='/non/existent/path', workspace_root=self.workspace_root)
            mock_print.assert_any_call(
                "Manifest not found at /non/existent/path. Please create it to define books and prompts."
            )

    def test_all_up_to_date(self):
        books = [{"id": "book1", "pages": [{"image": "images/page1.png", "prompt": "p1"}]}]
        self._write_manifest(books)
        self._create_image("images/page1.png")

        mock_requests.post.return_value = _make_api_response()
        with patch.dict(os.environ, {"OPENROUTER_API_KEY": "fake_key"}):
            with patch('builtins.print') as mock_print:
                generate_images.main(manifest_path=self.manifest_path, workspace_root=self.workspace_root)
                mock_print.assert_any_call("All book images are up to date. Nothing to generate.")

    @patch('sys.exit')
    def test_missing_openrouter_key_exits(self, mock_exit):
        books = [{"id": "book1", "pages": [{"image": "images/page1.png", "prompt": "p1"}]}]
        self._write_manifest(books)

        with patch.dict(os.environ, {}, clear=True):
            generate_images.main(manifest_path=self.manifest_path, workspace_root=self.workspace_root)

        mock_exit.assert_called_with(1)

    # ------------------------------------------------------------------
    # API correctness: endpoint, payload, response
    # ------------------------------------------------------------------
    def test_uses_correct_image_api_endpoint(self):
        """POST must go to https://openrouter.ai/api/v1/images"""
        books = [{"id": "book1", "pages": [{"image": "images/page1.png", "prompt": "p1"}]}]
        self._write_manifest(books)
        mock_requests.post.return_value = _make_api_response()

        with patch.dict(os.environ, {"OPENROUTER_API_KEY": "fake_key"}):
            generate_images.main(manifest_path=self.manifest_path, workspace_root=self.workspace_root)

        call_url = mock_requests.post.call_args[0][0]
        self.assertEqual(call_url, generate_images.OPENROUTER_IMAGE_API)
        self.assertIn("/api/v1/images", call_url)

    def test_payload_has_model_and_prompt_no_messages(self):
        """Payload must have 'model' and 'prompt' — NOT 'messages' or 'modalities'."""
        books = [{"id": "book1", "pages": [{"image": "images/page1.png", "prompt": "my prompt"}]}]
        self._write_manifest(books)
        mock_requests.post.return_value = _make_api_response()

        with patch.dict(os.environ, {"OPENROUTER_API_KEY": "fake_key"}):
            generate_images.main(manifest_path=self.manifest_path, workspace_root=self.workspace_root)

        payload = mock_requests.post.call_args[1]['json']
        self.assertEqual(payload['model'], generate_images.FLUX_MODEL)
        self.assertIn('prompt', payload)
        self.assertNotIn('messages', payload)
        self.assertNotIn('modalities', payload)

    def test_response_decoded_from_b64_json(self):
        """Image must be saved by decoding data[0].b64_json — no secondary HTTP GET."""
        books = [{"id": "book1", "pages": [{"image": "images/page1.png", "prompt": "p1"}]}]
        self._write_manifest(books)
        mock_requests.post.return_value = _make_api_response(FAKE_B64)

        with patch.dict(os.environ, {"OPENROUTER_API_KEY": "fake_key"}):
            generate_images.main(manifest_path=self.manifest_path, workspace_root=self.workspace_root)

        out = self._image_path("images/page1.png")
        self.assertTrue(os.path.exists(out))
        with open(out, 'rb') as f:
            self.assertEqual(f.read(), FAKE_IMAGE_BYTES)

        # No extra GET should be needed (image comes from b64 in the POST response)
        self.assertEqual(mock_requests.get.call_count, 0)

    # ------------------------------------------------------------------
    # input_references schema (from official API docs)
    # ------------------------------------------------------------------
    def test_first_page_has_no_input_references(self):
        """First page must not include input_references in the payload."""
        books = [{"id": "book1", "pages": [{"image": "images/page1.png", "prompt": "p1"}]}]
        self._write_manifest(books)
        mock_requests.post.return_value = _make_api_response()

        with patch.dict(os.environ, {"OPENROUTER_API_KEY": "fake_key"}):
            generate_images.main(manifest_path=self.manifest_path, workspace_root=self.workspace_root)

        payload = mock_requests.post.call_args[1]['json']
        self.assertNotIn('input_references', payload)

    def test_second_page_includes_input_references_with_correct_schema(self):
        """
        Page 2 must include input_references with the exact ContentPartImage schema:
          [{ "image_url": { "url": "data:image/...;base64,..." } }]
        No "type" field — per the official OpenRouter API spec.
        """
        books = [{
            "id": "book1",
            "pages": [
                {"image": "images/page1.png", "prompt": "p1"},
                {"image": "images/page2.png", "prompt": "p2"},
            ]
        }]
        self._write_manifest(books)
        self._create_image("images/page1.png", content=b"page1 image data")
        mock_requests.post.return_value = _make_api_response()

        with patch.dict(os.environ, {"OPENROUTER_API_KEY": "fake_key"}):
            generate_images.main(manifest_path=self.manifest_path, workspace_root=self.workspace_root)

        # Only one POST (page 2; page 1 exists already)
        self.assertEqual(mock_requests.post.call_count, 1)
        payload = mock_requests.post.call_args[1]['json']

        # input_references must be present and well-formed
        self.assertIn('input_references', payload)
        refs = payload['input_references']
        self.assertEqual(len(refs), 1)

        ref = refs[0]
        # Zod validation requires "type": "image_url" in each input_reference item
        self.assertEqual(ref.get('type'), 'image_url')
        self.assertIn('image_url', ref)

        url = ref['image_url']['url']
        self.assertTrue(url.startswith("data:image/"))
        decoded = base64.b64decode(url.split(",", 1)[1])
        self.assertEqual(decoded, b"page1 image data")

    def test_newly_generated_page_becomes_reference_for_next(self):
        """A page generated this run should be used as the reference for the subsequent page."""
        books = [{
            "id": "book1",
            "pages": [
                {"image": "images/page1.png", "prompt": "p1"},
                {"image": "images/page2.png", "prompt": "p2"},
                {"image": "images/page3.png", "prompt": "p3"},
            ]
        }]
        self._write_manifest(books)
        mock_requests.post.return_value = _make_api_response()

        with patch.dict(os.environ, {"OPENROUTER_API_KEY": "fake_key"}):
            generate_images.main(manifest_path=self.manifest_path, workspace_root=self.workspace_root)

        self.assertEqual(mock_requests.post.call_count, 3)
        all_calls = mock_requests.post.call_args_list

        p1_payload = all_calls[0][1]['json']
        p2_payload = all_calls[1][1]['json']
        p3_payload = all_calls[2][1]['json']

        # Page 1: no reference
        self.assertNotIn('input_references', p1_payload)
        # Page 2: has reference
        self.assertIn('input_references', p2_payload)
        # Page 3: has reference
        self.assertIn('input_references', p3_payload)

        # All images saved
        for rel in ["images/page1.png", "images/page2.png", "images/page3.png"]:
            self.assertTrue(os.path.exists(self._image_path(rel)))

    # ------------------------------------------------------------------
    # Manifest cleanup
    # ------------------------------------------------------------------
    def test_replace_flag_removed_after_generation(self):
        books = [{"id": "book1", "pages": [{"image": "images/page1.png", "prompt": "p1", "replace": True}]}]
        self._write_manifest(books)
        mock_requests.post.return_value = _make_api_response()

        with patch.dict(os.environ, {"OPENROUTER_API_KEY": "fake_key"}):
            generate_images.main(manifest_path=self.manifest_path, workspace_root=self.workspace_root)

        with open(self.manifest_path) as f:
            updated = json.load(f)
        self.assertNotIn('replace', updated[0]['pages'][0])

    # ------------------------------------------------------------------
    # Error resilience
    # ------------------------------------------------------------------
    def test_api_failure_is_non_fatal(self):
        """A failed API call should print an error but not crash the whole run."""
        books = [{
            "id": "book1",
            "pages": [
                {"image": "images/page1.png", "prompt": "p1"},
                {"image": "images/page2.png", "prompt": "p2"},
            ]
        }]
        self._write_manifest(books)

        # All pages fail — each gets max_retries attempts so there are 3 POSTs for page1 (fail),
        # then 3 POSTs for page2 (ok on first). We just need page2 to be saved.
        fail_resp = MagicMock()
        fail_resp.ok = False
        fail_resp.status_code = 500
        fail_resp.json.return_value = {"error": {"message": "server error"}}
        ok_resp = _make_api_response()
        ok_resp.ok = True
        # page1: 3 failures (max_retries=3), page2: success on first attempt
        mock_requests.post.side_effect = [fail_resp, fail_resp, fail_resp, ok_resp]

        with patch('time.sleep'):  # don't actually sleep in tests
            with patch.dict(os.environ, {"OPENROUTER_API_KEY": "fake_key"}):
                with patch('builtins.print') as mock_print:
                    generate_images.main(manifest_path=self.manifest_path, workspace_root=self.workspace_root)

        # Page 2 should still be saved despite page 1 failing
        self.assertTrue(os.path.exists(self._image_path("images/page2.png")))
        error_calls = [str(c) for c in mock_print.call_args_list if "Failed" in str(c)]
        self.assertGreater(len(error_calls), 0)


    # ------------------------------------------------------------------
    # Unit tests for retry helpers
    # ------------------------------------------------------------------
    def test_strip_sd_weights(self):
        self.assertEqual(
            generate_images._strip_sd_weights("A dragon stands tall (dragon:1.5) in a cave"),
            "A dragon stands tall dragon in a cave"
        )
        self.assertEqual(
            generate_images._strip_sd_weights("No weights here"),
            "No weights here"
        )
        self.assertEqual(
            generate_images._strip_sd_weights("(green snot:1.5) dripping from a troll"),
            "green snot dripping from a troll"
        )

    def test_is_moderation_error(self):
        moderation_body = {"error": {"message": "Request Moderated", "code": 400}}
        other_body = {"error": {"message": "Internal Server Error"}}
        self.assertTrue(generate_images._is_moderation_error(moderation_body))
        self.assertFalse(generate_images._is_moderation_error(other_body))

    def test_moderation_retries_with_simpler_prompt(self):
        """On a moderation hit, the next attempt uses a stripped/simpler prompt."""
        moderation_resp = MagicMock()
        moderation_resp.ok = False
        moderation_resp.status_code = 400
        moderation_resp.json.return_value = {
            "error": {"message": "Request Moderated", "code": 400}
        }
        ok_resp = _make_api_response()
        ok_resp.ok = True
        mock_requests.post.side_effect = [moderation_resp, ok_resp]

        result = generate_images._generate_image(
            openrouter_key="fake_key",
            prompt="A dragon in the woods (dragon:1.5)",
            reference_image_path=None,
            max_retries=3,
        )
        self.assertEqual(result, FAKE_IMAGE_BYTES)
        self.assertEqual(mock_requests.post.call_count, 2)

        # First attempt uses the weighted prompt
        first_prompt = mock_requests.post.call_args_list[0][1]['json']['prompt']
        self.assertIn('(dragon:1.5)', first_prompt)

        # Second attempt uses the stripped prompt
        second_prompt = mock_requests.post.call_args_list[1][1]['json']['prompt']
        self.assertNotIn('(dragon:1.5)', second_prompt)
        self.assertIn('dragon', second_prompt)

    def test_rate_limit_retries_with_backoff(self):
        """On a 429, the function retries after a backoff delay."""
        rate_limit_resp = MagicMock()
        rate_limit_resp.ok = False
        rate_limit_resp.status_code = 429
        rate_limit_resp.json.return_value = {"error": {"message": "rate limit"}}
        ok_resp = _make_api_response()
        ok_resp.ok = True
        mock_requests.post.side_effect = [rate_limit_resp, ok_resp]

        with patch('time.sleep') as mock_sleep:
            result = generate_images._generate_image(
                openrouter_key="fake_key",
                prompt="A troll under a bridge",
                reference_image_path=None,
                max_retries=3,
            )

        self.assertEqual(result, FAKE_IMAGE_BYTES)
        self.assertEqual(mock_requests.post.call_count, 2)
        mock_sleep.assert_called_once()  # one sleep between the two attempts

    def test_non_retryable_400_fails_immediately(self):
        """A non-moderation 400 (e.g., bad schema) should fail immediately without retrying."""
        bad_req_resp = MagicMock()
        bad_req_resp.ok = False
        bad_req_resp.status_code = 400
        bad_req_resp.json.return_value = {"error": {"message": "invalid_value in prompt"}}
        mock_requests.post.return_value = bad_req_resp

        with self.assertRaises(RuntimeError):
            generate_images._generate_image(
                openrouter_key="fake_key",
                prompt="A troll",
                reference_image_path=None,
                max_retries=3,
            )
        # Should fail after first attempt, not retry
        self.assertEqual(mock_requests.post.call_count, 1)

    def test_local_generation(self):
        """When local=True, should load local pipeline and generate images locally without calling requests."""
        books = [{"id": "book1", "pages": [{"image": "images/page1.png", "prompt": "p1"}]}]
        self._write_manifest(books)

        # Mock the pipeline instance and returned image
        mock_pipe_instance = MagicMock()
        mock_image = MagicMock()
        mock_pipe_instance.return_value.images = [mock_image]
        
        with patch('diffusers.AutoPipelineForText2Image.from_pretrained', return_value=mock_pipe_instance) as mock_from_pretrained:
            generate_images.main(manifest_path=self.manifest_path, workspace_root=self.workspace_root, local=True)
            
            # Verify the pipeline factory was called
            mock_from_pretrained.assert_called_once()
            # Verify the pipeline was called to generate the image
            mock_pipe_instance.assert_called_once()
            # Verify no HTTP POST requests were sent to OpenRouter
            self.assertEqual(mock_requests.post.call_count, 0)
            # Verify the generated image was saved to disk
            mock_image.save.assert_called_once()

    def test_local_generation_with_reference(self):
        """When local=True and a previous page image exists, should load and pass the reference image using IP-Adapter."""
        books = [{
            "id": "book1",
            "pages": [
                {"image": "images/page1.png", "prompt": "p1"},
                {"image": "images/page2.png", "prompt": "p2"},
            ]
        }]
        self._write_manifest(books)
        self._create_image("images/page1.png", content=b"fake page 1 image data")

        # Mock the pipeline instance and returned image
        mock_pipe_instance = MagicMock()
        # Mock set_ip_adapter_scale so hasattr(local_pipe, "set_ip_adapter_scale") returns True
        mock_pipe_instance.set_ip_adapter_scale = MagicMock()
        mock_image = MagicMock()
        mock_pipe_instance.return_value.images = [mock_image]
        
        with patch('diffusers.AutoPipelineForText2Image.from_pretrained', return_value=mock_pipe_instance) as mock_from_pretrained:
            with patch('diffusers.utils.load_image', return_value="loaded_image") as mock_load_image:
                generate_images.main(manifest_path=self.manifest_path, workspace_root=self.workspace_root, local=True)
                
                # Check load_ip_adapter was called
                mock_pipe_instance.load_ip_adapter.assert_called_once()
                # Check set_ip_adapter_scale was called
                mock_pipe_instance.set_ip_adapter_scale.assert_called_once_with(0.6)
                # Check local_pipe was called with ip_adapter_image
                mock_pipe_instance.assert_called_once()
                kwargs = mock_pipe_instance.call_args[1]
                self.assertEqual(kwargs["ip_adapter_image"], "loaded_image")


if __name__ == '__main__':
    unittest.main()


