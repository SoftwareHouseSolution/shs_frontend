/* Closing band on the home page: the client's final call to action.

   The trust figures that used to sit under this CTA now open the page instead — see
   components/sections/StatsRow.tsx for why. What is left is a plain server component:
   with the count-up gone there is no state, no observer and no rAF loop here, so the
   "use client" directive went with them.

   Copy is from the client's ui_ux/…/"website start and end and numbers.docx".

   The section/container wrapper is inlined rather than imported from Section.jsx and
   Container.jsx, for the same reason StubBody.tsx inlines it: those files are untyped
   .jsx with no .d.ts, so TypeScript infers every prop as required and <Section> alone
   fails to typecheck. Values match Section.jsx and Container.jsx exactly. */

import { Reveal } from "@/components/ds/Reveal";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { PillButton } from "@/components/ds/PillButton";
import { SITE } from "@/content/site";

export function StatsBand() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "var(--section-y) 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1600,
          marginLeft: "auto",
          marginRight: "auto",
          padding: "0 var(--gutter)",
          boxSizing: "border-box",
        }}
      >
        <Reveal style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", textAlign: "center", width: "100%" }}>
          <SectionHeading level="head" align="center">
            Ready to transform your jewellery business?
          </SectionHeading>
          <p style={{ margin: 0, font: "var(--body-copy)", color: "var(--body)", maxWidth: "58ch" }}>
            Whether you are opening your first store, managing multiple branches or expanding
            internationally, our jewellery management system covers inventory, sales, production,
            accounting and business performance in one platform.
          </p>
          <PillButton variant="primary" arrow href={SITE.demoHref}>
            Schedule your free demo
          </PillButton>
        </Reveal>
      </div>
    </section>
  );
}
