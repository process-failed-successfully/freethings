# FreeThings - Monorepo

A monorepo containing a collection of free, useful online tools and utilities. All tools work entirely in your browser with no registration required.

## 🌟 Features

- **100% Free** - No hidden costs, no subscriptions, no watermarks
- **Privacy First** - All processing happens in your browser
- **No Registration** - Start using any tool immediately
- **Mobile Friendly** - Works perfectly on all devices
- **Fast & Reliable** - Built for speed and reliability
- **Monorepo Structure** - All tools organized in a single repository

## 📊 Project Status

- **✅ 11 Complete Tools** - Fully functional and documented
- **🚧 9+ Planned Tools** - In development pipeline
- **📚 Complete Documentation** - Comprehensive guides for all tools
- **🎨 Consistent Design** - Unified user experience across all tools

## 🛠️ Available Tools

### ✅ Complete Tools
- **[QR Code Generator](tools/qrcode-site/)** - Create professional QR codes for URLs, text, WiFi, and more
- **[Unit Converter](tools/unit-converter/)** - Convert between metric and imperial units
- **[Text Case Converter](tools/text-case-converter/)** - Transform text between different cases
- **[Password Generator](tools/password-generator/)** - Generate secure, random passwords
- **[UUID Generator](tools/uuid-generator/)** - Generate unique identifiers for development
- **[Base64 Converter](tools/base64-converter/)** - Encode and decode Base64 strings
- **[Word Counter](tools/word-counter/)** - Count words, characters, and analyze text
- **[Image Converter](tools/image-converter/)** - Convert between JPG, PNG, WebP, and other image formats
- **[Image Resizer](tools/image-resizer/)** - Resize and compress images while maintaining quality
- **[Worksheet Generator](tools/worksheet-generator/)** - Create custom educational worksheets for children with math, English, and science problems
- **[Frontpage](tools/frontpage/)** - Main homepage with tool selector

## 📚 Documentation & Guides

### Comprehensive Tool Guides
- **[QR Code Generator Guide](docs/qr-code-generator-guide.html)** - Complete guide to creating QR codes with step-by-step instructions
- **[Unit Converter Guide](docs/unit-converter-guide.html)** - Master unit conversions with examples and best practices
- **[Text Tools Guide](docs/text-tools-guide.html)** - Text case conversion and word counting guide
- **[Password Generator Guide](docs/password-generator-guide.html)** - Create secure passwords and understand password security
- **[Developer Tools Guide](docs/developer-tools-guide.html)** - UUID generation and Base64 encoding for developers

### Help & Support
- **[Help & Troubleshooting](docs/help-and-troubleshooting.html)** - Get help with common issues and find solutions
- **[High Traffic How-To Guides](docs/README.md)** - SEO-optimized guides for popular tasks

### 🚧 Planned Tools
- **PDF Tools** - Compress, split, merge, and convert PDF files
- **JSON Formatter** - Format and validate JSON data
- **Background Remover** - Remove backgrounds from images
- **Markdown Converter** - Convert between Markdown and HTML
- **Regex Tester** - Test and debug regular expressions
- **Diff Checker** - Compare two text inputs
- **UTM Link Builder** - Create campaign tracking links
- **Meta Tag Generator** - Generate SEO meta tags
- **Sitemap Generator** - Create XML sitemaps for websites
- And more!

## 🚀 Getting Started

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/luke/freethings.git
   cd freethings
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   make serve
   ```

4. **Visit the site**
   - Open http://localhost:8000 in your browser
   - Navigate to individual tools at http://localhost:8000/tools/[tool-name]/

### Production Deployment

The site is hosted on Cloudflare Pages at [freethings.win](https://freethings.win)

## 🏗️ Monorepo Structure

```
freethings/
├── tools/                    # Individual tool applications
│   ├── frontpage/           # Main homepage with tool selector
│   ├── qrcode-site/         # QR Code Generator ✅
│   ├── unit-converter/      # Unit Converter ✅
│   ├── text-case-converter/ # Text Case Converter ✅
│   ├── password-generator/  # Password Generator ✅
│   ├── uuid-generator/      # UUID Generator ✅
│   ├── base64-converter/    # Base64 Converter ✅
│   ├── word-counter/        # Word Counter ✅
│   ├── image-converter/     # Image Converter ✅
│   ├── image-resizer/       # Image Resizer ✅
│   └── worksheet-generator/ # Worksheet Generator ✅
├── docs/                    # Documentation and guides
├── index.html              # Root redirect to frontpage
├── package.json            # Monorepo configuration
├── Makefile               # Development commands
└── README.md              # This file
```

## 🎨 Design System

All tools use a consistent design system with:
- **Inter font** for typography
- **Modern gradient backgrounds** for hero sections
- **Card-based layouts** for tool selection
- **Responsive design** for all devices
- **Consistent navigation** across all tools

## 🔧 Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox/Grid
- **Vanilla JavaScript** - No frameworks, pure performance
- **Font Awesome** - Icons
- **Google Fonts** - Typography
- **Node.js** - Development server
- **Make** - Build automation

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🛠️ Development Commands

```bash
# Start development server
npm run dev
make serve

# Check project structure
npm run check
make check

# Test all tools
make test

# Validate HTML/CSS
make validate

# Clean temporary files
make clean

# Show project structure
make structure

# Test specific tool
make test-tool TOOL=qrcode-site
```

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

All tools are free to use for any purpose. No attribution required.

## 🌐 Deployment

Hosted on Cloudflare Pages at [freethings.win](https://freethings.win)

---

**Made with ❤️ for the community**