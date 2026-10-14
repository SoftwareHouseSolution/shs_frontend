/* Route-structure facts that are code, not content.

   Everything that used to live here — company name, phone, e-mail, address, WhatsApp,
   social profiles, the trust figures — is now edited in the CMS (Django admin → Site
   settings / Home page) and arrives through lib/api. What remains is which routes MOUNT
   the <Contact /> section, which is a fact about the page components, not about the
   company. */

import { href, pathWithoutLocale, type Locale } from "./i18n";

/* Routes that render <Contact /> in the page body, written WITHOUT the locale prefix.
   Adding a route here without also mounting <Contact /> on it gives the CTA a dead
   anchor — the two must change together. */
export const CONTACT_ROUTES: readonly string[] = ["/", "/customers"];

/**
 * The "Book a demo" target for the page currently on screen: the local #contact section
 * when this route mounts one, the CMS-configured target (normally "/#contact") otherwise —
 * in the active language either way. `pathname` includes the locale segment.
 */
export function demoHrefFor(lang: Locale, pathname: string, fallback: string): string {
  return CONTACT_ROUTES.includes(pathWithoutLocale(pathname)) && fallback.endsWith("#contact")
    ? "#contact"
    : href(lang, fallback);
}
