#!/bin/bash

# FreeThings.win Development Server Script
# This script provides an easy way to run the site locally

set -e

# Configuration
PORT=8000
HOST="localhost"
SITE_URL="http://$HOST:$PORT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check project structure
check_structure() {
    print_header "Checking FreeThings.win project structure..."
    
    local missing_files=0
    
    # Check main files
    if [ ! -f "index.html" ]; then
        print_error "index.html missing"
        ((missing_files++))
    else
        print_status "index.html ✓"
    fi
    
    if [ ! -f "README.md" ]; then
        print_error "README.md missing"
        ((missing_files++))
    else
        print_status "README.md ✓"
    fi
    
    # Check tool directories
    local tools=("frontpage" "qrcode-site" "unit-converter" "text-case-converter" "password-generator" "uuid-generator" "base64-converter" "word-counter")
    
    for tool in "${tools[@]}"; do
        if [ ! -d "$tool" ]; then
            print_error "$tool directory missing"
            ((missing_files++))
        elif [ ! -f "$tool/index.html" ]; then
            print_error "$tool/index.html missing"
            ((missing_files++))
        else
            print_status "$tool/index.html ✓"
        fi
    done
    
    if [ $missing_files -eq 0 ]; then
        print_status "All required files present!"
    else
        print_warning "$missing_files files missing"
    fi
    
    echo ""
}

# Function to start server
start_server() {
    print_header "Starting FreeThings.win Development Server"
    echo "Server will be available at: $SITE_URL"
    echo "Press Ctrl+C to stop the server"
    echo ""
    
    # Try different server options
    if command_exists python3; then
        print_status "Starting server with Python3..."
        python3 -m http.server $PORT
    elif command_exists python; then
        print_status "Starting server with Python..."
        python -m http.server $PORT
    elif command_exists php; then
        print_status "Starting server with PHP..."
        php -S $HOST:$PORT
    elif command_exists node; then
        print_status "Starting server with Node.js..."
        npx http-server -p $PORT -o
    else
        print_error "No suitable server found!"
        print_error "Please install one of: Python3, PHP, or Node.js"
        exit 1
    fi
}

# Function to show help
show_help() {
    print_header "FreeThings.win Development Server"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  serve, start    Start the development server"
    echo "  check           Check project structure"
    echo "  test            Test navigation (requires server running)"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 serve        # Start development server"
    echo "  $0 check        # Check project structure"
    echo "  $0 test         # Test navigation"
    echo ""
    echo "Server will be available at: $SITE_URL"
}

# Function to test navigation
test_navigation() {
    print_header "Testing FreeThings.win Navigation"
    echo ""
    echo "Testing tool pages..."
    
    local tools=("frontpage" "qrcode-site" "unit-converter" "text-case-converter" "password-generator" "uuid-generator" "base64-converter" "word-counter")
    
    for tool in "${tools[@]}"; do
        local url="$SITE_URL/$tool/"
        echo -n "Testing $tool... "
        
        if command_exists curl; then
            if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
                echo -e "${GREEN}✓${NC}"
            else
                echo -e "${RED}✗${NC}"
            fi
        else
            echo -e "${YELLOW}?${NC} (curl not available)"
        fi
    done
    
    echo ""
    print_status "Navigation test complete!"
    echo "Visit $SITE_URL to test manually"
}

# Main script logic
case "${1:-serve}" in
    "serve"|"start")
        check_structure
        start_server
        ;;
    "check")
        check_structure
        ;;
    "test")
        test_navigation
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
