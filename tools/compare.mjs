/**
 * RETIRED as a live gate. Kept for reference and for re-verifying the port if the
 * home page is ever rolled back to the prototype layout.
 *
 * This asserted that `/` matched the design-system prototype at 0 differing pixels. That
 * held through commit 9a052f9. It no longer does, deliberately: `/` now carries the
 * site-wide navbar (replacing the floating NavPill) and the immersive hero carousel, so
 * there is no longer a prototype to match. Expect it to fail, and expect it to hang on
 * `networkidle` because the navbar prefetches 17 routes.
 *
 * The parity guarantee that IS still live is tools/check-ds-parity.mjs — the copied
 * design-system components and tokens remain byte-identical to their source.
 * Current behavioural gates: tools/check-nav.mjs and tools/check-hero.mjs.
 *
 * Pixel + motion parity harness: the design-system prototype vs the Next.js port.
 *
 *   Prototype: npx -y serve@latest "<DS root>" -l 4173
 *              → http://localhost:4173/ui_kits/swh-marketing
 *   Port:      pnpm dev  → http://localhost:3000
 *
 *   node tools/compare.mjs
 *
 * Writes screenshots and diff maps to tools/out/ (gitignored).
 *
 * The marquee in TrustedBy runs a continuous rAF and can never pixel-match, so it is frozen
 * identically in both targets before capture and its motion is verified separately by
 * sampling transform deltas.
 */
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "out");
// The trailing slash is required. `serve` rewrites /…/index.html to /…/swh-marketing, and
// without the slash the page's relative `src="SwhSections.jsx"` resolves one directory up
// and 404s, leaving the reference page blank.
const PROTO = "http://localhost:4173/ui_kits/swh-marketing/";
/* Defaults to the dev server. Point PORT_URL at `next start` for the authoritative run:
   dev mode injects a fixed dev-indicator badge in the bottom-left of the viewport, which the
   prototype has no equivalent of and which shows up as the only residual pixel difference. */
const PORT = process.env.PORT_URL ?? "http://localhost:3000/";
/* Full breakpoint sweep by default. Set WIDTHS=1440 for a quick intermediate check —
   use the full sweep before claiming parity. */
const WIDTHS = process.env.WIDTHS
  ? process.env.WIDTHS.split(",").map(Number)
  : [1440, 1280, 1279, 1200, 1199, 800, 799, 375];
const PRIMARY = 1440;

mkdirSync(OUT, { recursive: true });

const results = [];
const record = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

/** Load a page, wait for images and fonts, settle past the 11s ken-burns, freeze the marquee. */
async function settle(page, url, { freezeMarquee = true } = {}) {
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete), null, { timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
  // ken-burns is `forwards` over 11s, so both targets settle at scale(1.14).
  await page.waitForTimeout(12_000);
  if (freezeMarquee) {
    await page.evaluate(() => {
      const track = document.querySelector('[style*="max-content"]');
      if (track) {
        const clone = track.cloneNode(true);
        track.parentNode.replaceChild(clone, track); // detaches the rAF's node reference
        clone.style.transform = "translate3d(0px,0,0)";
      }
    });
  }
  await page.waitForTimeout(300);
  return errors;
}

async function fullPage(page) {
  return PNG.sync.read(await page.screenshot({ fullPage: true }));
}

async function run() {
  const browser = await chromium.launch();

  // ---------- 1. Layout parity across breakpoints ----------
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: "reduce", // freezes ken-burns + fires every Reveal, so the diff measures layout
    });
    const a = await ctx.newPage();
    const b = await ctx.newPage();
    const errA = await settle(a, PROTO);
    const errB = await settle(b, PORT);

    const [hA, hB] = await Promise.all([
      a.evaluate(() => document.documentElement.scrollHeight),
      b.evaluate(() => document.documentElement.scrollHeight),
    ]);
    record(`scrollHeight @${width}`, Math.abs(hA - hB) <= 2, `prototype ${hA}px vs port ${hB}px`);

    let [imgA, imgB] = [await fullPage(a), await fullPage(b)];
    /* The two canvases can differ by ~1px in height because the prototype latches a stale
       footer measurement (see tools/probe.mjs: every section matches to 0.000px; only the
       footer spacer differs, 208px vs an actual offsetHeight of 207px). That is a
       load-timing artifact of the prototype's own single measurement, not a code
       difference. Crop both to the common height so the content can actually be compared;
       the height delta itself is still gated by the scrollHeight check above. */
    if (imgA.width === imgB.width && imgA.height !== imgB.height) {
      const h = Math.min(imgA.height, imgB.height);
      const crop = (img) => {
        const out = new PNG({ width: img.width, height: h });
        PNG.bitblt(img, out, 0, 0, img.width, h, 0, 0);
        return out;
      };
      [imgA, imgB] = [crop(imgA), crop(imgB)];
    }
    if (imgA.width === imgB.width && imgA.height === imgB.height) {
      const diff = new PNG({ width: imgA.width, height: imgA.height });
      const changed = pixelmatch(imgA.data, imgB.data, diff.data, imgA.width, imgA.height, { threshold: 0.1 });
      const pct = (changed / (imgA.width * imgA.height)) * 100;
      writeFileSync(join(OUT, `diff-${width}.png`), PNG.sync.write(diff));
      if (width === PRIMARY) {
        writeFileSync(join(OUT, `prototype-${width}.png`), PNG.sync.write(imgA));
        writeFileSync(join(OUT, `port-${width}.png`), PNG.sync.write(imgB));
      }
      record(`pixel diff @${width}`, pct < 0.1, `${pct.toFixed(4)}% of ${imgA.width}x${imgA.height}`);
    } else {
      record(`pixel diff @${width}`, false, `size mismatch ${imgA.width}x${imgA.height} vs ${imgB.width}x${imgB.height}`);
    }

    if (width === PRIMARY) {
      record("console clean (prototype)", errA.length === 0, errA.slice(0, 3).join(" | "));
      record("console clean (port)", errB.length === 0, errB.slice(0, 3).join(" | "));
    }
    await ctx.close();
  }

  // ---------- 2. Behaviour assertions on the port ----------
  const ctx = await browser.newContext({ viewport: { width: PRIMARY, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await settle(p, PORT, { freezeMarquee: false });

  record("no horizontal overflow",
    await p.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth));

  // NavPill's inline `transform .2s ease-in-out` beats the .site-nav class rule. See PLAN Finding 2.
  record("nav transition is 0.2s (inline wins over .28s class rule)",
    (await p.evaluate(() => getComputedStyle(document.querySelector(".site-nav")).transitionDuration)) === "0.2s");

  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(200);
  await p.evaluate(() => window.scrollTo(0, 400));
  await p.waitForTimeout(400);
  record("nav peeks on scroll-down past 240px",
    await p.evaluate(() => document.querySelector(".site-nav").classList.contains("nav-peek")));

  await p.hover(".site-nav");
  await p.waitForTimeout(400);
  record("nav restores on hover",
    (await p.evaluate(() => getComputedStyle(document.querySelector(".site-nav")).opacity)) === "1");

  record("sticky footer spacer matches footer height",
    await p.evaluate(() => {
      const f = document.querySelector(".sticky-footer");
      const spacer = f.previousElementSibling;
      return Math.abs(f.offsetHeight - parseInt(spacer.style.height || "0", 10)) <= 1;
    }));

  // Marquee speed is measured head-to-head rather than against an absolute number: headless
  // Chromium throttles rAF, so px/second is not comparable to a real browser. What matters
  // is that both targets travel at the same rate under identical conditions.
  const readTravel = (pg) => pg.evaluate(async () => {
    const track = document.querySelector('[style*="max-content"]');
    const read = () => new DOMMatrixReadOnly(getComputedStyle(track).transform).m41;
    const t0 = read();
    await new Promise((r) => setTimeout(r, 2000));
    return Math.abs(read() - t0);
  });
  const protoPage = await ctx.newPage();
  await settle(protoPage, PROTO, { freezeMarquee: false });
  const [travelPort, travelProto] = [await readTravel(p), await readTravel(protoPage)];
  const ratio = travelProto > 0 ? travelPort / travelProto : 0;
  record("marquee is animating (port)", travelPort > 5, `${travelPort.toFixed(1)}px in 2s`);
  record("marquee speed matches prototype", ratio > 0.75 && ratio < 1.25,
    `port ${travelPort.toFixed(1)}px vs prototype ${travelProto.toFixed(1)}px (ratio ${ratio.toFixed(2)})`);
  await ctx.close();

  // ---------- 3. Reduced-motion behaviour ----------
  const rmCtx = await browser.newContext({ viewport: { width: PRIMARY, height: 900 }, reducedMotion: "reduce" });
  const rm = await rmCtx.newPage();
  await settle(rm, PORT, { freezeMarquee: false });
  record("reduced motion: ken-burns suppressed",
    (await rm.evaluate(() => getComputedStyle(document.querySelector(".hero-photo")).animationName)) === "none");
  record("reduced motion: marquee transform never set",
    (await rm.evaluate(() => document.querySelector('[style*="max-content"]').style.transform)) === "");
  await rmCtx.close();

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length) {
    console.log("Failures:");
    failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail ?? ""}`));
    process.exitCode = 1;
  }
}

run().catch((e) => { console.error(e); process.exitCode = 1; });
