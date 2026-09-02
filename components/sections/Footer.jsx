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
import { groupById } from "@/content/nav";
import { SITE, SITE_L, SOCIAL } from "@/content/site";
import { UI } from "@/content/ui";
import { href as localeHref } from "@/content/i18n";
import { Container } from "./Container";

/* Three columns of real destinations, taken from the navbar's own tree. "Company" is the
   About group; "Explore" is everything a visitor at the bottom of the page is most likely
   still hunting for. Groups are resolved by ID, never by label — labels are per-language
   now, and groupById throws on an unknown id so a nav restructure surfaces here as a build
   error rather than as an empty column. */
const COLUMNS = (ui) => [
  { key: "company", heading: ui.footerCompany, links: groupById("about") },
  { key: "explore", heading: ui.footerExplore, links: [...groupById("solutions"), ...groupById("customers")] },
  { key: "work", heading: ui.footerWorkWithUs, links: [...groupById("partners"), ...groupById("careers")] },
];

export function Footer({ lang }) {
  const ui = UI[lang];
  return (
    <footer className="swh-footer">
      <Container>
        <div className="swh-footer__top">
          {/* No ScrollReveal here, unlike the prototype's version. That effect maps the
              element's viewport position onto a 0.88→1 scale, and this footer lives inside
              .sticky-footer, which is position:fixed — its rect never changes, so the
              mapping would freeze the brand column at a permanent ~0.9 scale. */}
          <div className="swh-footer__brand">
            <Link href={localeHref(lang, "/")} className="swh-footer__mark" aria-label={`${SITE.name} — ${ui.homeAria}`}>
              <BrandLogo variant="lockup" height={44} />
            </Link>
            <p className="swh-footer__blurb">
              {ui.footerBlurb} {SITE.since}.
            </p>
            {/* The number and the address are LTR runs. Left unmarked inside an RTL
                column the bidi algorithm pushes the "+" of the phone number to the wrong
                end; `dir="ltr"` on the two that are not prose fixes it without affecting
                the English footer, where it is already the ambient direction. */}
            <ul className="swh-footer__contact">
              <li>{SITE_L[lang].address}</li>
              <li dir="ltr" style={{ unicodeBidi: "isolate" }}>
                <a href={SITE.phoneHref}>{SITE.phone}</a>
              </li>
              <li dir="ltr" style={{ unicodeBidi: "isolate" }}>
                <a href={`mailto:${SITE.salesEmail}`}>{SITE.salesEmail}</a>
              </li>
            </ul>
          </div>

          <nav className="swh-footer__nav" aria-label={ui.footerNavAria}>
            {COLUMNS(ui).map((col) => (
              <div className="swh-footer__col" key={col.key}>
                <h2 className="swh-footer__heading">{col.heading}</h2>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={localeHref(lang, l.href)}>{l.label[lang]}</Link>
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
                  aria-label={`${s.label} ${ui.opensInNewTab}`}
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
                aria-label={`WhatsApp ${SITE.phone} ${ui.opensInNewTab}`}
              >
                <SocialIcon name="WhatsApp" />
              </a>
            </li>
          </ul>

          {/* The year is a literal, exactly as in the prototype. Deriving it from
              new Date().getFullYear() renders identically today and quietly introduces a
              server/client mismatch class. Leave it literal. */}
          <p className="swh-footer__legal">
            © {SITE.name} · 2026 <span>{ui.allRightsReserved}</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
