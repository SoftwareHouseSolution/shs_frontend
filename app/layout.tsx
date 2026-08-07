import type { Metadata } from "next";

// Import order mirrors the prototype's <link rel="stylesheet"> followed by its inline <style>.
// styles.css only @imports the five token files; prototype.css depends on those variables.
import "@/styles/styles.css";
import "./prototype.css";
// Site chrome (nav, drawer, carousel, page headers). Last, so it can layer on the tokens
// and the prototype rules without either being able to override it.
import "./chrome.css";

import { SiteNav } from "@/components/chrome/SiteNav";
import { SkipLink } from "@/components/chrome/SkipLink";
import { SocialRail } from "@/components/chrome/SocialRail";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: {
    default: SITE.name,
    template: `%s — ${SITE.name}`,
  },
  description: `${SITE.name} — POS-integrated ERP for the gold and diamond trade, plus enterprise software, hardware and networking. Leading the market since ${SITE.since}.`,
};

/* This file stays a SERVER component so `metadata` above works. SiteNav is a client
   component; the directive lives on the imported file, not the importer, and rendering it
   here keeps it a sibling of {children} rather than an ancestor — so its state changes
   re-render the bar only, never a page section. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* <div id="app"> is load-bearing, not a wrapper habit. #app{overflow-x:hidden} is what
            contains the hero's .ds-back cards (translateX ±60%) and the sage block that spans
            left:-110%/right:-110%. Moving the rule to html or body changes scroll-container
            semantics and reintroduces a horizontal scrollbar. It must also never be given a
            height: overflow-x:hidden computes overflow-y to auto, so a fixed height would move
            scrolling out of the viewport and break window.scrollY along with every scroll
            effect on the page. */}
        <div id="app">
          <SkipLink />
          <SiteNav />
          {children}
          {/* Fixed to the left edge, so it is deliberately a sibling of {children} rather
              than something a page has to opt into. Safe inside #app: a fixed element is
              only clipped by an ancestor's overflow when that ancestor is a containing
              block, and #app carries no transform or filter (see the comment above). */}
          <SocialRail />
        </div>
      </body>
    </html>
  );
}
