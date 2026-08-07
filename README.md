# SWH web

The Software House Solutions website. It began as a Next.js 16 port of the design-system prototype
at `apps/softwarehouse-frontend/Software House Solutions Design System/ui_kits/swh-marketing/`, and
now carries a site-wide navbar, an immersive hero, and 17 interior routes.

```bash
pnpm dev          # http://localhost:3000
pnpm build        # Turbopack production build; every route is statically prerendered
pnpm start        # production server
pnpm typecheck
```

## Structure

- `app/layout.tsx` — server component. Holds `metadata`, the stylesheet order, `<SkipLink/>`,
  `<SiteNav/>`, and the load-bearing `<div id="app">`.
- `app/(site)/layout.tsx` → `PageShell` — `.page-content`, the measured footer spacer, and the
  fixed `.sticky-footer` the page scrolls over.
- `app/(site)/page.tsx` — home: the hero carousel, then the original device-mockup hero, then the
  eight remaining prototype sections.
- `app/(site)/[slug]/page.tsx` — all 17 interior routes from one file. `generateStaticParams` reads
  the same array that renders the menu, so a nav link without a page is impossible by construction.
  `dynamicParams = false` makes anything else a 404.
- `content/nav.ts` — the navigation tree, and the single source of truth for the route list.
  `content/pages.ts` is keyed `Record<PageSlug, PageContent>`, so a missing or misspelt page is a
  build-time type error.
- `components/chrome/` — persistent site furniture. `components/hero/` — carousel and page headers.
  `components/ds/` — untouched design-system copies. `components/sections/` — prototype sections.

## Verification

```bash
pnpm build && pnpm start -p 3001
node tools/check-ds-parity.mjs                            # design-system byte parity (29 checks)
PORT_URL=http://localhost:3001/ node tools/check-nav.mjs  # navigation + drawer (45 checks)
PORT_URL=http://localhost:3001/ node tools/check-hero.mjs # carousel + reduced motion (17 checks)
```

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
