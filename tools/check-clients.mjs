/* Behavioural checks for the client directory. Run against `next start`.
   node tools/check-clients.mjs   (override with PORT_URL) */
import { chromium } from "playwright";

const BASE = (process.env.PORT_URL ?? "http://localhost:3001/").replace(/\/$/, "");
const URL = BASE + "/customers";
const results = [];
const rec = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(String(e)));
p.on("response", (r) => {
  if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
});
await p.goto(URL, { waitUntil: "networkidle" });

const total = await p.locator(".swh-client-card").count();
rec("every client renders", total >= 360, `${total} cards`);

/* The page has to be indexable and has to work with JS off, so the cards must be in the
   server HTML — filtering only ever hides. */
const html = await (await fetch(URL)).text();
const inHtml = (html.match(/swh-client-card"/g) ?? []).length;
rec("cards are server-rendered", inHtml >= 360, `${inHtml} in HTML`);

await p.fill(".swh-filters__search", "gold");
await p.waitForTimeout(200);
const searched = await p.locator(".swh-client-card").count();
rec("search narrows the list", searched > 0 && searched < total, `${searched} of ${total}`);
rec("count reflects the search", (await p.locator(".swh-filters__count").textContent()).includes(String(searched)));

await p.fill(".swh-filters__search", "");
await p.waitForTimeout(150);
await p.locator('.swh-filters__chip[data-facet="type"][data-value="Manufacturing"]').click();
await p.waitForTimeout(200);
const manu = await p.locator(".swh-client-card").count();
rec("business-type filter works", manu > 0 && manu < total, `${manu} manufacturers`);
rec("selected chip reports its state",
  (await p.getAttribute('.swh-filters__chip[data-facet="type"][data-value="Manufacturing"]', "aria-pressed")) === "true");

/* Manufacturing is a jewellery-only attribute, so pairing it with the enterprise sector
   must reach the empty state rather than rendering a stray card. */
await p.locator('.swh-filters__chip[data-facet="sector"][data-value="enterprise"]').click();
await p.waitForTimeout(200);
rec("combined filters reach the empty state",
  (await p.locator(".swh-filters__empty").count()) === 1 && (await p.locator(".swh-client-card").count()) === 0);

await p.locator(".swh-filters__reset").click();
await p.waitForTimeout(200);
rec("reset restores every client", (await p.locator(".swh-client-card").count()) === total);

const first = () => p.locator(".swh-client-card__name").first().textContent();
const az = await first();
await p.selectOption(".swh-filters__sort", "za");
await p.waitForTimeout(200);
const za = await first();
rec("sort Z-A reverses the list", za !== az, `${az} -> ${za}`);
await p.selectOption(".swh-filters__sort", "region");
await p.waitForTimeout(200);
rec("sort by region reorders", (await first()) !== za);

/* Every logo referenced must exist — a 404 here means the dataset and the asset folder
   have drifted apart. */
const broken = await p.evaluate(() =>
  Array.from(document.querySelectorAll(".swh-client-card__logo img"))
    .filter((i) => i.complete && i.naturalWidth === 0).length);
rec("no broken logos in view", broken === 0, `${broken} broken`);

for (const w of [375, 800, 1024, 1440]) {
  await p.setViewportSize({ width: w, height: 900 });
  await p.waitForTimeout(150);
  rec(`no horizontal overflow @${w}`,
    await p.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth));
}

rec("console and network clean", errors.length === 0, errors.slice(0, 3).join(" | "));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) process.exitCode = 1;
