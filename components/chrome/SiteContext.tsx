"use client";

/* Site-wide CMS data (settings, navigation, footer, social links, badges) for client
   components. The [lang] layout fetches it once on the server and provides it here, so the
   navbar, footer, contact rail and error boundary all read one copy rather than each
   fetching or being handed it through five levels of props. */

import { createContext, useContext } from "react";
import type { SiteData } from "@/lib/api/types";

const SiteContext = createContext<SiteData | null>(null);

export function SiteProvider({ site, children }: { site: SiteData; children: React.ReactNode }) {
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteData {
  const site = useContext(SiteContext);
  if (!site) throw new Error("useSite() must be used inside <SiteProvider>.");
  return site;
}

/** For the few components that also render outside the provider (none today, but the
    root 404 sits above it) — returns null instead of throwing. */
export function useOptionalSite(): SiteData | null {
  return useContext(SiteContext);
}
