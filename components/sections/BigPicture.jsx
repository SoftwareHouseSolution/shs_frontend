/* Prototype source: SwhSections.jsx:189-216 — "See the big picture", ERP module list. */
import React from "react";
import { Reveal } from "@/components/ds/Reveal";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { NumberedList } from "@/components/ds/NumberedList";
import { PillButton } from "@/components/ds/PillButton";
import { Container } from "./Container";
import { ScrollReveal } from "./ScrollReveal";
import { MODULES } from "./data";
import { A } from "./assetPath";

export function BigPicture() {
  return (
    <section style={{ display: "flex", justifyContent: "center", padding: "var(--section-y) 0" }}>
      <Container style={{ display: "flex", flexWrap: "wrap", gap: "48px", alignItems: "flex-start" }}>
        <Reveal style={{ flex: "1 1 440px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <SectionHeading level="head">See the big picture.</SectionHeading>
          <p style={{ margin: 0, font: "var(--body-copy)", color: "var(--body)", maxWidth: "460px" }}>
            One comprehensive, POS-integrated ERP turns your operation into clear, connected data — across every location and segment.
          </p>
          <NumberedList items={MODULES} />
          <PillButton variant="secondary" style={{ marginTop: "12px" }}>Discover More</PillButton>
        </Reveal>
        <Reveal duration={0.9} style={{ flex: "1 1 440px" }}>
          <ScrollReveal>
            <img src={A("services/gold.jpg")} alt="Gold & Diamond ERP" style={{ width: "100%", height: "clamp(320px,40vw,640px)", objectFit: "cover", borderRadius: "var(--r-card)", display: "block" }} />
          </ScrollReveal>
        </Reveal>
      </Container>
    </section>
  );
}
