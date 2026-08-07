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
import { SITE } from "@/content/site";
import { BadgeSlot } from "./BadgeSlot";
import { WhatsAppLink } from "./WhatsAppLink";
import { useFocusTrap } from "./useFocusTrap";

type Props = {
  open: boolean;
  onClose: () => void;
  pathname: string;
};

export function NavDrawer({ open, onClose, pathname }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  useFocusTrap(panelRef, open);

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
    body.style.paddingRight = `${scrollbar}px`;

    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = "";
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
        aria-label="Site menu"
      >
        <button type="button" className="swh-drawer__close" onClick={onClose} aria-label="Close menu">
          ×
        </button>

        <ul>
          {NAV.map((entry) =>
            isGroup(entry) ? (
              <li
                key={entry.label}
                className="swh-drawer__group"
                data-open={expanded === entry.label}
              >
                <button
                  type="button"
                  className="swh-drawer__trigger"
                  aria-expanded={expanded === entry.label}
                  onClick={() =>
                    setExpanded((cur) => (cur === entry.label ? null : entry.label))
                  }
                >
                  {entry.label}
                  <svg className="swh-nav__chev" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
                    <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </button>
                <div className="swh-drawer__sub">
                  <ul>
                    {entry.children.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          aria-current={pathname === c.href ? "page" : undefined}
                          onClick={onClose}
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ) : (
              <li key={entry.href} className="swh-drawer__solo">
                <Link
                  href={entry.href}
                  aria-current={pathname === entry.href ? "page" : undefined}
                  onClick={onClose}
                >
                  {entry.label}
                </Link>
              </li>
            ),
          )}
        </ul>

        <div className="swh-drawer__foot">
          <PillButton variant="primary" arrow href={SITE.demoHref} fullWidth>
            Book a demo
          </PillButton>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <WhatsAppLink />
            <BadgeSlot />
          </div>
        </div>
      </div>
    </div>
  );
}
