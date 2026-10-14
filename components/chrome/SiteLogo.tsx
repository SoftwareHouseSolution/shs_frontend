"use client";

import { ThemedBrandLogo } from "./ThemedBrandLogo";
import { useSite } from "./SiteContext";

/* The site mark. Uses the logos uploaded in the CMS (Site settings → Brand) when there
   are any, and the design system's built-in SWH lockup otherwise — so the default install
   looks exactly as designed, and a rebrand needs no code change.

   Both themes are in the HTML and CSS shows one (see ThemedBrandLogo): the dark-background
   logo is used over photography (`onAccent`) and on the dark theme's surfaces. */
export function SiteLogo({ height, onAccent = false }: { height: number; onAccent?: boolean }) {
  const { settings } = useSite();
  const { logoOnLight, logoOnDark } = settings;
  if (!logoOnLight && !logoOnDark) return <ThemedBrandLogo height={height} onAccent={onAccent} />;

  const img = (src: string | null, className?: string) =>
    src ? <img className={className} src={src} alt="" style={{ height, width: "auto", display: "block" }} /> : null;
  if (onAccent) return img(logoOnDark ?? logoOnLight);
  return (
    <>
      {img(logoOnLight ?? logoOnDark, "swh-theme-light")}
      {img(logoOnDark ?? logoOnLight, "swh-theme-dark")}
    </>
  );
}
