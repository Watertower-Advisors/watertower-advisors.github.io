# Watertower Advisors Website

A modern, responsive website for Watertower Advisors — a boutique investment banking firm specializing in capital raising, M&A, and strategic advisory for venture-backed companies.

## Live Site

**URL**: [https://watertoweradvisors.github.io](https://watertoweradvisors.github.io)

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Pages](#pages)
- [Customization Guide](#customization-guide)
- [Assets](#assets)
- [Blog Configuration](#blog-configuration)
- [Analytics & Cookie Consent](#analytics--cookie-consent)
- [Deployment](#deployment)
- [Technical Details](#technical-details)
- [Common Issues](#common-issues)

---

## Overview

Static website built with HTML, CSS, and vanilla JavaScript. No frameworks or build tools required.

- Fully responsive (mobile, tablet, desktop)
- Always-dark color scheme (Axom-inspired)
- Smooth scroll animations
- Medium blog integration (currently hidden from nav — see Blog section)
- Cookie consent banner with GA4 analytics
- SEO optimized with semantic HTML and ARIA labels

---

## Project Structure

```
watertower.github.io/
├── index.html          # Homepage
├── about.html          # About / Team page
├── services.html       # Services page
├── industries.html     # Industries page
├── contact.html        # Contact page (full-page background image)
├── blog.html           # Blog page (hidden from nav — do not delete)
├── styles.css          # All global styles and CSS variables
├── script.js           # Global JS (page loader, scroll animations, counter)
├── blog.js             # Blog JS (Medium RSS fetch and rendering)
├── README.md           # This file
└── assets/
    ├── hero/           # Hero/banner images
    ├── images/         # General page images (industries, contact bg)
    ├── logos/          # Favicon files
    ├── team/           # Team member photos
    └── Watertower Advisors Logo Package/
                        # Full logo package (SVG, PNG variants)
```

---

## Pages

### 1. Homepage (`index.html`)
- Full-bleed hero with LA palms background image
- Animated stats counters (25 years, $500M+, 100 deals)
- Services overview cards (Capital Raising, M&A, Strategic Advisory)
- "Let's Talk" CTA button linking to contact page

### 2. About (`about.html`)
- Company overview with LA palms image
- Three approach pillars: Data-Driven, Founder-First, Network Reach
- Founder spotlight: Derek Norton
- Team grid: Connor Doyle, Pranav Lodha, Dale Ligon
- Advisors section: Michael Kassan, Allen Debevoise, Jordan Levin, Mark Terbeek, Kevin Wall

### 3. Services (`services.html`)
- Capital Raising ($10M–$150M equity and debt)
- M&A Advisory
- Strategic Advisory
- Client testimonials (Riot Games / Brandon Beck, Machinima / Allan DeBevoise)

### 4. Industries (`industries.html`)
- Media & Entertainment Tech
- Music & Audio
- Gaming & Interactive
- Creator Economy
- Deep Tech & AI
- Internet & Web3
- Each section has an image and expandable verticals list

### 5. Contact (`contact.html`)
- Full-page background image (`assets/images/venti-views-PiqHSHYO3Uw-unsplash.jpg`)
- Centered text with email and phone CTA buttons
- Email: info@watertoweradvisors.com
- Phone: (310) 498-7373

### 6. Blog (`blog.html`) — Hidden
- **Not linked in the nav.** The file is kept for when a Medium account is ready.
- Automatically fetches posts from Medium via RSS when enabled.
- To re-enable: add `<a class="nav__link" href="blog.html">Blog</a>` to the nav in all HTML files and update the Medium URL (see Blog Configuration below).

---

## Customization Guide

### Colors

The site uses a permanent dark theme. All colors are CSS variables in `styles.css`:

```css
:root {
  --bg:       #060606;   /* Page background */
  --card:     #171717;   /* Card / surface background */
  --ink:      #FFFFFF;   /* Primary text */
  --muted:    #8B8B8B;   /* Secondary / muted text */
  --line:     #1F1F1F;   /* Borders and dividers */
  --accent:   #0047FF;   /* Primary accent (electric blue) */
  --accent-2: #3324D5;   /* Secondary accent (purple) */
}
```

### Fonts

- **Headings**: Manrope (700, 800)
- **Body**: Inter (400, 500, 600)

To change fonts, update the `@import` at the top of `styles.css`.

### Text Content

All text is in the HTML files and can be edited directly:

- **Stats** (homepage): update `data-count` attributes in `index.html`
- **Team bios**: edit the card content in `about.html`
- **Services**: edit in `services.html` and the cards in `index.html`
- **Contact details**: edit the email/phone links in `contact.html`

### Navigation

The nav appears in all HTML files. To add or remove a link, edit the `<nav class="nav__links">` block in **every** HTML file to keep them consistent:

```html
<nav class="nav__links" aria-label="Primary">
  <a class="nav__link" href="about.html">About</a>
  <a class="nav__link" href="services.html">Services</a>
  <a class="nav__link" href="industries.html">Industries</a>
  <a class="nav__link" href="contact.html">Contact</a>
  <!-- Blog is intentionally hidden. Add the line below when ready: -->
  <!-- <a class="nav__link" href="blog.html">Blog</a> -->
</nav>
```

### Logo

The nav and footer on all pages use:
```
assets/Watertower Advisors Logo Package/Digital (RGB)/Wordmarks/Wordmark V3/SVG/WatertowerAdvisors_rgb_wordmark_v3_white_cropped.svg
```
This is the white SVG wordmark, designed for dark backgrounds. To swap it, replace the `src` in the `<img>` tag inside `.nav__brand` and `.footer-brand` across all HTML files.

### Favicon

All pages use:
```
assets/Watertower Advisors Logo Package/Digital (RGB)/Logomarks/Logomark V1/PNG (Transparent Background)/WatertowerAdvisors_rgb_logomark_v1_navy_cropped1080px.png
```
To change it, update the three `<link rel="icon">` tags in the `<head>` of each HTML file.

---

## Assets

### Hero & Background Images (`assets/hero/`, `assets/images/`)

| File | Used On |
|---|---|
| `assets/hero/la-palms.jpg` | Homepage hero, About page image |
| `assets/images/venti-views-PiqHSHYO3Uw-unsplash.jpg` | Contact page full-page background |
| `assets/images/marvin-meyer-*.jpg` | Industries — Media Tech |
| `assets/images/music-audio.jpg` | Industries — Music & Audio |
| `assets/images/gaming.jpg` | Industries — Gaming |
| `assets/images/creator-economy.jpg` | Industries — Creator Economy |
| `assets/images/alex-knight-*.jpg` | Industries — Deep Tech |
| `assets/images/internet-web3.jpg` | Industries — Internet & Web3 |

### Team Photos (`assets/team/`)

| File | Person |
|---|---|
| `derek-norton.jpg` | Derek Norton — Founder |
| `connor-doyle.jpg` | Connor Doyle — Managing Director |
| `pranav-lodha.jpg` | Pranav Lodha — Associate |
| `alex-lee.svg` | Dale Ligon — Executive Assistant (placeholder, replace with real photo) |
| `michael-kassan.jpg` | Michael Kassan — Advisor |
| `allen-debevoise.jpg` | Allen Debevoise — Advisor |
| `jordan-levin.jpg` | Jordan Levin — Advisor |
| `mark-terbeek.jpg` | Mark Terbeek — Advisor |
| `kevin-wall.jpg` | Kevin Wall — Advisor |

**To replace Dale Ligon's placeholder**: add a real photo as `assets/team/dale-ligon.jpg` (or any name), then update the `src` on that `<img>` tag in `about.html`.

---

## Blog Configuration

> **ACTION REQUIRED before enabling the blog**: Update the Medium URL in `blog.js`.

The blog page (`blog.html`) is built and ready but is currently hidden from the navigation. When a Watertower Advisors Medium account exists:

**Step 1** — Update `blog.js` line 6:

```javascript
// blog.js — line 6
const MEDIUM_URL = 'https://medium.com/@watertoweradvisors'; // <-- UPDATE THIS
```

Accepted formats:
```javascript
const MEDIUM_URL = 'https://medium.com/@watertoweradvisors';
// or a custom domain:
const MEDIUM_URL = 'https://watertoweradvisors.medium.com';
```

**Step 2** — Re-add the Blog nav link in all HTML files (see Navigation section above).

### How the blog works

- Fetches posts from Medium via RSS on page load
- Uses the free RSS2JSON API to bypass CORS
- Displays posts newest-first with title, date, read time, tags, and a "Read on Medium" link
- No manual updates needed — new posts appear automatically when published

### Troubleshooting

- Verify the RSS feed exists: `https://medium.com/feed/@watertoweradvisors`
- Open browser console (F12) for error details
- Test the RSS2JSON conversion: `https://api.rss2json.com/v1/api.json?rss_url=YOUR_FEED_URL`

---

## Analytics & Cookie Consent

Analytics is handled by `assets/js/consent.js`, which is loaded on every page.

- Shows a cookie consent banner on first visit
- Only loads Google Analytics (GA4) after the visitor clicks **Accept**
- Stores the choice in `localStorage` — banner does not reappear after a decision
- GA Measurement ID: `G-FB92R71P1W`

To update the GA ID, change the `GA_ID` value at the top of `consent.js`:

```javascript
var GA_ID = 'G-FB92R71P1W'; // <-- update if the GA property changes
```

---

## Deployment

The site is hosted on GitHub Pages.

### Making Changes

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

GitHub Pages rebuilds automatically. Changes are live within 1–2 minutes.

### Custom Domain

The site is served at `watertoweradvisors.github.io`. If you ever move to a custom domain:

1. Add a `CNAME` file in the repo root containing the domain (e.g. `watertoweradvisors.com`)
2. Point a CNAME DNS record at `watertoweradvisors.github.io`
3. Set the custom domain in GitHub → Settings → Pages

---

## Technical Details

- **HTML5** — semantic markup, ARIA labels throughout
- **CSS3** — CSS Grid, Flexbox, custom properties, no frameworks
- **JavaScript (ES6+)** — vanilla JS, no build step required
- **Google Fonts** — Inter & Manrope (loaded via `@import` in `styles.css`)
- **RSS2JSON API** — free, no auth required, used for Medium integration

### Breakpoints

| Range | Layout |
|---|---|
| > 1024px | Desktop (3-column grids) |
| 640–1024px | Tablet (2-column grids) |
| < 640px | Mobile (single column, hamburger nav) |

---

## Common Issues

**Blog stuck on "Loading posts..."**
Update `MEDIUM_URL` in `blog.js` to a valid Medium account and verify the RSS feed URL is accessible.

**Images not loading**
Check that file paths in HTML match the actual filenames exactly (case-sensitive on Linux/GitHub Pages).

**Animations not triggering**
JavaScript must be enabled. Check the browser console for errors.

**Mobile menu not closing**
Clear browser cache and verify `script.js` is loading without errors.

**Cookie banner reappears after accepting**
Check that `localStorage` is not being cleared between sessions (e.g. private browsing mode clears it on close).

---

## Contact

- **Email**: info@watertoweradvisors.com
- **Phone**: (310) 498-7373

---

*Last Updated: March 2026*
