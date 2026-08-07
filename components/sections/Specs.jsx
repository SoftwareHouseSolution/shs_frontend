/* Prototype source: SwhSections.jsx:218-240 — "Why choose SWH?" comparison table. */
import React from "react";
import { Reveal } from "@/components/ds/Reveal";
import { Eyebrow } from "@/components/ds/Eyebrow";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { SpecTable } from "@/components/ds/SpecTable";
import { Section } from "./Section";

export function Specs() {
  return (
    <Section id="specs">
      <Reveal style={{ marginBottom: "40px", textAlign: "center" }}>
        <Eyebrow>Specs</Eyebrow>
        <SectionHeading level="head" align="center" style={{ marginTop: "12px" }}>Why choose SWH?</SectionHeading>
      </Reveal>
      <Reveal style={{ width: "100%" }}>
        <SpecTable
          columns={[{ label: "SWH", highlight: true }, { label: "Generic vendor" }, { label: "In-house" }]}
          rows={[
            { cells: [{ ok: true, text: "40 yrs Gold & Diamond domain" }, { ok: false, text: "Generic ERP" }, { ok: false, text: "Build from zero" }] },
            { cells: [{ ok: true, text: "POS-integrated ERP" }, { ok: true, text: "Add-on POS" }, { ok: false, text: "Manual entry" }] },
            { cells: [{ ok: true, text: "Local support + training" }, { ok: false, text: "Remote only" }, { ok: false, text: "None" }] },
            { cells: [{ ok: true, text: "Regional presence" }, { ok: false, text: "Single market" }, { ok: false, text: "None" }] },
            { cells: [{ ok: true, text: "1,050+ jewellery clients" }, { ok: true, text: "Varies" }, { ok: false, text: "Unproven" }] },
          ]}
        />
      </Reveal>
    </Section>
  );
}
