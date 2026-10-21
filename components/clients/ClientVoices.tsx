/* "What our clients say" — the customers page's wall of testimonials, under the map.

   Every published testimonial, in the CMS order. Client reviews sent from /[lang]/review
   arrive here when an editor clicks "Publish as testimonial" (Admin → Inbox → Client
   reviews); a newly published one goes to the top. Renders nothing while there are none.

   Server component, plain markup: no state, so nothing ships to the browser. The cards sit
   in CSS columns rather than a grid, because reviews run from one line to six and a grid
   would leave holes under the short ones. */

import { Eyebrow } from "@/components/ds/Eyebrow";
import { PillButton } from "@/components/ds/PillButton";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { href as localeHref, type Locale } from "@/content/i18n";
import { VOICES_COPY } from "@/content/review";
import type { Testimonial } from "@/lib/api/types";

export function ClientVoices({ lang, testimonials }: { lang: Locale; testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  const copy = VOICES_COPY[lang];

  return (
    <section className="swh-directory swh-voices" aria-labelledby="client-voices">
      <div className="swh-directory__inner">
        <header className="swh-voices__head">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <SectionHeading level="head" as="h2" style={{ margin: 0 }}>
            <span id="client-voices">{copy.title}</span>
          </SectionHeading>
          <p className="swh-voices__lede">{copy.lede}</p>
        </header>

        <ul className="swh-voices__list">
          {testimonials.map((t) => (
            <li key={t.id} className="swh-voices__item">
              <blockquote className="swh-voices__quote" dir="auto">{t.quote}</blockquote>
              <p className="swh-voices__by">
                {t.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.avatar} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className="swh-voices__initial" aria-hidden="true">{t.authorName.slice(0, 1)}</span>
                )}
                <span>
                  <strong>{t.authorName}</strong>
                  {t.authorCompany ? <small>{t.authorCompany}</small> : null}
                </span>
              </p>
            </li>
          ))}
        </ul>

        <div className="swh-voices__cta">
          <PillButton variant="secondary" arrow href={localeHref(lang, "/review?src=customers")}>
            {copy.cta}
          </PillButton>
        </div>
      </div>
    </section>
  );
}
