/* Prototype source: SwhSections.jsx:18-56

   Scroll-linked expand/shrink reveal (framer-style useScroll→useTransform).
   scale 0.88→1→0.88, opacity trapezoid, translateY 20→0, mapped to the element's
   position in the viewport. Applied straight to the DOM node for 60fps (no re-render).

   NOTE: this must stay `useEffect`, never `useLayoutEffect`. The first paint happens
   before update() runs, so there is one untransformed frame. That frame exists in the
   prototype; removing it would be an improvement, and therefore a drift. */
import React, { useEffect, useRef } from "react";

export function ScrollReveal({ children, style }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.transform = "none"; el.style.opacity = "1"; return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = r.top + r.height / 2;
      let p = (vh - center) / vh;            // 0 entering bottom → 0.5 centered → 1 exiting top
      p = Math.max(0, Math.min(1, p));
      const scale = 1 - 0.24 * Math.abs(p - 0.5); // 0.88 edges → 1 center
      let opacity;                                 // trapezoid: full through the middle
      if (p < 0.3) opacity = 0.6 + (0.4 * p) / 0.3;
      else if (p > 0.7) opacity = 1 - (0.4 * (p - 0.7)) / 0.3;
      else opacity = 1;
      const y = 20 * Math.max(0, (0.5 - Math.min(p, 0.5)) / 0.5);
      el.style.transform = `translateY(${y.toFixed(1)}px) scale(${scale.toFixed(4)})`;
      el.style.opacity = opacity.toFixed(3);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={ref} style={{ transformOrigin: "top center", willChange: "transform, opacity", ...style }}>
      {children}
    </div>
  );
}
