"use client";

/* Mobile navigation drawer, below 1024px.

   Scroll-lock detail worth keeping: locking body scroll removes the scrollbar, which
   would shift the fixed navbar left by its width. The measured width is written to
   --swh-lock-pad and applied to both body's padding and the navbar's `right`, so nothing
   moves. Near-zero on touch devices with overlay scrollbars; visible on desktop. */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PillButton } from "@/components/ds/PillButton";
import { NAV, isGroup } from "@/content/nav";
import { demoHrefFor } from "@/content/site";
import { UI } from "@/content/ui";
import { href as localeHref, samePath, type Locale } from "@/content/i18n";
import { BadgeSlot } from "./BadgeSlot";
import { LanguageToggle } from "./LanguageToggle";
import { useFocusTrap } from "./useFocusTrap";

type Props = {
  open: boolean;
  onClose: () => void;
  pathname: string;
  lang: Locale;
};

export function NavDrawer({ open, onClose, pathname, lang }: Props) {
  const ui = UI[lang];
  const panelRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  useFocusTrap(panelRef, open);

  const isHere = (to: string) => samePath(pathname, localeHref(lang, to));
  /* The group holding the current page. The drawer opens with it already expanded, so the
     reader sees where they are without having to guess which of five accordions hides it —
     on a phone the drawer IS the only map of the site. */
  const hereGroup = NAV.find((e) => isGroup(e) && e.children.some((c) => isHere(c.href)));
  const hereGroupId = hereGroup && isGroup(hereGroup) ? hereGroup.id : null;

  useEffect(() => {
    if (open) setExpanded(hereGroupId);
  }, [open, hereGroupId]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    document.documentElement.style.setProperty("--swh-lock-pad", `${scrollbar}px`);
    /* The scrollbar is on the END side, which is the LEFT in Arabic — padding the right
       there would leave a gap on one side and let the bar jump on the other. The logical
       property does the choosing, and app/rtl.css moves the navbar's own offset to match. */
    body.style.paddingInlineEnd = `${scrollbar}px`;

    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingInlineEnd = "";
      document.documentElement.style.setProperty("--swh-lock-pad", "0px");
    };
  }, [open, onClose]);

  return (
    <div className="swh-drawer" data-open={open} inert={!open}>
      <div className="swh-drawer__scrim" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className="swh-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label={ui.siteMenu}
      >
        {/* An SVG cross rather than the "×" character: the glyph sat on the font's baseline,
            so it rendered a pixel or two low in its circle and changed weight with the
            font — Cairo's × is visibly heavier than DM Sans's. */}
        <button type="button" className="swh-drawer__close" onClick={onClose} aria-label={ui.closeMenu}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <ul>
          {NAV.map((entry) =>
            isGroup(entry) ? (
              <li
                key={entry.id}
                className="swh-drawer__group"
                data-open={expanded === entry.id}
              >
                <button
                  type="button"
                  className="swh-drawer__trigger"
                  aria-expanded={expanded === entry.id}
                  data-active={entry.id === hereGroupId || undefined}
                  onClick={() => setExpanded((cur) => (cur === entry.id ? null : entry.id))}
                >
                  {entry.label[lang]}
                  <svg className="swh-nav__chev" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
                    <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </button>
                <div className="swh-drawer__sub">
                  <ul>
                    {entry.children.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={localeHref(lang, c.href)}
                          aria-current={isHere(c.href) ? "page" : undefined}
                          onClick={onClose}
                        >
                          {c.label[lang]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ) : (
              <li key={entry.href} className="swh-drawer__solo">
                <Link
                  href={localeHref(lang, entry.href)}
                  aria-current={isHere(entry.href) ? "page" : undefined}
                  onClick={onClose}
                >
                  {entry.label[lang]}
                </Link>
              </li>
            ),
          )}
        </ul>

        <div className="swh-drawer__foot">
          <PillButton variant="primary" arrow href={demoHrefFor(lang, pathname)} fullWidth onClick={onClose}>
            {ui.bookDemo}
          </PillButton>
          <LanguageToggle lang={lang} onNavigate={onClose} />
          {/* WhatsApp was here too, and was invisible: .swh-wa took its colour from
              --nav-fg, and the drawer renders INSIDE <header class="swh-nav">, so over the
              hero that resolved to --paper — a white glyph on the white panel. It is gone
              rather than recoloured, because the contact rail now carries WhatsApp as a
              full-size branded button and rests fully in view at this width, so this was a
              duplicate of a control already on screen behind the drawer. */}
          <BadgeSlot />
        </div>
      </div>
    </div>
  );
}
