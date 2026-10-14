import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SkipLink } from "@/components/chrome/SkipLink";
import { SiteNav } from "@/components/chrome/SiteNav";
import { SocialRail } from "@/components/chrome/SocialRail";
import { HtmlLangSync } from "@/components/chrome/HtmlLangSync";
import { SiteProvider } from "@/components/chrome/SiteContext";
import { LOCALES, DIR, HTML_LANG, isLocale, type Locale } from "@/content/i18n";
import { getSite } from "@/lib/api/content";

/* Both languages are prerendered. `dynamicParams = false` makes /fr a 404 at build time
   rather than an attempted on-demand render — which `output: "export"` could not serve
   anyway. */
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

type Params = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { settings } = await getSite(lang);
  return {
    /* Per-language title and description from the CMS (Site settings → SEO).
       `alternates` emits the hreflang pair, which is the signal that actually tells a
       search engine these two URLs are the same document in two languages — the <html
       lang> attribute does not do that job. */
    title: { default: settings.defaultMetaTitle, template: `%s — ${settings.siteName}` },
    description: settings.defaultMetaDescription,
    ...(settings.favicon ? { icons: { icon: settings.favicon } } : {}),
    ...(settings.ogImage ? { openGraph: { images: [settings.ogImage] } } : {}),
    alternates: {
      canonical: `/${lang}`,
      languages: { en: "/en", ar: "/ar", "x-default": "/en" },
    },
  };
}

/* The SHELL. This is where the site actually starts: it owns the language, the direction
   and the chrome. It stays a SERVER component so `dir` is in the HTML the browser first
   parses — an Arabic page is right-to-left before a single byte of JavaScript runs.

   SiteNav is a client component; the directive lives on the imported file, not the
   importer, and rendering it here keeps it a sibling of {children} rather than an
   ancestor — so its state changes re-render the bar only, never a page section. */
export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang: Locale = raw;
  const site = await getSite(lang);

  return (
    <>
      {/* Copies lang/dir onto <html> after mount — see the note in app/layout.tsx. */}
      <HtmlLangSync lang={HTML_LANG[lang]} dir={DIR[lang]} />
      {/* <div id="app"> is load-bearing, not a wrapper habit. #app{overflow-x:hidden} is what
          contains the hero's .ds-back cards (translateX ±60%) and the sage block that spans
          left:-110%/right:-110%. Moving the rule to html or body changes scroll-container
          semantics and reintroduces a horizontal scrollbar. It must also never be given a
          height: overflow-x:hidden computes overflow-y to auto, so a fixed height would move
          scrolling out of the viewport and break window.scrollY along with every scroll
          effect on the page.

          It now also carries lang and dir. Both are valid on any element, and because every
          visible node on the page is inside this div, marking it here is equivalent to
          marking the document for everything a reader or a layout engine touches. */}
      <div id="app" lang={HTML_LANG[lang]} dir={DIR[lang]}>
        <SiteProvider site={site}>
          <SkipLink lang={lang} />
          <SiteNav lang={lang} />
          {children}
        {/* Fixed to the left edge, so it is deliberately a sibling of {children} rather
            than something a page has to opt into. Safe inside #app: a fixed element is
            only clipped by an ancestor's overflow when that ancestor is a containing
            block, and #app carries no transform or filter (see the comment above). */}
          <SocialRail lang={lang} />
        </SiteProvider>
      </div>
    </>
  );
}
