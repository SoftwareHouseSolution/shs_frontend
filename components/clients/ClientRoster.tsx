/* The "Every client" roster, as a moving wall.

   The cards are dealt into columns that drift endlessly — neighbouring columns in
   opposite directions — inside a fixed window faded at the top and bottom. 367 names laid
   out flat are a long page to scroll past; as a wall they read as what they are: a lot of
   jewellers, in a space the size of one screen.

   THE STATIC GRID IS THE BASELINE. The server renders the plain grid, so the full roster
   is in the HTML for crawlers and for JS-off (the contract this directory has always had),
   and the wall replaces it only when the roster comes near the viewport — building 700+
   cards during hydration would hold up the page's first second for a section most visitors
   reach later, if at all. The grid
   also comes back whenever the wall would not work:
   - under prefers-reduced-motion;
   - when a search or region leaves too few cards to fill the window — a column of three
     cards cannot loop without a hole, and repeating a search result would be wrong.

   HOW THE LOOP IS SEAMLESS. Each column's track holds its cards twice, and each copy
   carries one gap of padding after its last card, so the track is exactly two identical
   halves; moving it by -50% lands on a frame identical to the first. The second copy is
   aria-hidden, so a screen reader meets every client once. Durations are set from the
   measured column height, so every column moves at the same pixel speed whatever its
   length.

   MOTION. Hovering the wall pauses it (to read a card), the button pauses it for good
   (WCAG 2.2.2: anything moving for over five seconds needs a way to stop it), and it stops
   while scrolled out of view. */

import { startTransition, useEffect, useLayoutEffect, useRef, useState, type Ref } from "react";
import type { Client } from "@/lib/api/types";
import { UI } from "@/content/ui";
import type { Locale } from "@/content/i18n";
import { ClientCard } from "./ClientCard";

/* Kept in step with .swh-client-grid in app/chrome.css: the wall has as many columns as
   the grid would, so switching between them never reflows the cards' widths. */
const CARD_MIN = 210;
const GAP = 24;
const PHONE_MQ = "(max-width: 599px)";
/* Pixels per second, and a per-column factor so the columns never move in lockstep. */
const SPEED = 30;
const PACE = [1, 0.84, 0.93, 0.78, 0.9, 0.86];

function columnCount(width: number, phone: boolean) {
  if (phone) return 2;
  return Math.max(2, Math.floor((width + GAP) / (CARD_MIN + GAP)));
}

/** Deal the cards round-robin, so the list order reads across the top row. */
function deal(clients: readonly Client[], n: number): Client[][] {
  const cols: Client[][] = Array.from({ length: n }, () => []);
  clients.forEach((c, i) => cols[i % n].push(c));
  return cols;
}

type Props = {
  clients: readonly Client[];
  lang: Locale;
  typeName: (key: string) => string;
  /** The roster's outer box, for ClientMap's fade when the region changes. */
  ref?: Ref<HTMLDivElement>;
};

export function ClientRoster({ clients, lang, typeName, ref }: Props) {
  const ui = UI[lang];
  const boxRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(0); // 0 = not measured yet: render the grid
  const [still, setStill] = useState(false); // reduced motion
  const [paused, setPaused] = useState(false);
  const [offscreen, setOffscreen] = useState(true);
  const [near, setNear] = useState(false); // has come within reach of the viewport
  /* The deal that turned out too short to loop. Keyed, so a new search or width tries
     the wall again instead of staying a grid for the rest of the visit. */
  const dealKey = `${cols}:${clients.length}:${clients[0]?.slug ?? ""}`;
  const [shortKey, setShortKey] = useState<string | null>(null);

  // Column count follows the box width; reduced motion is followed live.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const phone = window.matchMedia(PHONE_MQ);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setCols(columnCount(box.clientWidth, phone.matches));
      setStill(reduce.matches);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(box);
    reduce.addEventListener("change", sync);
    return () => {
      ro.disconnect();
      reduce.removeEventListener("change", sync);
    };
  }, []);

  // Built when it is about to be seen; stopped while scrolled away, when nobody is watching.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setOffscreen(!e.isIntersecting);
        if (e.isIntersecting) startTransition(() => setNear(true));
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(box);
    return () => io.disconnect();
  }, []);

  const wall = near && cols > 0 && !still && shortKey !== dealKey && clients.length >= cols * 3;
  const columns = wall ? deal(clients, cols) : [];

  /* Measured before paint: a column shorter than the window would loop with a hole, so the
     grid takes over; otherwise each track gets the duration that gives it SPEED px/s. */
  useLayoutEffect(() => {
    const view = viewRef.current;
    if (!wall || !view) return;
    const tracks = [...view.querySelectorAll<HTMLElement>(".swh-roster__track")];
    const sets = tracks.map((t) => (t.firstElementChild as HTMLElement).offsetHeight);
    if (sets.some((h) => h < view.clientHeight)) {
      setShortKey(dealKey);
      return;
    }
    tracks.forEach((t, i) => t.style.setProperty("--roster-duration", `${sets[i] / (SPEED * PACE[i % PACE.length])}s`));
  });

  const setRefs = (el: HTMLDivElement | null) => {
    boxRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <div ref={setRefs} className="swh-roster" data-mode={wall ? "wall" : "grid"} data-paused={(wall && (paused || offscreen)) || undefined}>
      {wall ? (
        <>
          <div className="swh-roster__view" ref={viewRef}>
            {columns.map((col, i) => (
              <div className="swh-roster__col" key={i}>
                <div className="swh-roster__track" data-dir={i % 2 ? "down" : "up"}>
                  {[0, 1].map((copy) => (
                    // The second copy exists only to make the loop seamless.
                    <ul className="swh-roster__set" key={copy} aria-hidden={copy === 1 || undefined}>
                      {col.map((c) => (
                        <ClientCard key={c.slug} client={c} lang={lang} typeName={typeName} />
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="swh-roster__toggle"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            aria-label={ui.pauseMotion}
            title={paused ? ui.playMotion : ui.pauseMotion}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              {paused ? (
                <path d="M5 3.5v9l7.5-4.5z" fill="currentColor" />
              ) : (
                <path d="M5.5 3.5v9M10.5 3.5v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </>
      ) : (
        <ul className="swh-client-grid">
          {clients.map((c) => (
            <ClientCard key={c.slug} client={c} lang={lang} typeName={typeName} />
          ))}
        </ul>
      )}
    </div>
  );
}
