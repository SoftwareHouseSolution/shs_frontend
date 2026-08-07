/* Client proof on the home page. Two tiers, deliberately:

   VIP — Kirmena, Gold Era and King Gold — sit STILL, above the strip, at a larger size.
   A logo that holds position is read; a logo in a moving strip is only glanced at. These
   three are the names the client wants a visitor to actually register, so they get the
   one thing motion cannot give them, which is a stable place on the page.

   Everyone else runs in an endless marquee. The point of the strip is not to be read
   logo by logo — it is to make the size of the roster physically obvious in a way a grid
   of sixteen cannot. It has no first item and no last item for the same reason.

   Server component. MARQUEE is derived from CLIENTS rather than hand-listed so it cannot
   drift when the roster is regenerated from the PDF, and so a slug can never be a typo. */

import { Reveal } from "@/components/ds/Reveal";
import { PillButton } from "@/components/ds/PillButton";
import { InfiniteSlider } from "@/components/core/infinite-slider";
import { CLIENTS } from "@/content/clients";

const VIP = ["kirmena-jewellery", "gold-era-jewelry", "king-gold-jewellery"];

/* Resolved eagerly at module scope so a bad slug is a build-time crash rather than a row
   that quietly renders two logos instead of three. */
const VIP_LOGOS = VIP.map((slug) => {
  const c = CLIENTS.find((x) => x.slug === slug);
  if (!c) throw new Error(`LogoWall: no client with slug "${slug}"`);
  return c;
});

/* ~48 marks, spread evenly across the alphabetised roster rather than taken from the top
   of it — a marquee of forty-eight names all starting with "A" looks like a bug. Even
   spacing also keeps the strip stable when the roster grows: adding clients changes which
   logos appear, never how many. */
const MARQUEE_COUNT = 48;
const MARQUEE = (() => {
  const pool = CLIENTS.filter((c) => c.sector === "jewellery" && !VIP.includes(c.slug));
  const stride = Math.max(1, Math.floor(pool.length / MARQUEE_COUNT));
  return pool.filter((_, i) => i % stride === 0).slice(0, MARQUEE_COUNT);
})();

export function LogoWall() {
  return (
    <section className="swh-proof">
      <div className="swh-proof__inner">
        <Reveal style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "36px", width: "100%" }}>
          <p className="swh-proof__lede">
            Trusted by 1,750+ jewellery stores &amp; manufacturers across Egypt, Dubai, KSA &amp; USA
          </p>

          <ul className="swh-proof__vip">
            {VIP_LOGOS.map((c) => (
              <li key={c.slug}>
                {/* eager, not lazy: these three are above the fold on most desktops, and a
                    logo that fades in late is the one thing worse than a logo that moves. */}
                <img src={c.logo} alt={c.name} decoding="async" />
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
          aria-label={`A selection of our ${CLIENTS.length} clients`}
        >
          {/* NOT lazy, deliberately. The strip is an overflow:hidden box whose content is
              moved by a transform, so all but the first few marks sit outside the clip at
              any moment and never intersect the viewport — the browser would defer them
              indefinitely and the strip would scroll visible holes into view. They are
              ~5KB each, so the whole set is smaller than one hero still; fetchPriority
              keeps them behind the hero in the queue. */}
          {MARQUEE.map((c) => (
            <img
              key={c.slug}
              className="swh-proof__mark"
              src={c.logo}
              alt={c.name}
              decoding="async"
              fetchPriority="low"
            />
          ))}
        </InfiniteSlider>
      </Reveal>

      <div className="swh-proof__inner">
        <Reveal delay={0.12} style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <PillButton variant="secondary" arrow href="/customers">
            See all {CLIENTS.length} clients
          </PillButton>
        </Reveal>
      </div>
    </section>
  );
}
