"use client";

/* Prototype source: SwhSections.jsx:307-325 — structurally. Heading, text, address, phone,
   e-mail and the WhatsApp link all come from the CMS (Site settings → Contact), because
   this section is mounted on more than one route (see CONTACT_ROUTES in content/site.ts).

   WhatsApp stays the primary action: it is the channel the company answers fastest. The
   enquiry form beneath it is the alternative for people who would rather write — it posts
   to the API and reports back in the reader's language (components/sections/EnquiryForm). */
import React from "react";
import { Reveal } from "@/components/ds/Reveal";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { PillButton } from "@/components/ds/PillButton";
import { useSite } from "@/components/chrome/SiteContext";
import { Section } from "./Section";
import { EnquiryForm } from "./EnquiryForm";

export function Contact({ lang }) {
  const { settings } = useSite();
  const c = settings.contact;
  return (
    <Section id="contact">
      <Reveal style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", textAlign: "center", width: "100%" }}>
        <SectionHeading level="head" align="center">{c.heading}</SectionHeading>
        <p style={{ margin: 0, font: "var(--body-copy)", color: "var(--body)", maxWidth: "560px" }}>
          {c.body}{" "}
          {/* The address, number and email are ONE left-to-right run, pinned with dir and
              a bidi isolate. Dropped raw into an Arabic paragraph the bidi algorithm
              reorders the separating dots around the neutral runs. The number and the
              address are links: on a phone, a number you cannot tap is one you have to
              copy by hand. */}
          <span dir="ltr" style={{ unicodeBidi: "isolate" }}>
            {settings.address} ·{" "}
            <a className="swh-inline-link" href={`tel:${settings.phoneLink}`}>{settings.phoneDisplay}</a> ·{" "}
            <a className="swh-inline-link" href={`mailto:${settings.salesEmail}`}>{settings.salesEmail}</a>
          </span>
        </p>
        <div style={{ width: "100%", maxWidth: "860px", marginTop: "12px" }}>
          <PillButton
            variant="primary"
            arrow
            fullWidth
            href={settings.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.ctaLabel}
          </PillButton>
        </div>
      </Reveal>
      <Reveal delay={0.08} style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "40px" }}>
        <EnquiryForm lang={lang} />
      </Reveal>
    </Section>
  );
}
