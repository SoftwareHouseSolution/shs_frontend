/* The client review page — the link the team shares with clients (e.g. /ar/review?src=facebook).

   Server component: the header copy and the Facebook post come from here (the post is
   Site settings → "Facebook post for reviews"), the three steps are the client-side
   ReviewWizard. Not linked from the navigation and kept out of search results: it is a
   page for clients, not for visitors. */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewWizard } from "@/components/review/ReviewWizard";
import { isLocale } from "@/content/i18n";
import { REVIEW_COPY } from "@/content/review";
import { getSite } from "@/lib/api/content";

type Params = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const copy = REVIEW_COPY[lang];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    robots: { index: false, follow: false },
    alternates: {
      canonical: `/${lang}/review`,
      languages: { en: "/en/review", ar: "/ar/review" },
    },
  };
}

export default async function ReviewPage({ params }: Params) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const copy = REVIEW_COPY[lang];
  const { settings } = await getSite(lang);

  return (
    <div className="swh-rv-page">
      <header className="swh-rv-hero">
        <p className="swh-rv-hero__brand">{copy.brand}</p>
        <h1 className="swh-rv-hero__title">{copy.title}</h1>
        <p className="swh-rv-hero__lede">{copy.lede}</p>
        <ul className="swh-rv-hero__badges">
          {copy.badges.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </header>
      <ReviewWizard lang={lang} shareUrl={settings.reviewShareUrl ?? ""} />
    </div>
  );
}
