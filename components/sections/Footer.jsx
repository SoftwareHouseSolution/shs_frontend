/* Prototype source: SwhSections.jsx:327-348

   NOTE: the year is a literal string, exactly as in the prototype. Deriving it from
   `new Date().getFullYear()` would render identically today and quietly introduce a
   server/client mismatch class. Leave it literal. */
import React from "react";
import { BrandLogo } from "@/components/ds/BrandLogo";
import { Container } from "./Container";
import { ScrollReveal } from "./ScrollReveal";
import { A } from "./assetPath";

export function Footer() {
  const links = ["Services", "Clients", "How-to", "Contact"];
  return (
    <footer style={{ borderTop: "1px solid var(--hairline)", padding: "40px 0 60px" }}>
      <Container style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
        <nav style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
          {links.map((l) => <a key={l} href="#" style={{ fontFamily: "var(--f-sans)", fontWeight: 700, fontSize: "14px", letterSpacing: "-.35px", color: "var(--ink)", textDecoration: "none" }}>{l}</a>)}
        </nav>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px" }}>
          <ScrollReveal style={{ display: "inline-flex" }}>
            <BrandLogo variant="mark" height={48} src={A("brand/swh-logo.png")} />
          </ScrollReveal>
          <div style={{ display: "flex", gap: "40px", fontFamily: "var(--f-mono)", fontSize: "12px", color: "var(--accent)" }}>
            <span>© Software House Solutions · 2026</span>
            <span>All Rights Reserved</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
