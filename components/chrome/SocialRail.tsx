"use client";

/* The contact rail on the right edge: a WhatsApp button, and a toggle that reveals the
   three social profiles beneath it.

   IT USED TO REST 30% OFF-SCREEN, pulled in by hover. That was a good shape for a purely
   decorative social toggle — an element flush to the edge reads as browser chrome and gets
   ignored, whereas one visibly cut off reads as a thing that continues. It is the wrong
   shape now that the rail carries WhatsApp, which is the site's primary contact action and
   its only working enquiry channel. A conversion control that is a third off-screen until
   you happen to hover it is not a conversion control. The rail therefore rests fully in
   view at every width; hover still lifts the shadow, and the toggle still owns the reveal,
   so both affordances survive the change.

   ── WHY IT IS BUILT THE WAY IT IS ───────────────────────────────────────────────────

   - `position: fixed` and NOT inside any transformed ancestor. #app carries
     overflow-x:hidden (see app/layout.tsx); a fixed element is only clipped by an
     ancestor's overflow if that ancestor is also a containing block, which #app
     deliberately is not.

   - The links are `inert` while collapsed, not merely invisible. Without it the three
     profiles stay in the tab order behind a closed panel.

   - Icons come from components/chrome/SocialIcon.tsx, shared with the footer, so the two
     places cannot drift.

   The rail is present at every width. On a phone the WhatsApp button is the fastest route
   to a reply the company actually answers, which is worth an edge to itself; the three
   profiles stay behind the toggle.

   In Arabic it mirrors to the LEFT edge — app/rtl.css flips the anchor, the body's rounded
   corners and the direction the shadow is cast. */

import { useEffect, useRef, useState } from "react";
import { UI } from "@/content/ui";
import type { Locale } from "@/content/i18n";
import { SocialIcon } from "./SocialIcon";
import { WhatsAppLink } from "./WhatsAppLink";
import { useSite } from "./SiteContext";

export function SocialRail({ lang }: { lang: Locale }) {
  const ui = UI[lang];
  const { socialLinks } = useSite();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  /* Listeners are registered only while the rail is open — no always-on document
     handlers for a control that is shut most of the time. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="swh-rail" ref={rootRef} data-open={open ? "true" : "false"}>
      <div className="swh-rail__body">
        {/* WhatsApp sits ABOVE the toggle and outside the reveal, so it is never behind a
            tap. It is the one control here that is a conversation rather than a profile
            link — the company answers this line, and it is the site's only working enquiry
            channel (there is no form backend; see components/sections/Contact.jsx). That is
            why it is brand-green and larger than everything below it instead of a fourth
            monochrome glyph in the stack.

            Same component the drawer uses, so the mark and the aria-label cannot drift;
            only the class differs. */}
        <WhatsAppLink lang={lang} className="swh-rail__wa" hoverLabel={ui.whatsappLabel} />
        <span className="swh-rail__rule" aria-hidden="true" />

        <button
          type="button"
          className="swh-rail__toggle"
          aria-expanded={open}
          aria-controls="swh-rail-links"
          aria-label={open ? ui.hideSocial : ui.showSocial}
          onClick={() => setOpen((v) => !v)}
        >
          {/* Two strokes, rotated 45° when open, so the same mark is both "add" and
              "close". One shape, two states — no icon swap to keep in sync. */}
          <svg className="swh-rail__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {/* React 19 passes a boolean `inert` straight through to the attribute. */}
        <div className="swh-rail__reveal" id="swh-rail-links" inert={!open}>
          <ul className="swh-rail__list">
            {socialLinks.map((s, i) => (
              <li key={s.platform} style={{ "--i": i } as React.CSSProperties}>
                <a
                  className="swh-rail__link"
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.label} ${ui.opensInNewTab}`}
                >
                  <SocialIcon name={s.label} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
