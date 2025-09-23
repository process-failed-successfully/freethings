# Sitemap Configuration for FreeThings.dev

This document explains the sitemap setup and SEO best practices implemented for the FreeThings project.

## Files Created

### 1. `sitemap.xml`
- **Purpose**: Main XML sitemap for search engines
- **Location**: Root directory (`/sitemap.xml`)
- **URL**: `https://freethings.win/sitemap.xml`

**Features**:
- Includes all public pages and tools
- Prioritized by importance (homepage = 1.0, tools = 0.7-0.9, docs = 0.6)
- Proper change frequencies (weekly for homepage, monthly for tools)
- Valid XML structure with proper namespaces

### 2. `robots.txt`
- **Purpose**: Instructions for search engine crawlers
- **Location**: Root directory (`/robots.txt`)
- **URL**: `https://freethings.win/robots.txt`

**Features**:
- Allows all public content
- Blocks development files and sensitive directories
- References the sitemap location
- Includes crawl delay to prevent server overload

### 3. `sitemap-index.xml`
- **Purpose**: Sitemap index for future expansion
- **Location**: Root directory (`/sitemap-index.xml`)
- **URL**: `https://freethings.win/sitemap-index.xml`

**Features**:
- Currently references main sitemap
- Ready for future tool-specific or documentation sitemaps
- Scalable structure for growth

## Priority Structure

### High Priority (0.9-1.0)
- Homepage (`/`) - Priority 1.0
- Frontpage (`/frontpage/`) - Priority 0.9
- Unit Converter (`/unit-converter/`) - Priority 0.9

### Medium Priority (0.7-0.8)
- Image tools (converter, resizer) - Priority 0.8
- Text tools (word counter, case converter) - Priority 0.8
- Documentation (`/docs/`) - Priority 0.8

### Lower Priority (0.6-0.7)
- Developer tools (password generator, UUID, Base64) - Priority 0.7
- QR Code generator - Priority 0.7
- Individual documentation pages - Priority 0.6

## Change Frequencies

- **Weekly**: Homepage and frontpage (frequently updated content)
- **Monthly**: All tools and documentation (stable content with occasional updates)

## Best Practices Implemented

### 1. XML Structure
- Valid XML with proper encoding (UTF-8)
- Correct namespace declarations
- Schema validation references

### 2. URL Management
- Absolute URLs with HTTPS
- Consistent trailing slashes
- No duplicate entries

### 3. SEO Optimization
- Logical priority distribution
- Appropriate change frequencies
- Last modification dates

### 4. Security
- Blocks sensitive development files
- Allows only public content
- Prevents crawling of build artifacts

## Maintenance

### Regular Updates
1. **Lastmod dates**: Update when content changes
2. **New tools**: Add new tool URLs with appropriate priorities
3. **Change frequencies**: Adjust based on actual update patterns

### Monitoring
- Submit sitemap to Google Search Console
- Monitor crawl errors and indexing status
- Check for broken links and 404 errors

### Future Enhancements
- Consider image sitemaps for tool screenshots
- Add video sitemaps if tool demos are added
- Implement automatic sitemap generation for dynamic content

## Search Engine Submission

### Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property for `https://freethings.win`
3. Submit sitemap: `https://freethings.win/sitemap.xml`

### Bing Webmaster Tools
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add site: `https://freethings.win`
3. Submit sitemap: `https://freethings.win/sitemap.xml`

## Validation

### XML Validation
- Use [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- Check for syntax errors and proper structure

### Testing
- Test robots.txt with [Google's robots.txt Tester](https://www.google.com/webmasters/tools/robots-testing-tool)
- Verify all URLs in sitemap return 200 status codes

## File Locations

```
/home/luke/repos/freethings/
├── sitemap.xml          # Main sitemap
├── sitemap-index.xml    # Sitemap index
├── robots.txt           # Crawler instructions
└── SITEMAP.md          # This documentation
```

## Next Steps

1. Deploy files to production server
2. Submit sitemap to search engines
3. Monitor indexing progress
4. Update lastmod dates as content changes
5. Consider implementing automatic sitemap generation
