/* Prototype source: SwhSections.jsx:307-325 — structurally, but no longer verbatim: the
   address and phone were updated from the 2026 company profile (see content/site.ts).

   The CTA is a local state toggle with no submission — same as the prototype. There is no
   enquiry-form backend; see PRODUCT.md "Capabilities and Constraints". */
import React, { useState } from "react";
import { Reveal } from "@/components/ds/Reveal";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { PillButton } from "@/components/ds/PillButton";
import { Section } from "./Section";

export function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <Section id="contact">
      <Reveal style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", textAlign: "center", width: "100%" }}>
        <SectionHeading level="head" align="center">Connect with us.</SectionHeading>
        <p style={{ margin: 0, font: "var(--body-copy)", color: "var(--body)", maxWidth: "560px" }}>
          Let us give you more details about our software solutions. 99 Omar ibn El-khtab · +20 15 58856988 · Sales@Softwarehouse-sol.com
        </p>
        <div style={{ width: "100%", maxWidth: "860px", marginTop: "12px" }}>
          <PillButton variant="primary" arrow fullWidth onClick={() => setSent(true)}>
            {sent ? "Thanks — we'll be in touch" : "Learn More"}
          </PillButton>
        </div>
      </Reveal>
    </Section>
  );
}
