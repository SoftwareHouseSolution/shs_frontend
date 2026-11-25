/* /e-jewelry/download — the stable link the install page's QR encodes and people share.

   It forwards to whichever APK latest.json names, so the QR never changes between builds.
   A page rather than a server redirect because this app also ships as a static export (see
   next.config.ts), where no route can answer with a 302 — the same reason app/page.tsx is a
   page. Three layers, like that one: a script that reads latest.json and replaces this
   history entry with the APK; <noscript> refresh to the install page; a visible link.
   If nginx ever answers this path with a real 302, nothing else has to change. */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-Jewelry",
  robots: { index: false, follow: true },
};

const FORWARD = `(function(){
  var home = "/e-jewelry/";
  fetch("/e-jewelry/android/latest.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      location.replace(j && /^EJewelry-[0-9]+[.]apk$/.test(j.apk) ? "/e-jewelry/android/" + j.apk : home);
    })
    .catch(function () { location.replace(home); });
})();`;

export default function Download() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: FORWARD }} />
      <noscript>
        <meta httpEquiv="refresh" content="0;url=/e-jewelry/" />
      </noscript>
      <main style={{ font: "16px/1.5 system-ui, sans-serif", padding: "3rem", textAlign: "center" }}>
        <a href="/e-jewelry/">E-Jewelry</a>
      </main>
    </>
  );
}
