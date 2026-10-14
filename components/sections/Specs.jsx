/* Prototype source: SwhSections.jsx:218-240 — "Why choose SWH?" comparison table. */
import React from "react";
import { Reveal } from "@/components/ds/Reveal";
import { Eyebrow } from "@/components/ds/Eyebrow";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { SpecTable } from "@/components/ds/SpecTable";
import { Section } from "./Section";
import { HOME } from "@/content/home";

export function Specs({ lang }) {
  const c = HOME[lang];
  return (
    <Section id="specs">
      <Reveal style={{ marginBottom: "40px", textAlign: "center" }}>
        <Eyebrow>{c.specsEyebrow}</Eyebrow>
        <SectionHeading level="head" align="center" style={{ marginTop: "12px" }}>{c.specsHeading}</SectionHeading>
      </Reveal>
      <Reveal style={{ width: "100%" }}>
        {/* .swh-spec repairs the table below 700px — see the note in app/chrome.css.
            --spec-cols carries the column count because the fix rebuilds the grid. */}
        <div className="swh-spec" style={{ "--spec-cols": c.specColumns.length }}>
          <SpecTable
            /* The first column is the highlighted one in both languages: it is SWH's own
               column, not a position in a left-to-right reading order. */
            columns={c.specColumns.map((label, i) => (i === 0 ? { label, highlight: true } : { label }))}
            rows={c.specRows.map((cells) => ({ cells }))}
          />
        </div>
      </Reveal>
    </Section>
  );
}
