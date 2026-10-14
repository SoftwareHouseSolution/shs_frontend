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
import type { Client, ClientTaxonomy } from "@/lib/api/types";
import { UI } from "@/content/ui";
import type { Locale } from "@/content/i18n";
import { PillButton } from "@/components/ds/PillButton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { SearchIcon } from "@/components/feedback/icons";
import { ClientRoster } from "./ClientRoster";
import { FeaturedClients } from "./FeaturedClients";
import { embedUrl, fitZoom, offsetFromCentre, type LatLng } from "./regionGeo";

/* Over-scan in px per side. Google's controls sit within ~64px of the corners. */
const BLEED = 68;

export function ClientMap({
  clients,
  taxonomy,
  lang,
}: {
  clients: readonly Client[];
  taxonomy: ClientTaxonomy;
  lang: Locale;
}) {
  const ui = UI[lang];
  /* Region KEYS drive the filter and the map anchors; names are only ever used to print
     one. Filtering on a translated string would break the moment a label changed. */
  /* Names, pins and order come from the CMS taxonomy (Regions in the admin). */
  const { regionKeys, names, pins, anchors, typeName, featured } = useMemo(() => {
    const names = new Map(taxonomy.regions.map((r) => [r.key, r.name]));
    const pins = new Map<string, LatLng>();
    for (const r of taxonomy.regions) if (r.mapPin) pins.set(r.key, r.mapPin);
    const types = new Map(taxonomy.businessTypes.map((t) => [t.key, t.name]));
    return {
      regionKeys: taxonomy.regions.map((r) => r.key),
      names,
      pins,
      anchors: [...pins.values()],
      typeName: (key: string) => types.get(key) ?? key,
      featured: clients
        .filter((c) => c.featuredOrder !== null)
        .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0)),
    };
  }, [taxonomy, clients]);
  const regionName = (r: string) => names.get(r) ?? r;
  const [active, setActive] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const frameRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  /* Whether the Google embed has painted. Until it has, a skeleton sits over the frame —
     the embed is lazy and third-party, and on a slow line the panel used to sit as a flat
     blue rectangle with pills floating over nothing, which reads as broken rather than as
     loading. Never reset: a later src change (the zoom refitting on resize) swaps tiles
     under an already-drawn map, which is not a loading state. */
  const [mapReady, setMapReady] = useState(false);

  /* Counts per region, computed once. A region with no clients is not rendered — an empty
     pin is an invitation to click something that does nothing. */
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of clients) m.set(c.region, (m.get(c.region) ?? 0) + 1);
    return m;
  }, [clients]);

  const onMap = regionKeys.filter((r) => pins.has(r) && (counts.get(r) ?? 0) > 0);
  const offMap = regionKeys.filter((r) => !pins.has(r) && (counts.get(r) ?? 0) > 0);

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
  const zoom = box.w && box.h ? fitZoom(box.w, box.h, anchors) : null;

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
      /* Collated as "en" in both languages on purpose: client names are Latin in both
         (see content/clients.ts), so an Arabic collator would order them by codepoint
         rather than alphabetically. */
      .sort((a, b) => a.name.localeCompare(b.name, "en"));
  }, [clients, active, q]);

  /* Selecting a region scrolls the results into view.

     Without this the map fills the screen, the grid updates 600px below the fold, and the
     pill just changes colour — the page looks like it did nothing. Only on SELECT: clearing
     should leave the reader where they are, and the search field must never yank the page
     while someone is still typing into it.

     The scroll waits a frame so it targets the grid's new height rather than the old one,
     and `block: "start"` lands on the heading, which already clears the fixed navbar via the
     global `[id] { scroll-margin-top }` rule. */
  const resultRef = useRef<HTMLDivElement>(null);
  const select = useCallback(
    (r: string) => {
      setActive((cur) => {
        const next = cur === r ? null : r;
        if (next) {
          requestAnimationFrame(() =>
            resultRef.current?.scrollIntoView({
              // html{scroll-behavior:smooth} would otherwise animate this for everyone.
              behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth",
              block: "start",
            }),
          );
        }
        return next;
      });
    },
    [],
  );

  /* A short fade on the results when the REGION changes, so swapping 225 cards for 42
     reads as the list being filtered rather than as the page jumping. One element, opacity
     and transform only, via the Web Animations API — nothing to remount, so the cards and
     their decoded logos are reused exactly as before. Not on search: re-fading the grid
     on every keystroke would flicker while someone is typing. Skipped on mount and under
     reduced motion. */
  const gridRef = useRef<HTMLDivElement>(null);
  /* Compared against the last value rather than a "first run" flag, which StrictMode's
     double-invoked effect would flip on mount and then animate anyway. */
  const lastRegion = useRef(active);
  useEffect(() => {
    if (lastRegion.current === active) return;
    lastRegion.current = active;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    gridRef.current?.animate(
      [
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 280, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  }, [active]);

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
          <div className="swh-map__frame" ref={frameRef} data-ready={mapReady}>
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
              /* onLoad also fires for an iframe with no src (about:blank), which is what
                 this is until the frame is measured — so only a real embed counts. */
              onLoad={() => zoom && setMapReady(true)}
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
            {/* Above the embed, under the wash and the pins: the pills are real controls
                and stay usable while the scenery behind them loads. */}
            <div className="swh-map__skeleton" aria-hidden="true" />
            <div className="swh-map__wash" aria-hidden="true" />

            {/* The pills. A real <button> each, in a real list, so the map is operable by
                keyboard and legible to a screen reader without the map existing at all. */}
            <ul className="swh-map__pins">
              {onMap.map((r) => {
                const { dx, dy } = offsetFromCentre(pins.get(r)!, zoom ?? 7);
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
                      /* The untranslated region KEY, so tooling and tests have a stable
                         handle on a pin whose visible label changes with the language —
                         the same reason ClientDirectory's chips carry data-facet/value. */
                      data-region={r}
                      aria-pressed={active === r}
                      onClick={() => select(r)}
                    >
                      <span className="swh-map__tag-name">{regionName(r)}</span>
                      <span className="swh-map__tag-n">{n}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="swh-map__bar">
            <label className="swh-map__search">
              <span className="swh-filters__label">{ui.findAClient}</span>
              {/* The icon is a sibling of the input, not a background image, so it takes
                  currentColor and mirrors with the logical inset in RTL. */}
              <span className="swh-search">
                <span className="swh-search__icon" aria-hidden="true">
                  <SearchIcon />
                </span>
                <input
                  className="swh-filters__search swh-search__input"
                  type="search"
                  value={q}
                  placeholder={ui.nameOrLocation}
                  autoComplete="off"
                  spellCheck={false}
                  enterKeyHint="search"
                  onChange={(e) => setQ(e.target.value)}
                />
              </span>
            </label>

            {offMap.length > 0 && (
              <div className="swh-map__off">
                <span className="swh-filters__label">{ui.notOnTheMap}</span>
                <div className="swh-map__off-chips">
                  {offMap.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className="swh-filters__chip"
                      data-region={r}
                      aria-pressed={active === r}
                      onClick={() => select(r)}
                    >
                      {regionName(r)} <span className="swh-map__off-n">{counts.get(r)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sixteen named accounts on an endless strip, immediately above the heading.
            It is NOT filtered by the region selection: it is a fixed, client-chosen
            billboard, and a "featured" row that emptied itself when you pressed Alexandria
            would read as a bug rather than as a filter. The roster below is the thing the
            map filters. */}
        {featured.length > 0 ? <FeaturedClients lang={lang} clients={featured} /> : null}

        {/* data-active carries the key of the selected region, or nothing when the roster
            is unfiltered — the heading text beside it is localised and cannot be asserted on. */}
        <div className="swh-map__result" id="clients" ref={resultRef} data-active={active ?? ""}>
          <h2 className="swh-map__result-title">{active ? regionName(active) : ui.everyClient}</h2>
          {/* The running count used to be drawn beside the heading. It is now announced
              only, because it was the same number three times over on a page that already
              shows a count on every region pin and then lays the matching cards out
              underneath — but it cannot simply be deleted, because it is the ONLY feedback
              a screen-reader user gets that pressing a pin did anything. Visually hidden,
              still live, still polite. */}
          <p className="swh-vh" aria-live="polite">
            {ui.countOf(shown.length, clients.length)}
          </p>
          {active !== null || q !== "" ? (
            <button
              type="button"
              className="swh-filters__reset"
              onClick={() => {
                setActive(null);
                setQ("");
              }}
            >
              {ui.showAll}
            </button>
          ) : null}
        </div>

        {shown.length === 0 ? (
          <EmptyState
            title={ui.noClientTitle}
            action={
              <PillButton
                variant="secondary"
                onClick={() => {
                  setActive(null);
                  setQ("");
                }}
              >
                {ui.showAll}
              </PillButton>
            }
          >
            {ui.noClientMatch(q, active ? ui.inRegion(regionName(active)) : "")}
          </EmptyState>
        ) : (
          <ClientRoster ref={gridRef} clients={shown} lang={lang} typeName={typeName} />
        )}
      </div>
    </section>
  );
}
