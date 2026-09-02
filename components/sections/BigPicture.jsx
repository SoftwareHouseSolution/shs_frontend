/* Prototype source: SwhSections.jsx:189-216 — "See the big picture", ERP module list. */
import React from "react";
import { Reveal } from "@/components/ds/Reveal";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { NumberedList } from "@/components/ds/NumberedList";
import { PillButton } from "@/components/ds/PillButton";
import { Container } from "./Container";
import { ScrollReveal } from "./ScrollReveal";
import { HOME } from "@/content/home";
import { A } from "./assetPath";

export function BigPicture({ lang }) {
  const c = HOME[lang];
  return (
    <section style={{ display: "flex", justifyContent: "center", padding: "var(--section-y) 0" }}>
      <Container style={{ display: "flex", flexWrap: "wrap", gap: "48px", alignItems: "flex-start" }}>
        <Reveal style={{ flex: "1 1 440px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <SectionHeading level="head">{c.bigPictureHeading}</SectionHeading>
          <p style={{ margin: 0, font: "var(--body-copy)", color: "var(--body)", maxWidth: "460px" }}>
            {c.bigPictureBody}
          </p>
          <NumberedList items={c.modules} />
          <PillButton variant="secondary" style={{ marginTop: "12px" }}>{c.discoverMore}</PillButton>
        </Reveal>
        <Reveal duration={0.9} style={{ flex: "1 1 440px" }}>
          <ScrollReveal>
            <img src={A("services/gold.jpg")} alt={c.bigPictureImageAlt} style={{ width: "100%", height: "clamp(320px,40vw,640px)", objectFit: "cover", borderRadius: "var(--r-card)", display: "block" }} />
          </ScrollReveal>
        </Reveal>
      </Container>
    </section>
  );
}
