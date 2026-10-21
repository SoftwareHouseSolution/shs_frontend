/* Client testimonials — the CMS page "testimonials" with the wall of published
   testimonials between its header and its blocks.

   A static route beats the dynamic [slug] one; [slug] also leaves this slug out of its
   generateStaticParams (BESPOKE there). The header copy and the closing "Talk to a client"
   block stay editable in the CMS (Interior pages → Testimonials); the wall is every
   published testimonial (Shared content → Testimonials), which is where a client review
   lands when an editor publishes it. */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientVoices } from "@/components/clients/ClientVoices";
import { PageHeader } from "@/components/hero/PageHeader";
import { StubBody } from "@/components/stubs/StubBody";
import { UI } from "@/content/ui";
import { href as localeHref, isLocale } from "@/content/i18n";
import { getPage, getTestimonials } from "@/lib/api/content";

type Params = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const page = await getPage(lang, "testimonials");
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: {
      canonical: `/${lang}/testimonials`,
      languages: { en: "/en/testimonials", ar: "/ar/testimonials", "x-default": "/en/testimonials" },
    },
  };
}

export default async function TestimonialsPage({ params }: Params) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [page, testimonials] = await Promise.all([getPage(lang, "testimonials"), getTestimonials(lang)]);

  return (
    <>
      <PageHeader
        title={page.title}
        eyebrow={page.eyebrow}
        lede={page.lede}
        image={page.headerImage}
        crumbs={[
          { label: UI[lang].crumbHome, href: localeHref(lang, "/") },
          ...(page.breadcrumbParent ? [{ label: page.breadcrumbParent }] : []),
          { label: page.title },
        ]}
        lang={lang}
      />
      <ClientVoices lang={lang} testimonials={testimonials} />
      {page.blocks.length ? <StubBody blocks={page.blocks} lang={lang} /> : null}
    </>
  );
}
