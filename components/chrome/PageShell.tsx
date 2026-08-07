"use client";

/* The scrolling shell shared by every page.
   Lifted verbatim from the original app/page.tsx (which took it from the prototype's
   index.html App component). Four things make the sticky-footer reveal work and all four
   must stay exactly as they are:

     1. `.page-content` carries `background: var(--paper)` (in prototype.css) — without it
        the fixed footer shows through the page.
     2. The measurement is `useEffect`, never `useLayoutEffect`. The prototype paints one
        frame with the spacer at 0 before correcting; removing that would be a drift.
     3. It measures on mount and on resize only.
     4. The spacer is `aria-hidden` — it is pure layout.

   "use client" is required here for two independent reasons: the measurement effect, and
   the fact that no file in components/sections/ carries the directive itself. Footer
   imports ScrollReveal, which calls useEffect with no directive of its own, so anything
   rendering Footer must already be in the client graph. */

import { useEffect, useRef, useState } from "react";
import { Footer } from "@/components/sections/Footer";

export function PageShell({ children }: { children: React.ReactNode }) {
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerH, setFooterH] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (footerRef.current) setFooterH(footerRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <>
      <div className="page-content">
        {/* tabIndex allows the skip link to move focus here. */}
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </div>
      <div aria-hidden="true" style={{ height: footerH }} />
      <div className="sticky-footer" ref={footerRef}>
        <Footer />
      </div>
    </>
  );
}
