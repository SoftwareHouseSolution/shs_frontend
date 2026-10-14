"use client";

/* The home page's sections, in order. A client component because most section files
   (ScrollReveal, Testimonial, …) carry no "use client" of their own and rely on their
   importer — the page itself is a server component that fetches the content and passes
   it down. Sections the CMS leaves empty are skipped rather than rendered as husks. */

import { HeroCarousel } from "@/components/hero/HeroCarousel";
import { LogoWall } from "./LogoWall";
import { Services } from "./Services";
import { BigPicture } from "./BigPicture";
import { Specs } from "./Specs";
import { Testimonial } from "./Testimonial";
import { HowTo } from "./HowTo";
import { EventsRail } from "./EventsRail";
import { StatsRow } from "./StatsRow";
import { StatsBand } from "./StatsBand";
import { Contact } from "./Contact";
import type { Locale } from "@/content/i18n";
import type { HomeData } from "@/lib/api/types";

export function HomeSections({ lang, home }: { lang: Locale; home: HomeData }) {
  return (
    <>
      {home.hero.length > 0 ? <HeroCarousel lang={lang} slides={home.hero} /> : null}
      {/* The figures come first, immediately under the hero: since 1988, 1,750+ stores,
          96% of the market is the strongest thing on the page. */}
      {home.figures.stats.length > 0 ? <StatsRow figures={home.figures} /> : null}
      <LogoWall lang={lang} proof={home.proof} />
      <Services section={home.services} />
      <BigPicture section={home.bigPicture} discoverMoreLabel={home.discoverMoreLabel} />
      {home.specs ? <Specs specs={home.specs} /> : null}
      {home.testimonial ? <Testimonial testimonial={home.testimonial} /> : null}
      <HowTo howTo={home.howTo} />
      {home.events.items.length > 0 ? <EventsRail lang={lang} events={home.events} /> : null}
      {/* The client's closing CTA. Contact stays below it — that section carries the
          address, phone and email, which this one does not. */}
      <StatsBand lang={lang} band={home.band} />
      <Contact lang={lang} />
    </>
  );
}
