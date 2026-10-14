/* The first-load screen: the brand mark on the page canvas while fonts, the hero media and
   the logo strip arrive, then a soft fade into the page.

   Server component, deliberately. The overlay is in the first byte of HTML, so there is no
   frame of half-styled page before it; and it is dismissed by the small inline script right
   after it, not by React, so it does not have to wait for the JavaScript bundle to download
   and hydrate.

   Rules it keeps:
   - It only becomes VISIBLE after a short delay (CSS, --pre-delay). A fast load finishes
     before then and the visitor never sees it — a splash on a fast connection is pure cost.
   - Once per visit (sessionStorage). Moving between pages does not bring it back; the
     navigation progress bar covers those.
   - Never past MAX_WAIT_MS after the visitor clicked (measured from navigation start, not
     from when this script runs — on a slow line the stylesheet alone can take seconds,
     and the wait the visitor feels began at the click). A page that is already that slow
     dismisses the screen before its fade-in delay, so it never appears at all.
   - Never blocks input (pointer-events: none) — the page beneath is real and usable.
   - JavaScript off: hidden by the <noscript> style, so it can never trap anyone.
   - Reduced motion: no pulse, no sliding bar — a still mark that fades.

   The inline script changes data-state before React hydrates, hence suppressHydrationWarning
   on the overlay (it covers that one element's attributes only). */

import { UI } from "@/content/ui";
import { HTML_LANG, type Locale } from "@/content/i18n";
import { PRELOADER_MARK } from "./preloaderMark";

const MAX_WAIT_MS = 3500;
const SESSION_KEY = "swh:preloaded";

/* Ready = web fonts settled AND the window's load event (images, including the hero still
   or the video's poster). Video data itself does not hold the load event. */
const DISMISS = `(function(){
  var el = document.getElementById("swh-preloader");
  if (!el) return;
  try {
    if (sessionStorage.getItem("${SESSION_KEY}")) { el.setAttribute("data-state", "gone"); return; }
    sessionStorage.setItem("${SESSION_KEY}", "1");
  } catch (e) {}
  var finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    el.setAttribute("data-state", "leaving");
    setTimeout(function () { el.setAttribute("data-state", "gone"); }, 600);
  }
  var cap = setTimeout(finish, Math.max(0, ${MAX_WAIT_MS} - performance.now()));
  var fonts = (document.fonts && document.fonts.ready) || Promise.resolve();
  var loaded = new Promise(function (resolve) {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", resolve, { once: true });
  });
  Promise.all([fonts, loaded]).then(function () { clearTimeout(cap); finish(); }, finish);
})();`;

export function Preloader({
  lang,
  logoOnLight,
  logoOnDark,
}: {
  lang: Locale;
  logoOnLight: string | null;
  logoOnDark: string | null;
}) {
  // A CMS logo replaces the built-in mark; with only one uploaded, it serves both themes.
  const logos = { light: logoOnLight ?? logoOnDark, dark: logoOnDark ?? logoOnLight };
  return (
    <>
      <div
        id="swh-preloader"
        className="swh-preloader"
        data-state="loading"
        role="status"
        lang={HTML_LANG[lang]}
        suppressHydrationWarning
      >
        <div className="swh-preloader__mark" aria-hidden="true">
          {/* The built-in mark is embedded in the HTML (see tools/make-preloader-mark.mjs):
              this screen shows when the network is slow, so its image must not be a request
              of its own. One per theme, CSS shows the right one. A logo uploaded in the CMS
              is used instead when set. */}
          {(["light", "dark"] as const).map((theme) => {
            const src = theme === "light" ? logos.light ?? PRELOADER_MARK.light : logos.dark ?? PRELOADER_MARK.dark;
            const builtIn = src === PRELOADER_MARK[theme];
            return (
              <img
                key={theme}
                className={`swh-preloader__logo swh-theme-${theme}`}
                src={src}
                width={builtIn ? Math.round((PRELOADER_MARK.width / PRELOADER_MARK.height) * 44) : undefined}
                height={44}
                alt=""
                fetchPriority="high"
              />
            );
          })}
        </div>
        <div className="swh-preloader__track" aria-hidden="true">
          <span />
        </div>
        <span className="swh-vh">{UI[lang].loading}</span>
      </div>
      <script dangerouslySetInnerHTML={{ __html: DISMISS }} />
      <noscript>
        <style>{"#swh-preloader{display:none}"}</style>
      </noscript>
    </>
  );
}
