/* Regression check for the 2026-08-07 home-page work: the figures band under the hero, the
   endless client strip, the carousel timer, the social rail, the rebuilt footer and the nav
   fixes. Run `pnpm build && pnpm start --port 3311` first, then `node tools/check-home.mjs`.

   Same shape as check-nav.mjs and check-hero.mjs: assert, print, exit non-zero on failure. */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = "http://localhost:3311";
const OUT = "tools/out";
await mkdir(OUT, { recursive: true });

const b = await chromium.launch();
const fails = [];
const rec = (n, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${extra ? "  — " + extra : ""}`);
  if (!ok) fails.push(n);
};

/* ── Desktop ─────────────────────────────────────────────────────────────────── */
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
p.on("pageerror", (e) => errors.push(String(e)));

await p.goto(BASE, { waitUntil: "domcontentloaded" });
await p.waitForTimeout(2500);

rec("no horizontal scroll", await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  await p.evaluate(() => `${document.documentElement.scrollWidth} vs ${window.innerWidth}`));

// Figures land directly under the hero.
const order = await p.evaluate(() => {
  const secs = [...document.querySelectorAll("main > *")];
  return secs.slice(0, 3).map((s) => s.className || s.tagName);
});
rec("figures sit immediately after the hero", String(order[1]).includes("swh-figures"), order.join(" | "));

await p.evaluate(() => document.querySelector(".swh-figures").scrollIntoView());
await p.waitForTimeout(2200);
const clients = await p.locator(".swh-figures__value").nth(1).innerText();
rec("client figure counts to 1,750+", clients.trim() === "1,750+", clients);
rec("regions read KSA & USA",
  (await p.locator(".swh-proof__lede").innerText()).includes("KSA & USA"));

// Marquee: VIP row static, strip moving and seamless.
rec("3 VIP marks", (await p.locator(".swh-proof__vip li").count()) === 3);
// The strip's marks are lazy, so bring it into view and let them decode before measuring.
await p.evaluate(() => document.querySelector(".swh-proof__strip").scrollIntoView({ block: "center" }));
await p.waitForFunction(
  () => [...document.querySelectorAll(".swh-proof__mark")].filter((i) => i.complete).length > 20,
  null,
  { timeout: 20000 },
);
await p.waitForTimeout(600);
const t1 = await p.locator(".swh-slider__track").evaluate((el) => getComputedStyle(el).transform);
await p.waitForTimeout(900);
const t2 = await p.locator(".swh-slider__track").evaluate((el) => getComputedStyle(el).transform);
rec("marquee is moving", t1 !== t2, `${t1} -> ${t2}`);
const loop = await p.locator(".swh-slider__track").evaluate((el) => {
  const a = el.getAnimations()[0];
  const groups = el.querySelectorAll(".swh-slider__group");
  const w = groups[0].getBoundingClientRect().width;
  const gap = parseFloat(getComputedStyle(el).gap);
  const kf = a.effect.getKeyframes();
  // Match INSIDE the parens — "translate3d" itself contains a digit.
  const end = Math.abs(parseFloat(String(kf[1].transform).match(/\((-?[\d.]+)px/)[1]));
  return { travel: end, expected: w + gap, iterations: a.effect.getTiming().iterations };
});
rec("loop distance == group width + gap (no seam)", Math.abs(loop.travel - loop.expected) < 1.5, JSON.stringify(loop));
rec("loop is infinite", loop.iterations === Infinity || loop.iterations === null);

// Hero dots carry a running timer.
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(600);
rec("active dot has a fill", (await p.locator(".hero-carousel__dot-fill").count()) === 1);
const f1 = await p.locator(".hero-carousel__dot-fill").evaluate((el) => getComputedStyle(el).transform);
await p.waitForTimeout(1200);
const f2 = await p.locator(".hero-carousel__dot-fill").evaluate((el) => getComputedStyle(el).transform);
rec("dot timer advances", f1 !== f2, `${f1} -> ${f2}`);

// Carousel keeps going with the pointer over it.
const before = await p.locator(".hero-carousel__dot[aria-current='true']").getAttribute("aria-label");
await p.locator(".hero-carousel").hover();
await p.waitForTimeout(8200);
const after = await p.locator(".hero-carousel__dot[aria-current='true']").getAttribute("aria-label");
rec("carousel advances while hovered", before !== after, `${before} -> ${after}`);

// Social rail.
rec("rail rests 30% out",
  await p.locator(".swh-rail").evaluate((el) => {
    const m = new DOMMatrix(getComputedStyle(el).transform);
    return Math.abs(m.m41 + el.getBoundingClientRect().width * 0.3 / 0.7) < 3 || m.m41 < -5;
  }),
  await p.locator(".swh-rail").evaluate((el) => getComputedStyle(el).transform));
await p.locator(".swh-rail").hover();
await p.waitForTimeout(500);
rec("rail pulls fully in on hover",
  await p.locator(".swh-rail").evaluate((el) => Math.abs(new DOMMatrix(getComputedStyle(el).transform).m41) < 1));
await p.locator(".swh-rail__toggle").click();
await p.waitForTimeout(500);
rec("tap reveals 3 profiles", (await p.locator(".swh-rail__link:visible").count()) === 3);
rec("profiles are inert while collapsed",
  await p.evaluate(async () => {
    const rail = document.querySelector(".swh-rail");
    document.querySelector(".swh-rail__toggle").click();
    await new Promise((r) => setTimeout(r, 450));
    const closed = rail.dataset.open === "false";
    const inert = document.getElementById("swh-rail-links").hasAttribute("inert");
    document.querySelector(".swh-rail__toggle").click();
    await new Promise((r) => setTimeout(r, 450));
    return closed && inert;
  }));
await p.locator(".swh-rail").screenshot({ path: `${OUT}/v-rail.png` });

// Footer: real links only.
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await p.waitForTimeout(1200);
const dead = await p.locator('.swh-footer a[href="#"]').count();
rec("no dead footer links", dead === 0, `${dead} found`);
rec("footer has social icons", (await p.locator(".swh-footer__social a").count()) === 4);
await p.locator(".swh-footer").screenshot({ path: `${OUT}/v-footer.png` });

// Nav: no Blogs, solid on interior pages.
rec("Blogs removed from nav", (await p.locator('.swh-nav__list a:text-is("Blogs")').count()) === 0);
const res = await p.request.get(`${BASE}/blogs`);
rec("/blogs returns 404", res.status() === 404, String(res.status()));

await p.goto(`${BASE}/technology-partners`, { waitUntil: "domcontentloaded" });
await p.waitForTimeout(1800);
const navState = await p.locator(".swh-nav").getAttribute("data-nav-state");
rec("interior nav is solid, not transparent-over-ink", navState === "solid", String(navState));
await p.locator("header.swh-nav").screenshot({ path: `${OUT}/v-nav-interior.png` });
await p.locator(".swh-hardware, main").first().screenshot({ path: `${OUT}/v-partners.png` }).catch(() => {});

// Dropdown opens on hover, and does not stay pinned after a click elsewhere.
await p.goto(BASE, { waitUntil: "domcontentloaded" });
await p.waitForTimeout(1500);
await p.locator(".swh-nav__trigger", { hasText: "Partners" }).hover();
await p.waitForTimeout(400);
rec("dropdown opens on hover",
  (await p.locator('.swh-nav__item[data-open="true"]').count()) === 1);
await p.locator(".swh-nav__trigger", { hasText: "Customers" }).hover();
await p.waitForTimeout(400);
const openLabel = await p.locator('.swh-nav__item[data-open="true"] .swh-nav__trigger').innerText();
rec("hover moves to the next trigger", openLabel.includes("Customers"), openLabel);
await p.locator(".swh-nav__brand").hover();
await p.waitForTimeout(500);
rec("dropdown closes on hover-away", (await p.locator('.swh-nav__item[data-open="true"]').count()) === 0);

await p.screenshot({ path: `${OUT}/v-home-top.png` });
await p.evaluate(() => document.querySelector(".swh-figures").scrollIntoView({ block: "start" }));
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/v-figures-proof.png` });

/* ── Mobile ──────────────────────────────────────────────────────────────────── */
const m = await b.newPage({ viewport: { width: 390, height: 844 } });
await m.goto(BASE, { waitUntil: "domcontentloaded" });
await m.waitForTimeout(2500);
rec("mobile: no horizontal scroll",
  await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  await m.evaluate(() => `${document.documentElement.scrollWidth} vs ${window.innerWidth}`));
rec("mobile: rail hidden",
  await m.locator(".swh-rail").evaluate((el) => getComputedStyle(el).display === "none"));
await m.evaluate(() => document.querySelector(".swh-figures").scrollIntoView());
await m.waitForTimeout(1500);
await m.screenshot({ path: `${OUT}/v-mobile-figures.png` });
await m.evaluate(() => document.querySelector(".swh-proof").scrollIntoView());
await m.waitForTimeout(1200);
await m.screenshot({ path: `${OUT}/v-mobile-proof.png` });

rec("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));

await b.close();
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(", ")}` : "\nall green");
process.exit(fails.length ? 1 : 0);
