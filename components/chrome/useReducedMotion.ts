"use client";

import { useEffect, useState } from "react";

/* Mirrors the guard the design system already uses in Reveal.jsx and ScrollReveal.jsx,
   with a change listener added so toggling the OS setting takes effect without a reload.

   Returns false on the server and on the first client render, so there is no hydration
   mismatch; the effect corrects it before the first timer would fire. */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduce;
}
