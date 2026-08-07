/* Prototype source: SwhSections.jsx:307-325 — structurally, but no longer verbatim: the
   address and phone were updated from the 2026 company profile (see content/site.ts).

   The CTA used to be a local state toggle that flipped the label to "Thanks — we'll be in
   touch" and submitted nothing, which promised a reply the site could not deliver. There
   is still no enquiry-form backend (see PRODUCT.md "Capabilities and Constraints"), so the
   button now opens the real channel the company already answers on: WhatsApp. No state,
   no fake confirmation. */
import React from "react";
import { Reveal } from "@/components/ds/Reveal";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { PillButton } from "@/components/ds/PillButton";
import { SITE } from "@/content/site";
import { Section } from "./Section";

export function Contact() {
  return (
    <Section id="contact">
      <Reveal style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", textAlign: "center", width: "100%" }}>
        <SectionHeading level="head" align="center">Connect with us.</SectionHeading>
        <p style={{ margin: 0, font: "var(--body-copy)", color: "var(--body)", maxWidth: "560px" }}>
          Let us give you more details about our software solutions. {SITE.address} · {SITE.phone} · {SITE.salesEmail}
        </p>
        <div style={{ width: "100%", maxWidth: "860px", marginTop: "12px" }}>
          <PillButton
            variant="primary"
            arrow
            fullWidth
            href={SITE.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message us on WhatsApp
          </PillButton>
        </div>
      </Reveal>
    </Section>
  );
}
