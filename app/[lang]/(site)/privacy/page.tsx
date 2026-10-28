/* The privacy policy — /ar/privacy and /en/privacy.

   Its own page and its own switch, apart from the CMS pages: the text, the "last updated"
   date and the on/off toggle are Admin → Site → Legal pages. While it is switched off this
   page is a 404 and the footer drops its link. App-store listings point at this address,
   so keep it on while the apps are published.

   WHETHER IT IS ON comes from the site data's `legalPages`, not from the page's own
   endpoint: the site data refreshes like any other content, while the policy's own fetch,
   once cached, would keep serving its last good copy after the switch went off (the API's
   404 never replaces a cached 200).

   Server component; the body is rendered by LegalMarkdown, which never emits raw HTML. */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalMarkdown, outline } from "@/components/legal/LegalMarkdown";
import { isLocale, type Locale } from "@/content/i18n";
import { getLegal, getSite } from "@/lib/api/content";

type Params = { params: Promise<{ lang: string }> };

const SLUG = "privacy";

/** The policy, or null while it is switched off (see the note at the top). */
async function load(lang: Locale) {
  const { legalPages } = await getSite(lang);
  if (!legalPages?.some((p) => p.slug === SLUG)) return null;
  return getLegal(lang, SLUG);
}

const COPY: Record<Locale, { updated: string; contents: string; dateLocale: string }> = {
  ar: { updated: "آخر تحديث", contents: "المحتويات", dateLocale: "ar-EG" },
  en: { updated: "Last updated", contents: "Contents", dateLocale: "en-GB" },
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const doc = await load(lang);
  if (!doc) return {};
  return {
    title: doc.title,
    alternates: {
      canonical: `/${lang}/${SLUG}`,
      languages: { en: `/en/${SLUG}`, ar: `/ar/${SLUG}`, "x-default": `/en/${SLUG}` },
    },
  };
}

export default async function PrivacyPage({ params }: Params) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const doc = await load(lang);
  if (!doc) notFound();

  const copy = COPY[lang];
  const date = new Intl.DateTimeFormat(copy.dateLocale, { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${doc.lastUpdated}T12:00:00`),
  );
  const sections = outline(doc.body);

  return (
    <div className="swh-legal">
      <header className="swh-legal__head">
        <p className="swh-legal__eyebrow">SWHS</p>
        <h1 className="swh-legal__title">{doc.title}</h1>
        <p className="swh-legal__date">
          {copy.updated}: <time dateTime={doc.lastUpdated}>{date}</time>
        </p>
      </header>
      <div className="swh-legal__layout">
        {sections.length > 2 ? (
          <nav className="swh-legal__toc" aria-label={copy.contents}>
            <p className="swh-legal__toc-title">{copy.contents}</p>
            <ol>
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <article className="swh-legal__article">
          <LegalMarkdown source={doc.body} />
        </article>
      </div>
    </div>
  );
}
