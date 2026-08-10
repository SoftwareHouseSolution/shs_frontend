import type { NextConfig } from "next";

/**
 * Deliberately minimal.
 *
 * This app is a pixel- and motion-exact port of the design-system prototype at
 * `apps/softwarehouse-frontend/Software House Solutions Design System/ui_kits/swh-marketing/`.
 * No `images` block and no `sharp` dependency: the port uses plain <img> tags, because
 * next/image injects layout wrappers, lazy-loading, and AVIF/WebP re-encoding that would
 * change both layout and pixel values. See apps/web/README.md.
 */
/*
 * STATIC EXPORT (`pnpm build:static`) — for Bluehost and any other plain Apache/nginx host.
 *
 * Gated behind an env var rather than switched on permanently, because `output: "export"`
 * disables `next start`, and tools/check-home.mjs and check-nav.mjs both run against a
 * production server on a port. Leaving it always-on would trade the test harness for the
 * deploy target. `pnpm build` and `pnpm start` therefore behave exactly as before.
 *
 * trailingSlash emits `about-company/index.html` instead of `about-company.html`, which
 * Apache serves at /about-company/ with no rewrite rules and no MultiViews. Without it,
 * every interior route needs .htaccess to resolve.
 */
const isStatic = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isStatic ? { output: "export" as const, trailingSlash: true } : {}),
};

export default nextConfig;
