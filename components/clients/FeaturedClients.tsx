/* The featured-client strip, directly above the "Every client" heading.

   Sixteen named accounts, in the order the client gave them, running as an endless
   marquee. It is deliberately NOT a static row: sixteen marks laid out flat would read as
   "these are our clients", which is the opposite of the message on a page whose whole
   point is a 1,750-name roster. A strip with no first and no last item reads as a sample.

   Same InfiniteSlider, gap and speeds as the home page's .swh-proof__strip, so the two
   bands are recognisably the same object on two pages rather than two different marquees.

   Boxed inside .swh-directory__inner rather than full-bleed like the home band: here the
   strip sits between the map panel and the results heading, both of which are gutter-
   aligned, so a mark escaping to the viewport edge would break the column the whole
   section is built on. The edges are faded with a mask instead — endless without bleeding.

   No "use client": ClientMap, its only caller, already carries it.

   The gap is the one thing that cannot live in the stylesheet: InfiniteSlider takes it as
   a number because it also has to add exactly one of them between the two copies of the
   track, and a CSS gap it could not read would leave the loop short by one gap and put a
   visible stutter at the wrap. So it is matched to the same 799px breakpoint the marks are
   sized at — 72px between 190px marks reads as a row; 72px between 140px marks on a 358px
   phone reads as two logos and a lot of paper.

   FEATURED is resolved against CLIENTS at module scope, so a slug that stops existing when
   the roster is regenerated from the PDF is a build-time crash, not a silently missing
   logo. Same guard as LogoWall's VIP list. */

import { useEffect, useState } from "react";
import { InfiniteSlider } from "@/components/core/infinite-slider";
import { CLIENTS } from "@/content/clients";
import { UI } from "@/content/ui";
import type { Locale } from "@/content/i18n";

/* The breakpoint .swh-featured__mark is resized at in app/chrome.css. Kept in step by
   hand: they describe one layout change and splitting them would let the gap and the mark
   width disagree at exactly one width. */
const NARROW_MQ = "(max-width: 799px)";
const GAP = 72;
const GAP_NARROW = 36;

const FEATURED = [
  "kirmena-jewellery",
  "gold-era-jewelry",
  "oro-bianco-jewelry",
  "king-gold-jewellery",
  "royal-select",
  "jolie-gold",
  "uno-jewelry",
  "mb-gold-malak-bushra",
  "ayman-riad-jewellery",
  "gemma-azzurr",
  "makkar-jewelery",
  "gfg-jellewery",
  "swiss-gold",
  "ezzat-el-wakil-jewelry",
  "halim-gold",
  "emil-zaki",
];

const FEATURED_LOGOS = FEATURED.map((slug) => {
  const c = CLIENTS.find((x) => x.slug === slug);
  if (!c) throw new Error(`FeaturedClients: no client with slug "${slug}"`);
  return c;
});

export function FeaturedClients({ lang }: { lang: Locale }) {
  const ui = UI[lang];

  /* Starts wide on both server and client so hydration matches, then corrects after mount.
     The slider rebuilds at the same progress when `gap` changes, so the correction is a
     re-space and not a restart. Tracked live rather than read once, because a phone
     rotating landscape is a real 390→844px change and the strip would keep phone spacing
     at desktop width. */
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(NARROW_MQ);
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return (
    <div className="swh-featured">
      <InfiniteSlider
        className="swh-featured__strip"
        gap={narrow ? GAP_NARROW : GAP}
        speed={44}
        speedOnHover={14}
        aria-label={ui.featuredClientsAria}
      >
        {/* NOT lazy: all but the first few marks sit outside the slider's overflow clip at
            any moment, so they never intersect the viewport and a lazy loader would defer
            them forever — the strip would scroll visible holes into view. ~5KB each.
            fetchPriority keeps them behind the map and the page header in the queue. */}
        {FEATURED_LOGOS.map((c) => (
          <img
            key={c.slug}
            className="swh-featured__mark"
            src={c.logo}
            alt={ui.clientLogoAlt(c.name)}
            decoding="async"
            fetchPriority="low"
          />
        ))}
      </InfiniteSlider>
    </div>
  );
}
