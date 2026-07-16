# SolarOwl — Full-Site Audit (Security · SEO · Design · UX)

> Audited July 2026. Every item is marked **FIXED** (done in this pass) or **RECOMMENDED** (needs your decision or content).

---

## 1. Security

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| S1 | **Critical** | `/api/solar-design/projects` (GET) and `/api/solar-design/projects/[id]` (GET/PUT/DELETE) had **no authentication** — anyone could list every customer's name/phone/email/address, modify records, or delete them by guessing ids. | **FIXED** — all four now require `verifyAdmin()`; POST stays public (studio saves). |
| S2 | High | Admin login fell back to a **hardcoded JWT secret** (`default_secret_do_not_use_in_production`) when `JWT_SECRET` was unset — forgeable admin tokens. | **FIXED** — login now refuses to run without a real secret. |
| S3 | High | `/api/enquiries` interpolated raw user input (name, message, etc.) into **admin email HTML** — HTML/script injection into your inbox. | **FIXED** — all interpolations escaped; numeric fields coerced. |
| S4 | Medium | `/api/enquiries` had no rate limiting or input length caps — spam/flooding vector. | **FIXED** — 5 requests / 10 min per IP, length caps on every field, email format validation. |
| S5 | Low | Empty dead route file `app/api/enquiries/[id]/route.js`. | **FIXED** — removed. |
| S6 | — | All `/api/admin/*` routes correctly call `verifyAdmin()`; login has bcrypt + rate limiting + httpOnly/sameSite=strict cookie; upload validates type/size and requires admin. | Verified good. |
| S7 | Low | In-memory rate limiters reset on serverless cold starts. | **RECOMMENDED** — move to Upstash Redis or similar if spam becomes real. |
| S8 | Low | `PUT /api/solar-design/projects/[id]` passes the raw body to `findByIdAndUpdate` — admin-only now, but field whitelisting would be safer. | **RECOMMENDED** |
| S9 | Low | No CSP/security headers (X-Frame-Options, etc.). | **RECOMMENDED** — add `headers()` in `next.config` when convenient. |

## 2. SEO

| # | Finding | Status |
|---|---------|--------|
| E1 | **Root layout had zero metadata** — no title, description, OG tags anywhere on the site (except the studio). | **FIXED** — full metadata in `app/layout.js`: title template, description, keywords, OpenGraph, Twitter card, `metadataBase` (env-driven via `NEXT_PUBLIC_SITE_URL`). |
| E2 | No sitemap or robots.txt. | **FIXED** — `app/sitemap.js` (all 10 public routes, prioritized) + `app/robots.js` (blocks `/admin`, `/api`). |
| E3 | Public pages are client components → couldn't carry per-page metadata. | **FIXED** — metadata layouts added for solutions, products, projects, blog, about, contact, calculator, faq. |
| E4 | No structured data. | **FIXED** — `LocalBusiness` JSON-LD (address, phone, area served) in the root layout. |
| E5 | Blog posts/projects fetched client-side (`useEffect`) → **invisible to crawlers**; blog/[slug] has no dynamic metadata. | **RECOMMENDED** — convert blog list + [slug] and projects to server components with `generateMetadata`; biggest remaining SEO win. |
| E6 | Set `NEXT_PUBLIC_SITE_URL` to your real domain in production env. | **RECOMMENDED** |

## 3. Lead generation & information architecture

| # | Finding | Status |
|---|---------|--------|
| L1 | **Design Studio buried in the "More" dropdown** — the site's strongest differentiator was invisible. | **FIXED** — it is now: the navbar's flagship shimmer CTA ("✨ Design Your Solar"), the hero's primary button, a dedicated animated home-page showcase section, a FinalCTA button, the top item in the mobile menu, and a highlighted footer link. |
| L2 | Contact form appeared as home section #3, before any trust-building. | **FIXED** — home flow reordered: Hero → Studio showcase → Solutions → Why Solar → Testimonials → Projects → Contact → Blog → FAQ → Final CTA. |
| L3 | Footer links were all dead (`href="#"`). | **FIXED** — real routes + Studio/Calculator under "Tools & Services". |
| L4 | Privacy Policy / Terms links point nowhere. | **RECOMMENDED** — create the pages (legally advisable for a lead-gen site). |
| L5 | Social icons link to `#`. | **RECOMMENDED** — add real profiles or remove. |

## 4. Design & motion (solar-themed)

New shared motion system in `globals.css`, all guarded by `prefers-reduced-motion`:

- **Animated rising sun** in the hero — pulsing golden core + slowly rotating conic rays (60s), plus two drifting energy orbs (green/gold blur).
- **Shimmer gradient CTAs** (`.navbar-studio-cta`, `.btn-hero-primary`) — light sweep like sunlight across a panel.
- **Design Studio showcase** — an animated mock of the studio: roof outline draws itself on a satellite-style canvas, vertex handles pop, 12 panels stagger in, measurement label and floating KPI chips (system size / savings / payback) rise in on scroll.
- **Rotating sun rays** behind the final CTA.
- **Hero slides now crossfade** (stacked images) instead of hard-swapping, with the heading animating via AnimatePresence.
- Shared accents: `.section-eyebrow`, `.gradient-text`, floating proof chip on the hero image.
- Consistent `focus-visible` outlines site-wide (keyboard a11y).

## 5. UX & code-quality fixes

| # | Finding | Status |
|---|---------|--------|
| U1 | Hero right panel animated to `opacity: 10, scale: 1.1` — image permanently over-zoomed/cropped. | **FIXED** (`opacity: 1, scale: 1`). |
| U2 | CTAs were `<button><Link/></button>` — invalid nesting, tiny click target, broken keyboard semantics. | **FIXED** — proper `Link` elements styled as buttons (navbar, hero, FinalCTA). |
| U3 | Mobile menu didn't close on navigation. | **FIXED** — closes on any link tap. |
| U4 | `<a href>` used for internal routes (full page reloads) in Blog, Projects, WhySolar. | **FIXED** — converted to `next/link`. |
| U5 | Chatbot: functions referenced before declaration blocked React Compiler optimization. | **FIXED** — reordered. |
| U6 | Unescaped quotes/apostrophes (React lint errors) in Contact, FAQ, Footer, Testimonials. | **FIXED**. |
| U7 | Carousel dots always rendered the active class truthily (`active === index && "…"` → literal "false" class). | **FIXED** with ternary. |
| U8 | Blog/[slug] renders plain text only — fine for XSS, but no rich content. If you later render HTML, sanitize server-side. | Noted. |
| U9 | Calculator page and Design Studio produce different numbers (calculator uses its own math). | **RECOMMENDED** — port the calculator to `lib/solar-engine` so all numbers agree; add a "Want it on your real roof? → Design Studio" CTA there. |
| U10 | `WhatsappFloat`/`Chatbot` overlap on small screens; consider a single launcher. | **RECOMMENDED** |

## 6. Round 2 — Calculator, Particles & Admin Panel (July 2026)

### Calculator (math corrected — now shares the studio's engine)
| Old behavior | New behavior |
|---|---|
| State dropdown collected but **never used** (flat ₹7/kWh) | Tariff defaults from the per-state table (`getStateTariff`) |
| Yield: flat 4.5 PSH everywhere | State-level Peak Sun Hours from the engine's irradiance table |
| Subsidy: flat 30% of cost (wildly wrong above 3 kW) | Real PM Surya Ghar slabs (₹30k/kW ≤2 kW, ₹18k 3rd kW, cap ₹78k), shown as a line item |
| Savings = full bill even when the roof can't fit the system | System capped by roof area; savings capped at min(generation value, bill); coverage % shown |
| Payback = cost ÷ savings | 25-year cash flow with degradation via `buildEnergyReport` |
| ₹55k/kW (didn't match studio's ₹45k) | Same cost constant as the studio — both tools now always agree |
Plus: panel count, CO₂ card, 25-yr savings, and a "Get exact numbers on your real roof" CTA into the Design Studio.

### Particle background
`components/ParticleField.jsx` — canvas constellation of golden/green energy motes: slow drift + twinkle, gentle cursor repulsion, green links between neighbors and golden threads to the cursor. Mounted in the `(public)` layout → every public page, automatically excluding the Design Studio and admin. `pointer-events: none`, DPR capped, pauses on hidden tabs, disabled entirely under `prefers-reduced-motion` (via `useSyncExternalStore`).

### Admin panel
| # | Finding | Status |
|---|---------|--------|
| A1 | **Middleware protected nothing** (it only console-logged API requests) — any visitor could load every /admin page shell. | **FIXED** — `/admin/*` now redirects to login without the `admin_token` cookie (JWT itself verified by every API; verified: fake cookie → page shell but all data APIs 401). |
| A2 | **Studio data invisible** — enquiries table had no source info; SolarProject designs had no page at all. | **FIXED** — new **Studio Designs** page (list, search, status workflow draft→designed→proposal→approved, delete, full detail modal with system/roof/financials/confidence + Google Maps link); enquiries got a Source badge, source filter, studio system/roof column. |
| A3 | Enquiry detail = message-text-only modal. | **FIXED** — full lead drawer: contact block, message, reply history, and the complete Design Studio context (address, areas, kW, panels, kWh/yr, usage, tariff, coverage, maps link). |
| A4 | Dashboard ignored the studio funnel. | **FIXED** — 6 clickable stat cards incl. Studio Designs, Studio-sourced leads, total kW designed (new aggregate in `/api/admin/stats`). |
| A5 | Excel export missing studio fields. | **FIXED** — Source, design address, roof m², kW, panels, kWh/yr, monthly bill columns. |
| A6 | Design: flat white sidebar, duplicate icons, no page titles, no way back to the site. | **FIXED** — dark branded sidebar with grouped nav (Overview / Leads / Content), active states, "View website", contextual page title + date in the header. |
| A7 | `alert()` used for admin feedback. | **RECOMMENDED** — replace with inline toasts when convenient. |

## 7. Verification

- `npm run build` ✓ compiles (all routes)
- `npx eslint components app lib models utils` ✓ 0 errors (2 benign `<img>` data-URL warnings in the studio)
- `npx vitest run` ✓ 31/31 engine tests
- Admin-gated routes return 401 without the admin cookie
