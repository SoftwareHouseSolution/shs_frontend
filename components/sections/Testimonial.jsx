/* Prototype source: SwhSections.jsx:242-281 — scroll-driven word-by-word colour fill.

   NOTE: `useEffect`, not `useLayoutEffect`. onScroll() runs post-paint, so the first frame
   shows every word grey before the fill resolves. That frame exists in the prototype.

   REDUCED MOTION. This used to have no guard, on purpose, because the prototype had none.
   That reason expired with the pixel-parity baseline on `/` (see README), and the cost was
   not cosmetic: an unfilled word is #DADADA on --paper, 1.34:1, so a visitor who asked for
   less motion got a quote they could not read until they scrolled it into place. Under
   reduced motion the quote now renders fully inked and never listens to scroll.

   STATE IS THE LIT-WORD COUNT, not the raw scroll fraction. The fraction changed on every
   scroll event, so the whole quote re-rendered at scroll frequency; the count only changes
   when a word actually flips, which is a few dozen renders across the entire pass. Reads
   are batched to one per frame for the same reason. */
import React, { useEffect, useRef, useState } from "react";
import { Container } from "./Container";
import { ScrollReveal } from "./ScrollReveal";
import { HOME } from "@/content/home";
import { A } from "./assetPath";

export function Testimonial({ lang }) {
  const c = HOME[lang];
  /* Split per render rather than stored pre-split in content/home.ts: the word-by-word
     fill is this component's business, and a translator should never be handed an array
     of loose words to translate one at a time. */
  const words = c.quote.split(" ");
  const n = words.length;
  const ref = useRef(null);
  const [lit, setLit] = useState(0);
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLit(n);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // fill starts as the quote enters from the bottom and completes
      // by the time it reaches the upper third of the viewport
      const frac = (vh * 0.85 - r.top) / (vh * 0.55);
      // ceil(p·n) is exactly how many words the old `p * n > i` test lit.
      setLit(Math.ceil(Math.max(0, Math.min(1, frac)) * n));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [n]);
  return (
    <section style={{ display: "flex", justifyContent: "center", padding: "var(--section-y) 0" }}>
      <Container>
        <div ref={ref} style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p style={{ margin: 0, fontFamily: "var(--f-serif)", fontSize: "clamp(30px,5vw,64px)", lineHeight: 1.1, letterSpacing: "-1px" }}>
            {words.map((w, i) => {
              const on = i < lit;
              return <span key={i} style={{ color: on ? "var(--ink)" : "#DADADA", transition: "color .2s" }}>{w} </span>;
            })}
          </p>
          <div style={{ marginTop: "32px", display: "flex", alignItems: "center", gap: "14px" }}>
            <ScrollReveal style={{ display: "inline-flex" }}>
              <img src={A("testimonials/uncle.png")} alt="" style={{ height: "44px", width: "44px", objectFit: "contain" }} />
            </ScrollReveal>
            <span style={{ font: "var(--body-copy)", color: "var(--body)" }}>{c.quoteAttribution}</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
