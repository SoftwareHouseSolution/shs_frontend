/* Company facts. Sourced from PRODUCT.md and extract/impeccable_frontend_prd/product.md.
   Do not add claims here that are not in those files. If a newer client document lands,
   record it in PRODUCT.md first and then reflect it here — not the other way round. */

export const SITE = {
  name: "Software House Solutions",
  shortName: "SWH",
  since: 1988,
  /* Address and phone are from page 57 of the 2026 company profile and supersede the
     Al-Sherouk address and +20 155 208 1988 — see PRODUCT.md, which records both.
     WhatsApp deliberately still points at the OLD number: the profile does not mention
     WhatsApp, and a dead link is worse than an outdated one. */
  address: "99 Omar ibn El-khtab",
  phone: "+20 15 58856988",
  phoneHref: "tel:+201558856988",
  whatsapp: "https://wa.me/+201552081988",
  salesEmail: "Sales@Softwarehouse-sol.com",
  careersEmail: "Custcare@Softwarehouse-sol.com",
  regions: ["Egypt", "Dubai", "Malaysia", "Singapore"],
  /* The Contact section lives on the home page; there is no standalone contact route. */
  demoHref: "/#contact",
} as const;

/* Trust figures, rendered by components/sections/StatsBand.tsx.

   Source: the client's ui_ux/…/"website start and end and numbers.docx" (received
   2026-08-06). These SUPERSEDE the older "2000+ clients" figure — see PRODUCT.md, which
   records both and why the newer set wins. The two numbers describe different things:
   2000+ counted every client across every industry; 1,050+ counts jewellery stores and
   manufacturers specifically, which is the audience this site is for.

   `to` is the value counted up to; entries with `text` are rendered as-is. A year must
   never count up — a date ticking from zero reads as a bug, not as motion. */
export type Stat =
  | { to: number; prefix: string; suffix: string; label: string }
  | { text: string; label: string };

export const STATS: readonly Stat[] = [
  { text: "1988", label: "Established" },
  { to: 1050, prefix: "", suffix: "+", label: "Jewellery stores & manufacturers" },
  { to: 96, prefix: "", suffix: "%", label: "Of Egypt's jewellery market served" },
  { to: 35, prefix: "", suffix: "+", label: "Years of industry experience" },
  { text: "24/7", label: "Technical support" },
] as const;
