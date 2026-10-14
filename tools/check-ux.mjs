/* Regression check for the 2026-10 UI/UX pass: the mobile comparison-table repair, the
   nav "where am I" markers, the drawer auto-expand, the testimonial under reduced motion,
   the focus floor, the bilingual 404, the client-search empty state, the map loading
   state, the Contact links and the caption contrast.

   Run `pnpm build && pnpm start -p 3001` first, then `node tools/check-ux.mjs`.
   PORT_URL and SITE_LANG work as in check-nav.mjs. Same shape as the other checks:
   assert, print, exit non-zero on failure. */

import { chromium } from "playwright";

const BASE = (process.env.PORT_URL ?? "http://localhost:3001/").replace(/\/$/, "");
const LANG = process.env.SITE_LANG ?? "en";
const at = (p) => `${BASE}/${LANG}${p}`;

const b = await chromium.launch();
const fails = [];
const errors = [];
const rec = (n, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${extra ? "  — " + extra : ""}`);
  if (!ok) fails.push(n);
};
const watch = (page, label) => {
  page.on("pageerror", (e) => errors.push(`${label}: ${e}`));
  page.on("console", (m) => {
    // The 404 page is supposed to 404; that resource error is the test, not a fault.
    if (m.type() === "error" && !/status of 404/.test(m.text())) errors.push(`${label}: ${m.text()}`);
  });
};

/* ── Phone ───────────────────────────────────────────────────────────────────── */
const phone = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

/* The spec table: every row must agree on its column edges, and nothing may run past the
   table. Before the repair each row sized its own columns and the last one clipped. */
for (const path of ["/", "/background-capabilities"]) {
  const p = await phone.newPage();
  watch(p, path);
  await p.goto(at(path), { waitUntil: "load" });
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const table = document.querySelector(".swh-spec > div");
    if (!table) return null;
    const box = table.getBoundingClientRect();
    const rows = [...table.children].map((row) => [...row.children].map((c) => Math.round(c.getBoundingClientRect().left)));
    const overflow = [...table.querySelectorAll("div")].some((c) => c.getBoundingClientRect().right > box.right + 1);
    return { rows, overflow };
  });
  rec(`spec table present on ${path}`, r !== null);
  if (r) {
    const same = r.rows.every((row) => JSON.stringify(row) === JSON.stringify(r.rows[0]));
    rec(`spec table columns align on every row (${path})`, same, same ? "" : JSON.stringify(r.rows));
    rec(`spec table cells stay inside the table (${path})`, !r.overflow);
  }
  rec(`no horizontal scroll at 390 (${path})`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await p.close();
}

/* The testimonial is legible with no scrolling under reduced motion. */
{
  const p = await phone.newPage();
  watch(p, "testimonial");
  await p.goto(at("/"), { waitUntil: "load" });
  await p.waitForTimeout(600);
  const grey = await p.evaluate(() => {
    const quote = [...document.querySelectorAll("p")].find((el) => el.children.length > 5 && [...el.children].every((s) => s.tagName === "SPAN"));
    return quote ? [...quote.children].filter((s) => getComputedStyle(s).color !== "rgb(22, 25, 29)").length : -1;
  });
  rec("testimonial fully inked under reduced motion", grey === 0, `${grey} grey words`);

  // Contact: the number and the address are tappable.
  const links = await p.evaluate(() => [...document.querySelectorAll("#contact a")].map((a) => a.getAttribute("href")));
  rec("contact phone is a tel: link", links.some((h) => h?.startsWith("tel:")));
  rec("contact email is a mailto: link", links.some((h) => h?.startsWith("mailto:")));
  await p.close();
}

/* Drawer: opening on a child page shows that page's group already expanded. */
{
  const p = await phone.newPage();
  watch(p, "drawer");
  await p.goto(at("/our-team"), { waitUntil: "load" });
  await p.waitForTimeout(500);
  await p.click(".swh-burger");
  await p.waitForTimeout(400);
  const d = await p.evaluate(() => {
    const open = [...document.querySelectorAll(".swh-drawer__group[data-open='true']")];
    return {
      openCount: open.length,
      holdsCurrent: open.some((g) => g.querySelector("a[aria-current='page']")),
      triggerActive: open.some((g) => g.querySelector(".swh-drawer__trigger[data-active='true']")),
    };
  });
  rec("drawer opens with the current page's group expanded", d.openCount === 1 && d.holdsCurrent, JSON.stringify(d));
  rec("drawer marks the current group's trigger", d.triggerActive);
  await p.close();

  const h = await phone.newPage();
  await h.goto(at("/"), { waitUntil: "load" });
  await h.click(".swh-burger");
  await h.waitForTimeout(400);
  rec(
    "drawer marks Home as current on the home page",
    await h.evaluate(() => !!document.querySelector(".swh-drawer__solo a[aria-current='page']")),
  );
  rec("drawer opens with nothing expanded on the home page", await h.evaluate(() => !document.querySelector(".swh-drawer__group[data-open='true']")));
  await h.close();
}

/* Customers: empty state, reset, search field. */
{
  const p = await phone.newPage();
  watch(p, "customers");
  await p.goto(at("/customers"), { waitUntil: "load" });
  await p.waitForTimeout(900);
  await p.keyboard.press("Escape"); // the welcome video
  await p.waitForTimeout(400);
  const total = await p.locator(".swh-client-card").count();
  await p.fill(".swh-search__input", "zzzzqqq");
  await p.waitForTimeout(200);
  rec("empty state replaces the grid when nothing matches", (await p.locator(".swh-empty").count()) === 1 && (await p.locator(".swh-client-card").count()) === 0);
  rec("empty state has a heading", (await p.locator(".swh-empty h3").count()) === 1);
  await p.click(".swh-empty__action button");
  await p.waitForTimeout(200);
  rec("empty-state action restores the full roster", (await p.locator(".swh-client-card").count()) === total, `${total} cards`);
  rec("search field clears after reset", (await p.inputValue(".swh-search__input")) === "");
  const h = await p.evaluate(() => document.querySelector(".swh-search__input").getBoundingClientRect().height);
  rec("search field is a 44px touch target", h >= 44, `${h}px`);
  const sk = await p.evaluate(() => getComputedStyle(document.querySelector(".swh-map__skeleton"), "::after").animationIterationCount);
  rec("map loading shine is bounded, never infinite", sk !== "infinite", sk);
  await p.close();
}

/* The 404 is bilingual and carries its own way out. */
{
  const p = await phone.newPage();
  watch(p, "404");
  const res = await p.goto(`${BASE}/${LANG}/definitely-not-a-page`, { waitUntil: "load" });
  rec("unknown route returns 404", res?.status() === 404, String(res?.status()));
  const n = await p.evaluate(() => ({
    h1: document.querySelectorAll("h1").length,
    ar: !!document.querySelector(".swh-status[lang='ar'][dir='rtl']"),
    hrefs: [...document.querySelectorAll("main a")].map((a) => a.getAttribute("href")),
  }));
  rec("404 has exactly one h1", n.h1 === 1, String(n.h1));
  rec("404 carries an Arabic panel marked lang/dir", n.ar);
  rec("404 links home in both languages", n.hrefs.some((h) => /^\/en\/?$/.test(h)) && n.hrefs.some((h) => /^\/ar\/?$/.test(h)), n.hrefs.join(" "));
  rec("404 no longer points at a menu that is not there", !(await p.evaluate(() => document.body.innerText.includes("menu above"))));
  await p.close();
}
await phone.close();

/* ── Desktop ─────────────────────────────────────────────────────────────────── */
const desk = await b.newContext({ viewport: { width: 1440, height: 900 } });
{
  const p = await desk.newPage();
  watch(p, "desktop");
  await p.goto(at("/about-company"), { waitUntil: "load" });
  await p.waitForTimeout(500);
  rec(
    "nav marks the section trigger on a child page",
    await p.evaluate(() => document.querySelector("#navtrig-about")?.dataset.active === "true"),
  );
  rec(
    "nav marks no other section",
    await p.evaluate(() => document.querySelectorAll(".swh-nav__trigger[data-active='true']").length === 1),
  );

  // Focus floor: the design-system PillButton now shows a ring when tabbed to.
  await p.goto(at("/"), { waitUntil: "load" });
  await p.waitForTimeout(500);
  const ring = await p.evaluate(() => {
    const cta = document.querySelector(".swh-cta a");
    cta.focus({ focusVisible: true });
    const s = getComputedStyle(cta);
    return s.outlineStyle !== "none" || s.boxShadow !== "none";
  });
  rec("PillButton shows a focus ring", ring);

  // Caption contrast: the subtle token, not --muted.
  const col = await p.evaluate(() => getComputedStyle(document.querySelector(".swh-footer__heading")).color);
  rec("footer headings use the AA caption colour", col === "rgb(107, 107, 107)", col);
  await p.close();
}
await desk.close();
await b.close();

rec("no console errors or page errors", errors.length === 0, errors.slice(0, 5).join(" | "));
console.log(fails.length ? `\n${fails.length} FAILED` : "\nall passed");
process.exit(fails.length ? 1 : 0);
