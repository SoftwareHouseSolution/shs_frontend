/* Company facts. Sourced from PRODUCT.md and extract/impeccable_frontend_prd/product.md.
   Do not add claims here that are not in those files. If a newer client document lands,
   record it in PRODUCT.md first and then reflect it here — not the other way round. */

export const SITE = {
  name: "Software House Solutions",
  shortName: "SWH",
  since: 1988,
  /* Address and phone are from page 57 of the 2026 company profile and supersede the
     Al-Sherouk address and +20 155 208 1988 — see PRODUCT.md, which records both.
     WhatsApp was confirmed by the client on 2026-08-07 to be the SAME line as the phone
     number, so the old +20 155 208 1988 pointer is retired. */
  address: "99 Omar ibn El-khtab",
  phone: "+20 15 58856988",
  phoneHref: "tel:+201558856988",
  whatsapp: "https://wa.me/201558856988",
  salesEmail: "Sales@Softwarehouse-sol.com",
  careersEmail: "Custcare@Softwarehouse-sol.com",
  regions: ["Egypt", "Dubai", "KSA", "USA"],
  /* The Contact section lives on the home page; there is no standalone contact route. */
  demoHref: "/#contact",
} as const;

/* Social profiles, rendered by components/chrome/SocialRail.tsx.

   Facebook and Instagram are the URLs recorded in PRODUCT.md. LinkedIn is a PLACEHOLDER:
   the client has no LinkedIn URL on file anywhere in the profile PDF or the legacy site,
   and the instruction was to show the icon for now. It points at LinkedIn's own company
   search rather than a guessed vanity slug, so the link resolves to something real
   instead of a 404. Replace `href` the moment the company page URL arrives. */
export const SOCIAL = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/search/results/companies/?keywords=Software%20House%20Solutions",
    placeholder: true,
  },
  { label: "Instagram", href: "https://instagram.com/softwarehousesolutions", placeholder: false },
  { label: "Facebook", href: "https://m.facebook.com/softwarehousesoultions", placeholder: false },
] as const;

/* Trust figures, rendered by components/sections/StatsBand.tsx.

   Source: the client's ui_ux/…/"website start and end and numbers.docx" (received
   2026-08-06), with the client count revised UP to 1,750+ by the client on 2026-08-07.
   These SUPERSEDE the older "2000+ clients" figure — see PRODUCT.md, which records all
   three and why the newest wins. The numbers describe different things: 2000+ counted
   every client across every industry; 1,750+ counts jewellery stores and manufacturers
   specifically, which is the audience this site is for.

   `to` is the value counted up to; entries with `text` are rendered as-is. A year must
   never count up — a date ticking from zero reads as a bug, not as motion. */
export type Stat =
  | { to: number; prefix: string; suffix: string; label: string }
  | { text: string; label: string };

export const STATS: readonly Stat[] = [
  { text: "1988", label: "Established" },
  { to: 1750, prefix: "", suffix: "+", label: "Jewellery stores & manufacturers" },
  { to: 96, prefix: "", suffix: "%", label: "Of Egypt's jewellery market served" },
  { to: 35, prefix: "", suffix: "+", label: "Years of industry experience" },
  { text: "24/7", label: "Technical support" },
] as const;
