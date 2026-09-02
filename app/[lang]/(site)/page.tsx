"use client";

/* Home page. The shell (nav, .page-content, footer spacer, sticky footer) lives in
   components/chrome/PageShell.tsx via app/[lang]/(site)/layout.tsx.

   "use client" stays here because none of the section files carry the directive
   themselves — they all rely on being pulled into the client graph by their importer.

   That directive is also why the locale is read with useParams() rather than awaited from
   the `params` promise: a client component cannot be async. The value is the same one the
   server layout validated, and both /en and /ar are prerendered, so it is present on the
   first render rather than arriving after hydration. */

/* The prototype's <Header/> section (logo left, "Learn More" pill right, in normal flow)
   is deliberately not rendered here: the site-wide navbar carries both a logo and a CTA,
   so it would duplicate them within one screen height. The file stays on disk unedited,
   exactly like NavPill, and can be re-mounted at any time. */

import { useParams } from "next/navigation";
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
import { DEFAULT_LOCALE, isLocale } from "@/content/i18n";

export default function Page() {
  const params = useParams<{ lang: string }>();
  const lang = isLocale(params?.lang) ? params.lang : DEFAULT_LOCALE;

  return (
    <>
      <HeroCarousel lang={lang} />
      {/* Device-mockup hero ("Run your jewellery business." + the tablet/phone/desktop
          stack) — commented out. The component and its import are left in place so it
          can be restored by uncommenting both. */}
      {/* <Hero /> */}
      {/* The figures come first, immediately under the hero: since 1988, 1,750+ stores,
          96% of the market is the strongest thing on the page and it used to sit eight
          sections down, below the closing CTA. */}
      <StatsRow lang={lang} />
      <LogoWall lang={lang} />
      <Services lang={lang} />
      <BigPicture lang={lang} />
      <Specs lang={lang} />
      <Testimonial lang={lang} />
      <HowTo lang={lang} />
      <EventsRail lang={lang} />
      {/* The client's closing CTA. Contact stays below it — that section carries the
          address, phone and email, which this one does not. */}
      <StatsBand lang={lang} />
      <Contact lang={lang} />
    </>
  );
}
