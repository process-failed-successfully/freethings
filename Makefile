# Makefile for FreeThings.win Local Development
# This Makefile provides commands to run the site locally and test navigation

# Variables
PYTHON := python3
PORT := 8000
HOST := localhost
SITE_URL := http://$(HOST):$(PORT)

# Default target
.PHONY: help
help:
	@echo "FreeThings.win Local Development Server"
	@echo "======================================"
	@echo ""
	@echo "Available commands:"
	@echo "  make serve     - Start local development server (auto-finds available port)"
	@echo "  make serve-port PORT=8001 - Start server on specific port"
	@echo "  make stop      - Stop any running development servers"
	@echo "  make test      - Test all tool pages and navigation"
	@echo "  make test-tool TOOL=name - Test specific tool"
	@echo "  make clean     - Clean up temporary files"
	@echo "  make check     - Check for broken links and missing files"
	@echo "  make validate  - Validate HTML and CSS"
	@echo "  make structure - Show project structure"
	@echo "  make setup     - Setup development environment"
	@echo "  make dev       - Run check, validate, and serve"
	@echo "  make help      - Show this help message"
	@echo ""
	@echo "Server will be available at: $(SITE_URL)"
	@echo ""

# Start local development server
.PHONY: serve
serve:
	@echo "Starting FreeThings monorepo local development server..."
	@echo "Server will be available at: $(SITE_URL)"
	@echo "Press Ctrl+C to stop the server"
	@echo ""
	@# Check if port is already in use and find available port
	@available_port=$(PORT); \
	if lsof -i :$(PORT) >/dev/null 2>&1 || netstat -tulpn 2>/dev/null | grep -q ":$(PORT) "; then \
		echo "⚠️  Port $(PORT) is already in use. Trying alternative ports..."; \
		for alt_port in 8001 8002 8003 8080 3000; do \
			if ! lsof -i :$$alt_port >/dev/null 2>&1 && ! netstat -tulpn 2>/dev/null | grep -q ":$$alt_port "; then \
				echo "✓ Using port $$alt_port instead"; \
				available_port=$$alt_port; \
				break; \
			fi; \
		done; \
		if [ "$$available_port" = "$(PORT)" ]; then \
			echo "✗ No available ports found. Please stop other servers or use a different port."; \
			echo "   You can specify a custom port with: make serve-port PORT=9000"; \
			exit 1; \
		fi; \
	fi; \
	echo "Starting server on port $$available_port..."; \
	echo "Server will be available at: http://$(HOST):$$available_port"; \
	echo ""; \
	if command -v $(PYTHON) >/dev/null 2>&1; then \
		$(PYTHON) -m http.server $$available_port; \
	elif command -v python >/dev/null 2>&1; then \
		python -m http.server $$available_port; \
	elif command -v php >/dev/null 2>&1; then \
		php -S $(HOST):$$available_port; \
	elif command -v node >/dev/null 2>&1; then \
		npx http-server -p $$available_port -o; \
	else \
		echo "✗ No suitable server found. Please install Python3, PHP, or Node.js"; \
		exit 1; \
	fi

# Serve on specific port
.PHONY: serve-port
serve-port:
	@echo "Starting server on port $(PORT)..."
	@echo "Server will be available at: http://$(HOST):$(PORT)"
	@echo ""
	@if command -v $(PYTHON) >/dev/null 2>&1; then \
		$(PYTHON) -m http.server $(PORT); \
	elif command -v python >/dev/null 2>&1; then \
		python -m http.server $(PORT); \
	elif command -v php >/dev/null 2>&1; then \
		php -S $(HOST):$(PORT); \
	elif command -v node >/dev/null 2>&1; then \
		npx http-server -p $(PORT) -o; \
	else \
		echo "✗ No suitable server found. Please install Python3, PHP, or Node.js"; \
		exit 1; \
	fi

# Test all tool pages and navigation
.PHONY: test
test:
	@echo "Testing FreeThings monorepo tool pages and navigation..."
	@echo "======================================================="
	@echo ""
	@echo "Checking if all required files exist..."
	@for tool in frontpage qrcode-site unit-converter text-case-converter password-generator uuid-generator base64-converter word-counter image-converter image-resizer; do \
		if [ -f "tools/$$tool/index.html" ]; then \
			echo "✓ tools/$$tool/index.html exists"; \
		else \
			echo "✗ tools/$$tool/index.html missing"; \
		fi; \
		if [ -f "tools/$$tool/styles.css" ]; then \
			echo "✓ tools/$$tool/styles.css exists"; \
		else \
			echo "✗ tools/$$tool/styles.css missing"; \
		fi; \
	done
	@echo ""
	@echo "Checking main files..."
	@if [ -f "index.html" ]; then \
		echo "✓ index.html exists"; \
	else \
		echo "✗ index.html missing"; \
	fi
	@if [ -f "README.md" ]; then \
		echo "✓ README.md exists"; \
	else \
		echo "✗ README.md missing"; \
	fi
	@echo ""
	@echo "Testing navigation links..."
	@echo "Note: Start 'make serve' in another terminal to test live navigation"
	@echo ""

# Check for broken links and missing files
.PHONY: check
check:
	@echo "Checking for broken links and missing files..."
	@echo "============================================="
	@echo ""
	@echo "Checking internal links in HTML files..."
	@for html_file in $$(find . -name "*.html" -type f); do \
		echo "Checking $$html_file..."; \
		html_dir=$$(dirname "$$html_file"); \
		grep -o 'href="[^"]*"' "$$html_file" | grep -v 'http' | grep -v '#' | grep -v 'mailto:' | while read link; do \
			link_path=$$(echo "$$link" | sed 's/href="//;s/"//'); \
			# Skip javascript:void(0) links as they are intentional \
			if echo "$$link_path" | grep -q '^javascript:'; then \
				continue; \
			fi; \
			# Handle absolute paths (starting with /) by checking from project root \
			if echo "$$link_path" | grep -q '^/'; then \
				link_path=$$(echo "$$link_path" | sed 's|^/||'); \
				if [ ! -f "$$link_path" ] && [ ! -d "$$link_path" ] && [ ! -f "$$link_path/index.html" ]; then \
					echo "  ⚠️  Broken link: $$link_path"; \
				fi; \
			else \
				# Normalize the path by resolving .. and . components \
				resolved_path=$$(cd "$$html_dir" && readlink -f "$$link_path" 2>/dev/null || echo "$$html_dir/$$link_path"); \
				# Check if the resolved path exists relative to project root \
				project_relative_path=$$(echo "$$resolved_path" | sed "s|^$$(pwd)/||"); \
				# Also check if it exists in tools/ subdirectory (for links like ../frontpage/ -> tools/frontpage/) \
				tools_path="tools/$$(basename "$$link_path" | sed 's|/$$||')"; \
				if [ ! -f "$$project_relative_path" ] && [ ! -d "$$project_relative_path" ] && [ ! -f "$$project_relative_path/index.html" ] && \
				   [ ! -f "$$tools_path" ] && [ ! -d "$$tools_path" ] && [ ! -f "$$tools_path/index.html" ]; then \
					echo "  ⚠️  Broken link: $$link_path"; \
				fi; \
			fi; \
		done; \
	done
	@echo ""
	@echo "Link check complete!"

# Validate HTML and CSS (basic check)
.PHONY: validate
validate:
	@echo "Validating HTML and CSS files..."
	@echo "================================"
	@echo ""
	@echo "Checking HTML files for basic syntax..."
	@for html_file in $$(find . -name "*.html" -type f); do \
		echo "Validating $$html_file..."; \
		if grep -q "<!DOCTYPE html>" "$$html_file" && grep -q "</html>" "$$html_file"; then \
			echo "  ✓ Valid HTML structure"; \
		else \
			echo "  ✗ Invalid HTML structure"; \
		fi; \
	done
	@echo ""
	@echo "Checking CSS files..."
	@for css_file in $$(find . -name "*.css" -type f); do \
		echo "Validating $$css_file..."; \
		if [ -s "$$css_file" ]; then \
			echo "  ✓ CSS file has content"; \
		else \
			echo "  ✗ CSS file is empty"; \
		fi; \
	done
	@echo ""
	@echo "Validation complete!"

# Clean up temporary files
.PHONY: clean
clean:
	@echo "Cleaning up temporary files..."
	@find . -name "*.tmp" -delete 2>/dev/null || true
	@find . -name ".DS_Store" -delete 2>/dev/null || true
	@find . -name "Thumbs.db" -delete 2>/dev/null || true
	@echo "Cleanup complete!"

# Development workflow
.PHONY: dev
dev: check validate serve

# Quick start for new developers
.PHONY: setup
setup:
	@echo "Setting up FreeThings.win development environment..."
	@echo "=================================================="
	@echo ""
	@echo "Checking system requirements..."
	@if command -v $(PYTHON) >/dev/null 2>&1; then \
		echo "✓ Python3 found"; \
	elif command -v python >/dev/null 2>&1; then \
		echo "✓ Python found"; \
	elif command -v php >/dev/null 2>&1; then \
		echo "✓ PHP found"; \
	elif command -v node >/dev/null 2>&1; then \
		echo "✓ Node.js found"; \
	else \
		echo "✗ No suitable server found. Please install Python3, PHP, or Node.js"; \
		exit 1; \
	fi
	@echo ""
	@echo "Running initial checks..."
	@$(MAKE) check
	@echo ""
	@echo "Setup complete! Run 'make serve' to start the development server."

# Stop any running development servers
.PHONY: stop
stop:
	@echo "Stopping any running development servers..."
	@for port in 8000 8001 8002 8003 8080 3000; do \
		pid=$$(lsof -ti :$$port 2>/dev/null || netstat -tulpn 2>/dev/null | grep ":$$port " | awk '{print $$7}' | cut -d'/' -f1); \
		if [ -n "$$pid" ] && [ "$$pid" != "-" ]; then \
			echo "Stopping server on port $$port (PID: $$pid)"; \
			kill $$pid 2>/dev/null || true; \
		fi; \
	done
	@echo "Done!"

# Show project structure
.PHONY: structure
structure:
	@echo "FreeThings Monorepo Project Structure"
	@echo "====================================="
	@echo ""
	@if command -v tree >/dev/null 2>&1; then \
		tree -I 'node_modules|.git|*.pyc|__pycache__' -a -L 3 . 2>/dev/null || echo "Tree command failed, using alternative display"; \
	fi
	@echo "Directory structure:"
	@find . -type d -not -path './.git*' -not -path './node_modules*' | sort | head -20
	@echo ""
	@echo "Main files:"
	@ls -la | grep -E '\.(html|css|js|json|md|xml|toml)$|^[^.]' | head -10
	@echo ""
	@echo "Tools directory:"
	@ls -la tools/ | head -10

# Test specific tool
.PHONY: test-tool
test-tool:
	@echo "Usage: make test-tool TOOL=<tool-name>"
	@echo "Available tools: frontpage, qrcode-site, unit-converter, text-case-converter, password-generator, uuid-generator, base64-converter, word-counter, image-converter, image-resizer"
	@if [ -n "$(TOOL)" ]; then \
		echo "Testing $(TOOL)..."; \
		if [ -f "tools/$(TOOL)/index.html" ]; then \
			echo "✓ tools/$(TOOL)/index.html exists"; \
			echo "Visit: $(SITE_URL)/tools/$(TOOL)/"; \
		else \
			echo "✗ tools/$(TOOL)/index.html not found"; \
		fi; \
	fi
