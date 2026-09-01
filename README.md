# Watertower Advisors Website

A boutique investment bank's marketing site, built with [Astro](https://astro.build).

## Local Development

Requires Node 18+.

```bash
npm install          # install dependencies
npm run dev           # start dev server at localhost:4321
npm run build          # production build to dist/
npm run preview        # serve the production build locally for a final check
```

Before merging any branch to `main` or triggering a deploy: run `npm run build && npm run preview`, click through every page — including the blog listing and both `/corporate-development/` and `/mergers-acquisitions/` redirect stubs — and confirm animations respect reduced motion (OS setting, or Chrome DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce"). Nothing should be merged or deployed without this local check passing.

## Project Structure

```
src/
  layouts/Base.astro       # shared <head>, header, footer for every page
  components/               # Header, Footer, HeroMetrics
  content/blog/              # blog posts (Markdown, one per file)
  pages/                     # one file per route; file name = URL
  styles/global.css          # all CSS, one file, custom properties for theme tokens
public/
  assets/                    # images, logos, brand files — served at /assets/...
  scripts/                   # plain JS, loaded via <script> tags (not bundled)
astro.config.mjs             # site URL, sitemap integration, file-based URL output
```

## Adding a Blog Post

Add a new file to `src/content/blog/`, for example `src/content/blog/my-new-post.md`:

```md
---
title: "Post Title"
date: 2026-09-01
author: "Author Name, Title"
excerpt: "One or two sentences shown on the blog listing page."
tags: ["Tag One", "Tag Two"]
---

Full post content in Markdown goes here.
```

Omit `tags` if you don't need any. If the post lives elsewhere (e.g. Medium, a partner site) instead of being written here, add `externalUrl: "https://..."` instead of writing a body — the listing page will link out to it instead of generating a page on this site.

## Brand Colors

Defined as CSS custom properties in `src/styles/global.css`:

```css
:root {
  --bg: #14181C;        /* Page background (Ink) */
  --ink: #FFFFFF;        /* Primary text */
  --muted: #8B8B8B;       /* Secondary text */
  --line: #252B31;        /* Borders and dividers */
  --accent: #E0A72B;       /* Primary accent (WTA Amber) */
  --accent-2: #B8934A;      /* Secondary accent (WTA Amber Deep) */
  --card: #1C2228;         /* Card / surface background */
}
```

## Analytics & Cookie Consent

`public/assets/js/consent.js` shows a cookie consent banner on first visit and only loads Google Analytics 4 after the visitor accepts. GA Measurement ID is set at the top of that file (`GA_ID`).

## Deployment

Hosted on GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`). Pushing to `main` triggers `npm ci && npm run build`, then deploys the `dist/` output. No manual deploy step, no secrets required (uses GitHub's built-in Pages token).

The custom domain (`watertoweradvisors.com`) is set via `public/CNAME`, which Astro copies into every build.

## Contact

- Email: info@watertoweradvisors.com
- Phone: (424) 480-5449
