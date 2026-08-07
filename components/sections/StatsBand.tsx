"use client";

/* Closing band on the home page: the client's final call to action, then the trust
   figures counting up as they come into view.

   Copy and every number come from the client's
   ui_ux/…/"website start and end and numbers.docx". The figures also live in
   content/site.ts — that file is the source of truth, this one only renders it.

   The section/container wrapper is inlined rather than imported from Section.jsx and
   Container.jsx, for the same reason StubBody.tsx inlines it: those files are untyped
   .jsx with no .d.ts, so TypeScript infers every prop as required and <Section> alone
   fails to typecheck. Values match Section.jsx and Container.jsx exactly. */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ds/Reveal";
import { Eyebrow } from "@/components/ds/Eyebrow";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { PillButton } from "@/components/ds/PillButton";
import { useReducedMotion } from "@/components/chrome/useReducedMotion";
import { SITE, STATS } from "@/content/site";

const RAMP_MS = 1200;

/* useLayoutEffect on the client, useEffect on the server — the standard guard against
   React's SSR warning. It has to be the layout variant: `progress` starts at 1 so the
   final figures are in the server HTML (for crawlers, and for JS-off), and the effect
   resets it to 0 before starting. useEffect would run after paint, so the number would
   flash at its final value and then snap back to zero. */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* Ease-out cubic: fast at the start, settling at the end. A linear ramp reads as a
   loading spinner rather than a number arriving. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function StatsBand() {
  const reduce = useReducedMotion();
  const gridRef = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(1);

  useIsoLayoutEffect(() => {
    if (reduce) {
      setProgress(1);
      return;
    }
    const el = gridRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    setProgress(0);
    let raf = 0;
    let start = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect(); // once only — a figure that re-counts on every scroll-by is a toy
        const step = (now: number) => {
          if (!start) start = now;
          const t = Math.min(1, (now - start) / RAMP_MS);
          setProgress(t);
          if (t < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "var(--section-y) 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1600,
          marginLeft: "auto",
          marginRight: "auto",
          padding: "0 var(--gutter)",
          boxSizing: "border-box",
        }}
      >
        <Reveal style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", textAlign: "center", width: "100%" }}>
          <SectionHeading level="head" align="center">
            Ready to transform your jewellery business?
          </SectionHeading>
          <p style={{ margin: 0, font: "var(--body-copy)", color: "var(--body)", maxWidth: "58ch" }}>
            Whether you are opening your first store, managing multiple branches or expanding
            internationally, our jewellery management system covers inventory, sales, production,
            accounting and business performance in one platform.
          </p>
          <PillButton variant="primary" arrow href={SITE.demoHref}>
            Schedule your free demo
          </PillButton>
        </Reveal>

        <Reveal delay={0.08} style={{ width: "100%", marginTop: "56px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
            <Eyebrow>Trusted by the jewellery industry</Eyebrow>
          </div>
          <ul ref={gridRef} className="swh-stats">
            {STATS.map((s) => (
              <li key={s.label} className="swh-stats__item">
                {/* The figure is a <p>, not a heading: five sibling <h2>s under one
                    section would make the outline unreadable for a screen reader. */}
                <SectionHeading as="p" level="sub" align="center" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {"to" in s ? s.prefix + Math.round(s.to * easeOut(progress)).toLocaleString("en-GB") + s.suffix : s.text}
                </SectionHeading>
                <span className="swh-stats__label">{s.label}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
