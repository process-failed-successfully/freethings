#!/usr/bin/env python3
import os
import re
import hashlib

# Target file extensions that represent assets we want to cache bust
ASSET_EXTENSIONS = ['js', 'css', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'json', 'woff', 'woff2', 'ttf', 'eot']
ext_pattern = '|'.join(ASSET_EXTENSIONS)

# Regex to match asset paths in different formats (double quotes, single quotes, or CSS url())
# Group 1 will extract the base path of the asset
DOUBLE_QUOTE_RE = re.compile(rf'"([^"\s]+\.(?:{ext_pattern}))(?:\?[^"]*)?"')
SINGLE_QUOTE_RE = re.compile(rf"'([^'\s]+\.(?:{ext_pattern}))(?:\?[^']*)?'")
CSS_URL_RE = re.compile(rf"url\(\s*['\"]?([^'\")\s]+\.(?:{ext_pattern}))(?:\?[^'\")\s]*)?['\"]?\s*\)")

def get_file_hash(filepath):
    """Compute MD5 hash of a file's contents."""
    hasher = hashlib.md5()
    try:
        with open(filepath, 'rb') as f:
            buf = f.read(65536)
            while len(buf) > 0:
                hasher.update(buf)
                buf = f.read(65536)
        return hasher.hexdigest()[:10]
    except Exception as e:
        print(f"Error hashing {filepath}: {e}")
        return None

def process_file(file_path, base_dir):
    """Scan and update asset references within a file (HTML, CSS, JS)."""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    file_dir = os.path.dirname(file_path)
    modified = False

    # Function to replace matched paths with versioned query parameter
    def replace_match(match, quote_char='"', is_css_url=False):
        nonlocal modified
        orig_ref = match.group(0)
        path = match.group(1)

        # Ignore external URLs
        if path.startswith(('http://', 'https://', '//', 'data:')):
            return orig_ref

        # Resolve path
        if path.startswith('/'):
            resolved_path = os.path.join(base_dir, path.lstrip('/'))
        else:
            resolved_path = os.path.abspath(os.path.join(file_dir, path))

        # Check if the resolved file exists in our build directory
        if os.path.exists(resolved_path) and os.path.isfile(resolved_path):
            file_hash = get_file_hash(resolved_path)
            if file_hash:
                versioned_path = f"{path}?v={file_hash}"
                modified = True
                if is_css_url:
                    return f"url('{versioned_path}')"
                else:
                    return f"{quote_char}{versioned_path}{quote_char}"
        
        return orig_ref

    # Replace double-quoted strings
    new_content = DOUBLE_QUOTE_RE.sub(lambda m: replace_match(m, quote_char='"'), content)
    if new_content != content:
        content = new_content
        modified = True

    # Replace single-quoted strings
    new_content = SINGLE_QUOTE_RE.sub(lambda m: replace_match(m, quote_char="'"), content)
    if new_content != content:
        content = new_content
        modified = True

    # Replace CSS url() patterns
    new_content = CSS_URL_RE.sub(lambda m: replace_match(m, is_css_url=True), content)
    if new_content != content:
        content = new_content
        modified = True

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Busted cache references in: {os.path.relpath(file_path, base_dir)}")

def main():
    dist_dir = os.path.abspath('dist')
    if not os.path.exists(dist_dir):
        print("Error: 'dist' directory not found. Please run build.sh first.")
        return

    print("Running selective cache invalidation / cache busting...")
    for root, _, files in os.walk(dist_dir):
        for file in files:
            if file.endswith(('.html', '.js', '.css')):
                process_file(os.path.join(root, file), dist_dir)

if __name__ == '__main__':
    main()
