"use client";

/* The client roster as a map.

   Replaces the five rows of filter chips that used to sit here. Those chips asked the
   visitor to already know how we bucket the country; the map just shows them where the
   clients are, which is the thing a prospective customer is actually checking — "do you
   work with people near me".

   ── HOW IT IS PUT TOGETHER ──────────────────────────────────────────────────────────

   The Google embed is a LOCKED BACKDROP: fixed centre, fixed zoom, pointer-events:none,
   aria-hidden. It cannot be panned or zoomed, and that is the point — see the long note in
   regionGeo.ts. Because its viewport is fixed and known, every marker's pixel position
   follows from Web Mercator, recomputed on resize, so a pill can never drift off the city
   it names. A pannable iframe with overlaid pins is the version of this that looks right
   in a screenshot and is wrong in use.

   The iframe is over-scanned past the frame on all four sides and clipped. Symmetric, so
   the centre is unmoved; it exists to crop off Google's own zoom buttons and "View larger
   map" link, which would otherwise sit inside our rounded panel looking clickable while
   being inert.

   Selecting a region reveals its clients below the map. Everything renders server-side
   first and selection only filters, so the full roster is in the HTML for crawlers and for
   JS-off — same contract the old directory had.

   THE SEARCH FIELD STAYS. The map replaces the facets, not the ability to find one named
   client among 367; no map answers "where is Zeina Jewelry". */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Client, Region } from "@/content/clients";
import { REGIONS } from "@/content/clients";
import { ClientCard } from "./ClientCard";
import { REGION_ANCHORS, embedUrl, fitZoom, offsetFromCentre } from "./regionGeo";

/* Over-scan in px per side. Google's controls sit within ~64px of the corners. */
const BLEED = 68;

export function ClientMap({ clients }: { clients: readonly Client[] }) {
  const [active, setActive] = useState<Region | null>(null);
  const [q, setQ] = useState("");
  const frameRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  /* Counts per region, computed once. A region with no clients is not rendered — an empty
     pin is an invitation to click something that does nothing. */
  const counts = useMemo(() => {
    const m = new Map<Region, number>();
    for (const c of clients) m.set(c.region, (m.get(c.region) ?? 0) + 1);
    return m;
  }, [clients]);

  const onMap = REGIONS.filter((r) => REGION_ANCHORS[r] && (counts.get(r) ?? 0) > 0);
  const offMap = REGIONS.filter((r) => !REGION_ANCHORS[r] && (counts.get(r) ?? 0) > 0);

  /* Measure the frame so markers can be placed from its centre. useLayoutEffect: the pills
     must be positioned before paint, otherwise they all flash at the top-left corner for a
     frame and then jump. */
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Zoom follows the measured frame rather than being a constant — see fitZoom. It feeds
     both the pin maths and the embed URL, so the backdrop and the pins can never disagree.
     Rounding to an integer means the src only changes when the fit genuinely changes, not
     on every pixel of a resize drag. */
  const zoom = box.w && box.h ? fitZoom(box.w, box.h) : null;

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return clients
      .filter((c) => {
        if (active && c.region !== active) return false;
        if (needle && !c.name.toLowerCase().includes(needle) && !c.location.toLowerCase().includes(needle)) {
          return false;
        }
        return true;
      })
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "en"));
  }, [clients, active, q]);

  const select = useCallback((r: Region) => setActive((cur) => (cur === r ? null : r)), []);

  // Escape clears the selection, matching every other dismissible thing on the site.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <section className="swh-directory">
      <div className="swh-directory__inner">
        <div className="swh-map">
          <div className="swh-map__frame" ref={frameRef}>
            {/* aria-hidden and inert: it is scenery. Everything the map communicates is
                also in the pill buttons above it, which are real, focusable controls. */}
            <iframe
              className="swh-map__embed"
              /* Held back until the frame is measured: loading at a guessed zoom and then
                 swapping would cost a second request and a visible re-tile. */
              src={zoom ? embedUrl(zoom) : undefined}
              title=""
              aria-hidden="true"
              tabIndex={-1}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              /* Explicit size, not `inset` — an absolutely positioned iframe is a replaced
                 element, so `width: auto` gives its 300x150 intrinsic size instead of
                 stretching to the offsets. See the note in chrome.css. */
              style={{
                left: -BLEED,
                top: -BLEED,
                width: `calc(100% + ${BLEED * 2}px)`,
                height: `calc(100% + ${BLEED * 2}px)`,
              }}
            />
            <div className="swh-map__wash" aria-hidden="true" />

            {/* The pills. A real <button> each, in a real list, so the map is operable by
                keyboard and legible to a screen reader without the map existing at all. */}
            <ul className="swh-map__pins">
              {onMap.map((r) => {
                const { dx, dy } = offsetFromCentre(REGION_ANCHORS[r], zoom ?? 7);
                const n = counts.get(r) ?? 0;
                return (
                  <li
                    key={r}
                    className="swh-map__pin"
                    style={{
                      // Parked off-screen until measured, so nothing flashes at 0,0.
                      left: zoom ? box.w / 2 + dx : -9999,
                      top: zoom ? box.h / 2 + dy : -9999,
                    }}
                  >
                    <button
                      type="button"
                      className="swh-map__tag"
                      aria-pressed={active === r}
                      onClick={() => select(r)}
                    >
                      <span className="swh-map__tag-name">{r}</span>
                      <span className="swh-map__tag-n">{n}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="swh-map__bar">
            <label className="swh-map__search">
              <span className="swh-filters__label">Find a client</span>
              <input
                className="swh-filters__search"
                type="search"
                value={q}
                placeholder="Name or location"
                onChange={(e) => setQ(e.target.value)}
              />
            </label>

            {offMap.length > 0 && (
              <div className="swh-map__off">
                <span className="swh-filters__label">Not on the map</span>
                <div className="swh-map__off-chips">
                  {offMap.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className="swh-filters__chip"
                      aria-pressed={active === r}
                      onClick={() => select(r)}
                    >
                      {r} <span className="swh-map__off-n">{counts.get(r)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="swh-map__result">
          <h2 className="swh-map__result-title">
            {active ?? "Every client"}
            <span aria-live="polite">
              {shown.length} of {clients.length}
            </span>
          </h2>
          {active !== null || q !== "" ? (
            <button
              type="button"
              className="swh-filters__reset"
              onClick={() => {
                setActive(null);
                setQ("");
              }}
            >
              Show all {clients.length}
            </button>
          ) : null}
        </div>

        {shown.length === 0 ? (
          <p className="swh-filters__empty">
            No client matches “{q}”{active ? ` in ${active}` : ""}. Try a shorter search.
          </p>
        ) : (
          <ul className="swh-client-grid">
            {shown.map((c) => (
              <ClientCard key={c.slug} client={c} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
