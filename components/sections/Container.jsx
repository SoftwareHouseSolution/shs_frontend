/* Prototype source: SwhSections.jsx:8-16 */
import React from "react";

export const MAXW = 1600;

/* NOTE: `...style` is spread LAST on purpose. Callers override the shorthand
   `padding: "0 var(--gutter)"` with longhand paddingTop/paddingBottom (Header does).
   Reordering these keys silently changes the layout. */
export function Container({ children, style, className }) {
  return (
    <div className={className} style={{ width: "100%", maxWidth: MAXW, marginLeft: "auto", marginRight: "auto", padding: "0 var(--gutter)", boxSizing: "border-box", ...style }}>
      {children}
    </div>
  );
}
