"use client";

/* Home page. The shell (nav, .page-content, footer spacer, sticky footer) lives in
   components/chrome/PageShell.tsx via app/(site)/layout.tsx.

   "use client" stays here because none of the section files carry the directive
   themselves — they all rely on being pulled into the client graph by their importer. */

/* The prototype's <Header/> section (logo left, "Learn More" pill right, in normal flow)
   is deliberately not rendered here: the site-wide navbar carries both a logo and a CTA,
   so it would duplicate them within one screen height. The file stays on disk unedited,
   exactly like NavPill, and can be re-mounted at any time. */

import { HeroCarousel } from "@/components/hero/HeroCarousel";
// import { Hero } from "@/components/sections/Hero";
import { LogoWall } from "@/components/sections/LogoWall";
import { Services } from "@/components/sections/Services";
import { BigPicture } from "@/components/sections/BigPicture";
import { Specs } from "@/components/sections/Specs";
import { Testimonial } from "@/components/sections/Testimonial";
import { HowTo } from "@/components/sections/HowTo";
import { EventsRail } from "@/components/sections/EventsRail";
import { StatsRow } from "@/components/sections/StatsRow";
import { StatsBand } from "@/components/sections/StatsBand";
import { Contact } from "@/components/sections/Contact";

export default function Page() {
  return (
    <>
      <HeroCarousel />
      {/* Device-mockup hero ("Run your jewellery business." + the tablet/phone/desktop
          stack) — commented out. The component and its import are left in place so it
          can be restored by uncommenting both. */}
      {/* <Hero /> */}
      {/* The figures come first, immediately under the hero: since 1988, 1,750+ stores,
          96% of the market is the strongest thing on the page and it used to sit eight
          sections down, below the closing CTA. */}
      <StatsRow />
      <LogoWall />
      <Services />
      <BigPicture />
      <Specs />
      <Testimonial />
      <HowTo />
      <EventsRail />
      {/* The client's closing CTA. Contact stays below it — that section carries the
          address, phone and email, which this one does not. */}
      <StatsBand />
      <Contact />
    </>
  );
}
