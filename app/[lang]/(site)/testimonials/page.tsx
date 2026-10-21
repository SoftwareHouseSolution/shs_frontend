/* Client testimonials — the CMS page "testimonials" with every published testimonial
   between its header and its blocks: the newest SPOTLIGHT_MAX rotate in the spotlight, the
   rest follow as a wall of cards, then an invitation to write one.

   A static route beats the dynamic [slug] one; [slug] also leaves this slug out of its
   generateStaticParams (BESPOKE there). The header copy and the closing "Talk to a client"
   block stay editable in the CMS (Interior pages → Testimonials); the testimonials are
   Shared content → Testimonials, which is where a client review lands when an editor
   publishes it — newest first. */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TestimonialSpotlight } from "@/components/testimonials/TestimonialSpotlight";
import { ReviewInvite, TestimonialWall } from "@/components/testimonials/TestimonialWall";
import { PageHeader } from "@/components/hero/PageHeader";
import { StubBody } from "@/components/stubs/StubBody";
import { UI } from "@/content/ui";
import { href as localeHref, isLocale } from "@/content/i18n";
import { getPage, getTestimonials } from "@/lib/api/content";

type Params = { params: Promise<{ lang: string }> };

/* How many testimonials the spotlight rotates through; the rest go on the wall. */
const SPOTLIGHT_MAX = 6;

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
      <div className="swh-tpage">
        {testimonials.length ? (
          <>
            <TestimonialSpotlight lang={lang} items={testimonials.slice(0, SPOTLIGHT_MAX)} />
            <TestimonialWall lang={lang} items={testimonials.slice(SPOTLIGHT_MAX)} />
          </>
        ) : null}
        <ReviewInvite lang={lang} empty={testimonials.length === 0} />
      </div>
      {page.blocks.length ? <StubBody blocks={page.blocks} lang={lang} /> : null}
    </>
  );
}
