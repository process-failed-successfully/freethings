# Cloudflare Pages Deployment Guide

This guide explains how to deploy the FreeThings monorepo to Cloudflare Pages.

## Prerequisites

- Cloudflare account
- GitHub repository access
- Domain configured in Cloudflare (optional)

## Deployment Methods

### Method 1: GitHub Integration (Recommended)

1. **Connect Repository**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Click "Create a project"
   - Connect your GitHub account
   - Select the `freethings` repository

2. **Configure Build Settings**
   - **Framework preset**: None (Static Site)
   - **Build command**: `echo 'No build step required for static site'`
   - **Build output directory**: `.` (root directory)
   - **Root directory**: `/` (leave empty)

3. **Environment Variables** (if needed)
   - Add any required environment variables
   - For this project, none are currently required

4. **Deploy**
   - Click "Save and Deploy"
   - Cloudflare will automatically deploy from the main branch

### Method 2: Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Deploy**
   ```bash
   wrangler pages deploy .
   ```

### Method 3: Direct Upload

1. **Prepare Files**
   - Ensure all files are in the root directory
   - Verify `_redirects` and `_headers` files are present

2. **Upload to Cloudflare Pages**
   - Go to Cloudflare Pages dashboard
   - Click "Upload assets"
   - Drag and drop all files or select the directory

## Configuration Files

### `_redirects`
- Handles URL redirects for the monorepo structure
- Redirects old tool paths to new `/tools/` structure
- Provides common aliases for tools
- Handles SPA routing for tools

### `_headers`
- Sets security headers for all pages
- Configures cache control for different file types
- Optimizes performance with appropriate caching

### `wrangler.toml`
- Cloudflare Pages configuration
- Build and deployment settings
- Environment configuration

## Custom Domain Setup

1. **Add Custom Domain**
   - In Cloudflare Pages dashboard
   - Go to "Custom domains"
   - Add your domain (e.g., `freethings.win`)

2. **DNS Configuration**
   - Add CNAME record pointing to your Pages domain
   - Or use Cloudflare's automatic DNS management

3. **SSL Certificate**
   - Cloudflare automatically provides SSL certificates
   - Ensure "Always Use HTTPS" is enabled

## Performance Optimization

### Caching Strategy
- **HTML files**: 1 hour cache
- **CSS/JS files**: 1 year cache
- **Images**: 1 year cache
- **Fonts**: 1 year cache
- **XML files**: 1 day cache

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Content Security Policy configured
- Referrer Policy: strict-origin-when-cross-origin

## Monitoring and Analytics

### Cloudflare Analytics
- Built-in analytics in Cloudflare dashboard
- Page views, bandwidth, and performance metrics
- Real-time visitor statistics

### Google Analytics (Optional)
- Add Google Analytics tracking code to HTML files
- Configure in Cloudflare Pages environment variables

## Troubleshooting

### Common Issues

1. **404 Errors on Tool Pages**
   - Check `_redirects` file configuration
   - Verify tool directories exist in `/tools/`
   - Ensure proper SPA routing rules

2. **Caching Issues**
   - Check `_headers` file configuration
   - Verify cache control headers
   - Use Cloudflare cache purge if needed

3. **Build Failures**
   - Verify build command is correct
   - Check for missing files or dependencies
   - Review build logs in Cloudflare dashboard

### Debugging Steps

1. **Check Build Logs**
   - Go to Cloudflare Pages dashboard
   - View deployment logs
   - Look for error messages

2. **Test Locally**
   - Use `npm run dev` or `make serve`
   - Verify all tools work correctly
   - Check redirects and headers

3. **Validate Configuration**
   - Test `_redirects` rules
   - Verify `_headers` are applied
   - Check sitemap accessibility

## Continuous Deployment

### Automatic Deployments
- Cloudflare Pages automatically deploys on git push
- Configure branch protection rules
- Set up preview deployments for pull requests

### Manual Deployments
- Use Cloudflare dashboard for manual deployments
- Deploy specific branches or commits
- Rollback to previous deployments if needed

## Performance Monitoring

### Core Web Vitals
- Monitor LCP, FID, and CLS metrics
- Use Cloudflare's built-in performance insights
- Optimize based on real user metrics

### SEO Monitoring
- Submit sitemap to Google Search Console
- Monitor indexing status
- Check for crawl errors

## Backup and Recovery

### Repository Backup
- Ensure GitHub repository is properly backed up
- Use multiple deployment environments
- Keep deployment configuration in version control

### Data Recovery
- Cloudflare Pages provides automatic backups
- Can rollback to any previous deployment
- Repository serves as source of truth

## Security Considerations

### Access Control
- Limit who can deploy to production
- Use branch protection rules
- Implement code review processes

### Content Security
- Review CSP headers regularly
- Monitor for security vulnerabilities
- Keep dependencies updated

## Cost Optimization

### Cloudflare Pages Pricing
- Free tier includes 500 builds/month
- 20,000 requests/day on free tier
- Bandwidth included in free tier

### Optimization Tips
- Minimize build frequency
- Optimize images and assets
- Use appropriate cache headers
- Monitor usage in dashboard

---

For more information, visit the [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/).
