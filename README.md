# Watertower Advisors Website

A modern, responsive website for Watertower Advisors - a boutique investment banking firm specializing in capital raising, M&A, and strategic advisory for venture-backed companies.

## 🌐 Live Site

**URL**: [https://watertoweradvisors.github.io](https://watertoweradvisors.github.io)

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Pages](#pages)
- [Customization Guide](#customization-guide)
- [Assets](#assets)
- [Blog Configuration](#blog-configuration)
- [Deployment](#deployment)
- [Technical Details](#technical-details)
- [Browser Support](#browser-support)

## 🎯 Overview

This is a static website built with clean HTML, CSS, and JavaScript. It features:

- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Dark mode support (automatic based on system preference)
- ✅ Smooth scroll animations
- ✅ Automatic Medium blog integration
- ✅ Fast loading with page loader
- ✅ SEO optimized
- ✅ Accessible (ARIA labels, semantic HTML)

## 📁 Project Structure

```
watertower.github.io/
├── index.html          # Homepage
├── about.html          # About page
├── services.html       # Services page
├── industries.html     # Industries page
├── blog.html           # Blog page (auto-fetches from Medium)
├── contact.html        # Contact page
├── styles.css          # Global styles
├── script.js           # Global JavaScript
├── blog.js             # Blog-specific JavaScript
├── README.md           # This file
├── BLOG_README.md      # Blog-specific documentation
└── assets/
    ├── hero/           # Hero/banner images
    ├── images/         # General images
    ├── logos/          # Favicon and logo files
    └── team/           # Team member photos
```

## 📄 Pages

### 1. Homepage (`index.html`)
- Hero section with background image
- Stats section (animated counters)
- Services overview
- Call-to-action section

### 2. About (`about.html`)
- Company overview
- Approach/values
- Team members with photos

### 3. Services (`services.html`)
- Detailed service descriptions
- Capital raising
- M&A advisory
- Strategic advisory

### 4. Industries (`industries.html`)
- Target industries and sectors
- Media & Entertainment Tech
- Consumer Internet & Marketplaces
- Enterprise SaaS & AI

### 5. Blog (`blog.html`)
- **Automatically fetches posts from Medium**
- Displays posts in chronological order
- Clean card-based layout
- Tags and read time

### 6. Contact (`contact.html`)
- Contact details (email link)
- Company information

## 🎨 Customization Guide

### Updating Text Content

All text can be edited directly in the HTML files:

1. **Company Name/Branding**: Search for `WATERTOWER ADVISORS` in all HTML files
2. **Tagline**: Look for `INVESTMENT BANK` tag
3. **Services**: Edit in `services.html` and `index.html`
4. **Stats**: Update `data-count` attributes in `index.html`

### Updating Colors

Colors are defined as CSS variables in `styles.css`:

```css
:root {
  --bg: #FFFFFF;           /* Background color */
  --ink: #0A1B3D;          /* Primary text color */
  --muted: #4B5563;        /* Secondary text color */
  --line: #E5E7EB;         /* Border/divider color */
  --accent: #0EA5E9;       /* Primary accent (blue) */
  --accent-2: #10B981;     /* Secondary accent (green) */
  --card: #F8FAFC;         /* Card background */
}
```

### Updating Fonts

Current fonts:
- **Headings**: Manrope (700, 800)
- **Body**: Inter (400, 500, 600)

To change fonts, update the `@import` at the top of `styles.css`.

### Navigation Menu

To add/remove navigation items, edit the `<nav class="nav__links">` section in each HTML file:

```html
<nav class="nav__links" aria-label="Primary">
  <a class="nav__link" href="about.html">About</a>
  <a class="nav__link" href="services.html">Services</a>
  <a class="nav__link" href="industries.html">Industries</a>
  <a class="nav__link" href="blog.html">Blog</a>
  <a class="nav__link" href="contact.html">Contact</a>
</nav>
```

**Important**: Update navigation on ALL pages to maintain consistency.

## 🖼️ Assets

### Required Assets

#### 1. **Hero Images** (`assets/hero/`)
- `la-palms.jpg` - Homepage hero
- `services-hero.jpg` - Services page hero
- Format: JPEG, recommended size: 1920x1080px
- Optimize images for web (keep under 500KB)

#### 2. **Team Photos** (`assets/team/`)
- Format: SVG or JPG
- Aspect ratio: 4:3
- Names: `alex-lee.svg`, `jordan-rivera.svg`, `sam-patel.svg`

#### 3. **Logos/Favicons** (`assets/logos/`)
- `favicon.ico` - Main favicon (16x16, 32x32, 48x48)
- `favicon-192x192.png` - Android icon
- `favicon-32x32.png` - Standard favicon
- `favicon-16x16.png` - Small favicon
- `apple-touch-icon.png` - iOS icon (180x180)

### Adding New Assets

1. Place files in the appropriate `assets/` subdirectory
2. Update the HTML reference:
   ```html
   <img src="assets/folder/filename.jpg" alt="Description" />
   ```
3. Optimize images before uploading (use tools like TinyPNG, ImageOptim)

### Image Optimization Tips

- **Hero images**: 1920x1080px, JPEG, quality 80-85%, under 500KB
- **Team photos**: 800x600px, JPEG, quality 85-90%, under 200KB
- **Logos**: Use SVG when possible for crisp display at any size
- **Icons**: SVG preferred, or PNG with multiple sizes

## 📝 Blog Configuration

### Quick Setup

1. Open `blog.js`
2. Update the `MEDIUM_URL` constant:

```javascript
const MEDIUM_URL = 'https://yourusername.medium.com';
// or
const MEDIUM_URL = 'https://medium.com/@yourusername';
```

3. Save the file - **that's it!**

### How It Works

- The blog automatically fetches your Medium posts via RSS feed
- Uses RSS2JSON API to convert RSS to JSON (bypasses CORS)
- Posts display in chronological order (newest first)
- Updates automatically when visitors load the page
- No manual updates needed when you publish new posts

### Troubleshooting Blog Issues

If posts don't load:

1. **Check the Medium URL format** - should be one of:
   - `https://username.medium.com`
   - `https://medium.com/@username`
   - `https://custom.medium.com`

2. **Open browser console** (F12 or Cmd+Option+I) and look for errors

3. **Verify Medium RSS feed works** by visiting:
   ```
   https://username.medium.com/feed
   ```

4. **Check RSS2JSON API** is working:
   ```
   https://api.rss2json.com/v1/api.json?rss_url=YOUR_FEED_URL
   ```

For detailed blog documentation, see [BLOG_README.md](BLOG_README.md).

## 🚀 Deployment

### GitHub Pages (Current Setup)

This site is configured for GitHub Pages deployment:

1. **Repository name must be**: `username.github.io` or organization name
2. **Branch**: `main` (or `master`)
3. **Settings**: Go to Settings → Pages → Source: Deploy from `main` branch

### Making Changes

1. Edit files locally
2. Commit changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
3. GitHub Pages will automatically rebuild (takes 1-2 minutes)
4. Visit your site to see changes

### Custom Domain

To use a custom domain (e.g., `watertoweradvisors.com`):

1. Add a `CNAME` file to the root with your domain name
2. Configure DNS records with your domain provider:
   - Add a CNAME record pointing to `username.github.io`
3. Update in GitHub Settings → Pages → Custom domain

## 🔧 Technical Details

### Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid, Flexbox, Variables
- **JavaScript (ES6+)** - Vanilla JS, no frameworks
- **RSS2JSON API** - Medium blog integration
- **Google Fonts** - Inter & Manrope fonts

### Features

#### Page Loader
- Displays while page assets load
- Fades out automatically after 400ms
- Implemented in `script.js`

#### Scroll Animations
- Uses Intersection Observer API
- Elements fade in as they scroll into view
- Staggered delays for multiple elements

#### Responsive Design
- Mobile-first approach
- Breakpoints:
  - Desktop: > 1024px
  - Tablet: 640px - 1024px
  - Mobile: < 640px

#### Dark Mode
- Automatically detects system preference
- Uses CSS `prefers-color-scheme` media query
- Can be extended with manual toggle if needed

#### Stats Counter Animation
- Animated number counting on scroll
- Formats numbers (K, M suffixes)
- Only animates once per page load

### Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

Requires modern browser with support for:
- CSS Grid
- CSS Variables
- Intersection Observer API
- ES6+ JavaScript

## 📞 Contact

The site no longer includes an in-page contact form. The `contact.html` page now displays the company's contact information so visitors can email or call directly.

Current contact:
- **Email:** info@watertoweradvisors.com (`contact.html`)
- **Phone:** (310) 498-7373

To change the displayed email or phone number, edit the contact details in `contact.html` (the static link at the center of that page).

If you prefer a seamless form submission experience, consider integrating a form service such as FormSpree or EmailJS, or adding a lightweight backend to handle form posts.

### Analytics & Consent

A consent-aware Google Analytics loader was added at `assets/js/consent.js`. It shows a small cookie consent banner and injects the GA4 `gtag.js` script only after the visitor accepts. The GA measurement ID used in this branch is `G-FB92R71P1W`.

If you need event tracking (CTA clicks, outbound links), we can add data attributes and a small `analytics-events.js` to send `gtag('event', ...)` calls after consent.

## 🔐 Environment & Secrets

No environment variables or API keys are currently stored in the code. The RSS2JSON API is free and doesn't require authentication.

If you add features that need API keys:
1. Never commit API keys to the repository
2. Use GitHub Secrets for sensitive data
3. Implement a backend service to proxy API calls

## 📊 Analytics (Optional)

To add Google Analytics:

1. Get your GA4 tracking ID from Google Analytics
2. Add to the `<head>` of all HTML pages:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 🐛 Common Issues & Solutions

### Issue: Blog stuck on "Loading posts..."
**Solution**: Check browser console for errors, verify Medium URL format, ensure RSS feed is accessible

### Issue: Images not loading
**Solution**: Verify file paths are correct and files exist in `assets/` folder

### Issue: Dark mode not working
**Solution**: Check browser supports `prefers-color-scheme`, clear browser cache

### Issue: Animations not triggering
**Solution**: Ensure JavaScript is enabled, check console for errors

### Issue: Mobile menu not closing
**Solution**: Clear browser cache, verify `script.js` is loading correctly

## 🔄 Version History

- **v1.0** (Jan 2026) - Initial launch with 5 pages
- **v1.1** (Jan 2026) - Added blog page with automatic Medium integration

## 📝 License

This is a proprietary website for Watertower Advisors. All rights reserved.

## 🤝 Support

For issues or questions about the website:
1. Check this README first
2. Review `BLOG_README.md` for blog-specific issues
3. Check browser console for error messages
4. Verify all file paths and asset locations

---

**Last Updated**: January 15, 2026
