/* Behaviour gate for light/dark themes (app/theme.css, components/chrome/ThemeToggle.tsx).

     pnpm build && pnpm start -p 3001
     PORT_URL=http://localhost:3001/ node tools/check-theme.mjs      (SITE_LANG=ar too) */

import { chromium } from "playwright";

const LANG = process.env.SITE_LANG ?? "en";
const BASE = (process.env.PORT_URL ?? "http://localhost:3001/").replace(/\/$/, "");
const URL = `${BASE}/${LANG}`;

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

/* Relative luminance contrast of two computed CSS colours, in the page. */
const CONTRAST = `(a, b) => {
  const rgb = (c) => c.match(/[\\d.]+/g).slice(0, 3).map(Number);
  const lum = (c) => { const [r, g, b] = rgb(c).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}`;
async function contrast(page, fgSelector, bgSelector, prop = "color") {
  return page.evaluate(
    ([fg, bg, p, fn]) => {
      const f = document.querySelector(fg);
      const b = document.querySelector(bg);
      if (!f || !b) return null;
      return (0, eval)(fn)(getComputedStyle(f)[p], getComputedStyle(b).backgroundColor);
    },
    [fgSelector, bgSelector, prop, CONTRAST],
  );
}
const theme = (page) => page.getAttribute("html", "data-theme");

/* ── Follows the system before the first paint ────────────────────────────────────── */
for (const scheme of ["light", "dark"]) {
  const ctx = await browser.newContext({ colorScheme: scheme });
  const page = await ctx.newPage();
  watch(page);
  // Record the theme as the very first frame is produced, before any bundle runs.
  await page.addInitScript(() => {
    document.addEventListener("readystatechange", () => {
      if (document.readyState === "interactive") window.__firstTheme = document.documentElement.getAttribute("data-theme");
    }, { once: true });
  });
  await page.goto(URL, { waitUntil: "load" });
  const first = await page.evaluate(() => window.__firstTheme);
  rec(`system ${scheme}: theme set before the page parsed`, first === scheme, String(first));
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  rec(`system ${scheme}: page background`, scheme === "dark" ? bg === "rgb(16, 19, 23)" : bg === "rgb(250, 250, 248)", bg);
  await ctx.close();
}

/* ── Dark mode: contrast on real rendered colours ──────────────────────────────────── */
{
  const ctx = await browser.newContext({ colorScheme: "dark", viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page);
  await page.goto(URL, { waitUntil: "load" });
  await page.locator("#services").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const body = await contrast(page, "#services p", "body");
  rec("dark: body copy contrast ≥ 4.5", body >= 4.5, body?.toFixed(2));
  const heading = await contrast(page, "#services h2, #services h3", "body");
  rec("dark: heading contrast ≥ 4.5", heading >= 4.5, heading?.toFixed(2));
  // Primary button: label on its own fill.
  const btn = await page.evaluate(([fn]) => {
    const b = [...document.querySelectorAll('a[style*="--r-pill"]')].find((el) => getComputedStyle(el).color.startsWith("rgb(250"));
    if (!b) return null;
    const cs = getComputedStyle(b);
    return (0, eval)(fn)(cs.color, cs.backgroundColor);
  }, [CONTRAST]);
  rec("dark: primary button label ≥ 4.5", btn >= 4.5, btn?.toFixed(2));
  // Scroll so the bar turns solid, then check the logo variant.
  await page.evaluate(() => scrollTo(0, innerHeight * 1.5));
  await page.waitForTimeout(600);
  const logo = await page.evaluate(() =>
    [...document.querySelectorAll(".swh-nav__brand img")].filter((i) => i.offsetParent !== null).map((i) => i.getAttribute("src")),
  );
  rec("dark: navbar shows the light-S logo", logo.length === 1 && logo[0].endsWith("swh-logo.png"), logo.join(","));
  await ctx.close();
}

/* ── The toggle ────────────────────────────────────────────────────────────────────── */
{
  const ctx = await browser.newContext({ colorScheme: "light", viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page);
  await page.goto(URL, { waitUntil: "load" });
  const btn = page.locator(".swh-nav__cluster > .swh-theme");
  // aria-pressed is set on hydration (the server cannot know the theme); wait for it.
  await page.waitForSelector(".swh-nav__cluster > .swh-theme[aria-pressed]");
  rec("toggle: present and announced as not pressed", (await btn.getAttribute("aria-pressed")) === "false");
  await btn.click();
  rec("toggle: switches to dark", (await theme(page)) === "dark");
  rec("toggle: announces pressed", (await btn.getAttribute("aria-pressed")) === "true");
  const saved = await page.evaluate(() => localStorage.getItem("swh:theme"));
  rec("toggle: remembers a choice that differs from the system", saved === "dark", String(saved));
  await page.reload({ waitUntil: "load" });
  rec("toggle: choice survives a reload", (await theme(page)) === "dark");

  await page.locator(".swh-nav__cluster > .swh-theme").click(); // back to light = the system
  const cleared = await page.evaluate(() => localStorage.getItem("swh:theme"));
  rec("toggle: choosing the system's own theme forgets the choice", cleared === null, String(cleared));
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForTimeout(300);
  rec("follows a live system change when nothing is chosen", (await theme(page)) === "dark");

  await page.evaluate(() => localStorage.setItem("swh:theme", "light"));
  await page.reload({ waitUntil: "load" });
  rec("a saved light choice beats a dark system", (await theme(page)) === "light");
  await ctx.close();
}

/* ── The transition: three tiers ───────────────────────────────────────────────────── */
/* Records every class <html> carries during a switch, so a momentary one is still seen. */
const RECORD_CLASSES = () => {
  window.__classes = new Set();
  new MutationObserver(() => document.documentElement.classList.forEach((c) => window.__classes.add(c))).observe(
    document.documentElement,
    { attributes: true, attributeFilter: ["class"] },
  );
};
async function switchOnce(page) {
  await page.waitForSelector(".swh-nav__cluster > .swh-theme[aria-pressed]");
  await page.evaluate(RECORD_CLASSES);
  const before = await theme(page);
  await page.locator(".swh-nav__cluster > .swh-theme").click();
  const switchedAt = await page.evaluate(() => performance.now());
  await page.waitForTimeout(900);
  return {
    before,
    after: await theme(page),
    seen: await page.evaluate(() => [...window.__classes]),
    left: await page.evaluate(() => [...document.documentElement.classList]),
    switchedAt,
  };
}
{
  const ctx = await browser.newContext({ colorScheme: "light", viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page);
  await page.goto(URL, { waitUntil: "load" });
  const r = await switchOnce(page);
  rec("reveal: runs as a view transition", r.seen.includes("swh-theme-vt"));
  rec("reveal: theme switched", r.before === "light" && r.after === "dark");
  rec("reveal: cleans up after itself", !r.left.some((c) => c.startsWith("swh-theme-")), r.left.join(" "));
  const icons = await page.evaluate(() => ({
    sun: getComputedStyle(document.querySelector(".swh-nav__cluster .swh-theme__sun")).opacity,
    moon: getComputedStyle(document.querySelector(".swh-nav__cluster .swh-theme__moon")).opacity,
  }));
  rec("reveal: icon lands on the sun", icons.sun === "1" && icons.moon === "0", JSON.stringify(icons));

  // Changing one's mind mid-reveal: a second click 250ms in reverses it, and nothing may
  // stay stuck. (A click in the first ~100ms lands while the browser is snapshotting the
  // page — rendering is paused and it hits the root, so it cannot reach the button.)
  const toggleBtn = page.locator(".swh-nav__cluster > .swh-theme");
  await toggleBtn.click(); // dark → light
  await page.waitForTimeout(250);
  await toggleBtn.click(); // …and back, mid-animation
  await page.waitForTimeout(1200);
  const stuck = await page.evaluate(() => [...document.documentElement.classList]);
  rec("reveal: reversible mid-animation, settles cleanly", (await theme(page)) === "dark" && !stuck.some((c) => c.startsWith("swh-theme-")), `${await theme(page)} ${stuck.join(" ")}`);
  await ctx.close();
}
{
  const ctx = await browser.newContext({ colorScheme: "light", reducedMotion: "reduce" });
  const page = await ctx.newPage();
  watch(page);
  await page.goto(URL, { waitUntil: "load" });
  const r = await switchOnce(page);
  rec("reduced motion: no reveal", !r.seen.includes("swh-theme-vt") && !r.seen.includes("swh-theme-fading"), r.seen.join(" "));
  rec("reduced motion: switches instantly", r.after === "dark");
  await ctx.close();
}
{
  const ctx = await browser.newContext({ colorScheme: "light" });
  // A browser without the View Transitions API.
  await ctx.addInitScript(() => {
    delete Document.prototype.startViewTransition;
  });
  const page = await ctx.newPage();
  watch(page);
  await page.goto(URL, { waitUntil: "load" });
  const r = await switchOnce(page);
  rec("no View Transitions: cross-fades instead", r.seen.includes("swh-theme-fading") && !r.seen.includes("swh-theme-vt"), r.seen.join(" "));
  rec("no View Transitions: switched and cleaned up", r.after === "dark" && !r.left.some((c) => c.startsWith("swh-theme-")));
  await ctx.close();
}

/* ── Mobile: in the drawer ─────────────────────────────────────────────────────────── */
{
  const ctx = await browser.newContext({ colorScheme: "light", viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  watch(page);
  await page.goto(URL, { waitUntil: "load" });
  const inBar = await page.locator(".swh-nav__cluster > .swh-theme").isVisible();
  rec("mobile: not crowded into the bar", !inBar);
  await page.locator(".swh-burger").click();
  await page.waitForTimeout(400);
  const drawerBtn = page.locator(".swh-drawer__foot .swh-theme");
  rec("mobile: labelled switch in the drawer", (await drawerBtn.isVisible()) && /\S/.test(await drawerBtn.innerText()));
  await drawerBtn.click();
  rec("mobile: switches from the drawer", (await theme(page)) === "dark");
  await ctx.close();
}

rec("no console errors or page errors (both themes)", errors.length === 0, errors.slice(0, 2).join(" / "));
await browser.close();
console.log(fails.length ? `\n${fails.length} failed: ${fails.join(", ")}` : "\nall green");
process.exit(fails.length ? 1 : 0);
