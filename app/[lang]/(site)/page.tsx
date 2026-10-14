/* Home page. A server component: it fetches the home content from the CMS for this
   language and hands it to HomeSections, the client component that renders the sections.
   The shell (nav, .page-content, footer spacer, sticky footer) lives in PageShell via
   app/[lang]/(site)/layout.tsx.

   The prototype's <Header/> and device-mockup <Hero/> sections remain on disk, unmounted:
   the site-wide navbar and the hero carousel replaced them. */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeSections } from "@/components/sections/HomeSections";
import { isLocale } from "@/content/i18n";
import { getHome } from "@/lib/api/content";

type Params = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { seo } = await getHome(lang);
  return {
    // Falls back to the site default (the layout's title.default) when left empty.
    ...(seo.metaTitle ? { title: { absolute: seo.metaTitle } } : {}),
    ...(seo.metaDescription ? { description: seo.metaDescription } : {}),
  };
}

export default async function HomePage({ params }: Params) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const home = await getHome(lang);
  return <HomeSections lang={lang} home={home} />;
}
