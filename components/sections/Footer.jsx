/* Site footer.

   Every link resolves and nothing here is hardcoded except the layout: the columns are
   the CMS's footer columns (each lists the links of the navigation groups chosen for it,
   so they cannot drift from the navbar), and the blurb, contact block, social icons and
   legal line all come from Site settings. Rendered client-side inside PageShell, so it
   reads the site data from SiteContext.

   It sits inside .sticky-footer, which is `position: fixed` and revealed as the page
   scrolls off it. PageShell measures this element's height at runtime and pads the page by
   it, so the footer can grow to whatever height it needs without a magic number anywhere. */

import React from "react";
import Link from "next/link";
import { SocialIcon } from "@/components/chrome/SocialIcon";
import { SiteLogo } from "@/components/chrome/SiteLogo";
import { useSite } from "@/components/chrome/SiteContext";
import { UI } from "@/content/ui";
import { href as localeHref } from "@/content/i18n";
import { Container } from "./Container";

export function Footer({ lang }) {
  const ui = UI[lang];
  const { settings, footerColumns, socialLinks } = useSite();
  return (
    <footer className="swh-footer">
      <Container>
        <div className="swh-footer__top">
          {/* No ScrollReveal here: this footer lives inside .sticky-footer, which is
              position:fixed — its rect never changes, so the scale mapping would freeze
              the brand column at a permanent ~0.9. */}
          <div className="swh-footer__brand">
            <Link href={localeHref(lang, "/")} className="swh-footer__mark" aria-label={`${settings.siteName} — ${ui.homeAria}`}>
              <SiteLogo height={44} />
            </Link>
            <p className="swh-footer__blurb">
              {settings.footerBlurb} {settings.sinceYear}.
            </p>
            {/* The number and the e-mail are LTR runs. Left unmarked inside an RTL column
                the bidi algorithm pushes the "+" of the phone number to the wrong end. */}
            <ul className="swh-footer__contact">
              <li>{settings.address}</li>
              <li dir="ltr" style={{ unicodeBidi: "isolate" }}>
                <a href={`tel:${settings.phoneLink}`}>{settings.phoneDisplay}</a>
              </li>
              <li dir="ltr" style={{ unicodeBidi: "isolate" }}>
                <a href={`mailto:${settings.salesEmail}`}>{settings.salesEmail}</a>
              </li>
            </ul>
          </div>

          <nav className="swh-footer__nav" aria-label={ui.footerNavAria}>
            {footerColumns.map((col) => (
              <div className="swh-footer__col" key={col.key}>
                <h2 className="swh-footer__heading">{col.title}</h2>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.url}>
                      <Link href={localeHref(lang, l.url)}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="swh-footer__bottom">
          <ul className="swh-footer__social">
            {socialLinks.map((s) => (
              <li key={s.platform}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${s.label} ${ui.opensInNewTab}`}>
                  <SocialIcon name={s.label} />
                </a>
              </li>
            ))}
            <li>
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp ${settings.phoneDisplay} ${ui.opensInNewTab}`}
              >
                <SocialIcon name="WhatsApp" />
              </a>
            </li>
          </ul>

          {/* The year is a CMS value, not new Date(): deriving it at render time would
              introduce a server/client mismatch class around New Year. */}
          <p className="swh-footer__legal">
            © {settings.siteName} · {settings.copyrightYear} <span>{settings.rightsText}</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
