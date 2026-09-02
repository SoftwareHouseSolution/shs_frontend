/* THE navigation tree — single source of truth for both the menu and the route list.
   `generateStaticParams` in app/[lang]/(site)/[slug]/page.tsx derives its slugs from this
   array, so a nav link without a page is impossible by construction.

   Structure mirrors the reference site's information architecture. Labels are generic
   business-section names except "Life At SWH", which is adapted because the original
   embeds a different company's name. A competitor's product names are deliberately
   absent from the Solutions dropdown — those are their trademarks.

   BILINGUAL. `label` is a per-locale record; `href` is NOT — hrefs are stored WITHOUT the
   /en or /ar prefix and gain it at render time through i18n.href(). One tree, one route
   list, two languages: the Arabic menu cannot drift out of structural step with the
   English one, because there is only one structure.

   `id` is the stable, language-independent handle. DOM ids, open-menu state and the
   footer's column lookup all key off it — none of them may key off a label, which now
   changes with the language. */

import type { Locale, Localized } from "./i18n";

export type NavLeaf = { readonly label: Localized; readonly href: string };
export type NavGroup = {
  readonly id: string;
  readonly label: Localized;
  readonly children: readonly NavLeaf[];
};
export type NavEntry = NavLeaf | NavGroup;

export const NAV = [
  { label: { en: "Home", ar: "الرئيسية" }, href: "/" },
  {
    id: "about",
    label: { en: "About", ar: "من نحن" },
    children: [
      { label: { en: "About Company", ar: "عن الشركة" }, href: "/about-company" },
      { label: { en: "Background & Capabilities", ar: "خبراتنا وإمكانياتنا" }, href: "/background-capabilities" },
      { label: { en: "Our Team", ar: "فريق العمل" }, href: "/our-team" },
      { label: { en: "Certificates", ar: "الشهادات" }, href: "/certificates" },
    ],
  },
  {
    id: "solutions",
    label: { en: "Solutions", ar: "الحلول" },
    children: [
      { label: { en: "All Solutions", ar: "جميع الحلول" }, href: "/solutions" },
      { label: { en: "All Services", ar: "جميع الخدمات" }, href: "/services" },
    ],
  },
  {
    id: "partners",
    label: { en: "Partners", ar: "الشركاء" },
    children: [
      { label: { en: "Technology Partners", ar: "شركاء التقنية" }, href: "/technology-partners" },
      { label: { en: "Business Partners", ar: "شركاء الأعمال" }, href: "/business-partners" },
      { label: { en: "Become A Partner", ar: "كن شريكًا لنا" }, href: "/become-a-partner" },
    ],
  },
  {
    id: "customers",
    label: { en: "Customers", ar: "العملاء" },
    children: [
      { label: { en: "Customers Sample", ar: "نماذج من عملائنا" }, href: "/customers" },
      { label: { en: "Testimonials", ar: "آراء العملاء" }, href: "/testimonials" },
      { label: { en: "Case Studies", ar: "دراسات الحالة" }, href: "/case-studies" },
    ],
  },
  { label: { en: "News & Events", ar: "الأخبار والفعاليات" }, href: "/news-events" },
  {
    id: "careers",
    label: { en: "Careers", ar: "الوظائف" },
    children: [
      { label: { en: "Vacancies", ar: "الوظائف الشاغرة" }, href: "/vacancies" },
      { label: { en: "Internships", ar: "التدريب" }, href: "/internships" },
      { label: { en: "Life At SWH", ar: "الحياة في SWH" }, href: "/life-at-swh" },
    ],
  },
  /* Blogs was removed on 2026-08-07. It was a nav slot leading to an empty "not published
     yet" page, which reads as neglect rather than as a promise. Removing the entry here
     also removes the /blogs route: generateStaticParams derives its slugs from this array,
     so the page and the link cannot go out of step. */
] as const satisfies readonly NavEntry[];

export function isGroup(e: NavEntry): e is NavGroup {
  return "children" in e;
}

/** Stable DOM/state handle for any entry, group or leaf. Never derived from a label. */
export function entryId(e: NavEntry): string {
  return isGroup(e) ? e.id : e.href.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
}

/* Flatten the tree to its leaves, then to the slug union. StripSlash takes a naked type
   parameter so the conditional distributes across the union rather than collapsing it. */
type Flatten<T> = T extends { readonly children: readonly (infer C)[] } ? C : T;
type LeafHref = Flatten<(typeof NAV)[number]>["href"];
type StripSlash<T> = T extends `/${infer S}` ? S : never;

/** Every interior route, as a slug with no leading slash. "/" (Home) is excluded. */
export type PageSlug = StripSlash<Exclude<LeafHref, "/">>;

/* The callback return types are annotated because flatMap over an `as const` tuple
   otherwise resolves to a union of arrays rather than an array of a union. */

/** Runtime list of every leaf, in menu order — includes Home. */
export const NAV_LEAVES: readonly NavLeaf[] = NAV.flatMap((e): NavLeaf[] =>
  isGroup(e) ? [...e.children] : [e],
);

/** Which top-level group a leaf belongs to — used for breadcrumbs and page eyebrows. */
export const PARENT_OF: Readonly<Record<string, Localized>> = Object.fromEntries(
  NAV.flatMap((e): [string, Localized][] =>
    isGroup(e) ? e.children.map((c) => [c.href, e.label]) : [],
  ),
);

/** A group's children by id — the footer builds its columns from these.

    Throws rather than returning an empty array: a bad id means the footer would silently
    render a heading over nothing, which is exactly the kind of thing that ships. The old
    label-based lookup this replaces threw for the same reason. */
export function groupById(id: string): readonly NavLeaf[] {
  for (const e of NAV as readonly NavEntry[]) {
    if (isGroup(e) && e.id === id) return e.children;
  }
  throw new Error(`nav: no group with id "${id}"`);
}

/** Convenience for the many call sites that have a Localized and a Locale. */
export function label(l: Localized, lang: Locale): string {
  return l[lang];
}

/* Media queries cannot read custom properties, so these mirror values in app/chrome.css.
   Keep them in sync — the CSS is the source of truth for paint, these for logic. */
export const NAV_MENU_BP = 1024; // --- must equal the drawer breakpoint in chrome.css
export const NAV_H_PX = { base: 64, md: 80 }; // must equal --nav-h at <800 / >=800
