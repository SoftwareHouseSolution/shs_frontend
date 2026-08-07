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
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
