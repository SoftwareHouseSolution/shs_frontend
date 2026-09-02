/* Interior page content — the assembler.

   The copy itself moved out to content/pages.en.ts and content/pages.ar.ts when the site
   went bilingual; this file joins them and stays the one import every consumer already
   uses, so `import { PAGES } from "@/content/pages"` still resolves. The difference is
   that PAGES is now keyed by locale first:

     PAGES.en["about-company"]   // was PAGES["about-company"]

   Both language records are `Record<PageSlug, PageContent>`, and PageSlug comes from
   content/nav.ts. That is a three-way lock: a nav link with no page, a page in one
   language but not the other, or a slug typo in either file, are all type errors at build
   time rather than a 404 or a half-translated page at runtime.

   Types live in content/pages.types.ts and are re-exported here — the old import paths
   (`import type { StubBlock } from "@/content/pages"`) keep working. */

import type { Locale } from "./i18n";
import type { PageSlug } from "./nav";
import type { PageContent } from "./pages.types";
import { PAGES_EN } from "./pages.en";
import { PAGES_AR } from "./pages.ar";

export type { StubBlock, Photo, TimelineEntry, PageContent } from "./pages.types";

export const PAGES: Record<Locale, Record<PageSlug, PageContent>> = {
  en: PAGES_EN,
  ar: PAGES_AR,
};

/** Derived from the English record so the route list and the content can never disagree.
    Either language would do — they are keyed identically by construction. */
export const PAGE_SLUGS = Object.keys(PAGES_EN) as PageSlug[];
