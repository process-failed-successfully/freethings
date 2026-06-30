#!/bin/bash
set -e

echo "Building site for deployment..."

# Clean/create dist directory
rm -rf dist
mkdir -p dist

# Copy all files first (except dist itself to avoid recursion)
if command -v rsync >/dev/null 2>&1; then
  rsync -a --exclude='dist' --exclude='node_modules' --exclude='.git' --exclude='.github' ./ dist/
else
  # Fallback to cp if rsync is not available
  cp -R [a-zA-Z0-9]* dist/ 2>/dev/null || true
  # Explicitly copy hidden files/folders we want
  cp _redirects dist/ 2>/dev/null || true
  cp _headers dist/ 2>/dev/null || true
fi

# Clean up unwanted files/directories from dist
echo "Removing development and config files from build output..."
rm -rf dist/node_modules \
       dist/.git \
       dist/.github \
       dist/.Jules \
       dist/.jules \
       dist/.agents \
       dist/tests \
       dist/Makefile \
       dist/package.json \
       dist/package-lock.json \
       dist/wrangler.toml \
       dist/DEPLOYMENT.md \
       dist/DEVELOPMENT.md \
       dist/README.md \
       dist/SITEMAP.md \
       dist/Tools.md \
       dist/serve.py \
       dist/dev-server.sh \
       dist/build.sh \
       dist/.gitignore

# Remove scripts, venvs, Dockerfiles, and python source files from tools
echo "Cleaning up tool directories..."
find dist/tools -type d -name "scripts" -exec rm -rf {} + 2>/dev/null || true
find dist/tools -type d -name "venv" -exec rm -rf {} + 2>/dev/null || true
find dist/tools -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find dist/tools -name "Dockerfile*" -delete 2>/dev/null || true
find dist/tools -name "*.py" -delete 2>/dev/null || true
find dist/tools -name "README.md" -delete 2>/dev/null || true

echo "Build complete! Output is in the 'dist' directory."
