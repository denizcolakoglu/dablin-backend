# DABLIN_STATUS.md
_Last updated: April 11, 2026_

---

## Project Overview

**Dablin** (dablin.co) — AI visibility and SEO toolkit for brands and e-commerce sellers.

- **Frontend:** React + Vite → Vercel
- **Backend:** Node.js + Express → Railway
- **DB:** PostgreSQL
- **Auth:** Clerk
- **Payments:** Stripe
- **Blog:** Astro → `blog.dablin.co` (separate repo: `~/Downloads/dablin-blog-astro`)
- **Main repo:** `~/Downloads/shopify-describe`

---

## File Paths

| What | Path |
|---|---|
| Backend | `~/Downloads/shopify-describe/server.js` |
| Frontend src | `~/Downloads/shopify-describe/frontend/src/` |
| Components | `~/Downloads/shopify-describe/frontend/src/components/` |
| Pages | `~/Downloads/shopify-describe/frontend/src/components/pages/` |
| Main JSX | `~/Downloads/shopify-describe/frontend/src/main.jsx` |
| Index HTML | `~/Downloads/shopify-describe/frontend/index.html` |
| Public assets | `~/Downloads/shopify-describe/frontend/public/` |
| Blog repo | `~/Downloads/dablin-blog-astro/` |
| Blog post template | `~/Downloads/dablin-blog-astro/src/pages/[slug].astro` |
| Blog layout | `~/Downloads/dablin-blog-astro/src/layouts/BaseLayout.astro` |

---

## Pricing Plans

| Plan | Price | SEO Audit | AI Audit | Visibility Check | Query Check | Description | GSC |
|---|---|---|---|---|---|---|---|
| free | €0 | 0 | 0 | 0 | 0 | 0 | ✗ |
| starter | €9/mo | 5 | 5 | 0 | 0 | 20 | ✗ |
| pro | €19/mo | 10 | 10 | 10 | 0 | 100 | ✗ |
| agency | €49/mo | -1 | -1 | -1 | -1 | -1 | ✓ |

## Stripe Price IDs (live)
- starter_monthly: `price_1THVdmALkl0Rg374ipuoS3bS` (€9)
- starter_yearly: `price_1THW0vALkl0Rg374mrvH8Bkw`
- pro_monthly: `price_1THW3jALkl0Rg374w9UwB0KM` (€19)
- pro_yearly: `price_1THW6OALkl0Rg374vX9lBxHy`
- agency_monthly: `price_1THW84ALkl0Rg3743CtrHwO6` (€49)
- agency_yearly: `price_1THWACALkl0Rg374TBko0H3k`

---

## Backend API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/audit` | POST | SEO audit (18 checks) |
| `/api/audit-history` | GET | Paginated past SEO audits |
| `/api/ai-audit` | POST | GEO / AI Visibility Audit (12 checks) |
| `/api/share` | POST | Create 30-day public share link |
| `/api/share/:token` | GET | Public shared result (no auth) |
| `/api/plan` | GET | Current user plan |
| `/api/checkout` | POST | Stripe checkout |
| `/api/history` | GET | Description generation history |
| `/api/visibility-check-history` | GET | AI visibility check history |
| `/api/dashboard` | GET | Grouped audit history per URL |

---

## SEO Audit — Check Keys

### On-Page (11 checks — free)
`meta`, `headings`, `wordCount`, `alt`, `og`, `schema`, `productSchema`, `breadcrumb`, `reviewSchema`, `canonical`, `internalLinks`

### Technical (5 checks — Pro)
`renderBlocking`, `imageOpt`, `sitemap`, `robots`, `viewport`

### Algorithm (2 checks — Pro)
`informationGain`, `aiOverview`

---

## Public Pages — Helmet Meta Tags (all done)

| Page | Route | Title |
|---|---|---|
| Landing | `/` | Dablin — SEO Audit & GEO for brands and e-commerce |
| SEO Audit | `/seo-audit` | SEO Audit — 18 checks, AI fixes \| Dablin |
| GEO Audit | `/ai-visibility-audit` | GEO Audit — Check AI Visibility for Your Brand \| Dablin |
| AI Visibility Check | `/ai-visibility-check` | AI Visibility Check — ChatGPT, Gemini & Claude brand monitoring \| Dablin |
| AI Query Check | `/ai-query-check` | AI Query Check — Test any brand across ChatGPT, Gemini & Claude \| Dablin |
| Pricing | `/pricing` | Dablin Pricing — Starter €9, Pro €19, Agency €49 |
| What's New | `/whats-new` | What's New — Dablin changelog and updates |
| Search Console | `/google-search-console` | Google Search Console Integration — SEO insights inside Dablin |
| Dashboard | `/seo-geo-dashboard` | SEO & GEO Dashboard — Track and fix your visibility issues \| Dablin |
| Contact | `/contact` | Contact Dablin — We read every message |

**Note:** `react-helmet-async` is installed. `HelmetProvider` wraps the app in `main.jsx`. Helmet injects tags client-side — Googlebot renders JS so will pick them up, but raw curl/audit won't see them (SPA limitation).

**Canonical in index.html:** Points to `https://dablin.co/` only (homepage). Sub-routes handled by Helmet client-side.

---

## OG Images

| Page | File |
|---|---|
| Homepage | `/public/og-image.png` — "SEO Audit. GEO. AI Visibility." dark green |
| GEO Audit | `/public/geo-audit-og.png` — "GEO Audit. AI Visibility. 12 checks." |
| All others | Falls back to `og-image.png` |

---

## SEO Audit Page Hero GIF
- File: `frontend/public/seo-audit-demo.gif`
- Replaces the old `<SeoAuditDemo />` animated component
- High resolution version deployed

---

## SEO Audit — 4-Tab Layout (Audit.jsx)

- **On-Page** (free): 2-column layout — grouped checks left (Page metadata, OG tags, Schema markup, Canonical & links), score + Google search preview right
- **Off-Page** (Pro): blurred mock data teaser — DA score, backlinks, referring domains table with "Coming soon" overlay
- **Technical** (Pro): 5 checks with results and AI fixes
- **Algorithm** (Pro): Google March 2026 signals — green info box (opportunity framing)
- **History** (free, 5th tab): fetches `/api/audit-history`, expandable rows showing failed/passed checks, re-run button
- **Share results**: calls `/api/share`, creates 30-day public link, copies to clipboard
- **Product schema**: shows "Not an e-commerce page? Skip this" note when failed

---

## Blog (blog.dablin.co)

- Astro static site, separate repo `~/Downloads/dablin-blog-astro`
- Posts in `src/content/posts/` as markdown
- `[slug].astro` — blog post template
- **Schema added:** Article JSON-LD + BreadcrumbList JSON-LD on every post
- Cover images: `/public/images/{slug}.png`
- 4 posts published: `what-is-dablin`, `backlink-quality-vs-quantity`, `google-march-2026-update`, `ai-visibility-problem-solo-entrepreneurs`

---

## Schema in index.html

- `Organization` schema with LinkedIn + Medium sameAs
- `WebSite` schema with SearchAction
- `SiteNavigationElement` for sitelinks: SEO Audit, GEO Audit, AI Query Check, Pricing
- `WebApplication` schema

---

## GSC Performance (as of Apr 11, 2026)

- 91 impressions, 5 clicks, 5.5% CTR, avg position 28.1 (3 months)
- Wrong keywords ranking: "quality links", "backlinks" — from blog content
- Pages indexed: homepage, blog, pricing, seo-audit, whats-new
- Pricing page was showing homepage title — fixed via Helmet

---

## Content Plan (4 weeks from Apr 14)

| Week | Theme | Blog | LinkedIn | Reddit | Substack |
|---|---|---|---|---|---|
| Apr 14 | Google March 2026 / Information Gain | ✓ planned | Video + text post | r/SEO reply | Building in public week 1 |
| Apr 21 | AI visibility / ChatGPT brand monitoring | ✓ planned | Carousel + brand analysis | r/Dablin case study | SEO vs GEO opinion |
| Apr 28 | Product schema / Shopify e-commerce | ✓ planned | Text post + weekly update | r/shopify tool post | Week 3 signups + feedback |
| May 5 | Core Web Vitals / Technical SEO | ✓ planned | Video + month 1 recap | r/webdev tool post | Month 1 MRR recap |

Full plan in `dablin_content_plan.xlsx`.

---

## KPI Targets

- €500 MRR in 6 months via SEO-led growth
- Free → paid conversion: ≥5%
- Organic sessions: 500/mo
- Blog posts: 2/month

Full tracker in `dablin_kpi_tracker.xlsx`.

---

## Pending Items

- **Pricing page mobile fix** — `PagePricing.jsx` grid uses `repeat(3,1fr)`, needs `auto-fit` or breakpoint — deferred
- **Off-Page SEO tab** — DataForSEO integration deferred, keeping blurred teaser
- **SSR/prerendering** — Helmet works client-side only; public pages could benefit from `vite-plugin-prerender` for proper static HTML per route — deferred
- **Blog Week 1 article** — "What is Information Gain and why Google March 2026 penalises thin content" — not written yet
- **Google Ads** — campaign paused, UTM params and location targeting (exclude Indonesia/India) need fixing before reactivating

---

## What's New — Latest Entry (v1.0, April 10, 2026)

4-tab SEO Audit rebuild, History tab, Share results, 2-column On-Page layout, score header redesign, GEO Audit page rename, react-helmet-async across all public pages, blog Article + BreadcrumbList schema, SiteNavigationElement sitelinks, homepage OG image updated, GEO Audit OG image added, SEO Audit hero GIF replaced with real recording.

