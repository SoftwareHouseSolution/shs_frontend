/* Behaviour gate for the first-load screen (components/chrome/Preloader.tsx) and the
   navigation progress bar (components/chrome/NavigationProgress.tsx).

     pnpm build && pnpm start -p 3001
     PORT_URL=http://localhost:3001/ node tools/check-loading.mjs      (SITE_LANG=ar too) */

import { chromium } from "playwright";

const LANG = process.env.SITE_LANG ?? "en";
const BASE = (process.env.PORT_URL ?? "http://localhost:3001/").replace(/\/$/, "");
const URL = `${BASE}/${LANG}`;
const MAX_WAIT_MS = 3500;

const fails = [];
const rec = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? `  — ${extra}` : ""}`);
  if (!ok) fails.push(name);
};

const browser = await chromium.launch();
const errors = [];
const watch = (page) => {
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
};
const state = (page) => page.getAttribute("#swh-preloader", "data-state");
const opacity = (page) => page.$eval("#swh-preloader", (el) => Number(getComputedStyle(el).opacity));

/* ── Fast connection: never seen ───────────────────────────────────────────────────── */
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  watch(page);
  let maxOpacity = 0;
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  const t0 = Date.now();
  while (Date.now() - t0 < 1500) {
    const s = await state(page);
    if (s === "gone") break;
    maxOpacity = Math.max(maxOpacity, await opacity(page).catch(() => 0));
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(800);
  rec("fast load: dismissed", (await state(page)) === "gone", await state(page));
  rec("fast load: barely or never visible", maxOpacity < 0.9, `peak opacity ${maxOpacity.toFixed(2)}`);

  /* Same visit, another full page load: skipped outright. */
  await page.goto(`${URL}/about-company`, { waitUntil: "domcontentloaded" });
  rec("same visit: not shown again", (await state(page)) === "gone");
  await ctx.close();
}

/* ── Slow connection: shown, then leaves within the cap ────────────────────────────── */
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  watch(page);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 300,
    downloadThroughput: (400 * 1024) / 8,
    uploadThroughput: (200 * 1024) / 8,
  });
  await page.goto(URL, { waitUntil: "commit" });
  await page.waitForSelector("#swh-preloader", { state: "attached" });
  const started = Date.now();
  let peak = 0;
  let blocking = false;
  let goneAt = null;
  while (Date.now() - started < MAX_WAIT_MS + 4000) {
    const s = await state(page).catch(() => null);
    if (s === "gone") {
      goneAt = await page.evaluate(() => performance.now()); // ms since navigation start
      break;
    }
    const o = await opacity(page).catch(() => 0);
    if (o > 0.9) {
      // While it is visible, the page beneath must still take input.
      const top = await page.evaluate(() => document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.id);
      blocking ||= top === "swh-preloader";
    }
    peak = Math.max(peak, o);
    await page.waitForTimeout(60);
  }
  rec("slow load: the screen appears", peak > 0.9, `peak opacity ${peak.toFixed(2)}`);
  // Cap + removal delay (600 ms) + 1 s for timer drift: a busy main thread (hydration on a
  // throttled machine) fires timers late. Counted from the navigation the visitor started.
  rec("slow load: gone within the cap of the click", goneAt !== null && goneAt <= MAX_WAIT_MS + 1600, `${Math.round(goneAt ?? -1)} ms after navigation start`);
  rec("never blocks input", !blocking);
  await ctx.close();
}

/* ── JavaScript disabled ───────────────────────────────────────────────────────────── */
{
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "load" });
  const display = await page.$eval("#swh-preloader", (el) => getComputedStyle(el).display);
  rec("no JavaScript: hidden", display === "none", display);
  await ctx.close();
}

/* ── Navigation progress ───────────────────────────────────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page);
  // Hold every RSC payload — prefetches included — so the next page cannot already be
  // in the cache when the link is clicked, and the in-between state is observable.
  await page.route("**/*", async (route) => {
    if (route.request().headers()["rsc"]) await new Promise((r) => setTimeout(r, 1500));
    await route.continue().catch(() => {}); // may already be released by unroute below
  });
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(300);
  const origin = await page.$eval(".swh-progress span", (el) => getComputedStyle(el).transformOrigin);
  rec("progress grows from the reading start", LANG === "ar" ? origin.startsWith("1440") : origin.startsWith("0px"), origin);

  await page.locator(".swh-nav__link").last().click(); // a <Link>: client-side navigation
  await page.waitForTimeout(200);
  rec("progress shows while the next page loads", (await page.getAttribute(".swh-progress", "data-state")) === "loading");
  await page.waitForURL(/news-events/);
  await page.waitForTimeout(900);
  rec("progress clears on arrival", (await page.getAttribute(".swh-progress", "data-state")) === "idle");

  await page.unroute("**/*", { behavior: "ignoreErrors" }).catch(() => page.unroute("**/*"));
  await page.locator('a[href$="#contact"]').first().click().catch(() => {});
  await page.waitForTimeout(150);
  rec("same-page fragments do not start it", (await page.getAttribute(".swh-progress", "data-state")) === "idle");
  await ctx.close();
}

rec("no console errors or page errors", errors.length === 0, errors.slice(0, 2).join(" / "));
await browser.close();
console.log(fails.length ? `\n${fails.length} failed: ${fails.join(", ")}` : "\nall green");
process.exit(fails.length ? 1 : 0);
