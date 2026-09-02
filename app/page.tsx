import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, LOCALE_LABEL } from "@/content/i18n";

/* The bare "/" — a language gate, not a page.

   Every real route lives under /en or /ar. Something still has to answer the root, and on
   this deployment that something cannot be a redirect: `output: "export"` writes plain
   files to a Bluehost Apache host, so next.config's `redirects`, `middleware` and
   next/navigation's `redirect()` are all unavailable. What ships instead is one small
   HTML document that forwards itself, in three layers, each a fallback for the last:

     1. An inline script that runs before paint and replaces the history entry — so the
        back button returns to wherever the visitor came from, not to this stub.
        location.replace, never location.href, for exactly that reason.
     2. <noscript><meta http-equiv="refresh"> — conforming inside noscript, and the path
        for a browser with scripting off.
     3. Two visible links, if both of the above are somehow blocked.

   The script prefers Arabic only when the browser actually asks for it, and falls back to
   DEFAULT_LOCALE otherwise. Note that this file is the ONLY place a language is chosen for
   the visitor; every other link on the site carries its locale explicitly.

   Trailing slashes are written out because the static export sets trailingSlash: true and
   Apache serves these as directories. `next dev` normalises the extra slash away. */

export const metadata: Metadata = {
  /* Not indexable: it holds no content, and letting it into the index would compete with
     the two real home pages. The hreflang pair on those points here as x-default anyway. */
  robots: { index: false, follow: true },
  alternates: { languages: { en: "/en", ar: "/ar", "x-default": "/en" } },
};

const REDIRECT = `(function(){
  try {
    var want = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    var lang = /^ar\\b/i.test(want) ? "ar" : "${DEFAULT_LOCALE}";
    location.replace("/" + lang + "/");
  } catch (e) {
    location.replace("/${DEFAULT_LOCALE}/");
  }
})();`;

export default function LanguageGate() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: REDIRECT }} />
      <noscript>
        <meta httpEquiv="refresh" content={`0;url=/${DEFAULT_LOCALE}/`} />
      </noscript>
      {/* Visible only if both the script and the refresh are blocked. Styled inline: this
          document is deliberately standalone and pulls in none of the site's chrome. */}
      <main style={{ font: "16px/1.5 system-ui, sans-serif", padding: "3rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Software House Solutions</h1>
        <ul style={{ listStyle: "none", padding: 0, margin: "1.5rem 0 0", display: "flex", gap: "1rem", justifyContent: "center" }}>
          {LOCALES.map((l) => (
            <li key={l}>
              <a href={`/${l}/`} hrefLang={l}>
                {LOCALE_LABEL[l]}
              </a>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
