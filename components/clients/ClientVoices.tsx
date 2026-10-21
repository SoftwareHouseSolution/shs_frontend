/* The testimonials page's wall: every published testimonial, in the CMS order.

   Client reviews sent from /[lang]/review arrive here when an editor clicks "Publish as
   testimonial" (Admin → Inbox → Client reviews); a newly published one goes to the top.
   The page header above carries the title, so the wall is cards and a button only.

   Server component, plain markup: nothing ships to the browser. The cards sit in CSS
   columns rather than a grid, because reviews run from one line to six and a grid would
   leave holes under the short ones. */

import { PillButton } from "@/components/ds/PillButton";
import { href as localeHref, type Locale } from "@/content/i18n";
import { VOICES_COPY } from "@/content/review";
import type { Testimonial } from "@/lib/api/types";

export function ClientVoices({ lang, testimonials }: { lang: Locale; testimonials: Testimonial[] }) {
  const copy = VOICES_COPY[lang];

  return (
    <section className="swh-directory swh-voices">
      <div className="swh-directory__inner">
        {testimonials.length ? (
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
        ) : (
          <p className="swh-voices__empty">{copy.empty}</p>
        )}

        <div className="swh-voices__cta">
          <PillButton variant="primary" arrow href={localeHref(lang, "/review?src=testimonials")}>
            {copy.cta}
          </PillButton>
        </div>
      </div>
    </section>
  );
}
