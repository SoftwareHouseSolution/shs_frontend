import type { Metadata } from "next";

// Import order mirrors the prototype's <link rel="stylesheet"> followed by its inline <style>.
// styles.css only @imports the five token files; prototype.css depends on those variables.
import "@/styles/styles.css";
import "./prototype.css";
// Site chrome (nav, drawer, carousel, page headers). Last, so it can layer on the tokens
// and the prototype rules without either being able to override it.
import "./chrome.css";
// Right-to-left corrections, last of all: every rule in it is scoped to [dir="rtl"], so it
// is inert on an English page and can only ever add to the cascade, never reorder it.
import "./rtl.css";

import { DEFAULT_LOCALE, HTML_LANG, DIR } from "@/content/i18n";

/* Titles and descriptions come from the CMS per language — see app/[lang]/layout.tsx.
   The root only sets what holds for every document, including the language gate and
   the bare 404. */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

/* THE DOCUMENT. Deliberately thin: it owns <html> and <body> and nothing else.

   Why the chrome is NOT here any more. Every page now lives under app/[lang]/, and the
   nav, the skip link and the social rail all need to know which language they are in.
   A root layout receives no params — it sits above the dynamic segment — so they moved
   down one level to app/[lang]/layout.tsx, which does.

   Why <html lang> is the DEFAULT locale rather than the real one. Same reason: this file
   cannot see the route's params. app/[lang]/layout.tsx therefore puts the true `lang` and
   `dir` on #app, which it does own, and #app contains every visible element on the page —
   so the Arabic pages render right-to-left in the SERVER HTML, with no flash and no
   dependency on JavaScript. HtmlLangSync then copies the pair up onto <html> after mount,
   which is what fixes the scrollbar side and the UA's own text-selection direction.

   The consequence to remember: an assistive technology reading the document element alone
   sees "en" for a beat on an Arabic page. Everything it actually reads is inside #app and
   correctly marked. If Next ever lets a root layout read params, move it back up. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={HTML_LANG[DEFAULT_LOCALE]} dir={DIR[DEFAULT_LOCALE]}>
      <body>{children}</body>
    </html>
  );
}
