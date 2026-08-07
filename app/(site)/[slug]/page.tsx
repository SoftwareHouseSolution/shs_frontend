/* All 17 interior routes.

   generateStaticParams derives its slugs from content/pages.ts, which is keyed against
   content/nav.ts — the same array that renders the menu. So a nav link without a page is
   impossible by construction, and the route list cannot drift from the navigation.

   dynamicParams = false makes any other slug a 404 rather than an on-demand render.

   Promotion is additive: the day one of these needs a bespoke page, add
   app/(site)/our-team/page.tsx and it wins automatically — a static segment always beats
   a dynamic one — with no change to this file. */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/hero/PageHeader";
import { StubBody } from "@/components/stubs/StubBody";
import { PAGES, PAGE_SLUGS } from "@/content/pages";
import { PARENT_OF } from "@/content/nav";
import type { PageSlug } from "@/content/nav";

export const dynamicParams = false;

export function generateStaticParams() {
  return PAGE_SLUGS.map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES[slug as PageSlug];
  if (!page) return {};
  return { title: page.title, description: page.metaDescription };
}

export default async function InteriorPage({ params }: Params) {
  const { slug } = await params;
  const page = PAGES[slug as PageSlug];
  if (!page) notFound();

  const parent = PARENT_OF[`/${slug}`];
  const crumbs = [
    { label: "Home", href: "/" },
    ...(parent ? [{ label: parent }] : []),
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
      />
      <StubBody blocks={page.blocks} />
    </>
  );
}
