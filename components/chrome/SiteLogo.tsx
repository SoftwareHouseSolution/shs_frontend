"use client";

import { BrandLogo } from "@/components/ds/BrandLogo";
import { useSite } from "./SiteContext";

/* The site mark. Uses the logo uploaded in the CMS (Site settings → Brand) when there is
   one, and the design system's built-in SWH lockup otherwise — so the default install
   looks exactly as designed, and a rebrand needs no code change. `onAccent` picks the
   variant for dark backgrounds (over the hero), as BrandLogo's own prop does. */
export function SiteLogo({ height, onAccent = false }: { height: number; onAccent?: boolean }) {
  const { settings } = useSite();
  const uploaded = onAccent ? settings.logoOnDark ?? settings.logoOnLight : settings.logoOnLight;
  if (!uploaded) return <BrandLogo variant="lockup" height={height} onAccent={onAccent} />;
  return <img src={uploaded} alt="" style={{ height, width: "auto", display: "block" }} />;
}
