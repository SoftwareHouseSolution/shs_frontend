/* Company facts. Sourced from PRODUCT.md and extract/impeccable_frontend_prd/product.md.
   Do not add claims here that are not in those files. If a newer client document lands,
   record it in PRODUCT.md first and then reflect it here — not the other way round.

   SPLIT INTO TWO. `SITE` holds the facts that are the same in every language — a phone
   number, an email address, a founding year, a WhatsApp URL. `SITE_L` holds the ones that
   are written differently in Arabic: the street address and the region names. Keeping
   them apart means a translator never sees a mailto: string and a number can never be
   "translated" into something that no longer dials. */

import { href, pathWithoutLocale, type Locale } from "./i18n";

export const SITE = {
  name: "Software House Solutions",
  shortName: "SWH",
  since: 1988,
  /* Address and phone are from page 57 of the 2026 company profile and supersede the
     Al-Sherouk address and +20 155 208 1988 — see PRODUCT.md, which records both.
     WhatsApp was confirmed by the client on 2026-08-07 to be the SAME line as the phone
     number, so the old +20 155 208 1988 pointer is retired. */
  phone: "+20 15 58856988",
  phoneHref: "tel:+201558856988",
  whatsapp: "https://wa.me/201558856988",
  salesEmail: "Sales@Softwarehouse-sol.com",
  careersEmail: "Custcare@Softwarehouse-sol.com",
  /* The Contact section lives on the home page and on /customers; there is no standalone
     contact route. Stored UNPREFIXED — i18n.href() adds /en or /ar at render time. */
  demoHref: "/#contact",
} as const;

/** The company name is a proper noun and stays in Latin script in both languages, which
    is how it appears on the client's own Arabic material. Kept as a lookup anyway so a
    future Arabic trading name has somewhere to go. */
export const SITE_L: Record<Locale, { name: string; address: string; regions: readonly string[] }> = {
  en: {
    name: "Software House Solutions",
    address: "99 Omar ibn El-khtab",
    regions: ["Egypt", "Dubai", "KSA", "USA"],
  },
  ar: {
    name: "Software House Solutions",
    address: "99 شارع عمر بن الخطاب",
    regions: ["مصر", "دبي", "السعودية", "الولايات المتحدة"],
  },
};

/** Comma-joined region list, with the Arabic conjunction rather than a comma. Arabic
    prose lists with "و" prefixed to each item; a comma-separated list reads as a form
    field, not a sentence. */
export function regionList(lang: Locale): string {
  const r = SITE_L[lang].regions;
  return lang === "ar" ? r.join(" و") : r.join(", ");
}

/* Social profiles, rendered by components/chrome/SocialRail.tsx.

   Facebook and Instagram are the URLs recorded in PRODUCT.md. LinkedIn is a PLACEHOLDER:
   the client has no LinkedIn URL on file anywhere in the profile PDF or the legacy site,
   and the instruction was to show the icon for now. It points at LinkedIn's own company
   search rather than a guessed vanity slug, so the link resolves to something real
   instead of a 404. Replace `href` the moment the company page URL arrives.

   `label` is NOT translated: it is both the platform's own brand name and the key
   SocialIcon switches on. */
export const SOCIAL = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/search/results/companies/?keywords=Software%20House%20Solutions",
    placeholder: true,
  },
  { label: "Instagram", href: "https://instagram.com/softwarehousesolutions", placeholder: false },
  { label: "Facebook", href: "https://m.facebook.com/softwarehousesoultions", placeholder: false },
] as const;

/* Trust figures, rendered by components/sections/StatsRow.tsx.

   Source: the client's ui_ux/…/"website start and end and numbers.docx" (received
   2026-08-06), with the client count revised UP to 1,750+ by the client on 2026-08-07.
   These SUPERSEDE the older "2000+ clients" figure — see PRODUCT.md, which records all
   three and why the newest wins. The numbers describe different things: 2000+ counted
   every client across every industry; 1,750+ counts jewellery stores and manufacturers
   specifically, which is the audience this site is for.

   `to` is the value counted up to; entries with `text` are rendered as-is. A year must
   never count up — a date ticking from zero reads as a bug, not as motion.

   The VALUES are identical in both languages and the digits stay Western in Arabic too:
   Egyptian business writing uses Western digits, and the Arabic body copy elsewhere
   writes "1,750+" the same way. Only the labels differ. */
export type Stat =
  | { to: number; prefix: string; suffix: string; label: string }
  | { text: string; label: string };

const STATS_EN: readonly Stat[] = [
  { text: "1988", label: "Established" },
  { to: 1750, prefix: "", suffix: "+", label: "Jewellery stores & manufacturers" },
  { to: 96, prefix: "", suffix: "%", label: "Of Egypt's jewellery market served" },
  { to: 35, prefix: "", suffix: "+", label: "Years of industry experience" },
  { text: "24/7", label: "Technical support" },
];

const STATS_AR: readonly Stat[] = [
  { text: "1988", label: "سنة التأسيس" },
  { to: 1750, prefix: "", suffix: "+", label: "متجر ومصنع مجوهرات" },
  { to: 96, prefix: "", suffix: "%", label: "من سوق المجوهرات في مصر" },
  { to: 35, prefix: "", suffix: "+", label: "عامًا من الخبرة في القطاع" },
  { text: "24/7", label: "دعم فني" },
];

export const STATS: Record<Locale, readonly Stat[]> = { en: STATS_EN, ar: STATS_AR };

/* Routes that render <Contact /> in the page body, written WITHOUT the locale prefix.
   There is still no standalone contact route, so the nav CTA falls back to SITE.demoHref
   (the home page's section) everywhere else. Adding a route here without also mounting
   <Contact /> on it gives the CTA a dead anchor — the two must change together. */
export const CONTACT_ROUTES: readonly string[] = ["/", "/customers"];

/**
 * The "Book a demo" target for the page currently on screen: the local #contact section
 * when this route mounts one, the home page's section otherwise — in the active language
 * either way. `pathname` is the full path INCLUDING the locale segment, straight from
 * usePathname(); the locale is stripped before the lookup so CONTACT_ROUTES above stays
 * written in plain, prefix-free route terms.
 */
export function demoHrefFor(lang: Locale, pathname: string): string {
  return CONTACT_ROUTES.includes(pathWithoutLocale(pathname))
    ? "#contact"
    : href(lang, SITE.demoHref);
}
