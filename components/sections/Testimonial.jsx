/* Prototype source: SwhSections.jsx:242-281 — scroll-driven word-by-word colour fill.

   NOTE: `useEffect`, not `useLayoutEffect`. onScroll() runs post-paint, so the first frame
   shows every word grey before the fill resolves. That frame exists in the prototype.

   NOTE: there is deliberately no prefers-reduced-motion guard here — the prototype has none. */
import React, { useEffect, useRef, useState } from "react";
import { Container } from "./Container";
import { ScrollReveal } from "./ScrollReveal";
import { QUOTE } from "./data";
import { A } from "./assetPath";

export function Testimonial() {
  const ref = useRef(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // fill starts as the quote enters from the bottom and completes
      // by the time it reaches the upper third of the viewport
      const frac = (vh * 0.85 - r.top) / (vh * 0.55);
      setP(Math.max(0, Math.min(1, frac)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <section style={{ display: "flex", justifyContent: "center", padding: "var(--section-y) 0" }}>
      <Container>
        <div ref={ref} style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p style={{ margin: 0, fontFamily: "var(--f-serif)", fontSize: "clamp(30px,5vw,64px)", lineHeight: 1.1, letterSpacing: "-1px" }}>
            {QUOTE.map((w, i) => {
              const on = p * QUOTE.length > i;
              return <span key={i} style={{ color: on ? "var(--ink)" : "#DADADA", transition: "color .2s" }}>{w} </span>;
            })}
          </p>
          <div style={{ marginTop: "32px", display: "flex", alignItems: "center", gap: "14px" }}>
            <ScrollReveal style={{ display: "inline-flex" }}>
              <img src={A("testimonials/uncle.png")} alt="" style={{ height: "44px", width: "44px", objectFit: "contain" }} />
            </ScrollReveal>
            <span style={{ font: "var(--body-copy)", color: "var(--body)" }}>Mr. Mohammed Wassem — Wassem Jewellery</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
