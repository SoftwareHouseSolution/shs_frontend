/* Behaviour gate for visit analytics (components/chrome/VisitTracker.tsx).

   Drives one visit — Home → Customers (full page load) → Home (client-side navigation) →
   tab hidden — and checks what reached /api/v1/analytics/collect/: one session, one view id
   per page, a growing visible-time duration, a final report on leaving, and 202s. Then
   checks that a browser sending Do-Not-Track sends nothing.

   Headless Chromium announces itself as "HeadlessChrome", which the API (rightly) drops as
   a bot, so this presents an ordinary desktop Chrome user agent — set browser-wide at
   launch, because a per-context override does not reach beacons sent while a page unloads.

     pnpm build && pnpm start -p 3001
     PORT_URL=http://localhost:3001/ node tools/check-analytics.mjs
   Prints the session id; the visit is then visible in the admin under Visitors → Visits. */

import { chromium } from "playwright";

const BASE = (process.env.PORT_URL ?? "http://localhost:3001/").replace(/\/$/, "");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

const fails = [];
const rec = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? `  — ${extra}` : ""}`);
  if (!ok) fails.push(name);
};

const browser = await chromium.launch({ args: [`--user-agent=${UA}`] });

async function visit({ dnt = false } = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    extraHTTPHeaders: dnt ? { DNT: "1" } : {},
  });
  if (dnt) await context.addInitScript(() => Object.defineProperty(navigator, "doNotTrack", { get: () => "1" }));
  /* Playwright does not surface navigator.sendBeacon requests, so record their payloads
     in the page: remember each Blob's text when it is built, and log it when beaconed.
     sessionStorage survives the same-tab navigations this visit makes. */
  await context.addInitScript(() => {
    const text = new WeakMap();
    const NativeBlob = window.Blob;
    window.Blob = class extends NativeBlob {
      constructor(parts = [], opts) {
        super(parts, opts);
        if (parts.every((p) => typeof p === "string")) text.set(this, parts.join(""));
      }
    };
    const send = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (url, data) => {
      if (String(url).includes("/analytics/collect/")) {
        const log = JSON.parse(sessionStorage.getItem("__beacons") || "[]");
        log.push(typeof data === "string" ? data : text.get(data));
        sessionStorage.setItem("__beacons", JSON.stringify(log));
      }
      return send(url, data);
    };
  });
  const reports = [];
  const statuses = [];
  context.on("request", (r) => {
    if (r.url().includes("/analytics/collect/") && r.method() === "POST") {
      // Beacon bodies are Blobs; read the raw bytes rather than postData().
      const raw = r.postDataBuffer()?.toString("utf8");
      if (raw) reports.push(JSON.parse(raw));
    }
  });
  context.on("response", (r) => r.url().includes("/analytics/collect/") && statuses.push(r.status()));

  const page = await context.newPage();
  await page.goto(`${BASE}/en`, { waitUntil: "load" });
  await page.waitForTimeout(3000);
  await page.locator('.swh-proof a[href$="/customers"]').first().click(); // full page load
  await page.waitForURL(/\/en\/customers\/?$/);
  await page.waitForTimeout(2000);
  // The intro-video popup opens on arrival; dismiss it as a visitor would.
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  await page.locator(".swh-nav__link").first().click(); // Next <Link>: client-side
  await page.waitForURL(/\/en\/?$/);
  await page.waitForTimeout(2000);
  // The visitor switches away from the tab: the final page reports its time.
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { get: () => "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const beacons = JSON.parse((await page.evaluate(() => sessionStorage.getItem("__beacons"))) || "[]");
  for (const b of beacons) if (b) reports.push(JSON.parse(b));
  await page.close({ runBeforeUnload: true });
  await new Promise((r) => setTimeout(r, 1000));
  await context.close();
  return { reports, statuses };
}

const { reports, statuses } = await visit();
const sessions = new Set(reports.map((r) => r.session_id));
rec("reports were sent", reports.length > 0, `${reports.length} reports`);
rec("one session for the whole visit", sessions.size === 1, [...sessions].join(", "));
rec("one visitor id", new Set(reports.map((r) => r.visitor_id)).size === 1);

const views = [];
for (const r of reports) if (!views.find((v) => v.view_id === r.view_id)) views.push({ view_id: r.view_id, path: r.path });
rec("three page views in order", views.map((v) => v.path).join(" → ") === "/en → /en/customers → /en", views.map((v) => v.path).join(" → "));

const longest = (id) => Math.max(...reports.filter((r) => r.view_id === id).map((r) => r.duration_ms));
const [home, customers, back] = views;
rec("home time ≈ 3s", home && longest(home.view_id) >= 2500, home && `${longest(home.view_id)} ms`);
rec("customers time ≈ 2s", customers && longest(customers.view_id) >= 1500, customers && `${longest(customers.view_id)} ms`);
rec("final page reported when the tab is hidden", back && longest(back.view_id) >= 1500, back && `${longest(back.view_id)} ms`);
rec("only the first page carries the referrer field", reports.filter((r) => "referrer" in r).length === 1);
rec("every report accepted (202)", statuses.length > 0 && statuses.every((s) => s === 202), statuses.join(","));

const dnt = await visit({ dnt: true });
rec("Do-Not-Track browser sends nothing", dnt.reports.length === 0, `${dnt.reports.length} reports`);

await browser.close();
console.log(`\nsession: ${[...sessions][0] ?? "-"}`);
console.log(fails.length ? `${fails.length} failed: ${fails.join(", ")}` : "all green");
process.exit(fails.length ? 1 : 0);
