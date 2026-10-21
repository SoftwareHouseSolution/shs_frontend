/* Every CMS page that uses the standard template, in both languages.

   generateStaticParams reads the published page list from the API, so a page created in
   the admin becomes a route at the next build. It returns SLUGS ONLY; the `lang` half comes
   from app/[lang]/layout.tsx and Next composes the two.

   dynamicParams = false keeps the static export possible (Apache cannot render on demand):
   an unknown slug is a 404, and a page ADDED in the CMS needs a rebuild to get its route.
   Edits to existing pages do not — on `next start` they appear within CMS_REVALIDATE_SECONDS.

   Promotion is additive: a page that needs a bespoke layout gets its own folder
   (app/[lang]/(site)/<slug>/page.tsx) and wins automatically — customers already does. */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/hero/PageHeader";
import { StubBody } from "@/components/stubs/StubBody";
import { UI } from "@/content/ui";
import { href as localeHref, isLocale, type Locale } from "@/content/i18n";
import { getPage, getPageList } from "@/lib/api/content";
import { ApiResponseError } from "@/lib/api/envelope";

export const dynamicParams = false;

/* Standard-template pages that have their own folder: rendered there, not here. */
const BESPOKE = new Set(["testimonials"]);

export async function generateStaticParams() {
  const pages = await getPageList();
  return pages.filter((p) => p.template === "standard" && !BESPOKE.has(p.slug)).map((p) => ({ slug: p.slug }));
}

type Params = { params: Promise<{ slug: string; lang: string }> };

/** The page, or null when the CMS says it does not exist (unpublished since the build). */
async function load(lang: Locale, slug: string) {
  try {
    return await getPage(lang, slug);
  } catch (err) {
    if (err instanceof ApiResponseError && err.isNotFound) return null;
    throw err; // anything else is a real failure: let the error boundary show it
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, lang } = await params;
  if (!isLocale(lang)) return {};
  const page = await load(lang, slug);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    /* Points a search engine at the same page in the other language. */
    alternates: {
      canonical: `/${lang}/${slug}`,
      languages: { en: `/en/${slug}`, ar: `/ar/${slug}`, "x-default": `/en/${slug}` },
    },
  };
}

export default async function InteriorPage({ params }: Params) {
  const { slug, lang } = await params;
  if (!isLocale(lang)) notFound();
  const page = await load(lang, slug);
  if (!page) notFound();

  const crumbs = [
    { label: UI[lang].crumbHome, href: localeHref(lang, "/") },
    ...(page.breadcrumbParent ? [{ label: page.breadcrumbParent }] : []),
    { label: page.title },
  ];

  return (
    <>
      <PageHeader
        title={page.title}
        eyebrow={page.eyebrow}
        lede={page.lede}
        image={page.headerImage}
        crumbs={crumbs}
        lang={lang}
      />
      <StubBody blocks={page.blocks} lang={lang} />
    </>
  );
}
