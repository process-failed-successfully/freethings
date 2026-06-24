import unittest
from unittest.mock import patch, MagicMock, mock_open
import json
import os
import sys

# Add the root directory to sys.path to import serve.py
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import serve

class TestFreeThingsHTTPRequestHandler(unittest.TestCase):
    def setUp(self):
        self.mock_request = MagicMock()
        self.mock_client_address = ('127.0.0.1', 12345)
        self.mock_server = MagicMock()

        # Patching SimpleHTTPRequestHandler methods to avoid side effects during initialization
        with patch('http.server.SimpleHTTPRequestHandler.__init__', return_value=None):
            self.handler = serve.FreeThingsHTTPRequestHandler(
                self.mock_request, self.mock_client_address, self.mock_server
            )

        # Mocking methods used in the handler
        self.handler.send_response = MagicMock()
        self.handler.send_header = MagicMock()
        self.handler.end_headers = MagicMock()
        self.handler.wfile = MagicMock()
        self.handler.rfile = MagicMock()
        self.handler.headers = MagicMock()
        self.handler.path = '/'
        self.handler.translate_path = MagicMock(return_value='/mock/path')

    def test_end_headers(self):
        # We need to test FreeThingsHTTPRequestHandler.end_headers specifically.
        # When calling self.handler.end_headers(), it will call its own implementation.
        with patch('http.server.SimpleHTTPRequestHandler.end_headers') as mock_super_end_headers:
            # We must NOT mock self.handler.end_headers if we want to test it
            # But in setUp we DID mock it: self.handler.end_headers = MagicMock()
            # Let's fix that by deleting the mock on the instance for this test
            del self.handler.end_headers

            self.handler.end_headers()

            # Check if custom headers were sent
            self.handler.send_header.assert_any_call('Access-Control-Allow-Origin', '*')
            self.handler.send_header.assert_any_call('Cache-Control', 'no-cache, no-store, must-revalidate')
            # Check if super().end_headers() was called
            mock_super_end_headers.assert_called_once()

    def test_do_OPTIONS(self):
        self.handler.do_OPTIONS()
        self.handler.send_response.assert_called_with(200)
        self.handler.send_header.assert_any_call('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.handler.send_header.assert_any_call('Access-Control-Allow-Headers', 'Content-Type')
        self.handler.end_headers.assert_called_once()

    @patch('builtins.open', new_callable=mock_open, read_data='[{"id": "test-book", "pages": [{"replace": false}]}]')
    @patch('json.dump')
    def test_do_POST_tag_replace_success(self, mock_json_dump, mock_file):
        self.handler.path = '/api/tag-replace'
        post_data = json.dumps({'book_id': 'test-book', 'page_index': 0}).encode('utf-8')
        self.handler.headers.get.return_value = str(len(post_data))
        self.handler.rfile.read.return_value = post_data

        self.handler.do_POST()

        self.handler.send_response.assert_called_with(200)
        self.handler.send_header.assert_called_with('Content-Type', 'application/json')
        self.handler.wfile.write.assert_called_with(b'{"status":"ok"}')

        # Verify JSON update
        mock_json_dump.assert_called_once()
        updated_data = mock_json_dump.call_args[0][0]
        self.assertTrue(updated_data[0]['pages'][0]['replace'])

    @patch('builtins.open', side_effect=Exception("File error"))
    def test_do_POST_tag_replace_error(self, mock_file):
        self.handler.path = '/api/tag-replace'
        self.handler.headers.get.return_value = '2'
        self.handler.rfile.read.return_value = b'{}'

        self.handler.do_POST()

        self.handler.send_response.assert_called_with(500)
        self.handler.send_header.assert_called_with('Content-Type', 'application/json')

    def test_do_POST_404(self):
        self.handler.path = '/unknown'
        self.handler.do_POST()
        self.handler.send_response.assert_called_with(404)

    @patch('os.path.isdir', return_value=True)
    def test_do_GET_redirect_trailing_slash(self, mock_isdir):
        self.handler.path = '/tools'
        self.handler.do_GET()
        self.handler.send_response.assert_called_with(301)
        self.handler.send_header.assert_called_with('Location', '/tools/')

    @patch('os.path.exists', return_value=True)
    @patch('os.path.isdir', return_value=False)
    @patch('http.server.SimpleHTTPRequestHandler.do_GET')
    def test_do_GET_index_html_resolution(self, mock_super_get, mock_isdir, mock_exists):
        # Path with trailing slash should look for index.html
        self.handler.path = '/tools/'
        # translate_path for /tools/index.html must return a path that exists
        self.handler.translate_path.side_effect = lambda p: '/mock/path/index.html' if 'index.html' in p else '/mock/path/'

        self.handler.do_GET()
        self.assertEqual(self.handler.path, '/tools/index.html')
        mock_super_get.assert_called_once()

    def test_log_message_filters_noise(self):
        with patch('http.server.SimpleHTTPRequestHandler.log_message') as mock_super_log:
            # 200 OK should be filtered
            self.handler.log_message("format", "GET / HTTP/1.1", "200")
            mock_super_log.assert_not_called()

            # 404 Not Found should be logged
            self.handler.log_message("format", "GET /bad HTTP/1.1", "404")
            mock_super_log.assert_called_once()

    def test_log_message_no_args(self):
        with patch('http.server.SimpleHTTPRequestHandler.log_message') as mock_super_log:
            self.handler.log_message("format")
            mock_super_log.assert_called_once()

class TestMain(unittest.TestCase):
    @patch('socketserver.TCPServer')
    @patch('os.chdir')
    @patch('sys.argv', ['serve.py', '9000'])
    def test_main_custom_port(self, mock_chdir, mock_server):
        mock_server_instance = mock_server.return_value.__enter__.return_value
        mock_server_instance.serve_forever.side_effect = KeyboardInterrupt

        with patch('builtins.print'):
            serve.main()

        mock_server.assert_called_with(("", 9000), serve.FreeThingsHTTPRequestHandler)
        mock_chdir.assert_called_once()

    @patch('socketserver.TCPServer')
    @patch('os.chdir')
    @patch('sys.argv', ['serve.py'])
    def test_main_default_port(self, mock_chdir, mock_server):
        mock_server_instance = mock_server.return_value.__enter__.return_value
        mock_server_instance.serve_forever.side_effect = KeyboardInterrupt

        with patch('builtins.print'):
            serve.main()

        mock_server.assert_called_with(("", 8000), serve.FreeThingsHTTPRequestHandler)

if __name__ == '__main__':
    unittest.main()
