/* Prototype source: SwhSections.jsx:283-305 — "Map your success" three-step flow. */
import React from "react";
import { Reveal } from "@/components/ds/Reveal";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { StepCard } from "@/components/ds/StepCard";
import { PillButton } from "@/components/ds/PillButton";
import { Section } from "./Section";
import { STEPS } from "./data";

export function HowTo() {
  return (
    <Section id="how-to">
      <Reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%", flexWrap: "wrap", gap: "20px", marginBottom: "56px" }}>
        <SectionHeading level="head">Map your success.</SectionHeading>
        <PillButton variant="secondary" href="#contact">Discover More</PillButton>
      </Reveal>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", width: "100%" }}>
        {STEPS.map((s, i) => (
          <Reveal key={i} delay={i * 0.08} style={{ flex: "1 1 260px" }}>
            <StepCard n={s.n} title={s.title}>{s.body}</StepCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
