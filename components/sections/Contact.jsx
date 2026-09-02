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
import { SITE, SITE_L } from "@/content/site";
import { HOME } from "@/content/home";
import { Section } from "./Section";

export function Contact({ lang }) {
  const c = HOME[lang];
  return (
    <Section id="contact">
      <Reveal style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", textAlign: "center", width: "100%" }}>
        <SectionHeading level="head" align="center">{c.contactHeading}</SectionHeading>
        <p style={{ margin: 0, font: "var(--body-copy)", color: "var(--body)", maxWidth: "560px" }}>
          {c.contactBody}{" "}
          {/* The address, number and email are ONE left-to-right run, pinned with dir and
              a bidi isolate. Dropped raw into an Arabic paragraph the bidi algorithm
              reorders the separating dots around the neutral runs, and the line comes out
              as "Sales@... · 99 شارع ... · +20 15" with the dots in the wrong places. */}
          <span dir="ltr" style={{ unicodeBidi: "isolate" }}>
            {SITE_L[lang].address} · {SITE.phone} · {SITE.salesEmail}
          </span>
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
            {c.contactCta}
          </PillButton>
        </div>
      </Reveal>
    </Section>
  );
}
