# Quick Cloudflare Pages Deployment Guide

## Option 1: Direct Upload (Fastest)
1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Click "Upload assets"
3. Drag and drop all files from this folder
4. Click "Deploy site"
5. Your site will be live in seconds!

## Option 2: Git Integration (Recommended for updates)
1. Create a GitHub repository
2. Upload all files to the repository
3. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
4. Click "Connect to Git"
5. Select your repository
6. Build settings:
   - Build command: (leave empty)
   - Build output directory: `/`
7. Click "Save and Deploy"

## Files to Upload
- `index.html`
- `styles.css`
- `script.js`
- `package.json`
- `README.md`
- `_headers` (for security headers)
- `_redirects` (for URL redirects)

## Custom Domain (Optional)
1. In Cloudflare Pages dashboard, go to "Custom domains"
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate will be automatically provisioned

## Performance Features Included
- ✅ Security headers configured
- ✅ Cache optimization
- ✅ URL redirects for SEO
- ✅ Favicon included
- ✅ Mobile responsive design
