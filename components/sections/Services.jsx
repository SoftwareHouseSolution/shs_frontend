/* Prototype source: SwhSections.jsx:156-187 — services intro + card grid.
   Card stagger is delay={i * 0.08}; keep the literal, it is the motion fingerprint. */
import React from "react";
import { Reveal } from "@/components/ds/Reveal";
import { Eyebrow } from "@/components/ds/Eyebrow";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { FeatureCard } from "@/components/ds/FeatureCard";
import { Section } from "./Section";
import { ScrollReveal } from "./ScrollReveal";
/* Copy, cards and image come from the CMS (Home page → Services). */
export function Services({ section: c }) {
  return (
    <Section id="services">
      <Reveal style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "720px", marginBottom: "64px" }}>
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <SectionHeading level="head">{c.heading}</SectionHeading>
        <p style={{ margin: 0, font: "var(--body-copy)", color: "var(--body)", maxWidth: "560px" }}>
          {c.body}
        </p>
      </Reveal>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", width: "100%" }}>
        {c.items.map((s, i) => (
          <Reveal key={i} delay={i * 0.08} style={{ flex: "1 1 220px" }}>
            <FeatureCard title={s.title}>{s.body}</FeatureCard>
          </Reveal>
        ))}
      </div>
      {c.image ? <Reveal duration={0.9} style={{ width: "100%", marginTop: "56px" }}>
        <ScrollReveal>
          <img src={c.image} alt={c.imageAlt} style={{ width: "100%", height: "clamp(280px,42vw,620px)", objectFit: "cover", borderRadius: "var(--r-card)", display: "block" }} />
        </ScrollReveal>
      </Reveal> : null}
    </Section>
  );
}
