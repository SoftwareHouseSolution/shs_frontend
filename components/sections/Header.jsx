/* Prototype source: SwhSections.jsx:66-74
   Header: logo (left) + CTA (right), normal flow, scrolls away. */
import React from "react";
import { BrandLogo } from "@/components/ds/BrandLogo";
import { PillButton } from "@/components/ds/PillButton";
import { Container } from "./Container";
import { A } from "./assetPath";

export function Header() {
  return (
    <Container style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "28px", paddingBottom: "8px" }}>
      <BrandLogo variant="lockup" height={40} src={A("brand/swh-logo.png")} />
      <PillButton variant="primary" arrow href="#contact">Learn More</PillButton>
    </Container>
  );
}
