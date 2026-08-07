"use client";

/* The social rail on the right edge.

   It sits 70% inside the viewport and 30% outside it. That is not decoration: an element
   flush to the edge reads as part of the browser chrome and gets ignored, whereas one
   that is visibly cut off by the edge reads as a thing that continues — so the eye treats
   it as reachable rather than as furniture. Pointing at it pulls the remaining 30% in;
   pressing it opens the three profiles.

   ── WHY IT IS BUILT THE WAY IT IS ───────────────────────────────────────────────────

   - `position: fixed` and NOT inside any transformed ancestor. #app carries
     overflow-x:hidden (see app/layout.tsx); a fixed element is only clipped by an
     ancestor's overflow if that ancestor is also a containing block, which #app
     deliberately is not.

   - The rest position is a transform, never a `right` offset. Transforms do not
     participate in layout, so the 30% overhang cannot widen the page or trip a horizontal
     scrollbar. This matters more on the right than it did on the left: overflow past the
     left edge is free in LTR, overflow past the right edge is not.

   - `focus-within` gets the same treatment as `hover`. Tabbing to a control that is 30%
     off-screen and stays there is the version of this pattern that fails an audit.

   - The links are `inert` while collapsed, not merely invisible. Without it the three
     profiles stay in the tab order behind a closed panel.

   - Icons come from components/chrome/SocialIcon.tsx, shared with the footer, so the two
     places cannot drift.

   The rail hides itself below 900px. On a phone the screen edges are thumb territory that
   belongs to the page and to the browser's own gestures, and the same three links are
   already in the footer. */

import { useEffect, useRef, useState } from "react";
import { SOCIAL } from "@/content/site";
import { SocialIcon } from "./SocialIcon";

export function SocialRail() {
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
        <button
          type="button"
          className="swh-rail__toggle"
          aria-expanded={open}
          aria-controls="swh-rail-links"
          aria-label={open ? "Hide social links" : "Show social links"}
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
            {SOCIAL.map((s, i) => (
              <li key={s.label} style={{ "--i": i } as React.CSSProperties}>
                <a
                  className="swh-rail__link"
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.label} — opens in a new tab`}
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
