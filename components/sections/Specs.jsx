/* Prototype source: SwhSections.jsx:218-240 — "Why choose SWH?" comparison table. */
import React from "react";
import { Reveal } from "@/components/ds/Reveal";
import { Eyebrow } from "@/components/ds/Eyebrow";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { SpecTable } from "@/components/ds/SpecTable";
import { Section } from "./Section";
/* The comparison table chosen on the Home page in the CMS. */
export function Specs({ specs: c }) {
  return (
    <Section id="specs">
      <Reveal style={{ marginBottom: "40px", textAlign: "center" }}>
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <SectionHeading level="head" align="center" style={{ marginTop: "12px" }}>{c.heading}</SectionHeading>
      </Reveal>
      <Reveal style={{ width: "100%" }}>
        {/* .swh-spec repairs the table below 700px — see the note in app/chrome.css.
            --spec-cols carries the column count because the fix rebuilds the grid. */}
        <div className="swh-spec" style={{ "--spec-cols": c.columns.length }}>
          {/* `highlight` marks SWH's own column — set per column in the CMS, so it is
              not a position in a left-to-right reading order. */}
          <SpecTable columns={c.columns} rows={c.rows} />
        </div>
      </Reveal>
    </Section>
  );
}
