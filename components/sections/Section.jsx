/* Prototype source: SwhSections.jsx:58-64 */
import React from "react";
import { Container } from "./Container";

/* `...style` spreads last — callers override the `padding: "var(--section-y) 0"`
   shorthand with paddingTop/paddingBottom longhands (Hero does). Key order matters.
   TrustedBy used to be the other one; LogoWall replaced it and inlines its own section. */
export function Section({ id, children, style }) {
  return (
    <section id={id} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "var(--section-y) 0", ...style }}>
      <Container>{children}</Container>
    </section>
  );
}
