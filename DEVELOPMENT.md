# FreeThings.win Development Guide

This guide explains how to run and develop the FreeThings.win site locally.

## 🚀 Quick Start

### Option 1: Using Make (Recommended)
```bash
# Start the development server
make serve

# Check project structure
make check

# Test navigation
make test

# Show all available commands
make help
```

### Option 2: Using the Development Script
```bash
# Start the development server
./dev-server.sh serve

# Check project structure
./dev-server.sh check

# Test navigation
./dev-server.sh test
```

### Option 3: Using Node.js
```bash
# Install dependencies (optional)
npm install

# Start the development server
npm start

# Or use npx directly
npx http-server -p 8000 -o
```

### Option 4: Using Python
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

### Option 5: Using PHP
```bash
php -S localhost:8000
```

## 🌐 Accessing the Site

Once the server is running, visit:
- **Main Site**: http://localhost:8000
- **Front Page**: http://localhost:8000/frontpage/
- **QR Generator**: http://localhost:8000/qrcode-site/
- **Unit Converter**: http://localhost:8000/unit-converter/
- **Text Case Converter**: http://localhost:8000/text-case-converter/
- **Password Generator**: http://localhost:8000/password-generator/
- **UUID Generator**: http://localhost:8000/uuid-generator/
- **Base64 Converter**: http://localhost:8000/base64-converter/
- **Word Counter**: http://localhost:8000/word-counter/

## 🧪 Testing Navigation

### Manual Testing
1. Start the development server
2. Visit http://localhost:8000
3. Click through all the tool links
4. Test navigation between tools
5. Verify all pages load correctly

### Automated Testing
```bash
# Using Make
make test

# Using the development script
./dev-server.sh test
```

## 📁 Project Structure

```
freethings/
├── Makefile              # Development commands
├── dev-server.sh         # Development server script
├── package.json          # Node.js configuration
├── index.html           # Root redirect page
├── frontpage/           # Main homepage
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── qrcode-site/         # QR Code Generator
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── unit-converter/      # Unit Converter
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── ... (other tools)
```

## 🔧 Development Commands

### Make Commands
- `make serve` - Start development server
- `make test` - Test all tool pages
- `make check` - Check for broken links
- `make validate` - Validate HTML/CSS
- `make clean` - Clean temporary files
- `make help` - Show all commands

### Script Commands
- `./dev-server.sh serve` - Start server
- `./dev-server.sh check` - Check structure
- `./dev-server.sh test` - Test navigation
- `./dev-server.sh help` - Show help

### NPM Commands
- `npm start` - Start development server
- `npm run serve` - Start development server
- `npm run dev` - Start with no caching
- `npm run check` - Check project structure

## 🐛 Troubleshooting

### Server Won't Start
1. Check if port 8000 is available
2. Try a different port: `python3 -m http.server 8080`
3. Make sure you have Python, PHP, or Node.js installed

### Pages Not Loading
1. Check if all files exist: `make check`
2. Verify file permissions
3. Check browser console for errors

### Navigation Issues
1. Verify all HTML files have correct navigation links
2. Check that relative paths are correct
3. Test with different browsers

## 📝 Adding New Tools

1. Create a new directory for your tool
2. Add `index.html`, `styles.css`, and `script.js`
3. Update navigation in existing tools
4. Add the tool to the front page
5. Test with `make test`

## 🌍 Deployment

The site is designed to be deployed to static hosting services like:
- Cloudflare Pages
- Netlify
- GitHub Pages
- Vercel

No build process required - just upload the files!

## 📞 Support

If you encounter issues:
1. Check this development guide
2. Run `make check` to verify structure
3. Check browser console for errors
4. Ensure all dependencies are installed
