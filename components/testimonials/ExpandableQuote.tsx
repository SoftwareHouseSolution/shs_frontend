"use client";

/* A wall card's quote, clamped to a few lines with "Read more" — shown only when the text
   actually overflows the clamp, measured after layout (and again when the card resizes),
   so a short quote never carries a button that does nothing. */

import { useEffect, useRef, useState } from "react";

export function ExpandableQuote({ text, more, less }: { text: string; more: string; less: string }) {
  const ref = useRef<HTMLQuoteElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      if (!open) setOverflows(el.scrollHeight > el.clientHeight + 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  return (
    <>
      <blockquote ref={ref} className={`swh-wall__quote${open ? " is-open" : ""}`} dir="auto">
        {text}
      </blockquote>
      {overflows || open ? (
        <button type="button" className="swh-wall__more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? less : more}
        </button>
      ) : null}
    </>
  );
}
