/* THE navigation tree — single source of truth for both the menu and the route list.
   `generateStaticParams` in app/(site)/[slug]/page.tsx derives its slugs from this array,
   so a nav link without a page is impossible by construction.

   Structure mirrors the reference site's information architecture. Labels are generic
   business-section names except "Life At SWH", which is adapted because the original
   embeds a different company's name. A competitor's product names are deliberately
   absent from the Solutions dropdown — those are their trademarks. */

export type NavLeaf = { readonly label: string; readonly href: string };
export type NavGroup = { readonly label: string; readonly children: readonly NavLeaf[] };
export type NavEntry = NavLeaf | NavGroup;

export const NAV = [
  { label: "Home", href: "/" },
  {
    label: "About",
    children: [
      { label: "About Company", href: "/about-company" },
      { label: "Background & Capabilities", href: "/background-capabilities" },
      { label: "Our Team", href: "/our-team" },
      { label: "Certificates", href: "/certificates" },
    ],
  },
  {
    label: "Solutions",
    children: [
      { label: "All Solutions", href: "/solutions" },
      { label: "All Services", href: "/services" },
    ],
  },
  {
    label: "Partners",
    children: [
      { label: "Technology Partners", href: "/technology-partners" },
      { label: "Business Partners", href: "/business-partners" },
      { label: "Become A Partner", href: "/become-a-partner" },
    ],
  },
  {
    label: "Customers",
    children: [
      { label: "Customers Sample", href: "/customers" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Case Studies", href: "/case-studies" },
    ],
  },
  { label: "News & Events", href: "/news-events" },
  {
    label: "Careers",
    children: [
      { label: "Vacancies", href: "/vacancies" },
      { label: "Internships", href: "/internships" },
      { label: "Life At SWH", href: "/life-at-swh" },
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
export const PARENT_OF: Readonly<Record<string, string>> = Object.fromEntries(
  NAV.flatMap((e): [string, string][] =>
    isGroup(e) ? e.children.map((c) => [c.href, e.label]) : [],
  ),
);

/* Media queries cannot read custom properties, so these mirror values in app/chrome.css.
   Keep them in sync — the CSS is the source of truth for paint, these for logic. */
export const NAV_MENU_BP = 1024; // --- must equal the drawer breakpoint in chrome.css
export const NAV_H_PX = { base: 64, md: 80 }; // must equal --nav-h at <800 / >=800
