import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/ds/BrandLogo";
import { PillButton } from "@/components/ds/PillButton";
import { StatusPanel } from "@/components/feedback/StatusPanel";
import { CompassIcon } from "@/components/feedback/icons";
import { DEFAULT_LOCALE, DIR, HTML_LANG, LOCALES, href as localeHref } from "@/content/i18n";
import { getSite } from "@/lib/api/content";
import { UI } from "@/content/ui";

/* Root-level 404 — the page Apache serves as 404.html for any unknown URL.

   IT HAS NO NAVBAR, and that shapes everything below. It sits above app/[lang]/, which is
   where the chrome lives now, so the old copy's "everything else is reachable from the
   menu above" pointed at a menu that was not there. This page therefore has to carry its
   own way out: the brand mark (home), and per-language actions to the two places a lost
   visitor most often wants — the home page and the contact section.

   IT IS BILINGUAL, because it cannot know the reader's language. A root not-found sees no
   route params, and inferring the language from the URL in the browser would paint English
   first and then swap — a flash on the one page whose whole job is to be reassuring. So
   both languages are in the server HTML side by side, each marked with its own lang and
   dir, so a screen reader switches voice and the Arabic panel lays out right-to-left
   without any JavaScript. English leads because it is DEFAULT_LOCALE, matching the
   language gate at "/". */

export const metadata: Metadata = {
  title: `${UI.en.notFoundTitle} · ${UI.ar.notFoundTitle}`,
  robots: { index: false, follow: true },
};

/* The site name and the contact target come from the CMS when it answers. A 404 must never
   itself fail, so if the API is unreachable the page falls back to the plain mark and the
   home-page contact anchor. */
async function siteOrNull() {
  try {
    return await getSite(DEFAULT_LOCALE);
  } catch {
    return null;
  }
}

export default async function NotFound() {
  const site = await siteOrNull();
  const name = site?.settings.siteName ?? "";
  const contactHref = site?.settings.primaryCta.url ?? "/#contact";
  return (
    <main id="main" className="swh-404">
      <Link className="swh-404__brand" href={localeHref(DEFAULT_LOCALE, "/")} aria-label={name ? `${name} — ${UI.en.homeAria}` : UI.en.homeAria}>
        <BrandLogo variant="lockup" height={40} />
      </Link>

      <div className="swh-404__panels">
        {LOCALES.map((l, i) => {
          const ui = UI[l];
          return (
            <StatusPanel
              key={l}
              lang={HTML_LANG[l]}
              dir={DIR[l]}
              /* One h1 for the document; the second language's heading is its h2. */
              titleAs={i === 0 ? "h1" : "h2"}
              icon={<CompassIcon />}
              eyebrow={`404 · ${ui.notFoundTitle}`}
              title={ui.notFoundHeading}
              actions={
                <>
                  <PillButton variant="primary" arrow href={localeHref(l, "/")}>
                    {ui.backHome}
                  </PillButton>
                  <PillButton variant="secondary" href={localeHref(l, contactHref)}>
                    {ui.contactUs}
                  </PillButton>
                </>
              }
            >
              {ui.notFoundBody}
            </StatusPanel>
          );
        })}
      </div>
    </main>
  );
}
