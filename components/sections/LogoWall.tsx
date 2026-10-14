/* Client proof on the home page. Two tiers, deliberately:

   VIP — Kirmena, Gold Era and King Gold — sit STILL, above the strip, at a larger size.
   A logo that holds position is read; a logo in a moving strip is only glanced at. These
   three are the names the client wants a visitor to actually register, so they get the
   one thing motion cannot give them, which is a stable place on the page.

   Everyone else runs in an endless marquee. The point of the strip is not to be read
   logo by logo — it is to make the size of the roster physically obvious in a way a grid
   of sixteen cannot. It has no first item and no last item for the same reason.

   Server component. */

import { Reveal } from "@/components/ds/Reveal";
import { PillButton } from "@/components/ds/PillButton";
import { InfiniteSlider } from "@/components/core/infinite-slider";
import { href as localeHref, type Locale } from "@/content/i18n";
import type { HomeData } from "@/lib/api/types";

/* Which clients are highlighted and which run in the strip is set per client in the CMS
   (Clients → "Placement on the site"). */
export function LogoWall({ lang, proof: c }: { lang: Locale; proof: HomeData["proof"] }) {
  return (
    <section className="swh-proof">
      <div className="swh-proof__inner">
        <Reveal style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "36px", width: "100%" }}>
          <p className="swh-proof__lede">{c.lede}</p>

          <ul className="swh-proof__vip">
            {/* `v`, not `c`: `c` is the page copy in this scope now. */}
            {c.highlighted.map((v) => (
              <li key={v.slug}>
                {/* eager, not lazy: these three are above the fold on most desktops, and a
                    logo that fades in late is the one thing worse than a logo that moves. */}
                <img src={v.logo} alt={v.name} decoding="async" />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* Full-bleed on purpose — the strip is escaping the page, so boxing it inside the
          content gutter would give it exactly the two edges it is trying not to have. */}
      <Reveal delay={0.08} style={{ width: "100%" }}>
        <InfiniteSlider
          className="swh-proof__strip"
          gap={72}
          speed={44}
          speedOnHover={14}
          aria-label={c.stripAriaLabel}
        >
          {/* NOT lazy, deliberately. The strip is an overflow:hidden box whose content is
              moved by a transform, so all but the first few marks sit outside the clip at
              any moment and never intersect the viewport — the browser would defer them
              indefinitely and the strip would scroll visible holes into view. They are
              ~5KB each, so the whole set is smaller than one hero still; fetchPriority
              keeps them behind the hero in the queue. */}
          {c.strip.map((m) => (
            <img
              key={m.slug}
              className="swh-proof__mark"
              src={m.logo}
              alt={m.name}
              decoding="async"
              fetchPriority="low"
            />
          ))}
        </InfiniteSlider>
      </Reveal>

      <div className="swh-proof__inner">
        <Reveal delay={0.12} style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          {/* 1,750+ is the roster; the strip is only the logos we have clearance
              to publish. The button now names the roster so it matches the band above it,
              the /customers lede and StatsBand rather than contradicting all three. */}
          <PillButton variant="secondary" arrow href={localeHref(lang, c.cta.url)}>
            {c.cta.label}
          </PillButton>
        </Reveal>
      </div>
    </section>
  );
}
