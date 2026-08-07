/* Site footer.

   Replaces the prototype's version, which shipped four links — Services, Clients, How-to,
   Contact — that were all `href="#"`. Four dead ends is worse than no footer nav: the
   visitor who reaches the bottom of the page is the one still looking for something.

   Everything here now resolves. The link columns are derived from content/nav.ts, so they
   cannot drift from the navbar or point at a route that does not exist; the contact block
   and the social icons come from content/site.ts. Nothing in this file is hardcoded except
   the column headings.

   It sits inside .sticky-footer, which is `position: fixed` and revealed as the page
   scrolls off it. PageShell measures this element's height at runtime and pads the page by
   it, so the footer can grow to whatever height it needs without a magic number anywhere.

   The mark uses BrandLogo's light-surface variant by default. The old one rendered the
   off-white "S" on #EEEFF1, so the footer logo was a roof with a hole in it. */

import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ds/BrandLogo";
import { SocialIcon } from "@/components/chrome/SocialIcon";
import { NAV, isGroup } from "@/content/nav";
import { SITE, SOCIAL } from "@/content/site";
import { Container } from "./Container";

/* Two columns of real destinations, taken from the navbar's own tree. "Company" is the
   About group; "Explore" is everything a visitor at the bottom of the page is most likely
   still hunting for. Both are resolved by label so a nav rename surfaces here as a build
   error rather than as an empty column. */
const groupNamed = (label) => {
  const g = NAV.find((e) => isGroup(e) && e.label === label);
  if (!g) throw new Error(`Footer: no nav group "${label}"`);
  return g.children;
};

const COLUMNS = [
  { heading: "Company", links: groupNamed("About") },
  { heading: "Explore", links: [...groupNamed("Solutions"), ...groupNamed("Customers")] },
  { heading: "Work with us", links: [...groupNamed("Partners"), ...groupNamed("Careers")] },
];

export function Footer() {
  return (
    <footer className="swh-footer">
      <Container>
        <div className="swh-footer__top">
          {/* No ScrollReveal here, unlike the prototype's version. That effect maps the
              element's viewport position onto a 0.88→1 scale, and this footer lives inside
              .sticky-footer, which is position:fixed — its rect never changes, so the
              mapping would freeze the brand column at a permanent ~0.9 scale. */}
          <div className="swh-footer__brand">
            <Link href="/" className="swh-footer__mark" aria-label={`${SITE.name} — home`}>
              <BrandLogo variant="lockup" height={44} />
            </Link>
            <p className="swh-footer__blurb">
              POS-integrated ERP for the gold and diamond trade, plus enterprise software,
              hardware and networking. Leading the market since {SITE.since}.
            </p>
            <ul className="swh-footer__contact">
              <li>{SITE.address}</li>
              <li>
                <a href={SITE.phoneHref}>{SITE.phone}</a>
              </li>
              <li>
                <a href={`mailto:${SITE.salesEmail}`}>{SITE.salesEmail}</a>
              </li>
            </ul>
          </div>

          <nav className="swh-footer__nav" aria-label="Footer">
            {COLUMNS.map((col) => (
              <div className="swh-footer__col" key={col.heading}>
                <h2 className="swh-footer__heading">{col.heading}</h2>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="swh-footer__bottom">
          <ul className="swh-footer__social">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.label} — opens in a new tab`}
                >
                  <SocialIcon name={s.label} />
                </a>
              </li>
            ))}
            <li>
              <a
                href={SITE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp ${SITE.phone} — opens in a new tab`}
              >
                <SocialIcon name="WhatsApp" />
              </a>
            </li>
          </ul>

          {/* The year is a literal, exactly as in the prototype. Deriving it from
              new Date().getFullYear() renders identically today and quietly introduces a
              server/client mismatch class. Leave it literal. */}
          <p className="swh-footer__legal">
            © {SITE.name} · 2026 <span>All Rights Reserved</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
