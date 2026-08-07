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
const OUT = "tools/out";
await mkdir(OUT, { recursive: true });

const fails = [];
const rec = (n, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${extra ? "  — " + extra : ""}`);
  if (!ok) fails.push(n);
};

const b = await chromium.launch();

for (const vp of [
  { width: 1440, height: 1000, tag: "desktop" },
  { width: 1280, height: 720, tag: "laptop-short" },
  { width: 390, height: 844, tag: "mobile" },
]) {
  const p = await b.newPage({ viewport: { width: vp.width, height: vp.height } });
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(`${BASE}/customers`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);
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
    await p.locator(".swh-map__tag", { hasText: "Greater Cairo" }).click();
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
    const cards = await p.locator(".swh-client-grid > li").count();
    rec("selecting a region filters the grid", /Greater Cairo/.test(heading) && cards > 0 && cards < 367,
      `${heading} / ${cards} cards`);

    await p.locator(".swh-filters__reset").click();
    await p.waitForTimeout(600);
    rec("show-all restores the full roster", (await p.locator(".swh-client-grid > li").count()) === 367);

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

await b.close();
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(", ")}` : "\nall green");
process.exit(fails.length ? 1 : 0);
