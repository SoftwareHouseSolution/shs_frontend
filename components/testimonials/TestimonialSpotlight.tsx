"use client";

/* The testimonials page's spotlight: one testimonial at a time, large, with its picture.

   ROTATION. It moves on by itself every DWELL_MS, shown by a progress bar under the quote.
   The bar IS the timer: a CSS animation whose `animationend` advances the slide, so pausing
   is just `animation-play-state: paused` — no interval to keep in step with what the eye
   sees. It pauses while the pointer is over it, while anything inside has focus, and while
   the tab is hidden; the visitor can stop it outright with the pause button (WCAG 2.2.2).
   Following the site's motion rule — nothing loops forever — it stops after one full round,
   back on the first testimonial. Under reduced motion it never moves by itself.

   ENTRANCE. On every change the quote's words rise in one after another (the site's
   swh-hero-copy keyframes, staggered). The slide is re-keyed so the animation replays.

   INPUT. Previous/next buttons, the arrow keys, a horizontal swipe, and the row of pictures
   underneath, which doubles as the list of who is in the rotation. "Next" follows the
   reading direction: leftwards in Arabic, rightwards in English. */

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/i18n";
import { TESTIMONIALS_COPY } from "@/content/review";
import type { Testimonial } from "@/lib/api/types";
import { useReducedMotion } from "@/components/chrome/useReducedMotion";
import { Portrait } from "./Portrait";

const DWELL_MS = 8000;
const SWIPE_PX = 48;
const WORD_STAGGER_MS = 22;
const WORD_STAGGER_CAP_MS = 700;
const LONG_QUOTE = 260;

export function TestimonialSpotlight({ lang, items }: { lang: Locale; items: Testimonial[] }) {
  const t = TESTIMONIALS_COPY[lang];
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [stopped, setStopped] = useState(false); // the visitor pressed pause
  const [advances, setAdvances] = useState(0); // automatic moves so far
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const swipeFrom = useRef<number | null>(null);

  const total = items.length;
  const current = items[index];
  const rotating = total > 1 && !reduced && !stopped && advances < total;
  const held = hovered || focused || hidden;

  useEffect(() => {
    const sync = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  function go(to: number) {
    setIndex(((to % total) + total) % total);
  }

  /* "Next" is the way the text reads: towards the left in Arabic. */
  function isRtl(el: Element | null) {
    return !!el && getComputedStyle(el).direction === "rtl";
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const forward = (e.key === "ArrowRight") !== isRtl(e.currentTarget);
    go(index + (forward ? 1 : -1));
  }

  function onPointerUp(e: React.PointerEvent<HTMLElement>) {
    if (swipeFrom.current === null) return;
    const dx = e.clientX - swipeFrom.current;
    swipeFrom.current = null;
    if (Math.abs(dx) < SWIPE_PX) return;
    const forward = (dx < 0) !== isRtl(e.currentTarget);
    go(index + (forward ? 1 : -1));
  }

  const words = current.quote.split(/(\s+)/);
  let wordIndex = 0;

  return (
    <section
      className="swh-spotlight"
      aria-roledescription="carousel"
      aria-label={t.spotlight}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      onKeyDown={onKeyDown}
    >
      <div
        className="swh-spotlight__stage"
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") swipeFrom.current = e.clientX;
        }}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeFrom.current = null)}
      >
        <figure
          key={current.id}
          className="swh-spotlight__slide"
          aria-roledescription="slide"
          aria-label={t.counter(index + 1, total)}
          aria-live={rotating ? "off" : "polite"}
        >
          <Portrait src={current.avatar} name={current.authorName} className="swh-spotlight__portrait" />

          <div className="swh-spotlight__body">
            <span className="swh-spotlight__mark" aria-hidden="true">“</span>
            <blockquote
              className={`swh-spotlight__quote${current.quote.length > LONG_QUOTE ? " is-long" : ""}`}
              dir="auto"
            >
              {words.map((w, i) => {
                if (/^\s+$/.test(w)) return w;
                const delay = Math.min(wordIndex++ * WORD_STAGGER_MS, WORD_STAGGER_CAP_MS);
                return (
                  <span key={i} className="swh-spotlight__word" style={{ animationDelay: `${delay}ms` }}>
                    {w}
                  </span>
                );
              })}
            </blockquote>
            <figcaption className="swh-spotlight__by">
              <strong>{current.authorName}</strong>
              {current.authorCompany ? <span>{current.authorCompany}</span> : null}
            </figcaption>
          </div>
        </figure>
      </div>

      {total > 1 ? (
        <div className="swh-spotlight__controls">
          <div className="swh-spotlight__progress" aria-hidden="true">
            {rotating ? (
              <span
                key={`${index}-${advances}`}
                className="swh-spotlight__bar"
                style={{ animationDuration: `${DWELL_MS}ms`, animationPlayState: held ? "paused" : "running" }}
                onAnimationEnd={() => {
                  setAdvances((n) => n + 1);
                  go(index + 1);
                }}
              />
            ) : null}
          </div>

          <span className="swh-spotlight__counter">{t.counter(index + 1, total)}</span>

          {!reduced ? (
            <button
              type="button"
              className="swh-spotlight__btn"
              onClick={() => {
                if (rotating) setStopped(true);
                else {
                  setStopped(false);
                  setAdvances(0);
                }
              }}
              aria-label={rotating ? t.pause : t.play}
            >
              {rotating ? (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z" /></svg>
              )}
            </button>
          ) : null}
          <button type="button" className="swh-spotlight__btn swh-spotlight__btn--prev" onClick={() => go(index - 1)} aria-label={t.previous}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button type="button" className="swh-spotlight__btn swh-spotlight__btn--next" onClick={() => go(index + 1)} aria-label={t.next}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      ) : null}

      {total > 1 ? (
        <ul className="swh-spotlight__people">
          {items.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                className="swh-spotlight__person"
                aria-current={i === index ? "true" : undefined}
                aria-label={t.show(item.authorName)}
                title={item.authorName}
                onClick={() => go(i)}
              >
                <Portrait src={item.avatar} name={item.authorName} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
