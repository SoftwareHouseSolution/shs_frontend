/* Prototype source: SwhSections.jsx:76-101

   Two nested transform contexts here, deliberately: the fan lives on the .ds-back wrapper
   divs (prototype.css) and the ken-burns zoom lives on the child image, via .hero-photo.
   Collapsing the wrapper into the image would destroy both animations. */
import React from "react";
import { Reveal } from "@/components/ds/Reveal";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { Container } from "./Container";
import { A } from "./assetPath";

export function Hero() {
  return (
    <section style={{ minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "clamp(96px,14vh,150px)", boxSizing: "border-box", overflow: "hidden" }}>
      <Container style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minHeight: 0, width: "100%" }}>
        <Reveal>
          <SectionHeading level="hero" as="h1" align="center" style={{ fontSize: "clamp(44px,7vw,96px)", letterSpacing: "-0.03em" }}>Run your jewellery business.</SectionHeading>
        </Reveal>
        <Reveal duration={0.9} delay={0.1} style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "clamp(28px,5vh,64px)" }}>
          <div className="dashboard-stack" style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ position: "absolute", left: "-110%", right: "-110%", bottom: "-6%", top: "40%", background: "var(--sage)", borderRadius: "var(--r-card)", zIndex: 0 }} />
            <div className="ds-back ds-back--left">
              <img className="hero-photo" src={A("imagery/tablet.png")} alt="SWH ERP on tablet" style={{ width: "auto", height: "auto", maxWidth: "min(400px,38vw)", maxHeight: "44vh", objectFit: "contain", display: "block", borderRadius: "16px" }} />
            </div>
            <div className="ds-back ds-back--right">
              <img className="hero-photo" src={A("imagery/desktop.png")} alt="SWH ERP on desktop" style={{ width: "auto", height: "auto", maxWidth: "min(400px,38vw)", maxHeight: "44vh", objectFit: "contain", display: "block", borderRadius: "14px" }} />
            </div>
            <div className="ds-center">
              <img className="hero-photo" src={A("imagery/ipad2.png")} alt="SWH ERP dashboard on mobile" style={{ width: "auto", height: "auto", maxWidth: "min(340px,60vw)", maxHeight: "54vh", objectFit: "contain", display: "block" }} />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
