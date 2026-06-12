#!/usr/bin/env python3
"""
Custom HTTP server for FreeThings.win development
Fixes path resolution issues with Python's default http.server
"""
import http.server
import socketserver
import os
import sys
import json
from urllib.parse import unquote, urlparse

class FreeThingsHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler that fixes path resolution issues"""
    
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        if self.path == '/api/tag-replace':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body.decode('utf-8'))
                book_id = data.get('book_id')
                page_index = data.get('page_index')
                
                manifest_path = 'tools/reading-helper/books_manifest.json'
                with open(manifest_path, 'r', encoding='utf-8') as f:
                    books = json.load(f)
                
                for book in books:
                    if book.get('id') == book_id:
                        pages = book.get('pages', [])
                        if 0 <= page_index < len(pages):
                            pages[page_index]['replace'] = True
                            break
                
                with open(manifest_path, 'w', encoding='utf-8') as f:
                    json.dump(books, f, indent=4, ensure_ascii=False)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status":"ok"}')
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_GET(self):
        # Parse the requested path
        parsed_path = urlparse(self.path)
        path = unquote(parsed_path.path)
        
        # Handle directory requests - ensure trailing slash
        if not path.endswith('/') and os.path.isdir(self.translate_path(path)):
            # Redirect to version with trailing slash
            self.send_response(301)
            self.send_header('Location', path + '/')
            self.end_headers()
            return
        
        # Handle directory index files
        if path.endswith('/'):
            index_path = path + 'index.html'
            if os.path.exists(self.translate_path(index_path)):
                self.path = index_path
        
        # Call parent handler
        super().do_GET()
    
    def translate_path(self, path):
        """Translate URL path to filesystem path"""
        # Use parent implementation but ensure we're in the right directory
        # The parent class handles path translation correctly
        return super().translate_path(path)
    
    def log_message(self, format, *args):
        """Custom logging to show what's being served"""
        # Only log errors (4xx, 5xx) to reduce noise
        if len(args) >= 2:
            status_code = args[1]
            if status_code.startswith(('4', '5')):
                super().log_message(format, *args)
        else:
            super().log_message(format, *args)

def main():
    PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    
    # Change to the directory where this script is located
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Handler = FreeThingsHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"FreeThings.win Development Server")
        print(f"Server running at http://localhost:{PORT}/")
        print(f"Serving from: {os.getcwd()}")
        print(f"Press Ctrl+C to stop the server")
        print("")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == '__main__':
    main()

