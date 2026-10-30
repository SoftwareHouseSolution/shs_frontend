/* Behaviour gate for the /customers map — see components/clients/regionGeo.ts.

   The thing worth guarding is containment. Every region pin is positioned by Web Mercator
   from the frame's centre, and a pin computed correctly can still be drawn outside the box
   if the frame is shorter than the anchors' spread: that is exactly how "Upper Egypt"
   vanished off the bottom of a 461px-tall frame during development. fitZoom exists to stop
   that, and this asserts it holds at three viewports rather than the one it was tuned on.

   Run `pnpm build && pnpm start --port 3311` first, then `node tools/check-customers.mjs`.
   Same shape as check-nav.mjs and check-home.mjs. */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = "http://localhost:3311";
/* SITE_LANG picks which language build to check. Every route is under /en or /ar now, and
   the bare "/" is only a redirect stub — pointing a headless browser at it lands on the
   gate, not on a page. Default "en" so an unset environment behaves as this script always
   did. Run it with SITE_LANG=ar to check the Arabic build. */
const LANG = process.env.SITE_LANG ?? "en";

const OUT = "tools/out";
await mkdir(OUT, { recursive: true });

const fails = [];
const rec = (n, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${extra ? "  — " + extra : ""}`);
  if (!ok) fails.push(n);
};

const b = await chromium.launch();

/* Cards a reader meets. The moving roster draws each column twice to loop it, and the
   second copy is aria-hidden — counting raw .swh-client-card would double the roster. */
const countCards = (p) =>
  p.evaluate(() => [...document.querySelectorAll(".swh-client-card")].filter((c) => !c.closest("[aria-hidden]")).length);

for (const vp of [
  { width: 1440, height: 1000, tag: "desktop" },
  { width: 1280, height: 720, tag: "laptop-short" },
  { width: 390, height: 844, tag: "mobile" },
]) {
  const p = await b.newPage({ viewport: { width: vp.width, height: vp.height } });
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(`${BASE}/${LANG}/customers`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);

  /* Dismiss the intro video, which opens itself on this route (see CustomerVideoModal).
     Its scrim covers the page, so every click below this point would otherwise land on the
     overlay instead of on the map — which is what this script was doing before the modal
     shipped: failing on "element intercepts pointer events" rather than on anything it
     actually tests. Escape is the modal's own documented dismissal, so this exercises the
     real path rather than reaching in and deleting the node. */
  await p.keyboard.press("Escape");
  await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector(".swh-map").scrollIntoView({ block: "center" }));
  await p.waitForTimeout(vp.tag === "desktop" ? 4500 : 2500);

  const r = await p.evaluate(() => {
    const f = document.querySelector(".swh-map__frame").getBoundingClientRect();
    const pins = [...document.querySelectorAll(".swh-map__pin")].map((el) => {
      const b = el.getBoundingClientRect();
      return {
        name: el.innerText.split("\n")[0],
        inside:
          b.left >= f.left - 1 && b.right <= f.right + 1 && b.top >= f.top - 1 && b.bottom <= f.bottom + 1,
      };
    });
    const embed = document.querySelector(".swh-map__embed");
    return {
      frame: `${Math.round(f.width)}x${Math.round(f.height)}`,
      zoom: (embed.src.match(/z=(\d+)/) || [])[1],
      // The embed must fill the frame plus the bleed. `width:auto` on an absolutely
      // positioned iframe silently collapses it to 300x150 — that shipped once.
      embedW: Math.round(embed.getBoundingClientRect().width),
      outside: pins.filter((x) => !x.inside).map((x) => x.name),
      pins: pins.length,
    };
  });

  rec(`${vp.tag}: all 6 region pins render`, r.pins === 6, `${r.pins} pins, frame ${r.frame}`);
  rec(`${vp.tag}: every pin is inside the frame`, r.outside.length === 0, r.outside.join(", ") || `zoom ${r.zoom}`);
  rec(`${vp.tag}: embed fills the frame`, r.embedW > parseInt(r.frame, 10), `${r.embedW}px vs ${r.frame}`);
  rec(`${vp.tag}: no page errors`, errors.length === 0, errors.slice(0, 2).join(" | "));

  await p.locator(".swh-map__frame").screenshot({ path: `${OUT}/c-frame-${vp.tag}.png` });

  if (vp.tag === "desktop") {
    // The map must actually filter, and clearing must actually restore.
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(400);
    const yBefore = await p.evaluate(() => window.scrollY);
    /* Selected by data-region — the CMS region key (Regions → key), not the label: the label is translated and this script
       runs against both languages. */
    await p.locator('.swh-map__tag[data-region="greater-cairo"]').click();
    await p.waitForTimeout(1400); // smooth scroll has to land

    /* Selecting must bring the results into view. Without it the grid updates below the
       fold and the only visible feedback is the pill changing colour. */
    const scroll = await p.evaluate(() => {
      const h = document.querySelector(".swh-map__result").getBoundingClientRect();
      const nav = document.querySelector(".swh-nav").offsetHeight;
      return { y: window.scrollY, headingTop: Math.round(h.top), nav };
    });
    rec("selecting scrolls the results into view",
      scroll.y > yBefore + 100 && scroll.headingTop >= 0 && scroll.headingTop < 260,
      `scrollY ${yBefore} -> ${scroll.y}, heading at ${scroll.headingTop}px (nav ${scroll.nav}px)`);

    const heading = (await p.locator(".swh-map__result-title").innerText()).replace(/\n/g, " ");
    const cards = await countCards(p);
    /* Assert on data-active, the untranslated region key, rather than on the heading text:
       the heading reads "Greater Cairo" in English and "القاهرة الكبرى" in Arabic, and this
       script runs against both. The heading still goes into the message so a failure shows
       what was actually on screen. */
    const activeRegion = await p.getAttribute(".swh-map__result", "data-active");
    rec("selecting a region filters the grid",
      activeRegion === "greater-cairo" && cards > 0 && cards < 367,
      `${activeRegion} — ${heading} / ${cards} cards`);

    await p.locator(".swh-filters__reset").click();
    await p.waitForTimeout(600);
    rec("show-all restores the full roster", (await countCards(p)) === 367);

    // The embed is scenery: it must never be reachable or announced.
    rec("embed is inert and hidden from assistive tech",
      await p.locator(".swh-map__embed").evaluate((el) =>
        el.getAttribute("aria-hidden") === "true" &&
        el.tabIndex === -1 &&
        getComputedStyle(el).pointerEvents === "none"));

    await p.screenshot({ path: `${OUT}/c-selected.png` });
  }
  await p.close();
}

/* ── The location dropdown (components/clients/LocationFilter.tsx) ──────────────────
   What can silently break: a spelling falling out of its area (the point of clientAreas.ts
   is that "Maddi" and "Maadi" are one row), Escape closing the panel AND clearing the
   filter, and the panel being painted under the strip below it. */
for (const vp of [{ width: 1440, height: 1000, tag: "desktop" }, { width: 390, height: 844, tag: "mobile" }]) {
  const p = await b.newPage({ viewport: vp });
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(`${BASE}/${LANG}/customers`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(600);
  const area = () => p.getAttribute(".swh-map__result", "data-area");
  const trigger = p.locator(".swh-loc__trigger");
  const input = p.locator(".swh-loc__panel input");

  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  rec(`location ${vp.tag}: opening focuses the search`, await input.evaluate((el) => el === document.activeElement));
  rec(`location ${vp.tag}: panel is on top of the page`,
    await p.evaluate(() => {
      const r = document.querySelector(".swh-loc__list").getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + 20);
      return Boolean(hit?.closest(".swh-loc__panel"));
    }));
  rec(`location ${vp.tag}: panel stays inside the viewport`,
    await p.evaluate(() => {
      const r = document.querySelector(".swh-loc__panel").getBoundingClientRect();
      return r.left >= 0 && r.right <= document.documentElement.clientWidth;
    }));
  await p.screenshot({ path: `${OUT}/c-location-${vp.tag}.png` });

  await input.fill(LANG === "ar" ? "المعادي" : "maadi");
  rec(`location ${vp.tag}: typing narrows the list`, (await p.locator(".swh-loc__opt").count()) === 1);
  await p.keyboard.press("Enter");
  await p.waitForTimeout(1400);
  const maadi = await countCards(p);
  rec(`location ${vp.tag}: an area filters the grid, every spelling included`,
    (await area()) === "maadi" && maadi === 12, `${await area()} / ${maadi} cards`);
  rec(`location ${vp.tag}: the panel closed and the button reads the choice`,
    (await p.locator(".swh-loc__panel").count()) === 0 &&
    (await trigger.innerText()) === (await p.locator(".swh-map__result-title").innerText()));

  await trigger.click();
  await p.keyboard.press("Escape");
  await p.waitForTimeout(100);
  rec(`location ${vp.tag}: Escape closes the panel and keeps the filter`,
    (await p.locator(".swh-loc__panel").count()) === 0 && (await area()) === "maadi");
  await p.keyboard.press("Escape");
  await p.waitForTimeout(100);
  rec(`location ${vp.tag}: a second Escape clears the filter`, (await area()) === "");

  await trigger.click();
  await p.locator('.swh-loc__opt[data-location="region:giza"]').click();
  await p.waitForTimeout(1400);
  rec(`location ${vp.tag}: a region row is the same filter as its pin`,
    (await p.getAttribute(".swh-map__result", "data-active")) === "giza" && (await area()) === "");

  await p.locator(".swh-filters__reset").click();
  await p.waitForTimeout(600);
  rec(`location ${vp.tag}: show-all restores the full roster`, (await countCards(p)) === 367);

  await p.locator(".swh-loc__trigger").click();
  await p.locator(".swh-loc__panel input").fill("zzzzqqq");
  rec(`location ${vp.tag}: no match says so`,
    (await p.locator(".swh-loc__none").count()) === 1 && (await p.locator(".swh-loc__opt").count()) === 0);
  await p.mouse.click(2, 2);
  await p.waitForTimeout(100);
  rec(`location ${vp.tag}: clicking away closes the panel`, (await p.locator(".swh-loc__panel").count()) === 0);
  rec(`location ${vp.tag}: no page errors`, errors.length === 0, errors.slice(0, 2).join(" | "));
  await p.close();
}

/* ── The moving roster (components/clients/ClientRoster.tsx) ────────────────────────
   What can silently break: the loop's seam (a track that is not exactly two equal halves
   jumps once per cycle), logos that never load inside the moving window, the pause
   controls, and the fallbacks to the plain grid. */
const ty = (p) =>
  p.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector(".swh-roster__track")).transform).m42);
async function openRoster(p, { wall = true } = {}) {
  // Not "load": that waits on the Google Maps embed, which is a third party's network.
  await p.goto(`${BASE}/${LANG}/customers`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(500);
  // Arrive at its TOP, as a visitor scrolling down does: until the wall is built the
  // roster is the full static grid, thousands of pixels tall, and its centre is far below
  // where the 760px wall will end up.
  await p.evaluate(() => {
    const top = document.querySelector(".swh-roster").getBoundingClientRect().top + scrollY;
    scrollTo(0, top - 200);
  });
  if (wall) await p.waitForSelector('.swh-roster[data-mode="wall"] .swh-roster__track', { timeout: 10000 });
  await p.evaluate(() => document.querySelector(".swh-roster").scrollIntoView({ block: "center" }));
  await p.waitForTimeout(800);
}
for (const vp of [{ width: 1440, height: 1000, tag: "desktop" }, { width: 390, height: 844, tag: "mobile", cols: 2 }]) {
  const p = await b.newPage({ viewport: vp });
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  await openRoster(p);
  const w = await p.evaluate(() => {
    const r = document.querySelector(".swh-roster");
    const view = r.querySelector(".swh-roster__view");
    const tracks = [...r.querySelectorAll(".swh-roster__track")];
    return {
      mode: r.dataset.mode,
      cols: tracks.length,
      seams: tracks.map((t) => Math.abs(t.getBoundingClientRect().height - 2 * t.firstElementChild.getBoundingClientRect().height)),
      fills: tracks.every((t) => t.firstElementChild.getBoundingClientRect().height >= view.clientHeight),
    };
  });
  rec(`roster ${vp.tag}: runs as a moving wall`, w.mode === "wall" && (vp.cols ? w.cols === vp.cols : w.cols >= 3), `${w.mode}, ${w.cols} columns`);
  rec(`roster ${vp.tag}: every loop is seamless (two equal halves)`, w.seams.every((d) => d < 0.5), w.seams.map((d) => d.toFixed(1)).join(","));
  rec(`roster ${vp.tag}: each column is taller than its window`, w.fills);
  rec(`roster ${vp.tag}: every client announced exactly once`, (await countCards(p)) === 367);
  rec(`roster ${vp.tag}: no page errors`, errors.length === 0, errors.slice(0, 2).join(" | "));
  await p.close();
}
{
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await openRoster(p);
  const a = await ty(p);
  await p.waitForTimeout(800);
  const moved = Math.abs((await ty(p)) - a);
  rec("roster: drifts", moved > 5, `${moved.toFixed(1)}px in 800ms`);

  // Cards that drift INTO the window must load their logos — lazy images inside a clipped,
  // moving track are the classic way to scroll blank cards into view.
  await p.waitForTimeout(12000);
  const logos = await p.evaluate(() => {
    const vb = document.querySelector(".swh-roster__view").getBoundingClientRect();
    const mid = [...document.querySelectorAll(".swh-roster__view img")].filter((i) => {
      const r = i.getBoundingClientRect();
      return r.top > vb.top + vb.height * 0.2 && r.bottom < vb.bottom - vb.height * 0.2; // past the fades
    });
    return { shown: mid.length, loaded: mid.filter((i) => i.complete && i.naturalWidth > 0).length };
  });
  rec("roster: logos that drift into view have loaded", logos.shown > 0 && logos.loaded === logos.shown, `${logos.loaded}/${logos.shown}`);

  const toggle = p.locator(".swh-roster__toggle");
  await toggle.focus();
  await p.keyboard.press("Enter");
  await p.waitForSelector(".swh-roster[data-paused]");
  await p.waitForTimeout(100);
  const x = await ty(p);
  await p.waitForTimeout(800);
  rec("roster: the button pauses it", Math.abs((await ty(p)) - x) < 0.5 && (await toggle.getAttribute("aria-pressed")) === "true");
  await p.keyboard.press("Enter");
  await p.waitForSelector(".swh-roster:not([data-paused])");
  const y = await ty(p);
  await p.waitForTimeout(800);
  rec("roster: …and resumes it", Math.abs((await ty(p)) - y) > 5);

  await p.locator(".swh-roster__view").hover();
  await p.waitForTimeout(100);
  const h = await ty(p);
  await p.waitForTimeout(800);
  rec("roster: hovering holds it still", Math.abs((await ty(p)) - h) < 0.5);
  await p.mouse.move(5, 5);

  // A search with a handful of matches cannot fill a looping column: plain grid.
  await p.fill(".swh-search__input", "abaza");
  await p.waitForTimeout(400);
  const few = await p.evaluate(() => ({ mode: document.querySelector(".swh-roster")?.dataset.mode, n: document.querySelectorAll(".swh-client-card").length }));
  rec("roster: a short result is a still grid", few.mode === "grid" && few.n > 0 && few.n < 10, JSON.stringify(few));
  await p.fill(".swh-search__input", "");
  await p.waitForTimeout(400);
  rec("roster: clearing the search brings the wall back", (await p.getAttribute(".swh-roster", "data-mode")) === "wall");

  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(400);
  rec("roster: stops while scrolled out of view", (await p.getAttribute(".swh-roster", "data-paused")) !== null);
  await p.close();
}
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await openRoster(p, { wall: false });
  const mode = await p.getAttribute(".swh-roster", "data-mode");
  rec("reduced motion: the plain grid, every client", mode === "grid" && (await countCards(p)) === 367, mode);
  await ctx.close();
}

await b.close();
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(", ")}` : "\nall green");
process.exit(fails.length ? 1 : 0);
