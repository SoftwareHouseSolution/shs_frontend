"use client";

/* The trust figures, sitting directly under the hero.

   They used to live at the bottom of the page inside StatsBand, below the closing CTA.
   That put the single most persuasive thing the company has — since 1988, 1,750+ stores,
   96% of the market — behind eight sections of scrolling, where a visitor deciding
   whether this vendor is credible had already decided. The numbers now land in the first
   screen after the hero and the closing CTA keeps the bottom of the page to itself.

   Every figure comes from content/site.ts, which is the source of truth; this file only
   renders it.

   ── THE COUNT-UP ────────────────────────────────────────────────────────────────────
   One rAF loop drives the whole row, and each figure reads its own window out of that
   single clock with a per-index offset. Five independent timers would drift apart within
   a second and turn a deliberate cascade into noise.

   `progress` starts at 1 so the finished numbers are in the server HTML — for crawlers,
   and for JS-off. useLayoutEffect (not useEffect) resets it to 0 BEFORE the browser
   paints; with useEffect the final figure would paint once and then snap back to zero,
   which is a visible flash on every load. */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/ds/Eyebrow";
import { useReducedMotion } from "@/components/chrome/useReducedMotion";
import { STATS } from "@/content/site";

const RAMP_MS = 1400; // how long one figure takes to arrive
const STAGGER_MS = 110; // offset between neighbouring figures
const TOTAL_MS = RAMP_MS + STAGGER_MS * (STATS.length - 1);

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* Ease-out quart. Steeper than the cubic used elsewhere on purpose: a number should
   arrive fast and then settle, so the eye reads the final value rather than watching a
   slot machine spin. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

export function StatsRow() {
  const reduce = useReducedMotion();
  const rowRef = useRef<HTMLUListElement>(null);
  const [elapsed, setElapsed] = useState(TOTAL_MS);
  const [shown, setShown] = useState(false);

  useIsoLayoutEffect(() => {
    if (reduce) {
      setElapsed(TOTAL_MS);
      setShown(true);
      return;
    }
    const el = rowRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    setElapsed(0);
    let raf = 0;
    let start = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect(); // once only — a figure that re-counts on every scroll-by is a toy
        setShown(true);
        const step = (now: number) => {
          if (!start) start = now;
          const t = now - start;
          setElapsed(Math.min(TOTAL_MS, t));
          if (t < TOTAL_MS) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <section className="swh-figures" aria-label="Company figures">
      <div className="swh-figures__inner">
        <div className="swh-figures__eyebrow">
          <Eyebrow>Trusted by the jewellery industry</Eyebrow>
        </div>

        <ul className="swh-figures__row" ref={rowRef} data-in={shown ? "true" : "false"}>
          {STATS.map((s, i) => {
            const local = Math.max(0, Math.min(1, (elapsed - i * STAGGER_MS) / RAMP_MS));
            return (
              <li
                className="swh-figures__item"
                key={s.label}
                style={{ "--i": i } as React.CSSProperties}
              >
                {/* A <p>, not a heading: five sibling <h2>s under one section would make
                    the document outline unreadable for a screen reader. */}
                <p className="swh-figures__value">
                  {"to" in s
                    ? s.prefix + Math.round(s.to * easeOut(local)).toLocaleString("en-GB") + s.suffix
                    : s.text}
                </p>
                <span className="swh-figures__label">{s.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
