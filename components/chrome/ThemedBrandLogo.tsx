/* The SWH lockup in the right colours for the theme, with no JavaScript.

   The mark exists as two files: an ink "S" for light backgrounds and an off-white "S" for
   dark ones (BrandLogo's own two sources). Both renderings are in the HTML and CSS shows
   one by <html data-theme> (see .swh-theme-light/.swh-theme-dark in app/theme.css), so
   the logo is right on the first paint for every visitor. The wordmark already follows
   the theme through var(--ink).

   `onAccent` (over photography) is the solid-white version and is the same in both themes,
   so it renders once. Server-safe: no hooks — the root 404 uses it too. */

import type { ComponentType } from "react";
import { BrandLogo as DsBrandLogo, type BrandLogoProps } from "@/components/ds/BrandLogo";

/* BrandLogo.d.ts (a design-system copy) omits two props the component accepts: the
   light-background source and pass-through attributes. Widened here, at the call site. */
const BrandLogo = DsBrandLogo as ComponentType<BrandLogoProps & { srcOnLight?: string; className?: string }>;

const LIGHT_S_ON_DARK = "/assets/brand/swh-logo.png";

export function ThemedBrandLogo({ height, onAccent = false }: { height: number; onAccent?: boolean }) {
  if (onAccent) return <BrandLogo variant="lockup" height={height} onAccent />;
  return (
    <>
      <BrandLogo variant="lockup" height={height} className="swh-theme-light" />
      <BrandLogo variant="lockup" height={height} srcOnLight={LIGHT_S_ON_DARK} className="swh-theme-dark" />
    </>
  );
}
