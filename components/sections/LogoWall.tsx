/* Replaces the marquee that used to sit here.

   Static by choice: an infinite scroll of client marks is motion the visitor did not ask
   for and cannot stop, and the same logos now have a real home on /customers where they
   can be searched and filtered. The trust sentence below was the marquee's only home, so
   it moves here verbatim.

   Server component. FEATURED is a hand-picked sample, not a ranking — it exists so the
   home page shows sixteen marks rather than three hundred and sixty-seven. */

import { Reveal } from "@/components/ds/Reveal";
import { PillButton } from "@/components/ds/PillButton";
import { CLIENTS } from "@/content/clients";

const FEATURED = [
  "kirmena-jewellery", "gold-era-jewelry", "oro-bianco-jewelry", "king-gold-jewellery",
  "royal-select", "jolie-gold", "uno-jewelry", "halim-gold",
  "carati-jewels", "shams-jewellery", "uncle-sam-jewellery", "zahra-jewellery",
  "malak-jewelry", "rashad-jewellery", "diamond-zone", "ajour-jewellery",
];

/* Resolved eagerly at module scope so a typo in FEATURED is a build-time crash rather
   than a wall that quietly renders fifteen logos. */
const LOGOS = FEATURED.map((slug) => {
  const c = CLIENTS.find((x) => x.slug === slug);
  if (!c) throw new Error(`LogoWall: no client with slug "${slug}"`);
  return c;
});

export function LogoWall() {
  return (
    <section style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "90px 0 40px" }}>
      <div style={{ width: "100%", maxWidth: 1600, margin: "0 auto", padding: "0 var(--gutter)", boxSizing: "border-box" }}>
        <Reveal style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "28px", width: "100%" }}>
          <span style={{ fontFamily: "var(--f-sans)", fontSize: "15px", letterSpacing: "-0.075px", color: "var(--body)", textAlign: "center" }}>
            Trusted by 1,050+ jewellery stores &amp; manufacturers across Egypt, Dubai, Malaysia &amp; Singapore
          </span>
          <ul className="swh-logo-wall">
            {LOGOS.map((c) => (
              <li key={c.slug} className="swh-logo-wall__item">
                <img src={c.logo} alt={c.name} loading="lazy" decoding="async" />
              </li>
            ))}
          </ul>
          <PillButton variant="secondary" arrow href="/customers">
            See all {CLIENTS.length} clients
          </PillButton>
        </Reveal>
      </div>
    </section>
  );
}
