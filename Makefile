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
	@echo "  make serve     - Start local development server"
	@echo "  make test      - Test all tool pages and navigation"
	@echo "  make clean     - Clean up temporary files"
	@echo "  make check     - Check for broken links and missing files"
	@echo "  make validate  - Validate HTML and CSS"
	@echo "  make help      - Show this help message"
	@echo ""
	@echo "Server will be available at: $(SITE_URL)"
	@echo ""

# Start local development server
.PHONY: serve
serve:
	@echo "Starting FreeThings.win local development server..."
	@echo "Server will be available at: $(SITE_URL)"
	@echo "Press Ctrl+C to stop the server"
	@echo ""
	@if command -v $(PYTHON) >/dev/null 2>&1; then \
		$(PYTHON) -m http.server $(PORT); \
	else \
		echo "Python3 not found. Trying alternative methods..."; \
		if command -v python >/dev/null 2>&1; then \
			python -m http.server $(PORT); \
		elif command -v php >/dev/null 2>&1; then \
			php -S $(HOST):$(PORT); \
		elif command -v node >/dev/null 2>&1; then \
			npx http-server -p $(PORT) -o; \
		else \
			echo "No suitable server found. Please install Python3, PHP, or Node.js"; \
			exit 1; \
		fi; \
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
		grep -o 'href="[^"]*"' "$$html_file" | grep -v 'http' | grep -v '#' | while read link; do \
			link_path=$$(echo "$$link" | sed 's/href="//;s/"//'); \
			if [ ! -f "$$link_path" ] && [ ! -d "$$link_path" ]; then \
				echo "  ⚠️  Broken link: $$link_path"; \
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

# Show project structure
.PHONY: structure
structure:
	@echo "FreeThings.win Project Structure"
	@echo "================================"
	@echo ""
	@tree -I 'node_modules|.git' . 2>/dev/null || find . -type d | head -20

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
