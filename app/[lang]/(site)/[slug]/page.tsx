/* All 17 interior routes, in both languages.

   generateStaticParams derives its slugs from content/pages.ts, which is keyed against
   content/nav.ts — the same array that renders the menu. So a nav link without a page is
   impossible by construction, and the route list cannot drift from the navigation.

   It returns SLUGS ONLY. The `lang` half of the params comes from the generateStaticParams
   in app/[lang]/layout.tsx, and Next composes the two — every slug is emitted once per
   locale, giving 2 × 16 prerendered pages. Adding a third language means editing LOCALES
   and nothing here.

   dynamicParams = false makes any other slug a 404 rather than an on-demand render.

   Promotion is additive: the day one of these needs a bespoke page, add
   app/[lang]/(site)/our-team/page.tsx and it wins automatically — a static segment always
   beats a dynamic one — with no change to this file. */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/hero/PageHeader";
import { StubBody } from "@/components/stubs/StubBody";
import { PAGES, PAGE_SLUGS } from "@/content/pages";
import { PARENT_OF } from "@/content/nav";
import type { PageSlug } from "@/content/nav";
import { UI } from "@/content/ui";
import { href as localeHref, isLocale } from "@/content/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return PAGE_SLUGS.map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string; lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, lang } = await params;
  if (!isLocale(lang)) return {};
  const page = PAGES[lang][slug as PageSlug];
  if (!page) return {};
  return {
    title: page.title,
    description: page.metaDescription,
    /* Points a search engine at the same page in the other language. Both exist for every
       slug, so neither side of the pair can be a dead reference. */
    alternates: {
      canonical: `/${lang}/${slug}`,
      languages: { en: `/en/${slug}`, ar: `/ar/${slug}`, "x-default": `/en/${slug}` },
    },
  };
}

export default async function InteriorPage({ params }: Params) {
  const { slug, lang } = await params;
  if (!isLocale(lang)) notFound();
  const page = PAGES[lang][slug as PageSlug];
  if (!page) notFound();

  /* The parent group's label is a per-locale record now, so the breadcrumb reads in the
     page's own language rather than always in English. */
  const parent = PARENT_OF[`/${slug}`];
  const crumbs = [
    { label: UI[lang].crumbHome, href: localeHref(lang, "/") },
    ...(parent ? [{ label: parent[lang] }] : []),
    { label: page.title },
  ];

  return (
    <>
      <PageHeader
        title={page.title}
        eyebrow={page.eyebrow}
        lede={page.lede}
        image={page.image}
        crumbs={crumbs}
        lang={lang}
      />
      <StubBody blocks={page.blocks} lang={lang} />
    </>
  );
}
