/* Behavioural and accessibility checks for the site navigation.
   node tools/check-nav.mjs   (override with PORT_URL) */
import { chromium } from "playwright";

const URL = process.env.PORT_URL ?? "http://localhost:3001/";
const results = [];
const rec = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch();

/* ---------- desktop ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(URL, { waitUntil: "domcontentloaded" });
  /* Only the hero's own images: the page below the fold now carries lazy-loaded
     client logos and event photography that never report complete until they are
     scrolled into view, so waiting on document.images would never resolve. */
  await p.waitForFunction(() =>
    Array.from(document.querySelectorAll(".hero-slide__img, .swh-page-header__img"))
      .every((i) => i.complete));

  rec("navbar present", await p.locator("header.swh-nav").count() === 1);
  rec("old NavPill no longer rendered", await p.locator("nav.site-nav").count() === 0);
  rec("7 top-level items", await p.locator(".swh-nav__list > .swh-nav__item").count() === 7);
  /* 5 groups (About 4, Solutions 2, Partners 3, Customers 3, Careers 3) = 15 dropdown
     links, plus 2 standalone (Home, News & Events) = 17 leaves, 16 interior. Blogs was
     removed on 2026-08-07. */
  rec("5 dropdown panels", (await p.locator(".swh-nav__panel").count()) === 5);
  const dropdownLinks = await p.locator(".swh-nav__panel a").count();
  const soloLinks = await p.locator(".swh-nav__list > .swh-nav__item > a.swh-nav__link").count();
  rec("17 nav leaves = 16 interior routes + home",
    dropdownLinks === 15 && soloLinks === 2,
    `${dropdownLinks} in dropdowns + ${soloLinks} standalone`);

  // Header section removed from the home page.
  rec("duplicate Header section removed from /",
    (await p.locator('.page-content a:has-text("Learn More")').count()) <= 1);

  // Header must not be a containing block — that would trap the fixed drawer.
  const hdr = await p.evaluate(() => {
    const s = getComputedStyle(document.querySelector("header.swh-nav"));
    return { transform: s.transform, filter: s.filter, backdrop: s.backdropFilter };
  });
  rec("header creates no containing block for fixed children",
    hdr.transform === "none" && hdr.filter === "none" && (hdr.backdrop === "none" || !hdr.backdrop),
    `transform=${hdr.transform} filter=${hdr.filter} backdrop=${hdr.backdrop}`);

  // Over-hero state, then solid after scrolling past the carousel.
  rec("starts transparent over the hero",
    (await p.getAttribute("header.swh-nav", "data-nav-state")) === "over");
  const bgOver = await p.evaluate(() => getComputedStyle(document.querySelector(".swh-nav__surface")).backgroundColor);
  rec("over-hero surface is transparent", /rgba\(0, 0, 0, 0\)|transparent/.test(bgOver), bgOver);

  await p.evaluate(() => window.scrollTo(0, window.innerHeight + 400));
  await p.waitForTimeout(600);
  rec("goes solid past the hero",
    (await p.getAttribute("header.swh-nav", "data-nav-state")) === "solid");
  const bgSolid = await p.evaluate(() => getComputedStyle(document.querySelector(".swh-nav__surface")).backgroundColor);
  rec("solid surface paints --paper", bgSolid === "rgb(250, 250, 248)", bgSolid);

  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(600);
  rec("returns to transparent when scrolled back",
    (await p.getAttribute("header.swh-nav", "data-nav-state")) === "over");

  // Dropdown: hover opens.
  await p.locator("#navtrig-about").hover();
  await p.waitForTimeout(250);
  rec("hover opens the About panel",
    (await p.getAttribute("#navtrig-about", "aria-expanded")) === "true");
  rec("open panel is not inert",
    (await p.getAttribute("#navmenu-about", "inert")) === null);

  // Closed panels must be inert so they are out of the tab order and the a11y tree.
  rec("closed panels are inert",
    (await p.getAttribute("#navmenu-solutions", "inert")) !== null);

  // No role=menu — these are links to pages, not commands.
  rec("no role=menu / menuitem used",
    (await p.locator('.swh-nav [role="menu"], .swh-nav [role="menuitem"]').count()) === 0);

  // Keyboard: ArrowDown opens and focuses the first item.
  await p.locator("#navtrig-partners").focus();
  await p.keyboard.press("ArrowDown");
  await p.waitForTimeout(200);
  rec("ArrowDown opens and focuses first item",
    await p.evaluate(() => document.activeElement?.getAttribute("href") === "/technology-partners"),
    await p.evaluate(() => document.activeElement?.getAttribute("href")));

  await p.keyboard.press("ArrowDown");
  rec("ArrowDown moves to next item",
    await p.evaluate(() => document.activeElement?.getAttribute("href") === "/business-partners"));
  await p.keyboard.press("End");
  rec("End jumps to last item",
    await p.evaluate(() => document.activeElement?.getAttribute("href") === "/become-a-partner"));
  await p.keyboard.press("ArrowDown");
  rec("ArrowDown wraps to first",
    await p.evaluate(() => document.activeElement?.getAttribute("href") === "/technology-partners"));
  await p.keyboard.press("Escape");
  await p.waitForTimeout(150);
  rec("Escape closes and returns focus to the trigger",
    await p.evaluate(() => document.activeElement?.id === "navtrig-partners"));
  rec("panel closed after Escape",
    (await p.getAttribute("#navtrig-partners", "aria-expanded")) === "false");

  // ArrowUp opens focusing the last item.
  await p.keyboard.press("ArrowUp");
  await p.waitForTimeout(200);
  rec("ArrowUp opens and focuses last item",
    await p.evaluate(() => document.activeElement?.getAttribute("href") === "/become-a-partner"));
  await p.keyboard.press("Escape");

  // Focus rings must be visible.
  await p.locator("#navtrig-about").focus();
  const ring = await p.evaluate(() => getComputedStyle(document.querySelector("#navtrig-about")).boxShadow);
  rec("focus ring is applied", ring !== "none" && ring.length > 0, ring.slice(0, 60));

  /* Skip link, checked from a clean load. blur() is not enough: it clears activeElement
     but Chromium keeps the sequential-focus navigation starting point where it was, so
     Tab would continue from the nav trigger focused above. */
  await p.goto(URL, { waitUntil: "domcontentloaded" });
  await p.keyboard.press("Tab");
  const first = await p.evaluate(() => document.activeElement?.className);
  rec("skip link is the first tab stop", String(first).includes("swh-skip"), String(first));
  rec("#main exists for the skip link", await p.locator("#main").count() === 1);

  // Badge slot must render nothing at all while empty.
  rec("empty badge slot renders no element", await p.locator(".swh-badges").count() === 0);

  rec("console clean", errors.length === 0, errors.slice(0, 3).join(" | "));

  // No horizontal overflow at any tier, and the desktop menu must not wrap.
  for (const w of [1024, 1100, 1199, 1440, 1680]) {
    await p.setViewportSize({ width: w, height: 900 });
    await p.waitForTimeout(200);
    const noOverflow = await p.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth);
    const oneLine = await p.evaluate(() => {
      const items = [...document.querySelectorAll(".swh-nav__list > .swh-nav__item")];
      const tops = new Set(items.map((i) => Math.round(i.getBoundingClientRect().top)));
      return tops.size === 1;
    });
    rec(`@${w}: no overflow and menu on one line`, noOverflow && oneLine,
      `overflow-ok=${noOverflow} single-line=${oneLine}`);
  }
  await ctx.close();
}

/* ---------- drawer ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: "domcontentloaded" });

  rec("desktop menu hidden on mobile",
    !(await p.locator(".swh-nav__list").isVisible()));
  rec("burger visible on mobile", await p.locator(".swh-burger").isVisible());

  await p.locator(".swh-burger").click();
  await p.waitForTimeout(350);
  rec("drawer opens", (await p.getAttribute(".swh-drawer", "data-open")) === "true");
  rec("drawer is a modal dialog",
    (await p.getAttribute(".swh-drawer__panel", "aria-modal")) === "true");
  rec("body scroll locked",
    (await p.evaluate(() => getComputedStyle(document.body).overflow)) === "hidden");

  // Focus must be inside the drawer and must not escape on Tab.
  rec("focus moved into the drawer",
    await p.evaluate(() => document.querySelector(".swh-drawer__panel").contains(document.activeElement)));
  let escaped = false;
  for (let i = 0; i < 30; i++) {
    await p.keyboard.press("Tab");
    const inside = await p.evaluate(() =>
      document.querySelector(".swh-drawer__panel").contains(document.activeElement));
    if (!inside) { escaped = true; break; }
  }
  rec("Tab never escapes the drawer", !escaped);

  // Accordion.
  await p.locator(".swh-drawer__trigger").first().click();
  await p.waitForTimeout(300);
  rec("accordion group expands",
    (await p.getAttribute(".swh-drawer__group", "data-open")) === "true");

  await p.keyboard.press("Escape");
  await p.waitForTimeout(350);
  rec("Escape closes the drawer",
    (await p.getAttribute(".swh-drawer", "data-open")) === "false");
  rec("focus restored to the burger",
    await p.evaluate(() => document.activeElement?.classList.contains("swh-burger")));
  rec("body scroll restored",
    (await p.evaluate(() => getComputedStyle(document.body).overflow)) !== "hidden");
  rec("no horizontal overflow on mobile",
    await p.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) {
  console.log("Failures:");
  failed.forEach((f) => console.log(`  - ${f.name}${f.detail ? `: ${f.detail}` : ""}`));
  process.exitCode = 1;
}
