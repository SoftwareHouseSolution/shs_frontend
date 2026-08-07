/* Renders a page's content blocks using the real design-system primitives, so a stub page
   looks like the rest of the site rather than scaffolding.

   Server component. It deliberately does NOT import ScrollReveal: that file calls
   useEffect without a "use client" directive of its own, so importing it here would force
   the whole page into the client graph. Reveal and PillButton do carry the directive, so
   they are safe to render from the server. */

import { Reveal } from "@/components/ds/Reveal";
import { Eyebrow } from "@/components/ds/Eyebrow";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { FeatureCard } from "@/components/ds/FeatureCard";
import { NumberedList } from "@/components/ds/NumberedList";
import { StepCard } from "@/components/ds/StepCard";
import { SpecTable } from "@/components/ds/SpecTable";
import { PillButton } from "@/components/ds/PillButton";
import type { Photo, StubBlock } from "@/content/pages";

const body = { margin: 0, font: "var(--body-copy)", color: "var(--body)" } as const;

/* Plain <img> in a plain grid — no lightbox, no click-to-zoom, no state. Anything
   interactive here would need "use client", and this file being a server component is what
   keeps all 17 interior pages out of the client bundle (see the header note).

   The source set mixes portrait and landscape at wildly different aspect ratios, so the
   tiles fix their own ratio and crop rather than letting the row height jump. */
function PhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="swh-photo-grid">
      {photos.map((p) => (
        <img key={p.src} className="swh-photo-grid__img" src={p.src} alt={p.alt} decoding="async" loading="lazy" />
      ))}
    </div>
  );
}

function Block({ block }: { block: StubBlock }) {
  switch (block.kind) {
    case "intro":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "720px" }}>
          {block.eyebrow ? <Eyebrow>{block.eyebrow}</Eyebrow> : null}
          <SectionHeading level="head">{block.heading}</SectionHeading>
          <p style={{ ...body, maxWidth: "560px" }}>{block.body}</p>
        </div>
      );

    case "cards":
      return (
        <div style={{ width: "100%" }}>
          {block.heading ? (
            <SectionHeading level="sub" style={{ marginBottom: "32px" }}>
              {block.heading}
            </SectionHeading>
          ) : null}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", width: "100%" }}>
            {block.items.map((it) => (
              <div key={it.title} style={{ flex: "1 1 220px" }}>
                <FeatureCard title={it.title}>{it.body}</FeatureCard>
              </div>
            ))}
          </div>
        </div>
      );

    case "numbered":
      return (
        <div style={{ width: "100%", maxWidth: "760px" }}>
          {block.heading ? (
            <SectionHeading level="sub" style={{ marginBottom: "24px" }}>
              {block.heading}
            </SectionHeading>
          ) : null}
          <NumberedList items={block.items} />
        </div>
      );

    case "steps":
      return (
        <div style={{ width: "100%" }}>
          {block.heading ? (
            <SectionHeading level="sub" style={{ marginBottom: "32px" }}>
              {block.heading}
            </SectionHeading>
          ) : null}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", width: "100%" }}>
            {block.items.map((s) => (
              <div key={s.n} style={{ flex: "1 1 260px" }}>
                <StepCard n={s.n} title={s.title}>
                  {s.body}
                </StepCard>
              </div>
            ))}
          </div>
        </div>
      );

    case "spec":
      return (
        <div style={{ width: "100%" }}>
          {block.heading ? (
            <SectionHeading level="sub" style={{ marginBottom: "32px" }}>
              {block.heading}
            </SectionHeading>
          ) : null}
          <SpecTable columns={block.columns} rows={block.rows} />
        </div>
      );

    /* Reuses the home page's .swh-logo-wall rather than the design system's TrustedStrip:
       that component applies mixBlendMode "exclusion" at 0.6 opacity, which is right for
       flat marks on a dark strip and wrong for the colour brand logos this now carries. */
    case "logos":
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", width: "100%" }}>
          <span style={{ fontFamily: "var(--f-sans)", fontSize: "15px", color: "var(--body)" }}>{block.label}</span>
          <ul className="swh-logo-wall">
            {block.logos.map((l) => (
              <li key={l.src} className="swh-logo-wall__item">
                <img src={l.src} alt={l.alt} loading="lazy" decoding="async" />
              </li>
            ))}
          </ul>
        </div>
      );

    case "hardware":
      return (
        <div style={{ width: "100%" }}>
          {block.heading ? (
            <SectionHeading level="sub" style={{ marginBottom: "32px" }}>
              {block.heading}
            </SectionHeading>
          ) : null}
          <ul className="swh-hardware">
            {block.items.map((it) => (
              <li key={it.n} className="swh-hardware__item">
                <img src={it.image} alt={it.title} loading="lazy" decoding="async" />
                <p className="swh-hardware__n">{it.n}</p>
                <p className="swh-hardware__title">{it.title}</p>
              </li>
            ))}
          </ul>
        </div>
      );

    case "timeline":
      return (
        <ol className="swh-timeline">
          {block.items.map((e) => (
            <li key={e.title} className="swh-timeline__item">
              <div className="swh-timeline__marker" aria-hidden="true" />
              <div className="swh-timeline__body">
                {e.year ? <Eyebrow>{e.year}</Eyebrow> : null}
                <SectionHeading level="sub">{e.title}</SectionHeading>
                {e.paras.map((t) => (
                  <p key={t.slice(0, 40)} style={{ ...body, maxWidth: "62ch" }}>
                    {t}
                  </p>
                ))}
                <PhotoGrid photos={e.photos} />
              </div>
            </li>
          ))}
        </ol>
      );

    case "gallery":
      return (
        <div style={{ width: "100%" }}>
          {block.heading ? (
            <SectionHeading level="sub" style={{ marginBottom: "32px" }}>
              {block.heading}
            </SectionHeading>
          ) : null}
          <PhotoGrid photos={block.items} />
        </div>
      );

    case "cta": {
      // An off-site CTA opens in a new tab and says so; an in-site one must not.
      const external = /^https?:\/\//.test(block.href);
      return (
        <div className="swh-stub-cta">
          <SectionHeading level="sub">{block.heading}</SectionHeading>
          <p style={{ ...body, maxWidth: "52ch" }}>{block.body}</p>
          <PillButton
            variant="primary"
            arrow
            href={block.href}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer", "aria-label": `${block.label} — opens in a new tab` }
              : {})}
          >
            {block.label}
          </PillButton>
        </div>
      );
    }
  }
}

/* The section/container wrapper is inlined rather than imported from
   components/sections/. Those files are untyped .jsx with no .d.ts, so TypeScript infers
   every prop as required and `<Section>` alone fails to typecheck. Inlining the same
   values keeps this new code independent of the prototype sections instead of bending
   either one to fit. Values match Section.jsx and Container.jsx exactly. */
export function StubBody({ blocks }: { blocks: StubBlock[] }) {
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
        <div style={{ display: "flex", flexDirection: "column", gap: "72px", width: "100%" }}>
          {blocks.map((b, i) => (
            /* delay={i * 0.08} is the design system's stagger literal, the same one
               Services.jsx calls "the motion fingerprint". */
            <Reveal key={`${b.kind}-${i}`} delay={i * 0.08}>
              <Block block={b} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
