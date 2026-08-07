"use client";

/* Home-page events section: a vertical scroller with a clickable rail beside it.

   Vertical rather than a horizontal carousel on purpose — the four events are a timeline,
   and a timeline that runs sideways fights the direction the rest of the page reads. The
   rail is the click target: pick an event and the panel scrolls to it; scroll the panel by
   hand and the rail follows. Both directions work, so neither control is a dead end.

   All four panels are in the DOM and scroll-snapped, so with JavaScript off this degrades
   to a plain scrollable list of events rather than to nothing. */

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ds/Reveal";
import { Eyebrow } from "@/components/ds/Eyebrow";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { PillButton } from "@/components/ds/PillButton";
import { useReducedMotion } from "@/components/chrome/useReducedMotion";
import { EVENTS } from "@/content/events";

export function EventsRail() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);

  /* The rail follows the scroller rather than the other way round: whichever panel owns
     most of the scroller decides which rail item is current. rootMargin trims the top and
     bottom so a panel only counts once it is genuinely the one being read. */
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        const win = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (win) setActive(Number((win.target as HTMLElement).dataset.index));
      },
      { root, rootMargin: "-35% 0px -35% 0px", threshold: [0.1, 0.5, 0.9] },
    );
    panelRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) => {
    const el = panelRefs.current[i];
    if (!el) return;
    setActive(i);
    el.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section
      style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "var(--section-y) 0" }}
    >
      <div style={{ width: "100%", maxWidth: 1600, margin: "0 auto", padding: "0 var(--gutter)", boxSizing: "border-box" }}>
        <Reveal style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "48px", maxWidth: "620px" }}>
          <Eyebrow>News &amp; events</Eyebrow>
          <SectionHeading level="head">Where you will find us.</SectionHeading>
          <p style={{ margin: 0, font: "var(--body-copy)", color: "var(--body)" }}>
            We exhibit at the trade&rsquo;s own events, and we turn up on site when a client opens
            their doors.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="swh-events">
            {/* A list of buttons, not links: these move the panel beside them rather than
                navigating anywhere. aria-current marks which one is showing. */}
            <nav className="swh-events__rail" aria-label="Events">
              <ol>
                {EVENTS.map((e, i) => (
                  <li key={e.title}>
                    <button
                      type="button"
                      className="swh-events__tab"
                      aria-current={i === active}
                      onClick={() => goTo(i)}
                    >
                      <span className="swh-events__tab-year">{e.year ?? "Recent"}</span>
                      <span className="swh-events__tab-title">{e.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>

            {/* tabIndex 0 so the scroller is reachable and scrollable from the keyboard —
                a focusable scroll container is the one case where it is correct. */}
            <div
              ref={scrollerRef}
              className="swh-events__scroller"
              tabIndex={0}
              role="group"
              aria-label="Event details"
            >
              {EVENTS.map((e, i) => (
                <article
                  key={e.title}
                  className="swh-events__panel"
                  data-index={i}
                  ref={(el) => {
                    panelRefs.current[i] = el;
                  }}
                >
                  <img
                    className="swh-events__img"
                    src={e.photos[0].src}
                    alt={e.photos[0].alt}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="swh-events__body">
                    <p className="swh-events__year">{e.year ?? "Recent"}</p>
                    <h3 className="swh-events__title">{e.title}</h3>
                    <p className="swh-events__text">{e.paras[0]}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
            <PillButton variant="secondary" arrow href="/news-events">
              All news &amp; events
            </PillButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
