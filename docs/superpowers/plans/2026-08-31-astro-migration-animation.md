# Astro Migration + Animation + Brand Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Watertower Advisors static HTML site to Astro, fix the blog SEO gap, apply the Amber brand color, add a differentiated GSAP animation layer, and ship it all testable locally with zero deploy until the user approves.

**Architecture:** Astro static site generator (`build.format: 'file'` to preserve every existing `.html` URL exactly). Shared `Base.astro` layout + `Header`/`Footer` components kill the current 8x markup duplication. Blog becomes a native Astro content collection (one migrated entry, schema supports link-out posts since that's the only content that currently exists). Existing vanilla JS (`script.js`, `consent.js`) is carried over byte-for-byte as static files — zero behavior risk. GSAP is added purely additively for a new hero data-motif and card/CTA motion polish.

**Tech Stack:** Astro 7.x, `@astrojs/sitemap`, GSAP 3.12+ (core + ScrollTrigger, MIT, no paid plugins), Node 18+, npm, GitHub Actions (`actions/deploy-pages`).

**Spec:** `docs/superpowers/specs/2026-08-31-astro-migration-animation-design.md`

## Global Constraints

- Branch `astro-migration-animation` only. Nothing pushed to `origin`, nothing merged to `main`, until the user has run `npm run build && npm run preview` locally and explicitly approves.
- Public repo: no secrets/credentials committed in plaintext. The deploy workflow uses only GitHub's built-in `GITHUB_TOKEN` — no external tokens are needed for GitHub Pages deploy, so none are introduced.
- Every existing URL must resolve identically after migration (`/about.html`, `/services.html#ma`, `/corporate-development/`, etc.) — no SEO-breaking URL changes. Enforced via `build.format: 'file'` and root-absolute asset/nav paths (see Task 4 rationale).
- All copy/content is carried over unchanged except the two explicitly-approved fixes: accent color (`#E85C3A` → `#E0A72B`) and the contact-page background image path bug (see Task 3).
- `prefers-reduced-motion: reduce` must render the final state immediately for every new GSAP animation, with no blocked interaction.
- No new npm dependency beyond `astro`, `@astrojs/sitemap`, and `gsap`.

---

### Task 1: Astro project scaffold + config

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, `npm run preview` scripts used by every later task and by the user's local verification.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "watertower-advisors-website",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  },
  "dependencies": {
    "astro": "^7.1.6",
    "@astrojs/sitemap": "^3.2.1",
    "gsap": "^3.12.7"
  }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://watertoweradvisors.com',
  build: {
    format: 'file',
  },
  integrations: [sitemap()],
});
```

`build.format: 'file'` is required: without it, `src/pages/about.astro` emits `about/index.html` served at `/about/`, silently changing every existing URL and breaking the sitemap/backlinks/canonical tags already indexed by Google. With it, `about.astro` emits `about.html` served at `/about.html` — identical to today.

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/base"
}
```

- [ ] **Step 4: Update `.gitignore`**

Read current `.gitignore` first, then append (don't overwrite):

```
node_modules/
dist/
.astro/
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, `package-lock.json` created, no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore
git commit -m "Scaffold Astro project with file-based output to preserve existing URLs"
```

---

### Task 2: Move assets into `public/`, fix the space-in-path bug

**Files:**
- Create: `public/assets/brand/watertower-wordmark-white.png` (copy of the referenced wordmark)
- Create: `public/assets/brand/favicon.png` (copy of the referenced favicon)
- Move: `assets/hero/`, `assets/images/`, `assets/logos/`, `assets/team/`, `assets/js/`, `assets/og-image.jpg` → same paths under `public/assets/`
- Create: `public/CNAME`, `public/robots.txt`, `public/llms.txt`

**Interfaces:**
- Produces: every asset reachable at `/assets/<subpath>` with zero spaces anywhere in the path — this is what every later page/component task references.

Only two files inside `assets/Watertower Advisors Logo Package/` are referenced anywhere in the current site (confirmed by grep across all HTML): the white wordmark and the 2026 favicon. The rest of that directory (multiple unused logomark/wordmark variants in different formats) is unreferenced design-source clutter, consistent with the prior cleanup in commit `25c6f46`. Only the two used files are carried forward, under a clean flat path.

- [ ] **Step 1: Copy the two referenced brand files to a clean path**

```bash
mkdir -p public/assets/brand
cp "assets/Watertower Advisors Logo Package/Digital (RGB)/Watertower_Advisors_Wordmark_W.png" public/assets/brand/watertower-wordmark-white.png
cp "assets/Watertower Advisors Logo Package/Digital (RGB)/WA_Favicon_2026.png" public/assets/brand/favicon.png
```

- [ ] **Step 2: Move the rest of the referenced asset tree into `public/`**

```bash
mkdir -p public/assets
mv assets/hero public/assets/hero
mv assets/images public/assets/images
mv assets/logos public/assets/logos
mv assets/team public/assets/team
mv assets/js public/assets/js
mv assets/og-image.jpg public/assets/og-image.jpg
```

- [ ] **Step 3: Verify no page still references the old space-containing path**

Run: `grep -r "Watertower Advisors Logo Package" --include="*.astro" src/ 2>/dev/null; echo "done"`
Expected: no output before "done" (there are no `.astro` files yet at this point in the plan — this is a guard re-run at the end of Task 13 once all pages exist; for now just confirm the copy succeeded)

Run: `ls public/assets/brand/`
Expected: `favicon.png` and `watertower-wordmark-white.png` listed.

- [ ] **Step 4: Move root-level static files that GitHub Pages needs into `public/`**

```bash
cp CNAME public/CNAME
cp llms.txt public/llms.txt
```

`robots.txt` needs one content change (the sitemap URL) before copying — done in Task 15 alongside the sitemap integration, not here.

- [ ] **Step 5: Commit**

```bash
git add public/
git commit -m "Move site assets into public/, flatten brand asset paths to remove spaces"
```

Note: the original `assets/` directory (now missing `hero/`, `images/`, `logos/`, `team/`, `js/`, `og-image.jpg`) still contains the full `Watertower Advisors Logo Package/`, the two loose top-level PNGs, and `.DS_Store`. These are removed in Task 17's cleanup step once every page has been ported and confirmed working — deleting them now, before the old `.html` files are removed, would break the still-live legacy pages during the migration.

---

### Task 3: Global stylesheet with brand color fix

**Files:**
- Create: `src/styles/global.css`

**Interfaces:**
- Produces: every class/token used by every component and page task below (`.container`, `.section`, `.hero`, `.btn--primary`, `--accent`, etc. — unchanged names from the current `styles.css`).

Port `styles.css` to `src/styles/global.css` with three fixes, all found while reading the current file:

1. **Brand color**: `--accent` from `#E85C3A` to `#E0A72B` (WTA Amber), `--accent-2` from `#B8431F` to `#B8934A` (WTA Amber Deep).
2. **Hardcoded rgba literals that don't use the CSS variable** — these were hand-typed from the old accent's RGB `(232,92,58)` and would stay orange even after the variable changes: `.input:focus` box-shadow, `.service-number` background, `.industry-toggle:hover` background. Replace each with the equivalent Amber RGB `(224,167,43)`.
3. **Orphaned/broken CSS block**: lines ~114-120 of the current file contain a syntax error — a duplicate `.nav__link::after` rule fragment with no selector, left over from a bad edit (the real `.nav__link::after` rule already exists correctly at the current line ~96-101). Drop the orphaned fragment entirely.
4. **Contact-page background image path bug**: `body.contact-page main.contact-fullpage` currently points to `assets/images/venti-views-PiqHSHYO3Uw-unsplash.jpg`, a file that does not exist anywhere in the repo (confirmed via `find`) — this is a live 404 on production today. The only `venti-views-*` file that exists is `venti-views-0YWaDPylkYA-unsplash.jpg` (also used as the Industries hero). Point the contact background at that file.
5. All asset `url(...)` references become root-absolute (`/assets/...`) instead of relative, since later pages (blog post detail pages) live one directory level deep and relative paths would resolve incorrectly from there.

- [ ] **Step 1: Create `src/styles/global.css`**

```css
/* ==== Fonts & Tokens ==== */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap');

:root{
  --bg:#14181C; --ink:#FFFFFF; --muted:#8B8B8B; --line:#252B31;
  --accent:#E0A72B; --accent-2:#B8934A; --card:#1C2228;
  --radius:12px; --space:24px; --max:1200px;
  --transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --shadow-sm:0 1px 3px rgba(0,0,0,0.3);
  --shadow-md:0 4px 6px rgba(0,0,0,0.4);
  --shadow-lg:0 10px 25px rgba(0,0,0,0.6);
}

/* ==== Page Loader ==== */
.page-loader{
  position:fixed; inset:0; z-index:9999;
  background:var(--bg); display:flex; align-items:center; justify-content:center;
  transition:opacity 0.6s ease, visibility 0.6s ease;
}
.page-loader--hidden{
  opacity:0; visibility:hidden;
}
.loader-spinner{
  width:48px; height:48px; border:4px solid var(--line);
  border-top-color:var(--accent); border-radius:50%;
  animation:spin 0.8s linear infinite;
}
@keyframes spin{
  to{transform:rotate(360deg)}
}

/* ==== Scroll Animations ==== */
.fade-in{
  opacity:0; transform:translateY(30px);
  transition:opacity 0.8s ease-out, transform 0.8s ease-out;
}
.fade-in.in-view{
  opacity:1; transform:translateY(0);
}
.fade-in-delay-1{
  transition-delay:0.1s;
}
.fade-in-delay-2{
  transition-delay:0.2s;
}
.fade-in-delay-3{
  transition-delay:0.3s;
}

/* ==== Base ==== */
*{box-sizing:border-box}
html{scroll-behavior:smooth}
html,body{height:100%}
body{
  margin:0; background:var(--bg); color:var(--ink);
  font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
  line-height:1.6; overflow-x:hidden;
}
img{max-width:100%; height:auto; display:block}
a{color:inherit; transition:var(--transition)}

/* ==== Layout / Grid rhythm ==== */
.container{max-width:var(--max); margin:0 auto; padding:0 var(--space)}
.section{padding:64px 0}
.section--tight{padding:40px 0}
.grid{display:grid; gap:var(--space)}
.grid-3{grid-template-columns:repeat(3,1fr)}
.grid-2{grid-template-columns:repeat(2,1fr)}

/* ==== Header ==== */
.header{position:sticky; top:0; z-index:10; background:rgba(20,24,28,0.92); border-bottom:1px solid var(--line); backdrop-filter:blur(12px)}
.nav{display:flex; align-items:center; justify-content:space-between; height:90px; padding-top:12px; padding-bottom:12px}
.nav__brand{display:flex; align-items:center; gap:14px; text-decoration:none; font-weight:700; transition:var(--transition); font-size:16px}
.nav__brand:hover{opacity:0.8; transform:translateY(-1px)}
.nav__brand img{height:60px; width:auto; flex-shrink:0}

.footer-brand{display:flex; align-items:center}
.footer-brand img{height:50px; width:auto; flex-shrink:0}

.nav__links{display:flex; gap:28px}
.nav__link{text-decoration:none; font-weight:500; padding:4px 0; position:relative}
.nav__link::after{
  content:''; position:absolute; bottom:0; left:0; width:0; height:2px;
  background:var(--accent); transition:width 0.3s ease;
}
.nav__link:hover::after{width:100%}
.nav__link[aria-current="page"]{border-bottom:2px solid var(--accent)}
.nav__link[aria-current="page"]::after{width:0}

/* Hamburger menu */
.hamburger{
  display:none; background:none; border:none; cursor:pointer;
  padding:8px; flex-direction:column; gap:5px; z-index:20;
}
.hamburger span{
  display:block; width:24px; height:2px; background:var(--ink);
  transition:all 0.3s ease; border-radius:2px;
}
.hamburger.active span:nth-child(1){transform:rotate(45deg) translate(7px, 7px)}
.hamburger.active span:nth-child(2){opacity:0}
.hamburger.active span:nth-child(3){transform:rotate(-45deg) translate(7px, -7px)}

/* ==== Hero ==== */
.hero{position:relative; min-height:70vh; display:flex; align-items:center; overflow:hidden}
.hero--image{background-size:cover; background-position:center}
.hero::after{content:""; position:absolute; inset:0; background:linear-gradient(135deg, rgba(20,24,28,.80), rgba(20,24,28,.60))}
.hero__inner{position:relative; z-index:1; color:#fff; max-width:900px}
.hero h1{
  font-family:Manrope,Inter,sans-serif; font-weight:800; font-size:clamp(40px, 6vw, 64px);
  line-height:1.1; margin:0 0 20px; letter-spacing:-0.02em;
}
.hero p{max-width:720px; margin:0 0 32px; color:#F1F5F9; font-size:clamp(16px, 2vw, 20px); line-height:1.6}

/* ==== Buttons ==== */
.actions{display:flex; gap:16px; flex-wrap:wrap}
.btn{
  display:inline-flex; align-items:center; justify-content:center; gap:10px;
  padding:14px 28px; border-radius:var(--radius); font-weight:600; text-decoration:none;
  cursor:pointer; transition:var(--transition); border:none; font-size:16px;
  box-shadow:var(--shadow-sm); position:relative; overflow:hidden;
}
.btn::before{
  content:""; position:absolute; inset:0; background:rgba(255,255,255,0.1);
  transform:translateX(-100%); transition:transform 0.3s ease;
}
.btn:hover::before{transform:translateX(0)}
.btn--primary{background:var(--accent); color:#fff}
.btn--primary:hover{transform:translateY(-2px); box-shadow:var(--shadow-lg)}
.btn--secondary{border:2px solid currentColor; background:transparent}
.btn--secondary:hover{background:rgba(255,255,255,0.1); transform:translateY(-2px)}
.btn--secondary{color:#fff}

/* ==== Cards / Stats ==== */
.card{
  background:var(--bg); border:1px solid var(--line); border-radius:16px; padding:24px;
  transition:var(--transition); box-shadow:var(--shadow-sm);
}
.card:hover{
  transform:translateY(-4px); box-shadow:var(--shadow-lg); border-color:var(--accent);
}
.stat{display:flex; flex-direction:column; gap:8px; text-align:center}
.stat__value{
  font-family:Manrope; font-weight:800; font-size:clamp(36px, 5vw, 48px);
  background:linear-gradient(135deg, var(--accent), var(--accent-2));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  background-clip:text;
}
.stat__label{color:var(--muted); font-size:15px; font-weight:500}
.kicker{
  letter-spacing:.1em; text-transform:uppercase; color:var(--accent);
  font-size:13px; font-weight:700; margin-bottom:8px;
}
.h2{
  font-family:Manrope; font-size:clamp(32px, 4vw, 44px); line-height:1.15;
  margin:0 0 16px; font-weight:800; letter-spacing:-0.02em;
}
.h3{
  font-family:Manrope; font-size:22px; line-height:1.3;
  margin:0 0 8px; font-weight:700;
}
.lead{color:var(--muted); max-width:760px; font-size:clamp(16px, 2vw, 18px); line-height:1.7}

/* ==== Footer ==== */
.footer{border-top:1px solid var(--line)}
.footer-grid{display:flex; flex-wrap:wrap; gap:40px; justify-content:space-between; align-items:flex-start; padding:40px 0 24px}
.footer-contact,.footer-legal{display:flex; flex-direction:column; gap:8px}
.footer-link{color:var(--muted); text-decoration:none; font-size:14px; transition:color 0.2s}
.footer-link:hover{color:var(--ink)}
.footer-bottom{border-top:1px solid var(--line); padding:20px 0; font-size:14px}

/* ==== Legal Page ==== */
.legal-nav{display:flex; flex-wrap:wrap; gap:12px; margin-bottom:16px}
.legal-nav-link{color:var(--accent); text-decoration:none; font-size:14px; font-weight:600; padding:8px 16px; border:1px solid var(--accent); border-radius:6px; transition:var(--transition)}
.legal-nav-link:hover{background:var(--accent); color:#fff}
.legal-section{border-top:1px solid var(--line)}
.legal-content{max-width:800px}
.legal-header{margin-bottom:32px}
.legal-date{color:var(--muted); font-size:14px; margin-top:8px}
.legal-content h3{color:var(--ink); font-size:18px; font-weight:600; margin:32px 0 12px}
.legal-content p{color:var(--muted); line-height:1.7; margin-bottom:16px}
.legal-content ul{color:var(--muted); line-height:1.7; padding-left:24px; margin-bottom:16px}
.legal-content li{margin-bottom:6px}
.legal-content code{background:var(--card); padding:2px 6px; border-radius:4px; font-size:13px; font-family:monospace}

/* ==== Contact ==== */
.input, textarea{
  width:100%; padding:12px 14px; border:1px solid var(--line); border-radius:10px;
  font:inherit; background:var(--bg); color:var(--ink); transition:var(--transition);
}
.input:focus, textarea:focus{
  outline:none; border-color:var(--accent); box-shadow:0 0 0 3px rgba(224,167,43,0.15);
}
textarea{min-height:140px; resize:vertical}

body.contact-page{display:flex; flex-direction:column; min-height:100vh}
body.contact-page main.contact-fullpage{
  flex:1; position:relative;
  background-image:url('/assets/images/venti-views-0YWaDPylkYA-unsplash.jpg');
  background-size:cover; background-position:center;
  display:flex; align-items:center; justify-content:center;
}
.contact-overlay{
  position:absolute; inset:0;
  background:linear-gradient(180deg, rgba(20,24,28,0.55), rgba(20,24,28,0.70));
}
.contact-content{
  position:relative; z-index:1;
  text-align:center; color:#fff;
  padding:80px 24px; max-width:700px; width:100%;
}
.contact-content .kicker{color:var(--accent)}
.contact-content .lead{color:rgba(255,255,255,0.85); margin-bottom:40px}
.contact-details{display:flex; gap:16px; flex-wrap:wrap; justify-content:center}

.contact-form{
  display:flex; flex-direction:column; gap:18px;
  max-width:560px; margin:0 auto; text-align:left;
  background:rgba(20,24,28,0.55); border:1px solid rgba(255,255,255,0.08);
  border-radius:16px; padding:32px; backdrop-filter:blur(8px);
}
.contact-form__row{display:grid; grid-template-columns:1fr 1fr; gap:16px}
.contact-form__field{display:flex; flex-direction:column; gap:6px}
.contact-form__field label{
  font-size:13px; font-weight:600; color:rgba(255,255,255,0.85);
  letter-spacing:0.02em;
}
.contact-form .input,
.contact-form textarea{
  background:rgba(255,255,255,0.06); color:var(--ink);
  border:1px solid rgba(255,255,255,0.12);
}
.contact-form .input::placeholder,
.contact-form textarea::placeholder{color:rgba(255,255,255,0.4)}
.contact-form .input:focus,
.contact-form textarea:focus{
  border-color:var(--accent);
  background:rgba(255,255,255,0.08);
}
.contact-form__submit{align-self:flex-start; margin-top:4px}
.contact-form__status{
  margin:0; min-height:1.2em; font-size:14px;
  color:rgba(255,255,255,0.75);
}
.contact-form__status--success{color:#7CE787}
.contact-form__status--error{color:#FF8E72}

@media (max-width:640px){
  .contact-content{padding:60px 20px}
  .contact-details{flex-direction:column; align-items:center}
  .contact-form{padding:24px}
  .contact-form__row{grid-template-columns:1fr}
}

/* ==== Tablet ==== */
@media (max-width:1024px){
  .grid-3{grid-template-columns:repeat(2,1fr)}
  .hero{min-height:60vh}
  .section{padding:56px 0}
  .section--tight{padding:36px 0}
  .nav__brand img{height:42px}
}

/* ==== Mobile ==== */
@media (max-width:640px){
  .grid-3,.grid-2{grid-template-columns:1fr}
  .nav__links{gap:18px}
  .hero{min-height:50vh}
  .btn{padding:12px 20px; font-size:15px}
  .section{padding:40px 0}
  .section--tight{padding:32px 0}
  .actions{gap:12px}
}

/* ==== Blog Styles ==== */
.blog-grid{
  display:grid; gap:32px; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr));
}
.blog-card{
  display:flex; flex-direction:column; height:100%;
  transition:var(--transition);
}
.blog-card__content{
  display:flex; flex-direction:column; gap:12px; height:100%;
}
.blog-meta{
  display:flex; align-items:center; gap:8px;
  font-size:14px; color:var(--muted); font-weight:500;
}
.blog-meta__divider{color:var(--line)}
.blog-card__title{
  margin:0; font-size:22px; line-height:1.3;
  transition:color 0.3s ease;
}
.blog-card:hover .blog-card__title{color:var(--accent)}
.blog-card__description{color:var(--muted); margin:0; line-height:1.6; flex-grow:1}
.blog-tags{display:flex; flex-wrap:wrap; gap:8px; margin-top:4px}
.blog-tag{
  display:inline-block; padding:4px 12px;
  background:var(--card); border:1px solid var(--line);
  border-radius:20px; font-size:13px; font-weight:500;
  color:var(--muted); transition:var(--transition);
}
.blog-card:hover .blog-tag{border-color:var(--accent); color:var(--accent)}
.blog-card__link{
  display:inline-flex; align-items:center; gap:6px;
  text-decoration:none; color:var(--accent); font-weight:600;
  font-size:15px; margin-top:8px; width:fit-content;
  transition:var(--transition);
}
.blog-card__link svg{transition:transform 0.3s ease}
.blog-card__link:hover{gap:10px}
.blog-card__link:hover svg{transform:translateX(4px)}
.blog-loading{
  display:flex; flex-direction:column; align-items:center;
  justify-content:center; padding:60px 20px; text-align:center;
}
.no-posts{padding:60px 20px; text-align:center}

@media (max-width:640px){
  .hamburger{display:flex}
  .nav__links{
    position:fixed; top:90px; left:0; right:0;
    background:var(--bg); border-bottom:1px solid var(--line);
    flex-direction:column; gap:0; padding:0;
    max-height:0; overflow:hidden; transition:max-height 0.3s ease;
    box-shadow:0 4px 12px rgba(0,0,0,0.1);
  }
  .nav__links.active{max-height:400px; padding:16px 0}
  .nav__link{padding:12px 24px; width:100%; border-bottom:1px solid var(--line)}
  .nav__link:last-child{border-bottom:none}
  .nav__link::after{display:none}
  .nav__brand img{height:32px}
  .footer-brand img{height:38px}
  .footer-grid{flex-direction:column; gap:24px; padding:32px 0 20px}
  .blog-grid{grid-template-columns:1fr}
}

/* ==== Services Detail ==== */
.service-summary-card{
  background:var(--bg); border:1px solid var(--line);
  border-radius:12px; padding:28px; transition:var(--transition);
  display:flex; flex-direction:column; gap:12px;
}
.service-summary-card:hover{
  transform:translateY(-4px); box-shadow:var(--shadow-lg);
  border-color:var(--accent);
}
.service-number{
  display:inline-block; font-size:14px; font-weight:700;
  color:var(--accent); background:rgba(224,167,43,0.12);
  padding:6px 12px; border-radius:6px; width:fit-content;
  margin-bottom:4px;
}
.service-summary-card h3{margin:0 0 8px; font-size:20px}
.service-summary-card p{margin:0; color:var(--muted); line-height:1.6; flex-grow:1}
.service-link{
  color:var(--accent); text-decoration:none; font-weight:600;
  font-size:15px; display:inline-flex; align-items:center; gap:6px;
  transition:var(--transition); width:fit-content;
}
.service-link:hover{gap:10px; text-decoration:underline}
.service-detail{max-width:900px; margin:0 auto}
.service-features{
  display:grid; grid-template-columns:repeat(2, 1fr); gap:24px; margin:32px 0;
}
.service-feature{
  padding:20px; background:var(--bg); border:1px solid var(--line);
  border-radius:12px; transition:var(--transition);
}
.service-feature:hover{
  border-color:var(--accent); transform:translateY(-2px);
  box-shadow:var(--shadow-md);
}
.service-feature h3{margin:0 0 8px; color:var(--accent)}
.service-feature p{margin:0; color:var(--muted); line-height:1.6}
.service-description{margin-top:32px; padding-top:32px; border-top:1px solid var(--line)}
.service-description p{color:var(--muted); line-height:1.8; margin-bottom:16px}
.service-description p:last-child{margin-bottom:0}

/* ==== Client Logo Strip ==== */
.client-logos{
  display:flex; align-items:center; justify-content:center;
  gap:64px; flex-wrap:wrap; row-gap:32px;
  padding:24px 0;
}
.client-logo{
  height:56px; width:auto; max-width:180px; object-fit:contain;
  filter:grayscale(100%) opacity(0.7);
  transition:var(--transition);
}
.client-logo:hover{filter:grayscale(0%) opacity(1); transform:translateY(-2px)}

.testimonials-teaser{background:var(--card)}
.testimonials-section{background:var(--bg)}

@media (max-width:1024px){
  .service-features{grid-template-columns:1fr}
}
@media (max-width:640px){
  .service-detail{padding:0}
}

/* ==== Industries Page ==== */
.industry-section{padding:60px 0; border-bottom:1px solid var(--line)}
.industry-section:last-of-type{border-bottom:none}
.industry-content{
  display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:center;
}
.industry-section--reverse .industry-content{direction:rtl}
.industry-section--reverse .industry-text{direction:ltr}
.industry-image{
  position:relative; border-radius:16px; overflow:hidden;
  box-shadow:var(--shadow-lg); transition:var(--transition);
}
.industry-image:hover{transform:translateY(-4px); box-shadow:0 20px 40px rgba(0,0,0,0.15)}
.industry-image img{width:100%; height:100%; object-fit:cover; aspect-ratio:4/3; display:block}
.industry-text{display:flex; flex-direction:column; gap:16px}
.industry-text h2{margin:0 0 8px; color:var(--ink)}
.industry-text p{margin:0; color:var(--muted); line-height:1.7}
.industry-toggle{
  display:inline-flex; align-items:center; gap:8px;
  padding:10px 18px; margin-top:8px;
  background:var(--card); border:1px solid var(--line);
  border-radius:8px; color:var(--accent); font-weight:600;
  font-size:15px; cursor:pointer; transition:var(--transition);
  font-family:inherit; width:fit-content;
}
.industry-toggle:hover{
  border-color:var(--accent); background:rgba(224,167,43,0.06);
  transform:translateY(-2px);
}
.industry-toggle svg{transition:transform 0.3s ease}
.industry-toggle[aria-expanded="true"] svg{transform:rotate(180deg)}
.industry-verticals{
  margin-top:16px; padding:20px;
  background:var(--card); border:1px solid var(--line);
  border-radius:12px; animation:slideDown 0.3s ease-out;
}
@keyframes slideDown{
  from{opacity:0; transform:translateY(-10px)}
  to{opacity:1; transform:translateY(0)}
}
.industry-verticals ul{margin:0; padding:0; list-style:none; display:grid; gap:12px}
.industry-verticals li{padding-left:24px; position:relative; color:var(--muted); line-height:1.6}
.industry-verticals li::before{
  content:'•'; position:absolute; left:8px; color:var(--accent);
  font-weight:bold; font-size:20px;
}

@media (max-width:1024px){
  .industry-section{padding:48px 0}
  .industry-content{gap:36px}
}
@media (max-width:768px){
  .industry-content{grid-template-columns:1fr; gap:32px}
  .industry-section--reverse .industry-content{direction:ltr}
  .industry-image{order:-1}
  .industry-section{padding:40px 0}
}

/* ==== Utility ==== */
.visually-hidden{position:absolute!important;clip:rect(1px,1px,1px,1px);padding:0;border:0;height:1px;width:1px;overflow:hidden;white-space:nowrap}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "Add global stylesheet with Amber brand color and three existing-bug fixes"
```

---

### Task 4: Client-side scripts (ported unchanged)

**Files:**
- Create: `public/scripts/main.js`
- Create: `public/assets/js/consent.js` (already done via move in Task 2 — this task only verifies it)

**Interfaces:**
- Produces: `/scripts/main.js`, loaded via a plain `<script src="/scripts/main.js" defer></script>` tag from `Base.astro` — same loading pattern as today, zero behavior change.

The current `script.js` already contains every piece of interaction logic used across the whole site (page loader, hamburger, fade-in observer, counter, smooth scroll, footer year, industry toggle) in one file. It is copied verbatim — no code changes — since the spec calls for porting this logic as-is, not rewriting it.

- [ ] **Step 1: Create `public/scripts/main.js`**

```js
// ==== Page Loader & Animations ====

// Preloader fade-out on page load
window.addEventListener('load', () => {
  const loader = document.querySelector('.page-loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('page-loader--hidden');
    }, 400);
  }
});

// ==== Hamburger Menu Toggle ====
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav__links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      const isExpanded = hamburger.classList.contains('active');
      hamburger.setAttribute('aria-expanded', isExpanded);
    });

    const links = navLinks.querySelectorAll('.nav__link');
    links.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }
});

// ==== Scroll Animations (Intersection Observer) ====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach((el) => observer.observe(el));
});

// ==== Stats Counter Animation ====
const animateCounter = (element, target, duration = 2000) => {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = formatNumber(target);
      clearInterval(timer);
    } else {
      element.textContent = formatNumber(Math.floor(current));
    }
  }, 16);
};

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(0) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toString();
};

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll('[data-count]');
      counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute('data-count'));
        animateCounter(counter, target);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.addEventListener('DOMContentLoaded', () => {
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }
});

// ==== Smooth Scroll for Anchor Links ====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ==== Update Copyright Year ====
const yearElement = document.getElementById('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// ==== Industry Verticals Toggle ====
document.addEventListener('DOMContentLoaded', () => {
  const industryToggles = document.querySelectorAll('.industry-toggle');

  industryToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const targetId = toggle.getAttribute('aria-controls');
      const targetElement = document.getElementById(targetId);
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

      if (targetElement) {
        if (isExpanded) {
          toggle.setAttribute('aria-expanded', 'false');
          targetElement.hidden = true;
          toggle.querySelector('span').textContent = 'View Verticals';
        } else {
          toggle.setAttribute('aria-expanded', 'true');
          targetElement.hidden = false;
          toggle.querySelector('span').textContent = 'Hide Verticals';
        }
      }
    });
  });
});
```

- [ ] **Step 2: Verify `consent.js` landed correctly in Task 2's move**

Run: `ls public/assets/js/consent.js && head -3 public/assets/js/consent.js`
Expected: file exists, first lines show `(function(){` / `var CONSENT_KEY = 'wt_ga_consent';`.

- [ ] **Step 3: Commit**

```bash
git add public/scripts/main.js
git commit -m "Port existing interaction script unchanged into public/scripts"
```

---

### Task 5: `Base.astro` layout, `Header.astro`, `Footer.astro`

**Files:**
- Create: `src/layouts/Base.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`

**Interfaces:**
- Consumes: `src/styles/global.css` (Task 3), `/scripts/main.js` and `/assets/js/consent.js` (Task 4), `/assets/brand/watertower-wordmark-white.png` and `/assets/brand/favicon.png` (Task 2).
- Produces: `Base.astro` accepting props `{ title: string; description: string; path: string; current?: 'about' | 'services' | 'industries' | 'blog' | 'contact' | ''; bodyClass?: string }`, with a named slot `schema` for per-page JSON-LD `<script>` tags and the default slot for page `<main>` content. `Header.astro` accepts `{ current }` (same union type). `Footer.astro` takes no props.

Two deliberate corrections while unifying these, both because a single shared component can only encode one behavior where the current 8 hand-copied files silently disagreed:

1. **Nav links become root-absolute** (`/about.html` instead of `about.html`). The current relative links only work because every existing page lives at the root. Once blog posts exist at `/blog/<slug>/` (Task 13), a relative link from that depth would resolve wrong. Root-absolute works from any depth.
2. **Blog link removed from the nav consistently.** Today, `blog.html`'s own header is the only one that includes a "Blog" nav link — every other page's header omits it, and the README states blog is "intentionally hidden from nav" pending real content. Since there's only one thin external-link post today (confirmed with the user), the nav stays consistent with the other 7 pages: no Blog link. The page itself remains live and indexable via the sitemap; it's just not in primary nav. This is a one-line, explicitly-called-out resolution of an existing inconsistency, not a content change.

- [ ] **Step 1: Create `src/components/Header.astro`**

```astro
---
interface Props {
  current?: 'about' | 'services' | 'industries' | 'blog' | 'contact' | '';
}
const { current = '' } = Astro.props;
---
<header class="header">
  <div class="container nav">
    <a class="nav__brand" href="/index.html">
      <img src="/assets/brand/watertower-wordmark-white.png" alt="Watertower Advisors" />
    </a>
    <button class="hamburger" aria-label="Toggle menu" aria-expanded="false">
      <span></span>
      <span></span>
      <span></span>
    </button>
    <nav class="nav__links" aria-label="Primary">
      <a class="nav__link" href="/about.html" aria-current={current === 'about' ? 'page' : undefined}>About</a>
      <a class="nav__link" href="/services.html" aria-current={current === 'services' ? 'page' : undefined}>Services</a>
      <a class="nav__link" href="/industries.html" aria-current={current === 'industries' ? 'page' : undefined}>Industries</a>
      <a class="nav__link" href="/contact.html" aria-current={current === 'contact' ? 'page' : undefined}>Contact</a>
    </nav>
  </div>
</header>
```

- [ ] **Step 2: Create `src/components/Footer.astro`**

```astro
<footer class="footer" role="contentinfo">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="/assets/brand/watertower-wordmark-white.png" alt="Watertower Advisors" />
      </div>
      <div class="footer-contact">
        <a href="/contact.html" class="footer-link">Contact Us</a>
        <a href="tel:+14244805449" class="footer-link">(424) 480-5449</a>
        <span class="footer-link">8383 Wilshire Blvd. Suite 815, Beverly Hills, CA 90211</span>
      </div>
      <div class="footer-legal">
        <a href="/legal.html#privacy" class="footer-link">Privacy Policy</a>
        <a href="/legal.html#terms" class="footer-link">Terms of Service</a>
        <a href="/legal.html#cookies" class="footer-link">Cookie Policy</a>
        <a href="/legal.html#accessibility" class="footer-link">Accessibility</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span style="color:var(--muted)">© <span id="year"></span> Watertower Advisors. All rights reserved.</span>
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Create `src/layouts/Base.astro`**

```astro
---
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description: string;
  path: string;
  current?: 'about' | 'services' | 'industries' | 'blog' | 'contact' | '';
  bodyClass?: string;
}

const { title, description, path, current = '', bodyClass } = Astro.props;
const canonical = new URL(path, Astro.site).toString();
const ogImage = new URL('/assets/og-image.jpg', Astro.site).toString();
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Watertower Advisors" />
    <meta property="og:url" content={canonical} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImage} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />
    <link rel="icon" href="/assets/brand/favicon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/brand/favicon.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/brand/favicon.png" />
    <link rel="apple-touch-icon" href="/assets/logos/apple-touch-icon.png" />
    <script src="/assets/js/consent.js" defer></script>
    <slot name="schema" />
  </head>
  <body class={bodyClass}>
    <div class="page-loader">
      <div class="loader-spinner"></div>
    </div>
    <Header current={current} />
    <slot />
    <Footer />
    <script src="/scripts/main.js" defer></script>
  </body>
</html>
```

- [ ] **Step 4: Verify it builds in isolation**

Run: `npm run build`
Expected: fails with "no pages found" or similar (no `src/pages/*.astro` exist yet) — this confirms `Base.astro`/`Header.astro`/`Footer.astro` at least parse without Astro syntax errors. If the error is a template/syntax error inside these three files, fix before proceeding.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Base.astro src/components/Header.astro src/components/Footer.astro
git commit -m "Add shared Base layout, Header, and Footer components"
```

---

### Task 6: Homepage (`index.astro`)

**Files:**
- Create: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Base.astro` (Task 5).

- [ ] **Step 1: Create `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';

const schema = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "@id": "https://watertoweradvisors.com/#organization",
  "name": "Watertower Advisors",
  "url": "https://watertoweradvisors.com",
  "logo": "https://watertoweradvisors.com/assets/brand/watertower-wordmark-white.png",
  "description": "Boutique investment bank advising venture-backed companies on M&A and capital raising. Serving early- and growth-stage companies from $10M–$250M.",
  "telephone": "+14244805449",
  "email": "info@watertoweradvisors.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "8383 Wilshire Blvd. Suite 815",
    "addressLocality": "Beverly Hills",
    "addressRegion": "CA",
    "postalCode": "90211",
    "addressCountry": "US"
  },
  "areaServed": "US",
  "foundingDate": "2010",
  "sameAs": ["https://www.linkedin.com/company/watertower-advisors"],
  "serviceType": [
    "Sell-Side M&A Advisory",
    "Buy-Side M&A Advisory",
    "Capital Raising",
    "Corporate Development Advisory"
  ]
};
---
<Base
  title="Watertower Advisors | Boutique Investment Bank — Los Angeles"
  description="Boutique investment bank in Los Angeles advising venture-backed companies on M&A and capital raising ($10M–$250M). Founder-first approach."
  path="/"
>
  <script type="application/ld+json" slot="schema" set:html={JSON.stringify(schema)} />

  <main>
    <section class="hero hero--image" style="background-image:url('/assets/hero/la-palms.jpg')">
      <div class="container hero__inner">
        <h1 style="font-size:clamp(30px,4vw,50px)">Boutique Investment Bank for M&amp;A &amp; Capital Raising in Los Angeles</h1>
        <p>Watertower Advisors is a Los Angeles-based boutique investment bank partnering with early- and growth-stage, venture-backed companies for fundraising and M&amp;A across the U.S. and global markets.</p>
        <div class="actions">
          <a class="btn btn--primary" href="/contact.html">Let's Talk</a>
        </div>
      </div>
    </section>

    <section class="section stats-section" aria-labelledby="stats-heading">
      <h2 id="stats-heading" class="visually-hidden">Stats</h2>
      <div class="container fade-in" style="text-align:center; margin-bottom:32px">
        <p class="lead" style="margin:0 auto; max-width:820px">Boutique M&amp;A advisory and capital raising for venture-backed technology, AI, media, and consumer internet companies — Los Angeles and nationwide.</p>
      </div>
      <div class="container grid grid-3">
        <div class="stat card fade-in">
          <div class="stat__value" data-count="25">25</div>
          <div class="stat__label">Years of Advisory Experience</div>
        </div>
        <div class="stat card fade-in fade-in-delay-1">
          <div class="stat__value">$1B+</div>
          <div class="stat__label">Transaction Value</div>
        </div>
        <div class="stat card fade-in fade-in-delay-2">
          <div class="stat__value">60+</div>
          <div class="stat__label">Deals Completed</div>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="services-heading">
      <div class="container fade-in">
        <div class="kicker">What We Do</div>
        <h2 id="services-heading" class="h2">Advisory services for founders</h2>
        <p class="lead">We advise venture-backed teams through pivotal growth moments, aligning the right capital and strategic counterparties to accelerate outcomes.</p>
      </div>
      <div class="container grid grid-2" style="margin-top:32px">
        <article class="card fade-in">
          <h3 class="h3">Capital Raising</h3>
          <p class="body">$10M-$200M+ equity and debt financing for early and mid-stage companies. Complete mandate management from document preparation to close.</p>
          <a href="/services.html#capital-raising" class="service-link">Learn more →</a>
        </article>
        <article class="card fade-in fade-in-delay-1">
          <h3 class="h3">Mergers &amp; Acquisitions</h3>
          <p class="body">Strategic M&amp;A advisory for transactions between $10M-$250M+. Bespoke approach connecting you to industry leaders from roadshow to close.</p>
          <a href="/services.html#ma" class="service-link">Learn more →</a>
        </article>
        <article class="card fade-in fade-in-delay-2">
          <h3 class="h3">Corporate Development</h3>
          <p class="body">Strategic partnerships and alliances across emerging tech, consumer internet, media tech, and blockchain technologies.</p>
          <a href="/services.html#corp-dev" class="service-link">Learn more →</a>
        </article>
        <article class="card fade-in fade-in-delay-3">
          <h3 class="h3">Buy-Side M&amp;A</h3>
          <p class="body">Expert acquisition advisory to grow market share, launch revenue streams, and acquire talent with strategic guidance on valuations.</p>
          <a href="/services.html#buy-side" class="service-link">Learn more →</a>
        </article>
      </div>
    </section>

    <section class="section section--tight" aria-labelledby="ai-spotlight-heading">
      <div class="container fade-in">
        <div class="card" style="background:var(--card)">
          <div class="grid grid-2">
            <div>
              <div class="kicker">Sector Focus</div>
              <h2 id="ai-spotlight-heading" class="h2">Actively advising founders building with AI</h2>
              <p class="lead">From generative AI platforms to AI infrastructure and applied AI across verticals, we bring deep sector knowledge and an active network to help AI companies raise capital, find strategic partners, and execute transactions.</p>
              <a href="/industries.html#ai-ml" class="btn btn--secondary" style="margin-top:16px">Explore AI &amp; ML &rarr;</a>
            </div>
            <div style="display:flex; align-items:center; justify-content:flex-end">
              <div style="text-align:right; max-width:280px">
                <div style="font-size:2.5rem; font-weight:800; color:var(--accent); font-family:var(--font-heading); line-height:1">AI & ML</div>
                <div style="color:var(--muted); margin-top:8px; font-size:0.95rem">Generative AI · AI Infrastructure · AI Agents · Applied AI · AI-Native SaaS · MLOps</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section testimonials-teaser" aria-labelledby="testimonials-teaser-heading">
      <div class="container fade-in">
        <div class="kicker" style="text-align:center">Founders We've Worked With</div>
        <h2 id="testimonials-teaser-heading" class="h2" style="text-align:center">Trusted by industry leaders</h2>
        <div class="client-logos">
          <img src="/assets/logos/machinima.png" alt="Machinima" class="client-logo" loading="lazy">
          <img src="/assets/logos/tripp.png" alt="TRIPP" class="client-logo" loading="lazy">
          <img src="/assets/logos/riot-games.png" alt="Riot Games" class="client-logo" loading="lazy">
          <img src="/assets/logos/mesh.png" alt="Mesh" class="client-logo" loading="lazy">
          <img src="/assets/logos/airbit.png" alt="Airbit" class="client-logo" loading="lazy">
          <img src="/assets/logos/repost.png" alt="Repost" class="client-logo" loading="lazy">
          <img src="/assets/logos/bot-auto.png" alt="Bot.Auto" class="client-logo" loading="lazy">
          <img src="/assets/logos/kangaroo.png" alt="Kangaroo" class="client-logo" loading="lazy">
        </div>
      </div>
    </section>

    <section class="section section--tight" aria-labelledby="cta-home">
      <div class="container fade-in">
        <div class="card" style="background:var(--card)">
          <div class="grid grid-2">
            <div>
              <div class="kicker">Get Started</div>
              <h2 id="cta-home" class="h2">Exploring a raise, sale, or partnership?</h2>
              <p class="lead">We'd love to learn about your company and share how we can help.</p>
            </div>
            <div style="display:flex; align-items:center; justify-content:flex-end">
              <a class="btn btn--primary" href="/contact.html">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</Base>
```

Note: the hero data-motif animation described in the spec is layered onto this exact hero section in Task 14, once the animation infrastructure exists — not duplicated here.

- [ ] **Step 2: Build and verify the homepage renders**

Run: `npm run dev` (leave running), then in another terminal: `curl -s http://localhost:4321/ | grep -o '<title>[^<]*</title>'`
Expected: `<title>Watertower Advisors | Boutique Investment Bank — Los Angeles</title>`

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "Migrate homepage to Astro"
```

---

### Task 7: About page (`about.astro`)

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Create `src/pages/about.astro`**

```astro
---
import Base from '../layouts/Base.astro';

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Derek Norton",
  "jobTitle": "Founder & Non-Exec Chairman",
  "worksFor": { "@id": "https://watertoweradvisors.com/#organization" },
  "description": "Serial entrepreneur and venture capitalist with over 25 years of experience in technology, internet, and digital media. Founder and Managing Partner of Watertower Advisors.",
  "alumniOf": { "@type": "CollegeOrUniversity", "name": "University of Southern California" },
  "url": "https://watertoweradvisors.com/about.html"
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://watertoweradvisors.com/" },
    { "@type": "ListItem", "position": 2, "name": "About", "item": "https://watertoweradvisors.com/about.html" }
  ]
};
---
<Base
  title="About Watertower Advisors | Investment Banking & M&A Advisory"
  description="Watertower Advisors is a Los Angeles boutique investment bank led by Derek Norton, with 25+ years advising venture-backed tech and media companies."
  path="/about.html"
  current="about"
>
  <script type="application/ld+json" slot="schema" set:html={JSON.stringify(personSchema)} />
  <script type="application/ld+json" slot="schema" set:html={JSON.stringify(breadcrumbSchema)} />

  <main>
    <section class="section" aria-labelledby="who">
      <div class="container grid grid-2">
        <div class="fade-in">
          <div class="kicker">Who We Are</div>
          <h1 id="who" class="h2" style="margin:0 0 12px">Boutique investment banking, founder-first</h1>
          <p class="lead">We combine deep operating experience with a hands-on advisory model, bringing clarity, speed, and competitive tension to every process.</p>
          <p>From capital raising to strategic M&amp;A, we align incentives with founders and tailor mandates to fit the stage, sector, and story.</p>
        </div>
        <div class="fade-in fade-in-delay-1">
          <img src="/assets/hero/la-palms.jpg" alt="Los Angeles skyline with palm trees" width="1920" height="1255" style="border-radius:16px; border:1px solid var(--line)" />
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="approach">
      <div class="container fade-in">
        <div class="kicker">Our Approach</div>
        <h2 id="approach" class="h2">What guides our work</h2>
      </div>
      <div class="container grid grid-3" style="margin-top:24px">
        <article class="card fade-in">
          <h3 class="h3">Data-Driven</h3>
          <p>Market mapping, cohort analysis, and rigorous narrative testing to position your company with conviction.</p>
        </article>
        <article class="card fade-in fade-in-delay-1">
          <h3 class="h3">Founder-First</h3>
          <p>We structure processes to protect time, preserve optionality, and prioritize long-term outcomes.</p>
        </article>
        <article class="card fade-in fade-in-delay-2">
          <h3 class="h3">Network Reach</h3>
          <p>Direct access to leading investors and strategics across the U.S. and global markets.</p>
        </article>
      </div>
    </section>

    <section class="section" aria-labelledby="founder">
      <div class="container fade-in">
        <div class="kicker">Our Founder</div>
        <h2 id="founder" class="h2">Leadership</h2>
      </div>
      <div class="container grid grid-2 fade-in" style="margin-top:24px; align-items:center; gap:48px">
        <div>
          <img src="/assets/team/derek-norton.jpg" alt="Portrait of Derek Norton" style="width:100%; aspect-ratio:1/1; object-fit:cover; object-position:center top; border-radius:16px; border:1px solid var(--line)" />
        </div>
        <div>
          <h3 class="h3" style="margin:0 0 4px">Derek Norton</h3>
          <div style="color:var(--muted); margin:0 0 20px; font-weight:500">Founder &amp; Non-Exec Chairman</div>
          <p>Derek is a serial entrepreneur and venture capitalist with over 25 years of experience in technology, internet, and digital media. He is the founder and managing partner of Watertower Advisors, an industry-leading boutique investment bank utilizing a differentiated approach to fundraising and M&amp;A.</p>
          <p>In his role at Watertower Advisors, Derek has advised over 200 companies — including Widevine, Riot Games, and Machinima — and has been an active investor for over 18 years. Prior to founding Watertower Advisors, he was a partner at Entertainment Media Ventures, a Michael Milken-backed $120M seed and early-stage venture fund.</p>
          <p>Derek holds a BA in Communications from USC, serves on several corporate boards, and is the founder of the Innovators Collective — an ongoing event series for entrepreneurs, investors, and senior executives.</p>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="team">
      <div class="container fade-in">
        <div class="kicker">Team</div>
        <h2 id="team" class="h2">Experienced advisors, founder-first</h2>
        <p class="lead">A senior, hands-on team with deep operating and transaction experience across venture ecosystems.</p>
      </div>
      <div class="container grid grid-3" style="margin-top:24px">
        <article class="card fade-in" style="padding:0">
          <img src="/assets/team/connor-doyle.jpg" alt="Portrait of Connor Doyle" style="width:100%; aspect-ratio:1/1; object-fit:cover; object-position:center top; border-top-left-radius:16px; border-top-right-radius:16px" loading="lazy" />
          <div style="padding:16px 20px">
            <h3 class="h3" style="margin:0 0 4px">Connor Doyle</h3>
            <div style="color:var(--muted); margin:0 0 8px">Managing Director</div>
            <p style="margin:0">MBA from UCLA Anderson, BBA in Finance from UT. Entrepreneur with experience in technology, mobile, and consumer products. Focuses on capital raising and M&A for digital media, gaming, and consumer brands. Co-author of <a href="https://cfoadvisors.com/founders-guide-to-ma-playbook.html" target="_blank" rel="noopener noreferrer">A Practical M&amp;A Playbook for Founders</a>.</p>
          </div>
        </article>
        <article class="card fade-in fade-in-delay-1" style="padding:0">
          <img src="/assets/team/pranav-lodha.jpg" alt="Portrait of Pranav Lodha" style="width:100%; aspect-ratio:1/1; object-fit:cover; object-position:center top; border-top-left-radius:16px; border-top-right-radius:16px" loading="lazy" />
          <div style="padding:16px 20px">
            <h3 class="h3" style="margin:0 0 4px">Pranav Lodha</h3>
            <div style="color:var(--muted); margin:0 0 8px">Associate | Tech Specialist</div>
            <p style="margin:0">Pranav brings engineering experience across large enterprises and early stage startups, with a focus on AI infra, deep tech, and platform infra. He holds an MBA from UCLA Anderson and studied computer science and economics at UC Santa Cruz before completing a graduate degree in software engineering.</p>
          </div>
        </article>
        <article class="card fade-in fade-in-delay-2" style="padding:0">
          <img src="/assets/team/eric-ross.jpg" alt="Portrait of Eric Ross" style="width:100%; aspect-ratio:1/1; object-fit:cover; object-position:center top; border-top-left-radius:16px; border-top-right-radius:16px; filter:grayscale(100%)" loading="lazy" />
          <div style="padding:16px 20px">
            <h3 class="h3" style="margin:0 0 4px">Eric Ross</h3>
            <div style="color:var(--muted); margin:0 0 8px">Associate</div>
            <p style="margin:0">Eric brings a strong foundation in financial analysis and capital markets, with experience spanning equity research, credit analysis, and valuation modeling. He has covered companies across gaming, media, deep tech, and aerospace, developing sector expertise through roles at Citizens Capital Markets and JMP Securities. Eric holds a BBA in Finance from the University of Texas.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="section" aria-labelledby="advisors">
      <div class="container fade-in">
        <div class="kicker">Advisors</div>
        <h2 id="advisors" class="h2">Strategic advisors</h2>
        <p class="lead">Industry leaders providing strategic guidance and network access.</p>
      </div>
      <div class="container grid grid-3" style="margin-top:24px">
        <article class="card fade-in" style="padding:0">
          <img src="/assets/team/michael-kassan.jpg" alt="Portrait of Michael Kassan" style="width:100%; aspect-ratio:1/1; object-fit:cover; object-position:center top; border-top-left-radius:16px; border-top-right-radius:16px" loading="lazy" />
          <div style="padding:16px 20px; text-align:center">
            <h3 class="h3" style="margin:0 0 4px">Michael Kassan</h3>
            <div style="color:var(--muted); margin:0; font-size:0.875rem">Founder &amp; CEO, 3C Ventures</div>
          </div>
        </article>
        <article class="card fade-in fade-in-delay-1" style="padding:0">
          <img src="/assets/team/allen-debevoise.jpg" alt="Portrait of Allen Debevoise" style="width:100%; aspect-ratio:1/1; object-fit:cover; object-position:center top; border-top-left-radius:16px; border-top-right-radius:16px" loading="lazy" />
          <div style="padding:16px 20px; text-align:center">
            <h3 class="h3" style="margin:0 0 4px">Allen Debevoise</h3>
            <div style="color:var(--muted); margin:0; font-size:0.875rem">Co-Founder &amp; CEO, Machinima</div>
          </div>
        </article>
        <article class="card fade-in fade-in-delay-2" style="padding:0">
          <img src="/assets/team/jordan-levin.jpg" alt="Portrait of Jordan Levin" style="width:100%; aspect-ratio:1/1; object-fit:cover; object-position:center top; border-top-left-radius:16px; border-top-right-radius:16px" loading="lazy" />
          <div style="padding:16px 20px; text-align:center">
            <h3 class="h3" style="margin:0 0 4px">Jordan Levin</h3>
            <div style="color:var(--muted); margin:0; font-size:0.875rem">Former CEO, The WB Network</div>
          </div>
        </article>
        <article class="card fade-in" style="padding:0">
          <img src="/assets/team/mark-terbeek.jpg" alt="Portrait of Mark Terbeek" style="width:100%; aspect-ratio:1/1; object-fit:cover; object-position:center top; border-top-left-radius:16px; border-top-right-radius:16px" loading="lazy" />
          <div style="padding:16px 20px; text-align:center">
            <h3 class="h3" style="margin:0 0 4px">Mark Terbeek</h3>
            <div style="color:var(--muted); margin:0; font-size:0.875rem">Partner, Greycroft</div>
          </div>
        </article>
        <article class="card fade-in fade-in-delay-1" style="padding:0">
          <img src="/assets/team/kevin-wall.jpg" alt="Portrait of Kevin Wall" style="width:100%; aspect-ratio:1/1; object-fit:cover; object-position:center top; border-top-left-radius:16px; border-top-right-radius:16px" loading="lazy" />
          <div style="padding:16px 20px; text-align:center">
            <h3 class="h3" style="margin:0 0 4px">Kevin Wall</h3>
            <div style="color:var(--muted); margin:0; font-size:0.875rem">Founder &amp; CEO, Live Earth</div>
          </div>
        </article>
      </div>
    </section>
  </main>
</Base>
```

- [ ] **Step 2: Verify**

Run: `curl -s http://localhost:4321/about.html | grep -c 'Derek Norton'`
Expected: a count greater than 0.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "Migrate about page to Astro"
```

---

### Task 8: Services page (`services.astro`)

**Files:**
- Create: `src/pages/services.astro`

- [ ] **Step 1: Create `src/pages/services.astro`**

```astro
---
import Base from '../layouts/Base.astro';

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Watertower Advisors Services",
  "itemListElement": [
    {
      "@type": "ListItem", "position": 1,
      "item": {
        "@type": "Service", "name": "Capital Raising",
        "description": "Equity and debt financing advisory for early and mid-stage companies raising $10M–$200M+. Complete mandate management from document preparation to close.",
        "provider": { "@id": "https://watertoweradvisors.com/#organization" }
      }
    },
    {
      "@type": "ListItem", "position": 2,
      "item": {
        "@type": "Service", "name": "Sell-Side M&A Advisory",
        "description": "Strategic M&A advisory for transactions between $10M–$250M. Bespoke approach connecting founders to industry-leading acquirers from roadshow to close.",
        "provider": { "@id": "https://watertoweradvisors.com/#organization" }
      }
    },
    {
      "@type": "ListItem", "position": 3,
      "item": {
        "@type": "Service", "name": "Corporate Development",
        "description": "Strategic partnerships and alliances across emerging tech, consumer internet, media tech, and blockchain.",
        "provider": { "@id": "https://watertoweradvisors.com/#organization" }
      }
    },
    {
      "@type": "ListItem", "position": 4,
      "item": {
        "@type": "Service", "name": "Buy-Side M&A Advisory",
        "description": "Acquisition advisory to grow market share, launch new revenue streams, and acquire talent. Expert guidance on valuations and deal structures.",
        "provider": { "@id": "https://watertoweradvisors.com/#organization" }
      }
    }
  ]
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://watertoweradvisors.com/" },
    { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://watertoweradvisors.com/services.html" }
  ]
};
---
<Base
  title="Capital Raising & M&A Advisory | Watertower Advisors"
  description="Watertower Advisors offers sell-side M&A, buy-side M&A, capital raising, and corporate development advisory for venture-backed startups from $10M–$250M."
  path="/services.html"
  current="services"
>
  <script type="application/ld+json" slot="schema" set:html={JSON.stringify(itemListSchema)} />
  <script type="application/ld+json" slot="schema" set:html={JSON.stringify(breadcrumbSchema)} />

  <main>
    <section class="hero hero--image" style="background-image:url('/assets/hero/services-hero.jpg')">
      <div class="container hero__inner">
        <div class="kicker">Our Services</div>
        <h1>Where we add the most value</h1>
        <p>High-touch execution, precise positioning, and calibrated outreach driven by data and relationships.</p>
      </div>
    </section>

    <section class="section" aria-labelledby="services-overview" style="background:var(--card)">
      <div class="container">
        <div class="fade-in" style="text-align:center; margin-bottom:40px">
          <div class="kicker">Our Expertise</div>
          <h2 id="services-overview" class="h2">Comprehensive Advisory Services</h2>
          <p class="lead" style="margin:0 auto; max-width:700px">From capital raising to strategic M&A, we provide end-to-end support for early and growth-stage companies.</p>
        </div>
        <div class="grid grid-2" style="gap:24px">
          <article class="service-summary-card fade-in">
            <div class="service-number">01</div>
            <h3 class="h3">Capital Raising</h3>
            <p>$10M-$200M+ equity and debt financing for early and mid-stage companies. Complete mandate management from pitch preparation to close.</p>
            <a href="#capital-raising" class="service-link">Learn more →</a>
          </article>
          <article class="service-summary-card fade-in fade-in-delay-1">
            <div class="service-number">02</div>
            <h3 class="h3">Mergers &amp; Acquisitions</h3>
            <p>Micro M&A advisory for transactions between $10M-$250M. Strategic positioning that maximizes value while minimizing downside risk.</p>
            <a href="#ma" class="service-link">Learn more →</a>
          </article>
          <article class="service-summary-card fade-in fade-in-delay-2">
            <div class="service-number">03</div>
            <h3 class="h3">Corporate Development</h3>
            <p>Strategic partnerships and alliances across emerging tech, consumer internet, media tech, and blockchain. Contract advisory and financial analysis.</p>
            <a href="#corp-dev" class="service-link">Learn more →</a>
          </article>
          <article class="service-summary-card fade-in fade-in-delay-3">
            <div class="service-number">04</div>
            <h3 class="h3">Buy-Side M&amp;A</h3>
            <p>Strategic acquisition advisory to grow market share, launch revenue streams, and acquire talent. Expert guidance on valuations and deal structures.</p>
            <a href="#buy-side" class="service-link">Learn more →</a>
          </article>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="capital-raising">
      <div class="container fade-in">
        <article class="service-detail">
          <div class="kicker">01</div>
          <h2 id="capital-raising" class="h2">Venture Capital &amp; Growth Equity Fundraising Advisory</h2>
          <p class="lead">Entire mandate management from document preparation, roadshow coordination with venture, private equity and strategic investors, negotiations and process closing activities.</p>
          <div class="service-features">
            <div class="service-feature">
              <h3 class="h3">Document Preparation</h3>
              <p>Comprehensive pitch decks, financial models, and data room materials that position your company for maximum investor appeal.</p>
            </div>
            <div class="service-feature">
              <h3 class="h3">Strategy Refinement</h3>
              <p>Aligning your narrative, market positioning, and growth trajectory to resonate with the right investor profiles.</p>
            </div>
            <div class="service-feature">
              <h3 class="h3">Financial Analysis</h3>
              <p>Deep-dive valuation modeling, cap table optimization, and scenario planning to support strategic fundraising decisions.</p>
            </div>
            <div class="service-feature">
              <h3 class="h3">Mandate Management</h3>
              <p>End-to-end process coordination from initial outreach through close, ensuring founder focus remains on the business.</p>
            </div>
          </div>
          <div class="service-description">
            <p>Watertower Advisors supports an active yet underserved market of early and mid-stage companies seeking to secure funding via equity and/or debt financing. We support groups seeking to raise $10M-$200M+ in funding to expand product offerings and support business growth.</p>
            <p>Raising capital is a monumental endeavor. For entrepreneurs who are already challenged by limited time and resources, this additional distraction from the core focus of building their business too often results in failure.</p>
            <p>We believe strongly that management's attention and energies should be concentrated entirely on operating and growing the business they know, while our team works towards achieving critical initiatives on their behalf.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="section" aria-labelledby="ma" style="background:var(--card)">
      <div class="container fade-in">
        <article class="service-detail">
          <div class="kicker">02</div>
          <h2 id="ma" class="h2">Sell-Side M&amp;A Advisory for Venture-Backed Companies</h2>
          <p class="lead">A bespoke approach to strategic M&A advisory connecting you to industry leaders. We fully manage your process from roadshow to close. We specialize in sell-side M&A advisory for venture-backed technology, media, and AI companies across the U.S., with particular expertise in transactions between $10M and $250M.</p>
          <div class="service-description">
            <p>Watertower Advisors recognizes an active yet underserved market in Micro M&A – Transactions of between $10 Million and $250 Million. Watertower Advisors is a strategically positioned boutique advisor taking early and middle-stage venture-backed portfolio companies to market through a unique and innovative approach to M&A.</p>
            <p>By introducing companies to the market with a strategic and collaborative objective as the mandate, we can efficiently achieve the desired transaction while limiting downside risk associated with a sales or auction process run by traditional M&A shops.</p>
            <p>A tiered and comprehensive approach is utilized in targeting the most likely and otherwise unlikely set of acquirers and strategic partners.</p>
          </div>
          <div class="card" style="margin-top:24px">
            <div class="kicker">Further Reading</div>
            <h3 class="h3" style="margin:8px 0 8px">A Practical M&A Playbook for Founders</h3>
            <p style="color:var(--muted); margin:0 0 12px">Watertower Managing Director Connor Doyle co-authored a founder's guide to selling a company covering buyer types, deal timing relative to fundraising, diligence readiness, and deal structuring, including a case study on how process rigor can change founder take-home by 5x.</p>
            <a href="https://cfoadvisors.com/founders-guide-to-ma-playbook.html" target="_blank" rel="noopener noreferrer" class="service-link">Read the Playbook →</a>
          </div>
        </article>
      </div>
    </section>

    <section class="section" aria-labelledby="corp-dev">
      <div class="container fade-in">
        <article class="service-detail">
          <div class="kicker">03</div>
          <h2 id="corp-dev" class="h2">Corporate Development</h2>
          <p class="lead">Strategic partnerships and growth initiatives that accelerate enterprise value.</p>
          <div class="service-description">
            <p>Watertower Advisors partners with executive teams to design and execute corporate development strategies that expand capabilities, unlock new markets, and strengthen competitive positioning.</p>
            <p>We leverage deep sector expertise and senior-level relationships across media and technology to identify high-impact partnerships, commercial alliances, and strategic collaborations. From early-stage positioning to expansion-stage scaling, we help companies sharpen their strategic roadmap and align initiatives with long-term capital objectives, whether preparing for growth-stage fundraising or positioning for a strategic exit.</p>
            <p>Our team supports opportunity evaluation, financial modeling, and transaction structuring, while advising on partnership negotiations to ensure alignment and long-term value creation. We act as a disciplined strategic partner throughout the process, enabling leadership teams to execute growth initiatives with clarity and confidence.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="section" aria-labelledby="buy-side" style="background:var(--card)">
      <div class="container fade-in">
        <article class="service-detail">
          <div class="kicker">04</div>
          <h2 id="buy-side" class="h2">Buy-Side M&amp;A</h2>
          <p class="lead">Expert guidance on acquisitions that drive strategic growth and competitive advantage.</p>
          <div class="service-description">
            <p>Watertower Advisors partners with CEOs, boards, and investors to identify, evaluate, and execute acquisitions that accelerate long-term value creation.</p>
            <p>We help the C-Suite develop an effective M&A strategy for growing market share, launch new revenue streams, acquire talent, and expand their business.</p>
            <p>We work alongside leadership teams to define acquisition criteria aligned with strategic priorities, whether expanding into adjacent markets, adding differentiated capabilities, or deepening competitive moats. Leveraging our deep sector expertise and trusted network across media and technology, we proactively source opportunities both on and off market.</p>
            <p>Our team conducts rigorous market and financial analysis, supports valuation and deal structuring, and leads negotiations through closing. We manage the process end to end, enabling management teams to stay focused on running their business while we drive transaction execution.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="section testimonials-section" aria-labelledby="testimonials">
      <div class="container fade-in" style="text-align:center">
        <div class="kicker">Client Success</div>
        <h2 id="testimonials" class="h2">Trusted by Founders</h2>
        <p class="lead" style="margin:0 auto; max-width:600px">We've partnered with founders and executives at industry-leading companies to close transformative deals.</p>
        <div class="client-logos" style="margin:40px 0">
          <img src="/assets/logos/machinima.png" alt="Machinima" class="client-logo" loading="lazy">
          <img src="/assets/logos/tripp.png" alt="TRIPP" class="client-logo" loading="lazy">
          <img src="/assets/logos/riot-games.png" alt="Riot Games" class="client-logo" loading="lazy">
          <img src="/assets/logos/mesh.png" alt="Mesh" class="client-logo" loading="lazy">
          <img src="/assets/logos/airbit.png" alt="Airbit" class="client-logo" loading="lazy">
          <img src="/assets/logos/repost.png" alt="Repost" class="client-logo" loading="lazy">
          <img src="/assets/logos/bot-auto.png" alt="Bot.Auto" class="client-logo" loading="lazy">
          <img src="/assets/logos/kangaroo.png" alt="Kangaroo" class="client-logo" loading="lazy">
        </div>
      </div>
    </section>

    <section class="section section--tight" aria-labelledby="cta-services">
      <div class="container fade-in">
        <div class="card" style="background:var(--card)">
          <div class="grid grid-2">
            <div>
              <div class="kicker">Ready to explore?</div>
              <h2 id="cta-services" class="h2">Let's map the right path</h2>
              <p class="lead">We'll tailor an approach for your stage, sector, and outcome.</p>
            </div>
            <div style="display:flex; align-items:center; justify-content:flex-end">
              <a class="btn btn--primary" href="/contact.html">Start a Conversation</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</Base>
```

- [ ] **Step 2: Verify**

Run: `curl -s http://localhost:4321/services.html | grep -c 'id="corp-dev"'`
Expected: `1` (confirms the anchor the redirect stubs point to still exists).

- [ ] **Step 3: Commit**

```bash
git add src/pages/services.astro
git commit -m "Migrate services page to Astro"
```

---

### Task 9: Industries page (`industries.astro`)

**Files:**
- Create: `src/pages/industries.astro`

- [ ] **Step 1: Create `src/pages/industries.astro`**

```astro
---
import Base from '../layouts/Base.astro';

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://watertoweradvisors.com/" },
    { "@type": "ListItem", "position": 2, "name": "Industries", "item": "https://watertoweradvisors.com/industries.html" }
  ]
};
---
<Base
  title="Industries | Sector Focus — Watertower Advisors"
  description="Watertower Advisors advises founders in AI, media tech, aerospace & defense, robotics, gaming, creator economy, Web3, and consumer software."
  path="/industries.html"
  current="industries"
>
  <script type="application/ld+json" slot="schema" set:html={JSON.stringify(breadcrumbSchema)} />

  <main>
    <section class="hero hero--image" style="background-image:url('/assets/images/venti-views-0YWaDPylkYA-unsplash.jpg')">
      <div class="container hero__inner fade-in">
        <div class="kicker">Industry Expertise</div>
        <h1 id="ind" class="h2">Deep domain knowledge across high-growth sectors</h1>
        <p class="lead">We partner with innovators building the future across media, technology, and frontier industries. Our network and pattern recognition create outsized value for founders and investors.</p>
      </div>
    </section>

    <section class="industry-section" aria-labelledby="ai-ml">
      <div class="container">
        <div class="industry-content fade-in">
          <div class="industry-image">
            <img src="/assets/images/steve-johnson-_0iV9LmPDn0-unsplash.jpg" alt="Abstract visualization of artificial intelligence and machine learning" width="1200" height="675" loading="lazy">
          </div>
          <div class="industry-text">
            <h2 id="ai-ml" class="h2">Artificial Intelligence & Machine Learning</h2>
            <p>Artificial intelligence is reshaping every industry, from how content is created to how enterprises operate. We work with founders and investors at the frontier of generative AI, AI infrastructure, and applied AI applications across verticals. Our pattern recognition across hundreds of transactions positions us to identify value and drive outcomes in a rapidly evolving landscape. We advise AI startups on Series A through growth-stage fundraising, strategic partnerships, and M&amp;A exits, connecting founders with the right venture capital and corporate strategic partners.</p>
            <button class="industry-toggle" aria-expanded="false" aria-controls="ai-ml-verticals">
              <span>View Verticals</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div id="ai-ml-verticals" class="industry-verticals" hidden>
              <ul>
                <li>Generative AI & Foundation Models</li>
                <li>AI Infrastructure & Compute</li>
                <li>AI Agents & Automation</li>
                <li>Applied AI (Healthcare, Legal, Finance)</li>
                <li>AI-Native SaaS & Enterprise Tools</li>
                <li>Data Platforms & MLOps</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="industry-section industry-section--reverse" aria-labelledby="media-tech">
      <div class="container">
        <div class="industry-content fade-in">
          <div class="industry-image">
            <img src="/assets/images/MediaTechImage.jpg" alt="Media technology workspace" width="1200" height="800" loading="lazy">
          </div>
          <div class="industry-text">
            <h2 id="media-tech" class="h2">Media Tech</h2>
            <p>With our roots in the entertainment capital of the world, our team has deep domain expertise across media verticals and specializes at the intersection where technology meets media and entertainment.</p>
            <p>Our network is comprised of the world's leading entertainment giants and investors focused on the space.</p>
            <button class="industry-toggle" aria-expanded="false" aria-controls="media-tech-verticals">
              <span>View Verticals</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div id="media-tech-verticals" class="industry-verticals" hidden>
              <ul>
                <li>Entertainment & Production Tech</li>
                <li>SportsTech & Fan Engagement</li>
                <li>Video – Streaming, IP, Monetization</li>
                <li>Digital Marketing and Advertising</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="industry-section" aria-labelledby="music-audio">
      <div class="container">
        <div class="industry-content fade-in">
          <div class="industry-image">
            <img src="/assets/images/music-audio.jpg" alt="Music production and audio equipment" loading="lazy">
          </div>
          <div class="industry-text">
            <h2 id="music-audio" class="h2">Music & Audio</h2>
            <p>The music industry's evolution is powered by new creation platforms, AI-generated tracks, and streaming platforms, which have democratized access to music creation, distribution, and consumption. Networks and artist platforms are enabling artists to reach global audiences directly, bypassing traditional gatekeepers, and innovating in the creation and monetization of their work.</p>
            <button class="industry-toggle" aria-expanded="false" aria-controls="music-audio-verticals">
              <span>View Verticals</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div id="music-audio-verticals" class="industry-verticals" hidden>
              <ul>
                <li>Music Creation & Music AI Generation</li>
                <li>Artists & Producer Platforms</li>
                <li>Music & Audio Monetization</li>
                <li>Fan Engagement</li>
                <li>Streaming Services</li>
                <li>Podcast Creation & Distribution</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="industry-section industry-section--reverse" aria-labelledby="aerospace-defense-autonomy">
      <div class="container">
        <div class="industry-content fade-in">
          <div class="industry-image">
            <img src="/assets/images/alex-knight-2EJCSULRwC8-unsplash.jpg" alt="Aerospace and defense technology" width="1200" height="800" loading="lazy">
          </div>
          <div class="industry-text">
            <h2 id="aerospace-defense-autonomy" class="h2">Aerospace, Defense & Autonomy</h2>
            <p>The aerospace and defense sectors are undergoing rapid technological transformation, driven by advancements in autonomous systems, next-generation propulsion, and dual-use technologies. We advise companies at the frontier of defense technology, autonomous vehicles, uncrewed systems, and space, connecting them with strategic partners, defense primes, and investors shaping the future of national security and mobility.</p>
            <p>Our network spans leading defense contractors, government-aligned funds, and crossover investors actively deploying capital into commercial aerospace and autonomy platforms.</p>
            <button class="industry-toggle" aria-expanded="false" aria-controls="aerospace-defense-autonomy-verticals">
              <span>View Verticals</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div id="aerospace-defense-autonomy-verticals" class="industry-verticals" hidden>
              <ul>
                <li>Aerospace</li>
                <li>Defense Tech</li>
                <li>Autonomous Vehicles</li>
                <li>Autonomous Trucking</li>
                <li>Uncrewed Systems</li>
                <li>Space</li>
                <li>Sensors and Navigation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="industry-section" aria-labelledby="robotics-automation">
      <div class="container">
        <div class="industry-content fade-in">
          <div class="industry-image">
            <img src="/assets/images/frontier-tech.jpg" alt="Robotics and advanced manufacturing" loading="lazy">
          </div>
          <div class="industry-text">
            <h2 id="robotics-automation" class="h2">Robotics, Automation & Advanced Hardware</h2>
            <p>Robotics and advanced hardware are redefining productivity across manufacturing, logistics, and industrial operations. We partner with companies developing the next generation of physical intelligence, from collaborative robots and autonomous systems to advanced computing platforms and machine vision, helping them scale and connect with the right strategic and financial partners.</p>
            <p>Our network includes leading industrials, corporate strategics, and specialist investors driving the next wave of automation and hardware innovation.</p>
            <button class="industry-toggle" aria-expanded="false" aria-controls="robotics-automation-verticals">
              <span>View Verticals</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div id="robotics-automation-verticals" class="industry-verticals" hidden>
              <ul>
                <li>Robotics</li>
                <li>Industrial Automation</li>
                <li>Advanced Manufacturing</li>
                <li>Frontier Hardware</li>
                <li>Advanced Computing</li>
                <li>Machine Vision</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="industry-section industry-section--reverse" aria-labelledby="creator-economy">
      <div class="container">
        <div class="industry-content fade-in">
          <div class="industry-image">
            <img src="/assets/images/creator-economy.jpg" alt="Content creator workspace" loading="lazy">
          </div>
          <div class="industry-text">
            <h2 id="creator-economy" class="h2">Creator Economy</h2>
            <p>The creator economy is undergoing a significant evolution, marked by the emergence and integration of cutting-edge technologies that empower individuals to produce, distribute, and monetize content in unprecedented ways.</p>
            <button class="industry-toggle" aria-expanded="false" aria-controls="creator-economy-verticals">
              <span>View Verticals</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div id="creator-economy-verticals" class="industry-verticals" hidden>
              <ul>
                <li>Creator Services</li>
                <li>Influencer Marketplaces</li>
                <li>Creator Platforms</li>
                <li>Content Creation</li>
                <li>Social Media</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="industry-section" aria-labelledby="consumer-software">
      <div class="container">
        <div class="industry-content fade-in">
          <div class="industry-image">
            <img src="/assets/images/ConsumerInternet.jpg" alt="Consumer software and internet platforms" width="1200" height="800" loading="lazy">
          </div>
          <div class="industry-text">
            <h2 id="consumer-software" class="h2">Consumer Software & Internet</h2>
            <p>Consumer software and internet platforms continue to redefine how people connect, transact, and explore. From marketplaces to travel and dating, we partner with founders building the next generation of consumer experiences and the platforms that power them.</p>
            <button class="industry-toggle" aria-expanded="false" aria-controls="consumer-software-verticals">
              <span>View Verticals</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div id="consumer-software-verticals" class="industry-verticals" hidden>
              <ul>
                <li>Consumer Marketplaces</li>
                <li>E-Commerce and Marketplaces</li>
                <li>Travel</li>
                <li>Dating</li>
                <li>Social Commerce</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="industry-section industry-section--reverse" aria-labelledby="gaming">
      <div class="container">
        <div class="industry-content fade-in">
          <div class="industry-image">
            <img src="/assets/images/gaming.jpg" alt="Gaming and virtual reality experience" loading="lazy">
          </div>
          <div class="industry-text">
            <h2 id="gaming" class="h2">Gaming</h2>
            <p>The gaming industry is experiencing rapid growth, driven by advancements in tooling and technology, and a constant influx of innovative content. With the integration of virtual reality (VR), augmented reality (AR), and cloud gaming, players are being offered increasingly immersive and accessible gaming experiences.</p>
            <button class="industry-toggle" aria-expanded="false" aria-controls="gaming-verticals">
              <span>View Verticals</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div id="gaming-verticals" class="industry-verticals" hidden>
              <ul>
                <li>Gaming Studios</li>
                <li>Virtual Reality (VR) / Augmented Reality (AR)</li>
                <li>Gaming Infrastructure and Tools</li>
                <li>Web3 Gaming</li>
                <li>Mobile / Online Gaming</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="industry-section" aria-labelledby="internet-web3">
      <div class="container">
        <div class="industry-content fade-in">
          <div class="industry-image">
            <img src="/assets/images/internet-web3.jpg" alt="Internet infrastructure and blockchain technology" loading="lazy">
          </div>
          <div class="industry-text">
            <h2 id="internet-web3" class="h2">Internet & Web3</h2>
            <p>The internet is undergoing a transformation as new decentralized solutions begin emerging and more traditional firms look to tap into new technologies to serve their customers. The blockchain is revolutionizing industries and solutions across commerce, streamlining and resolving some of the world's oldest challenges.</p>
            <button class="industry-toggle" aria-expanded="false" aria-controls="internet-web3-verticals">
              <span>View Verticals</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div id="internet-web3-verticals" class="industry-verticals" hidden>
              <ul>
                <li>Internet Infrastructure</li>
                <li>Blockchain and Web3</li>
                <li>Communications</li>
                <li>DeFi & Crypto</li>
                <li>Blockchain Infrastructure</li>
                <li>IP and NFT</li>
                <li>DAO</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--tight" aria-labelledby="cta-industries">
      <div class="container fade-in">
        <div class="card" style="background:var(--card)">
          <div class="grid grid-2">
            <div>
              <div class="kicker">Partner with Us</div>
              <h2 id="cta-industries" class="h2">Exploring capital or strategic options?</h2>
              <p class="lead">We'll share perspective and an initial path within a quick intro call.</p>
            </div>
            <div style="display:flex; align-items:center; justify-content:flex-end">
              <a class="btn btn--primary" href="/contact.html">Schedule a Call</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</Base>
```

- [ ] **Step 2: Verify**

Run: `curl -s http://localhost:4321/industries.html | grep -c 'industry-toggle'`
Expected: `9` (one toggle button per industry section).

- [ ] **Step 3: Commit**

```bash
git add src/pages/industries.astro
git commit -m "Migrate industries page to Astro"
```

---

### Task 10: Contact page (`contact.astro`)

**Files:**
- Create: `src/pages/contact.astro`

The Web3Forms access key in the current `contact.html` is a public client-side form-submission identifier (it authorizes where form submissions get emailed, not an account credential) — same class of value as a Stripe publishable key or a Google Analytics measurement ID, both of which are already in this codebase's client-side JS. It is not a secret in the plaintext-credential sense the user flagged; it's carried over unchanged like the rest of the contact form markup.

- [ ] **Step 1: Create `src/pages/contact.astro`**

```astro
---
import Base from '../layouts/Base.astro';

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://watertoweradvisors.com/" },
    { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://watertoweradvisors.com/contact.html" }
  ]
};
---
<Base
  title="Contact — Watertower Advisors"
  description="Get in touch with Watertower Advisors. We advise venture-backed founders on M&A and capital raising. Reach us at info@watertoweradvisors.com or (424) 480-5449."
  path="/contact.html"
  current="contact"
  bodyClass="contact-page"
>
  <script type="application/ld+json" slot="schema" set:html={JSON.stringify(breadcrumbSchema)} />

  <main class="contact-fullpage">
    <div class="contact-overlay"></div>
    <div class="contact-content fade-in">
      <div class="kicker">Contact</div>
      <h1 id="contact-h" class="h2">We'd love to hear from you</h1>
      <p class="lead">Tell us a bit about your company and goals. We'll reply quickly with next steps.</p>

      <form id="contact-form" class="contact-form" action="https://api.web3forms.com/submit" method="POST" novalidate>
        <input type="hidden" name="access_key" value="6d62eec4-b62c-4079-8482-25169794ce02" />
        <input type="hidden" name="subject" value="New inquiry from watertoweradvisors.com" />
        <input type="hidden" name="from_name" value="Watertower Advisors Website" />
        <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off" />
        <div class="contact-form__row">
          <div class="contact-form__field">
            <label for="cf-name">Name</label>
            <input id="cf-name" class="input" type="text" name="name" autocomplete="name" required />
          </div>
          <div class="contact-form__field">
            <label for="cf-email">Email</label>
            <input id="cf-email" class="input" type="email" name="email" autocomplete="email" required />
          </div>
        </div>
        <div class="contact-form__field">
          <label for="cf-company">Company</label>
          <input id="cf-company" class="input" type="text" name="company" autocomplete="organization" />
        </div>
        <div class="contact-form__field">
          <label for="cf-message">How can we help?</label>
          <textarea id="cf-message" name="message" rows="5" required></textarea>
        </div>
        <button type="submit" class="btn btn--primary contact-form__submit">Send Message</button>
        <p id="contact-form-status" class="contact-form__status" role="status" aria-live="polite"></p>
      </form>
    </div>
  </main>

  <script>
    (function(){
      var form = document.getElementById('contact-form');
      var status = document.getElementById('contact-form-status');
      if (!form) return;
      form.addEventListener('submit', function(e){
        e.preventDefault();
        status.textContent = 'Sending…';
        status.className = 'contact-form__status';
        var data = new FormData(form);
        fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        }).then(function(response){
          return response.json().then(function(body){
            return { ok: response.ok, body: body };
          });
        }).then(function(result){
          if (result.ok && result.body && result.body.success) {
            form.reset();
            status.textContent = "Thanks — your message is on its way. We'll be in touch shortly.";
            status.classList.add('contact-form__status--success');
          } else {
            var msg = (result.body && result.body.message) || 'Something went wrong. Please email info@watertoweradvisors.com directly.';
            status.textContent = msg;
            status.classList.add('contact-form__status--error');
          }
        }).catch(function(){
          status.textContent = 'Network error. Please email info@watertoweradvisors.com directly.';
          status.classList.add('contact-form__status--error');
        });
      });
    })();
  </script>
</Base>
```

Note: this page's inline `<script>` is a plain (non-module) client script specific to this page — Astro processes `<script>` tags inside page/component files automatically, bundling and inlining them at build time. This is the one piece of interaction logic not routed through `public/scripts/main.js`, matching how it worked in the original (an inline `<script>` block only on `contact.html`).

- [ ] **Step 2: Verify**

Run: `curl -s http://localhost:4321/contact.html | grep -c 'access_key'`
Expected: `1`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/contact.astro
git commit -m "Migrate contact page to Astro"
```

---

### Task 11: Legal page (`legal.astro`)

**Files:**
- Create: `src/pages/legal.astro`

- [ ] **Step 1: Create `src/pages/legal.astro`**

```astro
---
import Base from '../layouts/Base.astro';

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://watertoweradvisors.com/" },
    { "@type": "ListItem", "position": 2, "name": "Legal", "item": "https://watertoweradvisors.com/legal.html" }
  ]
};
---
<Base
  title="Legal — Watertower Advisors"
  description="Privacy Policy, Terms of Service, Cookie Policy, and Accessibility Statement for Watertower Advisors."
  path="/legal.html"
>
  <script type="application/ld+json" slot="schema" set:html={JSON.stringify(breadcrumbSchema)} />

  <main>
    <section class="section section--tight" style="padding-top: 80px;">
      <div class="container">
        <div class="kicker">Legal</div>
        <h1 class="h2">Policies &amp; Legal Notices</h1>
        <p class="lead" style="margin-bottom: 48px;">Navigate to a specific section below.</p>
        <nav class="legal-nav" aria-label="Legal sections">
          <a href="#privacy" class="legal-nav-link">Privacy Policy</a>
          <a href="#terms" class="legal-nav-link">Terms of Service</a>
          <a href="#cookies" class="legal-nav-link">Cookie Policy</a>
          <a href="#accessibility" class="legal-nav-link">Accessibility</a>
        </nav>
      </div>
    </section>

    <section id="privacy" class="section legal-section">
      <div class="container legal-content">
        <div class="legal-header">
          <h2 class="h2">Privacy Policy</h2>
          <p class="legal-date">Last updated: March 2026</p>
        </div>
        <p>This Privacy Policy governs the manner in which Watertower Advisors, LLC ("Watertower Advisors," "we," "us," or "our") collects, uses, maintains, and discloses information collected from users (each, a "User") of the watertoweradvisors.com website ("Site"). This policy applies to the Site and all products and services offered by Watertower Advisors.</p>
        <h3>Personal Information We Collect</h3>
        <p>We may collect personal information from Users in a variety of ways, including when Users visit our Site, fill out a contact form, or engage with other activities, services, or features we make available. Personal information we may collect includes, but is not limited to:</p>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Mailing address</li>
          <li>Company name and role</li>
        </ul>
        <p>We collect personal information only if Users voluntarily submit it to us. Users may refuse to supply personal information, though this may limit their ability to engage in certain Site-related activities.</p>
        <h3>Non-Personal Information</h3>
        <p>We may automatically collect non-personal information when Users interact with our Site. This may include browser type, device type, operating system, internet service provider, referring URLs, pages visited, and time spent on the Site. This information is collected in aggregate form and does not identify individual users.</p>
        <h3>Cookies and Tracking Technologies</h3>
        <p>Our Site uses cookies and similar technologies to enhance the User experience, analyze site usage, and improve our services. For full details on the cookies we use and how to manage your preferences, please see our <a href="#cookies" style="color:var(--accent)">Cookie Policy</a>.</p>
        <h3>How We Use Your Information</h3>
        <p>We may use the information we collect for the following purposes:</p>
        <ul>
          <li>To respond to inquiries and provide requested services</li>
          <li>To improve the content and functionality of our Site</li>
          <li>To personalize your experience</li>
          <li>To send periodic communications (with your consent)</li>
          <li>To comply with legal obligations</li>
        </ul>
        <h3>How We Protect Your Information</h3>
        <p>We adopt appropriate technical and organizational security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information. Our Site is served over HTTPS to encrypt data in transit.</p>
        <h3>Sharing Your Information</h3>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share aggregated, non-personally identifiable information with trusted partners for analytical purposes. We may also disclose information when required by law or to protect the rights and safety of Watertower Advisors and its users.</p>
        <h3>Third-Party Services</h3>
        <p>Our Site may use third-party services such as Google Analytics (GA4) to analyze site usage. These third parties may collect information subject to their own privacy policies. We encourage you to review the privacy policies of any third-party services you interact with through our Site.</p>
        <h3>CCPA Privacy Rights (California Residents)</h3>
        <p>If you are a California resident, you have the right under the California Consumer Privacy Act (CCPA) to:</p>
        <ul>
          <li>Request disclosure of the categories and specific pieces of personal information we have collected about you</li>
          <li>Request deletion of your personal information</li>
          <li>Opt out of the sale of your personal information (note: we do not sell personal information)</li>
          <li>Not be discriminated against for exercising these rights</li>
        </ul>
        <p>To submit a request, contact us at <a href="mailto:info@watertoweradvisors.com" style="color:var(--accent)">info@watertoweradvisors.com</a>. We will respond within 45 days.</p>
        <h3>GDPR Rights (EEA/UK Residents)</h3>
        <p>If you are located in the European Economic Area or United Kingdom, you have certain rights under the General Data Protection Regulation (GDPR), including the right to access, correct, or erase your personal data, the right to restrict or object to processing, and the right to data portability. To exercise these rights, contact us at <a href="mailto:info@watertoweradvisors.com" style="color:var(--accent)">info@watertoweradvisors.com</a>.</p>
        <h3>Changes to This Policy</h3>
        <p>We reserve the right to update this Privacy Policy at any time. When we do, we will revise the "Last updated" date at the top of this page. Continued use of the Site after any changes constitutes acceptance of the updated policy.</p>
        <h3>Contact Us</h3>
        <p>If you have questions about this Privacy Policy, please contact us:<br>
        Email: <a href="mailto:info@watertoweradvisors.com" style="color:var(--accent)">info@watertoweradvisors.com</a><br>
        Phone: <a href="tel:+14244805449" style="color:var(--accent)">(424) 480-5449</a><br>
        Address: 8383 Wilshire Blvd. Suite 815, Beverly Hills, CA 90211</p>
      </div>
    </section>

    <section id="terms" class="section legal-section">
      <div class="container legal-content">
        <div class="legal-header">
          <h2 class="h2">Terms of Service</h2>
          <p class="legal-date">Last updated: March 2026</p>
        </div>
        <p>These Terms of Service ("Terms") govern your use of the Watertower Advisors website located at watertoweradvisors.com (the "Site"), operated by Watertower Advisors, LLC. By accessing or using the Site, you agree to be bound by these Terms. If you do not agree, please do not use the Site.</p>
        <h3>Use of the Site</h3>
        <p>The Site and its content are provided for informational purposes only. Watertower Advisors reserves the right to modify or discontinue any portion of the Site at any time without notice. We are not responsible if information on the Site is not accurate, complete, or current. Users rely on Site materials at their own risk.</p>
        <h3>Intellectual Property</h3>
        <p>All content on the Site, including but not limited to text, graphics, logos, images, and software, is the property of Watertower Advisors, LLC or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without prior written consent from Watertower Advisors.</p>
        <h3>Prohibited Uses</h3>
        <p>You agree not to use the Site to:</p>
        <ul>
          <li>Engage in any unlawful activity or violate any applicable local, state, national, or international law</li>
          <li>Infringe on the intellectual property rights of others</li>
          <li>Transmit any harassing, abusive, defamatory, obscene, or otherwise objectionable content</li>
          <li>Upload or transmit malicious code, viruses, or any software that may interfere with the Site's operation</li>
          <li>Attempt to gain unauthorized access to any portion of the Site or its related systems</li>
          <li>Engage in phishing, spoofing, or other deceptive practices</li>
        </ul>
        <h3>Third-Party Links</h3>
        <p>The Site may contain links to third-party websites. These links are provided for convenience only. Watertower Advisors has no control over the content of those sites and accepts no liability for them or for any loss or damage that may arise from your use of them. Review third-party privacy policies and terms independently.</p>
        <h3>Disclaimer of Warranties</h3>
        <p>The Site and its content are provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. Watertower Advisors does not warrant that the Site will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
        <h3>Limitation of Liability</h3>
        <p>To the fullest extent permitted by law, Watertower Advisors, LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Site, even if we have been advised of the possibility of such damages.</p>
        <h3>Indemnification</h3>
        <p>You agree to indemnify, defend, and hold harmless Watertower Advisors, LLC, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with your use of the Site or your violation of these Terms.</p>
        <h3>Governing Law</h3>
        <p>These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the courts located in Los Angeles County, California.</p>
        <h3>Changes to These Terms</h3>
        <p>We reserve the right to update these Terms at any time. Continued use of the Site after any modifications constitutes your acceptance of the revised Terms. We will revise the "Last updated" date at the top of this page when changes are made.</p>
        <h3>Contact Us</h3>
        <p>If you have questions about these Terms, please contact us:<br>
        Email: <a href="mailto:info@watertoweradvisors.com" style="color:var(--accent)">info@watertoweradvisors.com</a><br>
        Phone: <a href="tel:+14244805449" style="color:var(--accent)">(424) 480-5449</a><br>
        Address: 8383 Wilshire Blvd. Suite 815, Beverly Hills, CA 90211</p>
      </div>
    </section>

    <section id="cookies" class="section legal-section">
      <div class="container legal-content">
        <div class="legal-header">
          <h2 class="h2">Cookie Policy</h2>
          <p class="legal-date">Last updated: March 2026</p>
        </div>
        <p>This Cookie Policy explains how Watertower Advisors, LLC ("we," "us," or "our") uses cookies and similar tracking technologies on watertoweradvisors.com (the "Site"). By using the Site, you consent to the use of cookies as described in this policy.</p>
        <h3>What Are Cookies?</h3>
        <p>Cookies are small text files placed on your device by a website when you visit. They allow the website to remember your actions and preferences over time. Cookies can be "session cookies" (deleted when you close your browser) or "persistent cookies" (stored until they expire or you delete them).</p>
        <h3>Cookies We Use</h3>
        <p><strong>Strictly Necessary Cookies:</strong> These cookies are required for the Site to function properly. They enable core features such as security and accessibility. You cannot opt out of these cookies.</p>
        <p><strong>Analytics Cookies:</strong> With your consent, we use Google Analytics 4 (GA4) to collect anonymized information about how visitors use the Site — such as which pages are visited most often and how users navigate between pages. This helps us improve the Site experience. GA4 uses cookies including <code>_ga</code>, <code>_ga_[ID]</code>, and related identifiers. Data collected by Google Analytics is governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">Google's Privacy Policy</a>.</p>
        <p><strong>Preference Cookies:</strong> We store your cookie consent choice (accept or decline) in your browser's local storage so we can respect your preference on subsequent visits.</p>
        <h3>Managing Your Cookie Preferences</h3>
        <p>When you first visit the Site, you will be presented with a cookie consent banner. You may accept or decline analytics cookies at that time. You can also manage or delete cookies through your browser settings:</p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">Apple Safari</a></li>
          <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">Microsoft Edge</a></li>
        </ul>
        <p>Please note that disabling certain cookies may affect the functionality of the Site.</p>
        <h3>Opting Out of Google Analytics</h3>
        <p>To opt out of Google Analytics tracking across all websites, you may install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">Google Analytics Opt-out Browser Add-on</a>.</p>
        <h3>Third-Party Cookies</h3>
        <p>We do not use third-party advertising cookies or share your personal information with third parties for marketing purposes. Any third-party services we use are limited to analytics and site functionality.</p>
        <h3>Changes to This Policy</h3>
        <p>We may update this Cookie Policy from time to time. We will revise the "Last updated" date at the top of this page when changes are made.</p>
        <h3>Contact Us</h3>
        <p>If you have questions about our use of cookies, please contact us:<br>
        Email: <a href="mailto:info@watertoweradvisors.com" style="color:var(--accent)">info@watertoweradvisors.com</a><br>
        Phone: <a href="tel:+14244805449" style="color:var(--accent)">(424) 480-5449</a></p>
      </div>
    </section>

    <section id="accessibility" class="section legal-section">
      <div class="container legal-content">
        <div class="legal-header">
          <h2 class="h2">Accessibility Statement</h2>
          <p class="legal-date">Last updated: March 2026</p>
        </div>
        <p>Watertower Advisors, LLC is committed to ensuring that our website is accessible to all users, including those with disabilities. We continually work to improve the accessibility of our Site to provide an inclusive experience.</p>
        <h3>Our Commitment</h3>
        <p>We strive to conform to the <a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">Web Content Accessibility Guidelines (WCAG) 2.1</a> at Level AA. These guidelines explain how to make web content more accessible to people with disabilities, including those with visual, auditory, physical, speech, cognitive, language, learning, and neurological disabilities.</p>
        <h3>Measures We've Taken</h3>
        <ul>
          <li>Semantic HTML structure with appropriate heading hierarchy</li>
          <li>ARIA labels on interactive elements such as navigation and dialogs</li>
          <li>Sufficient color contrast between text and backgrounds</li>
          <li>Keyboard-navigable interface — all interactive elements are reachable via Tab/Shift+Tab</li>
          <li>Focus indicators on interactive elements for keyboard users</li>
          <li>Alt text on all meaningful images</li>
          <li>Responsive design that supports browser text resizing</li>
          <li>Page structure and landmarks (header, main, footer) for screen reader navigation</li>
        </ul>
        <h3>Known Limitations</h3>
        <p>While we aim for full accessibility, some areas of the Site may not yet meet all WCAG 2.1 AA criteria. We are actively working to identify and address these gaps. If you encounter an accessibility barrier, please let us know using the contact information below.</p>
        <h3>Third-Party Content</h3>
        <p>Our Site may include content from third-party services (such as embedded media or external links). We cannot guarantee the accessibility of all third-party content and encourage users to contact those providers directly regarding their accessibility practices.</p>
        <h3>Feedback and Contact</h3>
        <p>We welcome your feedback on the accessibility of our Site. If you experience any barriers while browsing, or if you need content in an alternative format, please contact us and we will do our best to assist you promptly:</p>
        <p>Email: <a href="mailto:info@watertoweradvisors.com" style="color:var(--accent)">info@watertoweradvisors.com</a><br>
        Phone: <a href="tel:+14244805449" style="color:var(--accent)">(424) 480-5449</a><br>
        Address: 8383 Wilshire Blvd. Suite 815, Beverly Hills, CA 90211</p>
        <h3>Formal Complaints</h3>
        <p>If you are not satisfied with our response to an accessibility concern, you may contact the <a href="https://www.ada.gov/" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">U.S. Department of Justice ADA Information Line</a> at 1-800-514-0301 (voice) or 1-800-514-0383 (TTY).</p>
      </div>
    </section>
  </main>
</Base>
```

- [ ] **Step 2: Verify**

Run: `curl -s http://localhost:4321/legal.html | grep -c 'id="privacy"\|id="terms"\|id="cookies"\|id="accessibility"'`
Expected: `4`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/legal.astro
git commit -m "Migrate legal page to Astro"
```

---

### Task 12: Redirect stub pages (`corporate-development`, `mergers-acquisitions`)

**Files:**
- Create: `public/corporate-development/index.html`
- Create: `public/mergers-acquisitions/index.html`

**Correction (2026-08-31): originally specified as `src/pages/.../index.astro`. That's wrong — `build.format: 'file'` (Task 1) is a global build setting that flattens EVERY Astro-routed page, including one named via a folder's `index.astro`, to `routename.html` (so `src/pages/corporate-development/index.astro` would emit `dist/corporate-development.html`, not `dist/corporate-development/index.html`). That changes the live URL from `/corporate-development/` to `/corporate-development` (no trailing slash, flat file) — an avoidable URL-shape regression for two pages that need the OLD directory+index.html shape while every other page correctly wants the new flat shape. Fix: these two files have zero dynamic content (empty Astro frontmatter, pure static HTML) and belong in `public/`, which Astro copies to `dist/` byte-for-byte regardless of `build.format` — this guarantees the output lands at exactly `dist/corporate-development/index.html`, matching the live site's current URL exactly, with no dependency on Astro's routing/build-format behavior at all. Plain `.html` files, not `.astro` — no frontmatter fence needed since there's no Astro processing to do.**

These carry the existing working stub markup unchanged — no `Base.astro`, no nav, exactly as they exist today, since they already correctly solve the problem they exist to solve.

- [ ] **Step 1: Create `public/corporate-development/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting… | Watertower Advisors</title>
    <link rel="canonical" href="https://watertoweradvisors.com/services.html#corp-dev" />
    <meta http-equiv="refresh" content="0; url=https://watertoweradvisors.com/services.html#corp-dev" />
  </head>
  <body>
    <p>This page has moved. Redirecting to <a href="https://watertoweradvisors.com/services.html#corp-dev">Corporate Development Advisory</a>.</p>
  </body>
</html>
```

- [ ] **Step 2: Create `public/mergers-acquisitions/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting… | Watertower Advisors</title>
    <link rel="canonical" href="https://watertoweradvisors.com/services.html#ma" />
    <meta http-equiv="refresh" content="0; url=https://watertoweradvisors.com/services.html#ma" />
  </head>
  <body>
    <p>This page has moved. Redirecting to <a href="https://watertoweradvisors.com/services.html#ma">M&amp;A Advisory</a>.</p>
  </body>
</html>
```

- [ ] **Step 3: Verify**

Run: `npm run build && grep -c 'meta http-equiv="refresh"' dist/corporate-development/index.html dist/mergers-acquisitions/index.html`
Expected: `1` for each file, AND confirm the exact paths `dist/corporate-development/index.html` and `dist/mergers-acquisitions/index.html` exist (directory + index.html, not a flat `corporate-development.html`) — this is the one thing `build.format: 'file'` cannot be allowed to touch.

- [ ] **Step 4: Commit**

```bash
git add public/corporate-development public/mergers-acquisitions
git commit -m "Carry over redirect stub pages unchanged, served from public/ to bypass build.format"
```

---

### Task 13: Blog content collection + migrated post

**Files:**
- Create: `src/content.config.ts` (top-level, NOT `src/content/config.ts` — see note below)
- Create: `src/content/blog/practical-ma-playbook-for-founders.md`
- Create: `src/pages/blog.astro`
- Create: `src/pages/blog/[...slug].astro`
- Delete (from repo root, once confirmed superseded): none yet — `blog.js` deletion happens in Task 17's cleanup, after final verification.

**Interfaces:**
- Produces: the `blog` content collection with schema `{ title: string; date: Date; author: string; excerpt: string; tags?: string[]; externalUrl?: string }`, consumed by both `blog.astro` and `blog/[...slug].astro`.

The only content that exists today is a link-out card to an externally-hosted article (`cfoadvisors.com`), not a first-party post — confirmed by reading `blog.html`: the "Featured Insight" card links out, and the "From Medium" section that `blog.js` populates has never had a real, working Medium account behind it (the URL in `blog.js` is a placeholder marked `// TODO: update with correct Medium username/URL`). The collection schema supports both link-out posts (via `externalUrl`) and future native posts (rendered from the markdown body), since that's what the site actually needs right now per the user's confirmation that no real blog cadence exists yet.

- [ ] **Step 1: Create `src/content.config.ts`**

**Correction (2026-08-31): the plan originally specified `type: 'content'` at `src/content/config.ts` — the "legacy" content collections API. Astro 6+ removed it entirely; the installed version here is 7.2.10, which throws `LegacyContentConfigError` on that shape. Use the current loader-based API below: the config file lives at the project-root-relative `src/content.config.ts` (not inside a `content/` subdirectory), and every collection needs an explicit `loader`.**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    excerpt: z.string(),
    tags: z.array(z.string()).optional(),
    externalUrl: z.string().url().optional(),
  }),
});

export const collections = { blog };
```

Note: the markdown post files themselves still live under `src/content/blog/` — only the collection *definition* file moves to the project's `src/content.config.ts`. The glob loader's default entry identifier is `id` (derived from the file path), not `slug` — this affects Steps 3-4 below.

- [ ] **Step 2: Create `src/content/blog/practical-ma-playbook-for-founders.md`**

```md
---
title: "A Practical M&A Playbook for Founders"
date: 2026-06-09
author: "Connor Doyle, Managing Director"
excerpt: "Buyer types, deal timing relative to fundraising, diligence readiness, and deal structuring mechanics, including a case study on how process rigor can change founder take-home by 5x."
tags: ["M&A", "Exit Planning", "Deal Structuring"]
externalUrl: "https://cfoadvisors.com/founders-guide-to-ma-playbook.html"
---
```

- [ ] **Step 3: Create `src/pages/blog.astro`**

Named `blog.astro` (not `blog/index.astro`) so `build.format: 'file'` emits `blog.html`, preserving the current URL exactly.

```astro
---
import Base from '../layouts/Base.astro';
import { getCollection } from 'astro:content';

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://watertoweradvisors.com/" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://watertoweradvisors.com/blog.html" }
  ]
};

const posts = (await getCollection('blog')).sort(
  (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
);
---
<Base
  title="Blog — Watertower Advisors"
  description="Insights on venture capital, M&A, and strategic advisory from Watertower Advisors."
  path="/blog.html"
>
  <script type="application/ld+json" slot="schema" set:html={JSON.stringify(breadcrumbSchema)} />

  <main>
    <section class="section" aria-labelledby="blog-heading">
      <div class="container fade-in">
        <div class="kicker">Insights & Analysis</div>
        <h1 id="blog-heading" class="h2">Latest from Watertower</h1>
        <p class="lead">Perspectives on venture capital, M&A strategy, and the evolving landscape of growth-stage investing.</p>
      </div>

      <div class="container" style="margin-top:40px">
        <div class="blog-grid" style="margin-top:16px">
          {posts.length === 0 ? (
            <div class="no-posts">
              <p style="color:var(--muted); text-align:center">No posts available at this time. Check back soon!</p>
            </div>
          ) : (
            posts.map((post, index) => {
              const href = post.data.externalUrl ?? `/blog/${post.id}/`;
              const isExternal = Boolean(post.data.externalUrl);
              return (
                <article class={`blog-card card fade-in ${index > 0 && index <= 3 ? `fade-in-delay-${index}` : ''}`}>
                  <div class="blog-card__content">
                    <div class="blog-meta">
                      <time datetime={post.data.date.toISOString().split('T')[0]}>
                        {post.data.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </time>
                      <span class="blog-meta__divider">•</span><span>{post.data.author}</span>
                    </div>
                    <h3 class="h3 blog-card__title">{post.data.title}</h3>
                    <p class="blog-card__description">{post.data.excerpt}</p>
                    {post.data.tags && (
                      <div class="blog-tags">
                        {post.data.tags.map((tag) => <span class="blog-tag">{tag}</span>)}
                      </div>
                    )}
                    <a href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined} class="blog-card__link">
                      {isExternal ? 'Read the Playbook' : 'Read more'}
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </a>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  </main>
</Base>
```

- [ ] **Step 4: Create `src/pages/blog/[...slug].astro`**

Only generates a static page for entries without `externalUrl` — the current entry is external and therefore produces zero pages from this file today. This is intentional: it's the mechanism for the native-post future the user described, without fabricating placeholder detail pages for content that isn't native.

```astro
---
import Base from '../../layouts/Base.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog', (entry) => !entry.data.externalUrl);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---
<Base
  title={`${post.data.title} — Watertower Advisors`}
  description={post.data.excerpt}
  path={`/blog/${post.id}/`}
>
  <main>
    <section class="section">
      <div class="container legal-content fade-in">
        <div class="kicker">Insights & Analysis</div>
        <h1 class="h2">{post.data.title}</h1>
        <div class="blog-meta" style="margin-bottom:24px">
          <time datetime={post.data.date.toISOString().split('T')[0]}>
            {post.data.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
          <span class="blog-meta__divider">•</span><span>{post.data.author}</span>
        </div>
        <Content />
      </div>
    </section>
  </main>
</Base>
```

- [ ] **Step 5: Verify**

Run: `npm run build 2>&1 | tail -20`
Expected: build succeeds; no route is generated for `/blog/practical-ma-playbook-for-founders/` (check with `ls dist/blog/ 2>/dev/null; echo done` — expected: only "done" printed, no directory, since that entry has `externalUrl` set).

Run: `npm run dev` (if not already running), then `curl -s http://localhost:4321/blog.html | grep -c 'Read the Playbook'`
Expected: `1`.

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts src/content src/pages/blog.astro src/pages/blog
git commit -m "Add blog content collection, migrate existing link-out post, remove client-side Medium fetch dependency"
```

---

### Task 14: GSAP animation layer

**Files:**
- Create: `src/components/HeroMetrics.astro`
- Create: `src/scripts/motion.js`
- Modify: `src/pages/index.astro` (add `<HeroMetrics />` to the hero section)
- Modify: `src/layouts/Base.astro` (load `motion.js` site-wide for the card/CTA polish)

**Interfaces:**
- Consumes: `gsap` and `gsap/ScrollTrigger` from the npm dependency installed in Task 1.
- Produces: no new interface consumed by later tasks — this is the terminal animation layer.

This file lives in `src/scripts/`, not `public/scripts/`, unlike Task 4's `main.js`. Reason: `main.js` has zero dependencies and is served byte-for-byte as a static file, matching the original site exactly. `motion.js` has an npm dependency (`gsap`) that only exists in `node_modules` at build time — GitHub Pages serves the built `dist/` output verbatim, which never contains `node_modules`. A file placed in `public/` is copied to `dist/` unprocessed, so a bare `import { gsap } from 'gsap'` inside it would 404 in the real deployed site (and in `npm run preview`, which also just serves `dist/` as static files). Astro only resolves and bundles npm imports for scripts it discovers by reference from within a `.astro` file's `<script src="...">` tag (a relative path, not one starting with `/`) — that triggers Vite processing, which resolves `gsap` from `node_modules` and outputs a hashed, bundled file into `dist/_astro/` at build time. Loading it from `Base.astro` with a relative `src` (Step 3) is what makes this work correctly in the production build, not just in dev.

- [ ] **Step 1: Create `src/components/HeroMetrics.astro`**

An inline SVG line motif built from the firm's three real stats (25 years, $1B+, 60+ deals), positioned as a foreground element inside the homepage hero. Rendered fully visible by default (so it degrades gracefully with JS disabled or `prefers-reduced-motion`); `motion.js` animates the stroke draw-in progressively.

```astro
<div class="hero-metrics" aria-hidden="true">
  <svg viewBox="0 0 240 140" width="240" height="140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line class="hero-metrics__bar" x1="10" y1="20" x2="150" y2="20" stroke="#E0A72B" stroke-width="10" stroke-linecap="round" />
    <text x="160" y="26" fill="#F1F5F9" font-family="Manrope, sans-serif" font-size="14" font-weight="700">25 yrs</text>

    <line class="hero-metrics__bar" x1="10" y1="65" x2="210" y2="65" stroke="#E0A72B" stroke-width="10" stroke-linecap="round" />
    <text x="10" y="90" fill="#F1F5F9" font-family="Manrope, sans-serif" font-size="14" font-weight="700">$1B+ transacted</text>

    <line class="hero-metrics__bar" x1="10" y1="110" x2="120" y2="110" stroke="#E0A72B" stroke-width="10" stroke-linecap="round" />
    <text x="130" y="115" fill="#F1F5F9" font-family="Manrope, sans-serif" font-size="14" font-weight="700">60+ deals</text>
  </svg>
</div>

<style>
  .hero-metrics{
    position:absolute; right:5%; bottom:8%; z-index:1;
    display:none;
  }
  @media (min-width:1024px){
    .hero-metrics{ display:block; }
  }
</style>
```

- [ ] **Step 2: Create `src/scripts/motion.js`**

```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Final state is already the default markup — nothing to animate, nothing to undo.
} else {
  // ---- Hero headline stagger reveal ----
  const heroInner = document.querySelector('.hero__inner');
  if (heroInner) {
    const heroChildren = heroInner.children;
    gsap.from(heroChildren, {
      opacity: 0,
      y: 24,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power2.out',
    });
  }

  // ---- Hero metrics: stroke draw-in ----
  const metricBars = document.querySelectorAll('.hero-metrics__bar');
  if (metricBars.length > 0) {
    metricBars.forEach((bar) => {
      const length = bar.getTotalLength();
      gsap.set(bar, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(bar, {
        strokeDashoffset: 0,
        duration: 0.9,
        delay: 0.4,
        ease: 'power2.inOut',
      });
    });
  }

  // ---- Stat and service card entrance (layered on top of the existing fade-in observer) ----
  const cardGroups = document.querySelectorAll('.stats-section .grid, .grid-2 .card, .service-summary-card');
  if (cardGroups.length > 0) {
    gsap.utils.toArray('.stat.card, .service-summary-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 20,
        scale: 0.97,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        delay: (i % 4) * 0.06,
      });
    });
  }

  // ---- Magnetic hover on primary CTA buttons (desktop pointer only) ----
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.btn--primary').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.2, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
      });
    });
  }
}
```

- [ ] **Step 3: Load `motion.js` from `Base.astro` with a relative `src` so Astro bundles it**

Modify the closing part of `<body>` in `src/layouts/Base.astro` (append right after the existing `<script src="/scripts/main.js" defer></script>` line):

```astro
    <script src="../scripts/motion.js"></script>
```

The relative path (`../scripts/motion.js`, resolved from `src/layouts/Base.astro` to `src/scripts/motion.js`) is what makes Astro treat this as a module to process: Vite resolves the `import { gsap } from 'gsap'` and `import { ScrollTrigger } from 'gsap/ScrollTrigger'` statements inside it against `node_modules`, bundles them together with the script body, and emits a single hashed file under `dist/_astro/` referenced by a correct `<script type="module" src="/_astro/motion.[hash].js">` tag in the final HTML. This happens identically in `astro dev`, `astro build`/`npm run preview`, and the GitHub Pages deploy — there is no runtime dependency on `node_modules` existing wherever the site is served from, unlike an import-map approach that points directly at `/node_modules/...` (which `astro preview` and GitHub Pages would both 404 on, since neither serves `node_modules`).

- [ ] **Step 4: Add `<HeroMetrics />` to the homepage hero**

Modify `src/pages/index.astro`: add the import at the top of the frontmatter block, and place the component inside the hero section.

```astro
---
import Base from '../layouts/Base.astro';
import HeroMetrics from '../components/HeroMetrics.astro';
// ...(existing schema const unchanged)...
---
```

```astro
    <section class="hero hero--image" style="background-image:url('/assets/hero/la-palms.jpg')">
      <div class="container hero__inner">
        <h1 style="font-size:clamp(30px,4vw,50px)">Boutique Investment Bank for M&amp;A &amp; Capital Raising in Los Angeles</h1>
        <p>Watertower Advisors is a Los Angeles-based boutique investment bank partnering with early- and growth-stage, venture-backed companies for fundraising and M&amp;A across the U.S. and global markets.</p>
        <div class="actions">
          <a class="btn btn--primary" href="/contact.html">Let's Talk</a>
        </div>
      </div>
      <HeroMetrics />
    </section>
```

(Only the `<HeroMetrics />` line is new inside this section — the rest is unchanged from Task 6, shown here for placement clarity.)

- [ ] **Step 5: Verify animations run, and that reduced-motion is respected**

Run: `npm run dev`, open `http://localhost:4321/` in a browser.
Expected: hero text staggers in, the three amber bars draw in over ~1 second, stat/service cards ease in on scroll, primary buttons show a subtle magnetic pull on mouse hover.

Then enable reduced motion (macOS: System Settings → Accessibility → Display → Reduce Motion; or Chrome DevTools → Rendering tab → "Emulate CSS media feature prefers-reduced-motion: reduce") and reload.
Expected: all content is visible immediately with no animation, no layout shift, buttons still clickable with no magnetic effect.

- [ ] **Step 6: Commit**

```bash
git add src/components/HeroMetrics.astro src/scripts/motion.js src/layouts/Base.astro src/pages/index.astro
git commit -m "Add GSAP animation layer: hero data motif, card entrance, magnetic CTA"
```

---

### Task 15: Sitemap integration + `robots.txt` fix

**Files:**
- Create: `public/robots.txt` (corrected content, not a straight copy)
- Delete: root `sitemap.xml` (superseded by the generated one — done in Task 17's cleanup, not here, since the old root site is still what's live until this branch merges)

`@astrojs/sitemap` (added in Task 1) generates `sitemap-index.xml` and `sitemap-0.xml` at build time automatically from the routes Astro discovers — not `sitemap.xml`. The current `robots.txt` points to `sitemap.xml`, which will no longer exist after this migration; it must point to the new generated file.

- [ ] **Step 1: Create `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://watertoweradvisors.com/sitemap-index.xml
```

- [ ] **Step 2: Build and confirm the sitemap generates**

Run: `npm run build && ls dist/sitemap*.xml`
Expected: `dist/sitemap-index.xml` and `dist/sitemap-0.xml` both listed.

Run: `cat dist/sitemap-0.xml | grep -o '<loc>[^<]*</loc>'`
Expected: one `<loc>` per route, including `https://watertoweradvisors.com/about.html`, `.../services.html`, `.../blog.html`, `.../corporate-development/`, `.../mergers-acquisitions/`, and NOT a `/blog/practical-ma-playbook-for-founders/` entry (since that route isn't generated, per Task 13).

- [ ] **Step 3: Commit**

```bash
git add public/robots.txt
git commit -m "Point robots.txt at the Astro-generated sitemap index"
```

---

### Task 16: GitHub Actions deploy workflow (added, not triggered)

**Files:**
- Create: `.github/workflows/deploy.yml`

This workflow only runs on push to `main`. Adding it on this feature branch does not execute it — per the global constraint, nothing deploys until the user merges, and merging is the user's explicit decision after local verification (Task 18).

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

No secrets are referenced — `actions/deploy-pages` uses the workflow's automatically-provisioned `GITHUB_TOKEN` via the `id-token: write` permission, not a manually-configured token.

- [ ] **Step 2: Verify the YAML is well-formed**

Run: `python3 -c "import yaml, sys; yaml.safe_load(open('.github/workflows/deploy.yml'))" 2>&1 || echo "install pyyaml or check by eye"`
Expected: no output (valid YAML), or fall back to a careful manual read if `pyyaml` isn't available locally.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deploy workflow (dormant until merged to main)"
```

---

### Task 17: Repo cleanup — remove superseded legacy files

**Files:**
- Delete: `index.html`, `about.html`, `services.html`, `industries.html`, `contact.html`, `legal.html`, `blog.html`, `blog.js`, `script.js`, `styles.css`, `sitemap.xml`, `corporate-development/index.html`, `mergers-acquisitions/index.html`
- Delete: `assets/Watertower Advisors Logo Package/`, `assets/WatertowerAdvisorsLogoClassicHorizontal.png`, `assets/watertower_logo_classic_cropped.png`, `assets/.DS_Store` (the two brand files actually used were already copied out in Task 2)
- Delete: root `CNAME`, `robots.txt`, `llms.txt` (already copied into `public/` in Task 2/15)
- Keep: `README.md` (rewritten in Task 19, not deleted), `docs/`, `.claude/`, `SEO-AUDIT-REPORT-2026.html`/`.pdf`, `charts/` — none of these are part of the site build.

This is a separate task from each page migration (rather than deleting the old file the moment its Astro replacement exists) so that if any earlier task needs to be re-checked against the original source, it's still there until everything is verified once, end to end.

- [ ] **Step 1: Confirm every route has an Astro replacement before deleting anything**

Run: `npm run build && find dist -name "*.html" | sort`
Expected output includes: `dist/index.html`, `dist/about.html`, `dist/services.html`, `dist/industries.html`, `dist/contact.html`, `dist/legal.html`, `dist/blog.html`, `dist/corporate-development/index.html`, `dist/mergers-acquisitions/index.html`.

- [ ] **Step 2: Delete superseded root files**

```bash
git rm index.html about.html services.html industries.html contact.html legal.html blog.html blog.js script.js styles.css sitemap.xml
git rm -r corporate-development mergers-acquisitions
git rm CNAME robots.txt llms.txt
```

- [ ] **Step 3: Delete the unreferenced legacy asset tree**

```bash
git rm -r "assets/Watertower Advisors Logo Package"
git rm "assets/WatertowerAdvisorsLogoClassicHorizontal.png" "assets/watertower_logo_classic_cropped.png"
rm -f "assets/.DS_Store"
rmdir assets 2>/dev/null || echo "assets/ not empty — check what's left with: ls -la assets/"
```

- [ ] **Step 4: Confirm the build still succeeds with the old files gone**

Run: `npm run build && npm run preview`
Expected: build succeeds, preview server starts with no errors referencing the deleted paths.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Remove legacy static HTML/CSS/JS and unused asset tree superseded by the Astro migration"
```

---

### Task 18: README rewrite

**Files:**
- Modify: `README.md` (full rewrite — the current file describes a Squarespace-era version of the site with a wrong color palette, wrong phone number, a team member who no longer appears on the About page, and stale blog instructions)

- [ ] **Step 1: Rewrite `README.md`**

```md
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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Rewrite README for the Astro project structure and local dev workflow"
```

---

### Task 19: Final local verification (per spec §8)

**Files:** none — this task runs commands and manually checks output, no new files.

- [ ] **Step 1: Clean build**

Run: `rm -rf dist .astro node_modules && npm install && npm run build`
Expected: zero errors, zero warnings in the build output.

- [ ] **Step 2: Route-complete check**

Run: `find dist -name "*.html" | sort`
Expected: `dist/about.html`, `dist/blog.html`, `dist/contact.html`, `dist/corporate-development/index.html`, `dist/index.html`, `dist/industries.html`, `dist/legal.html`, `dist/mergers-acquisitions/index.html`, `dist/services.html` — nine files, matching the nine URLs the live site currently serves.

- [ ] **Step 3: Preview and manual click-through**

Run: `npm run preview` and open `http://localhost:4321/` in a browser. Manually verify:
- Every nav link works and `aria-current` highlights the right one.
- Homepage hero shows the animated amber data motif on a desktop-width viewport (hidden below 1024px, by design).
- `/services.html#corp-dev` and `/services.html#ma` anchors exist and scroll correctly.
- `/corporate-development/` and `/mergers-acquisitions/` immediately redirect to those anchors.
- `/blog.html` shows the one migrated post linking out to `cfoadvisors.com`.
- Contact form fields are all present and the submit button is clickable (a real submission isn't necessary to verify markup/wiring, but don't submit against production Web3Forms during testing).
- Footer year shows the current year.
- Toggle reduced motion (see Task 14 Step 5) and reload every page — no motion, everything visible immediately, no console errors.

- [ ] **Step 4: JSON-LD spot check**

Run: `for f in index about services industries contact legal blog; do echo "-- $f --"; grep -A2 'application/ld+json' dist/$f.html | head -3; done`
Expected: every page shows at least one `application/ld+json` block; `index` and `services` show 2 (organization/itemlist + none since homepage has only 1 and services doesn't have a breadcrumb+itemlist double... — actually just confirm no page is silently missing its schema entirely (empty output for any page name is a bug to fix before proceeding).

- [ ] **Step 5: Asset path check — confirm the space bug is actually gone**

Run: `grep -r "Watertower Advisors Logo Package" dist/ 2>/dev/null; echo "checked"`
Expected: no output before "checked".

Run: `grep -o '"logo":"[^"]*"' dist/index.html`
Expected: `"logo":"https://watertoweradvisors.com/assets/brand/watertower-wordmark-white.png"` — no spaces.

- [ ] **Step 6: Lighthouse pass (optional but recommended)**

If Chrome is available: open DevTools → Lighthouse → run against `http://localhost:4321/` and `http://localhost:4321/services.html` for Performance, Accessibility, Best Practices, SEO. Compare qualitatively against the site's current live scores — flag anything that regressed, no specific target score required beyond "no regression."

- [ ] **Step 7: Report to the user**

Summarize: build is clean, all 9 routes present and verified, animations work and respect reduced motion, the two pre-existing bugs (contact background 404, space-in-path) are fixed, brand color is Amber. Explicitly state that nothing has been pushed to `origin` or merged to `main`, and ask the user to do their own click-through via `npm run preview` before deciding to merge.

No commit for this task — it's verification only. If any check fails, fix it in the relevant earlier task's files and re-commit there, not as a new patch-on-top commit, to keep each task's commit self-consistent.
