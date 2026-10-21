/* The testimonials page below the spotlight: the testimonials it does not rotate through,
   as a wall of cards, then the invitation to write one.

   Server component. Cards rise in as they scroll into view (Reveal, staggered across each
   row) and lift on hover; long quotes are clamped behind "Read more" (ExpandableQuote).
   CSS columns rather than a grid: quotes run from one line to many, and columns pack them
   without the holes a grid leaves under short cards. */

import { Eyebrow } from "@/components/ds/Eyebrow";
import { PillButton } from "@/components/ds/PillButton";
import { Reveal } from "@/components/ds/Reveal";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { href as localeHref, type Locale } from "@/content/i18n";
import { TESTIMONIALS_COPY } from "@/content/review";
import type { Testimonial } from "@/lib/api/types";
import { ExpandableQuote } from "./ExpandableQuote";
import { Portrait } from "./Portrait";

export function TestimonialWall({ lang, items }: { lang: Locale; items: Testimonial[] }) {
  const t = TESTIMONIALS_COPY[lang];
  if (items.length === 0) return null;

  return (
    <section className="swh-wall" aria-labelledby="more-testimonials">
      <Reveal>
        <SectionHeading level="sub" as="h2" style={{ margin: "0 0 32px" }}>
          <span id="more-testimonials">{t.moreTitle}</span>
        </SectionHeading>
      </Reveal>
      <ul className="swh-wall__list">
        {items.map((item, i) => (
          <li key={item.id} className="swh-wall__cell">
            <Reveal delay={(i % 3) * 0.08} y={14}>
              <figure className="swh-wall__card">
                <ExpandableQuote text={item.quote} more={t.readMore} less={t.readLess} />
                <figcaption className="swh-wall__by">
                  <Portrait src={item.avatar} name={item.authorName} />
                  <span>
                    <strong>{item.authorName}</strong>
                    {item.authorCompany ? <small>{item.authorCompany}</small> : null}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ReviewInvite({ lang, empty = false }: { lang: Locale; empty?: boolean }) {
  const t = TESTIMONIALS_COPY[lang];
  return (
    <Reveal>
      <aside className="swh-invite">
        <div className="swh-invite__text">
          <Eyebrow color="rgb(255 255 255 / 0.8)">{t.inviteEyebrow}</Eyebrow>
          <h2 className="swh-invite__title">{empty ? t.empty : t.inviteTitle}</h2>
          <p className="swh-invite__body">{t.inviteBody}</p>
        </div>
        <PillButton variant="secondary" arrow href={localeHref(lang, "/review?src=testimonials")}>
          {t.cta}
        </PillButton>
      </aside>
    </Reveal>
  );
}
