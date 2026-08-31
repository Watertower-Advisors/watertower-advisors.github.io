# Astro Migration + Animation + Brand Fix — Design Spec

Branch: `astro-migration-animation` (off `main`). No merge/deploy until user approves local preview.

## Context

Site is 7 real pages (index, about, services, industries, contact, legal, blog) plus two
already-collapsed redirect stubs (`corporate-development/`, `mergers-acquisitions/` — both
already thin meta-refresh + canonical pointers into `services.html#corp-dev` / `#ma`, no work
needed there beyond carrying them into the build unchanged). Currently plain static HTML/CSS/JS
committed straight to repo root, deployed via GitHub Pages with a `CNAME` for
`watertoweradvisors.com`. No build step exists today.

Problems this migration fixes:
- `blog.html` renders nothing server-side — posts are fetched client-side from Medium RSS via
  `blog.js`. Google indexes a spinner. Critical SEO gap.
- Header/footer/nav markup is hand-duplicated across 8 HTML files. Editing one and forgetting
  the other seven is a standing maintenance bug.
- `sitemap.xml` is hand-maintained and already drifts (`lastmod` staleness seen in git history).
- Asset paths contain literal spaces (`assets/Watertower Advisors Logo Package/...`) — breaks
  JSON-LD logo resolution in strict validators/crawlers.
- Site looks like every other boutique-IB dark-navy-plus-accent template (confirmed via direct
  comparison against corbelcap.com — same skeleton: dark bg, stock hero photo, card grid).
- Brand accent color (`#E85C3A`, coral) doesn't match WTA brand guideline Amber (`#E0A72B`).

Non-goals (explicitly out of scope for this migration):
- Replacing the hero stock photo with new photography (handled via animated data motif instead,
  see §5 — no new photo assets needed).
- Any Tailwind / component-framework adoption. Plain CSS carries over.
- Upgrading the corp-dev/M&A redirect stubs to real Cloudflare-layer 301s. They work correctly
  as static meta-refresh + canonical today; upgrading is a zero-code Cloudflare dashboard change
  the user can do anytime, unrelated to this migration.
- Blog tagging, pagination, author pages, RSS feed generation. There is exactly one existing
  post (by Connor). The content collection schema should not anticipate scale that doesn't
  exist yet.

## Decisions locked in during brainstorming

| Question | Decision |
|---|---|
| Blog content source of truth | Native markdown via Astro content collections. Not a Medium mirror. |
| corp-dev / M&A sub-pages | Already folded into `services.html` anchors via redirect stubs — carry stubs into build unchanged. |
| Redirect mechanism | Real Cloudflare 301s are available (DNS is proxied) but out of scope here — existing meta-refresh stubs keep working, upgrade is a separate manual Cloudflare change. |
| Deploy pipeline | GitHub Actions: build on push to `main`, deploy via `actions/deploy-pages`. No build artifacts committed to repo. |
| Brand accent color | Fix `--accent` from `#E85C3A` (coral) to `#E0A72B` (Amber); `--accent-2` from current dark coral to `#B8934A` (Amber Deep), per WTA brand guideline. |
| Animation ambition | Not just defensive polish — user wants a genuinely differentiated, "unique investment bank site." See §5. |
| Testing gate | Everything tested locally (`astro build && astro preview`) before any merge to `main`. No auto-deploy trigger until user says so. |

## 1. Project structure

```
src/
  layouts/
    Base.astro              — <html><head> (meta/OG/JSON-LD slot), Header, <slot/>, Footer
  components/
    Header.astro            — nav, hamburger (logic ported to a small script, see §4)
    Footer.astro
    StatCounter.astro        — wraps existing data-count counter pattern
  content/
    config.ts                — defines `blog` collection: title, date, excerpt, author (all required); no tags/category fields (YAGNI — one post exists)
    blog/
      2026-XX-XX-connor-post-slug.md   — migrated verbatim from current Medium content
  pages/
    index.astro
    about.astro
    services.astro
    industries.astro
    contact.astro
    legal.astro
    blog/
      index.astro            — getCollection('blog'), lists posts (renders fine with 1)
      [...slug].astro        — post renderer via render()
    corporate-development/
      index.astro            — static stub, markup carried over unchanged
    mergers-acquisitions/
      index.astro            — static stub, markup carried over unchanged
  styles/
    global.css               — current styles.css moved near-verbatim; accent color values updated per brand fix
  scripts/
    motion.js                — GSAP additions only (see §5); imported where needed, not global bundle bloat
public/
  CNAME, robots.txt, llms.txt
  assets/
    watertower-advisors-logo/   — renamed from "Watertower Advisors Logo Package" (kills space-in-URL bug)
    (rest of assets/ carried over unchanged)
astro.config.mjs
  - site: 'https://watertoweradvisors.com'
  - integrations: [sitemap()]   — replaces hand-maintained sitemap.xml
package.json, README.md (updated, see §6)
.github/workflows/deploy.yml
```

Existing `script.js` logic (hamburger toggle, IntersectionObserver fade-in, smooth scroll,
counter animation, industry-toggle) gets ported into small scoped scripts co-located with the
components that use it — not rewritten in GSAP wholesale. It already works; GSAP is additive
(§5), not a replacement engine.

## 2. Page-by-page migration notes

All 7 pages map 1:1, content and copy unchanged except:
- Every `<head>` gets the corrected asset paths (no spaces) and updated accent color inherits
  automatically via CSS variables — no per-page copy edits needed there.
- `index.html`'s inline `<style>` block (the `.visually-hidden` utility) moves into
  `global.css` — it's global-purpose, shouldn't be a one-off inline block.
- `blog.html` is replaced by `blog/index.astro` + the collection; `blog.js`'s Medium RSS fetch
  is deleted entirely (no client-side fetch needed once content is static).

## 3. JSON-LD / structured data

Each page keeps its existing schema block, ported into that page's `.astro` file (or passed as
a prop to `Base.astro` where a page needs a custom `@type`). The organization-level
`FinancialService` schema on the homepage gets its `logo` URL corrected to the new
space-free asset path as part of the same edit that fixes the path.

## 4. Interaction logic carried over (not rewritten)

- Hamburger menu toggle → ported into `Header.astro` inline `<script>`, same DOM structure.
- IntersectionObserver fade-in (`.fade-in`, `.fade-in-delay-*`) → stays as global behavior,
  ported into a small `scripts/reveal.js` loaded once via `Base.astro`. This is the mechanism
  used for card grids, stat sections, etc. — proven, cheap, not touched by the GSAP work below.
- Counter animation (`data-count`) → same logic, ported as-is; could be swapped for a GSAP
  `gsap.to` numeric tween later but not required for this migration (existing version is
  already correct — no bug to fix here).
- Industry-toggle expand/collapse → ported as-is into the `industries.astro` page script.

## 5. Animation — the differentiation layer

Goal per user: "unique investment bank website that gets us more clients," not just parity
polish. Two additive GSAP-driven pieces, both gated behind
`window.matchMedia('(prefers-reduced-motion: reduce)')` (renders final state immediately, no
motion, if the user has that preference):

**5a. Hero — animated deal-metrics motif (replaces static reliance on the stock photo as the
sole visual anchor)**
Instead of only a background stock photo, the hero gets a small inline SVG/canvas visual built
from the firm's real numbers — the existing 25 / $1B+ / 60+ stats — presented as a stylized
animated line or bar motif that draws in on load (GSAP `DrawSVG`-style stroke reveal or a
simple animated bar-fill, whichever proves lighter-weight to hand-build without a paid GSAP
plugin — default to a plain `stroke-dashoffset` CSS/GSAP tween on an inline SVG line so no
premium plugin dependency is required). This is layered next to/over the existing hero photo,
not a full redesign of the section — the photo can stay as ambient background, the data motif
becomes the foreground focal point that no Corbel-style competitor page has.

**5b. Motion polish**
- Hero headline: GSAP `SplitText`-free char/word stagger reveal (`hero__inner > *` children
  staggered fade+translateY) — avoids the paid SplitText plugin, uses plain child stagger.
- Section scroll reveals: keep existing IntersectionObserver fade-in for standard content;
  layer GSAP `ScrollTrigger` only on the stat cards and service cards for a slightly richer
  entrance (scale + translate, staggered) since those are the highest-attention elements.
- Magnetic hover on primary CTA buttons (`.btn--primary`): cursor-follow subtle translate,
  desktop pointer only (`@media (hover: hover) and (pointer: fine)`), disabled on touch.
- Exit/entrance timing follows the skill's motion tokens: enter ~400-600ms `power2.out`,
  respects reduced-motion, no animation blocks input.

**Dependency**: `gsap` (MIT, free core + ScrollTrigger, no paid plugins used — SplitText and
DrawSVG are intentionally avoided to avoid the GSAP club paywall). Loaded per-page only where
used, not injected globally into every page unnecessarily.

## 6. README update

New "Local Development" section replacing any stale run instructions:

```md
## Local Development

Requires Node 18+.

npm install          # install dependencies
npm run dev           # start dev server at localhost:4321
npm run build          # production build to dist/
npm run preview        # serve the production build locally for a final check

Before merging this branch to main or triggering a deploy: run `npm run build && npm run
preview`, click through every page (including the blog post and both redirect stubs), and
confirm animations respect reduced-motion (OS setting or DevTools emulation). Nothing should
be merged or deployed without this local check passing.
```

## 7. Deploy pipeline (build only — not triggered until user approves)

`.github/workflows/deploy.yml`: on push to `main`, `npm ci && npm run build`, upload `dist/` as
Pages artifact, deploy via `actions/deploy-pages`. This workflow is added on this branch but by
definition won't run until this branch is merged to `main` — consistent with "test everything
locally first, nothing deploys until I say so."

## 8. Testing / verification before merge

- `npm run build` completes with zero errors/warnings.
- `npm run preview`: click through all 7 pages + blog post + both redirect stubs; verify every
  internal anchor link (`services.html#corp-dev` etc.) still resolves.
- Validate JSON-LD on each page (schema.org validator or equivalent) — no regressions from the
  porting step.
- Verify asset paths with no spaces resolve (favicon, logo, OG image).
- Verify animations run correctly, and re-verify with `prefers-reduced-motion: reduce` forced
  on — must show final state immediately, no motion, no blocked interaction.
- Lighthouse pass (performance/SEO/accessibility) on homepage and one interior page — flag any
  regression vs current baseline, don't need a specific score target beyond "no regression."

## Explicitly deferred (not in this spec, candidate follow-ups)

- New hero photography / real deal imagery.
- Upgrading redirect stubs to Cloudflare-layer 301s.
- Blog scale features (tags, pagination) once post volume actually grows.
