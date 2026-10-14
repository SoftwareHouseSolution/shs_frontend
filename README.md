# SWH web

The Software House Solutions website. It began as a Next.js 16 port of the design-system prototype
at `apps/softwarehouse-frontend/Software House Solutions Design System/ui_kits/swh-marketing/`, and
now carries a site-wide navbar, an immersive hero, and 17 interior routes.

**All content comes from the Django CMS in `../backend`** — pages, navigation, hero slides,
figures, clients, events, contact details, images and video. Nothing editable is hardcoded
here; `content/` keeps only locale helpers (`i18n.ts`), interface strings (`ui.ts`) and
route-structure facts. Start the backend first (see `../backend/README.md`).

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL → the Django API
pnpm dev          # http://localhost:3000
pnpm build        # production build; every route is prerendered from the API and revalidated
pnpm start        # production server
pnpm typecheck
```

## Structure

- `lib/api/` — the only code that talks to the backend. `client.ts` (base URL, `?lang=`,
  envelope validation, retries, snake_case → camelCase), `envelope.ts` (the response
  contract and four distinguishable error classes), `content.ts` (cached server loaders),
  `types.ts` (payload types), `enquiries.ts` (the contact form's POST).
- `components/chrome/VisitTracker.tsx` + `lib/api/analytics.ts` — anonymous page-flow
  analytics for the CMS dashboard: reports each page view on open, every 15s while visible,
  and on leave (sendBeacon); counts only visible time; silent under Do-Not-Track/GPC or
  `NEXT_PUBLIC_ANALYTICS=off`.
- `components/chrome/SiteContext.tsx` — site-wide CMS data (settings, navigation, footer,
  social, badges) fetched once in `app/[lang]/layout.tsx` and read by the client chrome.

- `app/layout.tsx` — the document: `<html>`, `<body>`, the stylesheet order.
- `app/[lang]/layout.tsx` — fetches the site data for the language, provides `SiteContext`,
  renders `<SkipLink/>`, `<SiteNav/>` and the load-bearing `<div id="app">`; per-language
  title, description and favicon come from Site settings.
- `app/[lang]/(site)/layout.tsx` → `PageShell` — `.page-content`, the measured footer spacer,
  and the fixed `.sticky-footer` the page scrolls over.
- `app/[lang]/(site)/page.tsx` — home: a server component that fetches `/home/` and renders
  `components/sections/HomeSections.tsx`.
- `app/[lang]/(site)/[slug]/page.tsx` — every standard CMS page. `generateStaticParams` reads
  the published page list from the API; `dynamicParams = false` keeps the static export
  possible, so a page CREATED in the CMS needs a rebuild (edits to existing pages do not).
- `app/[lang]/(site)/customers/page.tsx` — the client directory (CMS page header + clients API).
- `components/chrome/` — persistent site furniture. `components/hero/` — carousel and page headers.
  `components/ds/` — untouched design-system copies. `components/sections/` — prototype sections.

## Verification

```bash
pnpm build && pnpm start -p 3001
PORT_URL=http://localhost:3001/ node tools/check-cms.mjs  # CMS content, lang/dir, enquiry form (21 checks)
PORT_URL=http://localhost:3001/ node tools/check-analytics.mjs  # visit tracking: flow, time on page, DNT (10 checks)
node tools/check-ds-parity.mjs                            # design-system byte parity (29 checks)
PORT_URL=http://localhost:3001/ node tools/check-nav.mjs  # navigation + drawer (45 checks)
PORT_URL=http://localhost:3001/ node tools/check-hero.mjs # carousel + reduced motion (17 checks)
PORT_URL=http://localhost:3001/ node tools/check-ux.mjs   # 2026-10 UI/UX pass (31 checks)
```

Every check also takes `SITE_LANG=ar`. `tools/check-clients.mjs` predates the map and still
targets the retired ClientDirectory; it times out on `networkidle` and is not a gate.

Use `next start`, not `next dev`: dev mode injects a fixed dev-indicator badge in the bottom-left of
the viewport.

### On the retired pixel-parity baseline

Until commit `9a052f9`, `/` was verified at **0 differing pixels** across 8 viewport widths against
the running prototype. That guarantee is **intentionally retired**, not regressed: `/` now replaces
the floating `NavPill` with a site-wide navbar and adds a full-bleed hero above the fold, so there
is no longer a prototype for it to match. `tools/compare.mjs` is kept for reference but is no longer
a gate — it will fail, and it hangs on `networkidle` because the navbar prefetches 17 routes.

What is still guaranteed, and still checked, is `tools/check-ds-parity.mjs`: every copied
design-system component and token file remains byte-identical to its source.

## Deliberate decisions

These look like omissions. They are not — each one is load-bearing for pixel parity.

**Plain `<img>`, never `next/image`.** `next/image` injects layout wrappers, requires `width`/`height`
that would override the hero's intrinsic-size sizing (`maxWidth: "min(400px,38vw)"`, `objectFit:
"contain"`), defaults to lazy-loading with a decode fade that shifts when images appear relative to
`Reveal` and the 11s ken-burns, and re-encodes to AVIF/WebP — which changes pixel values outright.
There is no `images` block in `next.config.ts` and `sharp` is not installed.

**Raw `@font-face`, never `next/font`.** Font family names are baked into token *values*
(`--f-serif: "Crimson Text", Georgia, serif`), so `next/font`'s hashed families would force edits to
`styles/tokens/typography.css`. It also injects size-adjusted fallback metrics and auto-preloads,
changing pre-swap layout and shortening FOUT. No preload links either — an improvement is still a
drift.

**No ESLint.** A formatter or a props-ordering rule would reorder inline style keys, and several
components depend on key order: `Container` and `Section` emit a `padding` shorthand and then spread
`...style`, so callers' `paddingTop`/`paddingBottom` longhands must land after it. If ESLint is added
later, exclude `components/ds/` and disable any key-sorting rule.

**The footer year is a literal string.** `"© Software House Solutions · 2026"`. Deriving it from
`new Date().getFullYear()` renders identically today and would quietly introduce a hydration
mismatch class.

**`useEffect`, never `useLayoutEffect`,** in `ScrollReveal` and `Testimonial`. Both paint one
untransformed frame before their effect runs. That frame exists in the prototype.

**The nav-peek toggle stays imperative.** `document.querySelector(".site-nav")` + `classList` mutates
in the same task as the passive scroll handler. Routing it through `setState` would defer the class
by a frame and re-render every section on every scroll event.

**`<div id="app">` in `layout.tsx` is structural.** `#app { overflow-x: hidden }` contains the hero's
`.ds-back` cards (`translateX ±60%`) and the sage block spanning `left:-110%/right:-110%`. Moving the
rule to `html`/`body` changes scroll-container semantics and reintroduces a horizontal scrollbar.

**No `role="menu"` in the navbar.** The dropdowns follow the WAI-ARIA Disclosure Navigation
pattern. `role="menu"` puts screen readers into application mode and strips the link role from
every item, which is wrong for links to pages. Closed panels use `inert` rather than the `hidden`
attribute — `hidden` sets `display:none` and would kill the transition.

**`@property --nav-bg` must stay `inherits: true`.** It is set on `.swh-nav` but read by its child
`.swh-nav__surface`. With `inherits: false` the child falls back to the initial value and the bar
never paints, even though the state attribute flips correctly.

**Reduced-motion overrides must match selector specificity, not just the element.** The hero zoom is
declared on `.hero-slide[data-state="enter"] .hero-slide__img` (0,2,1). A media query adds no
specificity, so an override written as `.hero-slide__img` (0,1,0) loses and the animation keeps
running.

## UI/UX conventions (2026-10 pass)

Layered on top of the design system, never inside it — `components/ds/` and `styles/` were
not touched.

- **Tokens.** `app/chrome.css` → "Design-system extensions" adds `--text-subtle` (the AA
  colour for small text; `--muted` is 2.98:1 and is for the muted-xl numerals only),
  `--hairline-strong`, `--danger`/`--danger-soft`, `--r-md`/`--r-lg`, `--ease-out`,
  `--ease-emph`, `--t-enter` and `--focus-outline`/`--focus-offset`. Reach for these before
  writing a literal.
- **Focus.** A zero-specificity `:where(...):focus-visible` floor gives every focusable
  element a ring; component rules that draw their own still win. On photography use
  `--focus-ring-over`.
- **Feedback components.** `components/feedback/` — `StatusPanel` (the 404 and the error
  boundary), `EmptyState` (no results) and their stroke icons. The 404 is bilingual because
  it cannot see the route's language; the error boundary lives in `(site)` so the nav and
  footer survive a failing page, and it never prints `error.message`.
- **Where am I.** A dropdown trigger carries `data-active` when the current page is one of
  its children; the drawer opens with that group expanded. Compare paths with `samePath()`
  from `content/i18n.ts`, never `===` — the static export adds trailing slashes.
- **SpecTable on phones.** Wrap it in `<div className="swh-spec" style={{ "--spec-cols": n }}>`;
  the wrapper rebuilds its per-row grids below 700px (see the note in `chrome.css`).
- **Motion.** New entrances reuse the hero copy's `swh-hero-copy` keyframes. Every one has a
  reduced-motion override, and nothing loops forever — the map skeleton's shine is capped
  at six passes.
- **Forms.** One: the enquiry form in `#contact` (`components/sections/EnquiryForm.tsx`).
  Validation is the API's — messages arrive in the page's language and land under each
  field; the first invalid field takes focus. Network, server, rate-limit and validation
  failures each get their own wording.
- **Deliberately absent.** No toast system and no route `loading.tsx`: every route is
  prerendered (and revalidated in the background), so there is no navigation-time fetch to
  wait on. A `loading.tsx` would also hand SiteNav's hero observer a skeleton to latch onto.

## Known differences from the prototype

Two, both load-timing artifacts of the prototype rather than code differences:

1. **Page height differs by 1px.** All nine sections match to 0.000px in position and height. The
   prototype latches a stale footer measurement of `208px` when its actual `offsetHeight` is `207px`
   — it measures once on mount (which happens mid-font-load, after the Babel transpile) and only
   re-measures on resize. This app measures the same way and gets the settled value. The diff
   harness crops to the common height; the delta itself is gated by the `scrollHeight` check.
2. **Ken-burns starts earlier here.** Its 11s clock starts at DOM insertion — after ~300–1500ms of
   CDN and Babel work in the prototype, but at first paint here. Since the animation is `forwards`,
   both settle at `scale(1.14)`; the harness waits 12s before capturing.

## Copied from the design system — do not edit

`components/ds/` (11 `.jsx` + 11 `.d.ts`) and `styles/` are copies. All 22 component files are
byte-identical to their source except `Reveal.jsx` and `PillButton.jsx`, which each gain exactly one
`"use client";` line. Verify with:

```bash
git diff --no-index "../softwarehouse-frontend/Software House Solutions Design System/components/motion/Reveal.jsx" components/ds/Reveal.jsx
```

`styles/styles.css` and four of five token files are byte-identical. `styles/tokens/fonts.css` is the
single exception: its five `src: url()` paths were changed from `../assets/fonts/…` to
`/assets/fonts/…` so they resolve against `public/`. Nothing else in it was touched.

Two consequences worth knowing:

- **`NavPill.d.ts` is narrower than `NavPill.jsx`.** The implementation spreads `...rest` onto its
  `<nav>` (which is how `.site-nav` gets attached), but the declaration only lists `links` and
  `style`. Rather than edit a design-system file, `app/page.tsx` widens the type at the call site.
- **All 11 `.d.ts` files use the global `JSX` namespace**, which React 19's types removed.
  `types/jsx-global.d.ts` restores it additively so they typecheck untouched.

If the design system is ever updated, re-verify `_ds_manifest.json`'s `sourceHashes` before
re-syncing — the prototype renders `_ds_bundle.js` while this app builds from the `.jsx` sources,
and they match today.
