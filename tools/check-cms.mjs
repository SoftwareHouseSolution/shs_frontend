/* Behaviour gate for the CMS integration: the pages render what the API serves, in the
   right language and direction, and the contact form reports validation errors and success
   the way the API words them.

   Needs the Django API (backend/, `python manage.py runserver`) and a production build:
     pnpm build && pnpm start -p 3001
     PORT_URL=http://localhost:3001/ node tools/check-cms.mjs      (SITE_LANG=ar for Arabic)

   Each run submits two enquiries per language — in local development raise
   API_THROTTLE_ENQUIRIES in backend/.env so repeated runs are not rate-limited. */

import { chromium } from "playwright";

const LANG = process.env.SITE_LANG ?? "en";
const BASE = (process.env.PORT_URL ?? "http://localhost:3001/").replace(/\/$/, "");
const API = (process.env.API_URL ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");

const fails = [];
const rec = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? `  — ${extra}` : ""}`);
  if (!ok) fails.push(name);
};

const api = async (path) => (await (await fetch(`${API}/${path}${path.includes("?") ? "&" : "?"}lang=${LANG}`)).json()).data;
const [site, home, about] = await Promise.all([api("site/"), api("home/"), api("pages/about-company/")]);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
/* The validation step provokes a deliberate 400 from /enquiries/, which Chrome logs as a
   failed resource. That one is expected; any other console error is not. */
page.on("console", (m) => {
  if (m.type() !== "error") return;
  if (m.text().startsWith("Failed to load resource") && m.location().url.includes("/enquiries/")) return;
  errors.push(m.text());
});

/* ── Document language and direction ─────────────────────────────────────────────── */
await page.goto(`${BASE}/${LANG}`, { waitUntil: "load" });
await page.waitForTimeout(400);
const dir = LANG === "ar" ? "rtl" : "ltr";
rec("<html lang> matches the route", (await page.getAttribute("html", "lang")) === LANG);
rec("<html dir> matches the language", (await page.getAttribute("html", "dir")) === dir, dir);
rec("#app carries dir in the server HTML", (await page.getAttribute("#app", "dir")) === dir);

/* ── Home renders CMS content ────────────────────────────────────────────────────── */
const heroTitle = (await page.textContent(".hero-carousel__title"))?.trim();
rec("hero shows the first CMS slide", heroTitle === home.hero[0].title, heroTitle);
const heroImg = await page.getAttribute(".hero-slide video", "poster");
rec("hero media is served from the CMS media store", Boolean(heroImg?.includes("/media/")), heroImg ?? "none");
const body = await page.textContent("main");
rec("services heading from CMS", body.includes(home.services.heading));
rec("closing band from CMS", body.includes(home.band.heading));
rec("contact heading from site settings", body.includes(site.settings.contact.heading));
const navLabels = await page.$$eval(".swh-nav__list > li > :first-child", (els) => els.map((e) => e.textContent.trim()));
rec("navbar labels come from the CMS", JSON.stringify(navLabels) === JSON.stringify(site.navigation.map((n) => n.label)), navLabels.join(" | "));
const cta = (await page.textContent(".swh-cta"))?.trim() ?? "";
rec("navbar CTA label from site settings", cta.includes(site.settings.primary_cta.label), cta);
const strip = await page.$$eval(".swh-proof__mark", (els) => els.length);
rec("client strip size matches the CMS", strip >= home.proof.strip.length, `${strip} marks`);

/* ── Interior page ───────────────────────────────────────────────────────────────── */
await page.goto(`${BASE}/${LANG}/about-company`, { waitUntil: "load" });
rec("page title from CMS", (await page.textContent("h1"))?.trim() === about.title);
const crumb = await page.textContent("nav[aria-label] ol");
rec("breadcrumb parent from navigation", Boolean(about.breadcrumb_parent && crumb?.includes(about.breadcrumb_parent)));
rec("document <title> from CMS", (await page.title()).startsWith(about.meta_title));

/* ── Contact form: validation ────────────────────────────────────────────────────── */
await page.goto(`${BASE}/${LANG}/#contact`, { waitUntil: "load" });
const form = page.locator("form.swh-enquiry");
await form.scrollIntoViewIfNeeded();
await form.locator('input[name="email"]').fill("not-an-email");
await form.locator('button[type="submit"]').click();
await page.waitForSelector(".swh-enquiry__error", { timeout: 10000 });
const invalid = await form.locator('[aria-invalid="true"]').count();
rec("server validation marks the invalid fields", invalid >= 3, `${invalid} fields`);
const errText = await form.locator(".swh-enquiry__error").first().textContent();
const arabic = /[؀-ۿ]/.test(errText ?? "");
rec("field errors are in the page language", LANG === "ar" ? arabic : !arabic, errText ?? "");
const focused = await page.evaluate(() => document.activeElement?.getAttribute("name"));
rec("focus moves to the first invalid field", focused === "full_name", focused ?? "none");

/* ── Contact form: success ───────────────────────────────────────────────────────── */
const stamp = Date.now();
await form.locator('input[name="full_name"]').fill("Playwright Check");
await form.locator('input[name="email"]').fill(`check+${stamp}@example.com`);
await form.locator('textarea[name="message"]').fill(`Automated check ${stamp}: please ignore this enquiry.`);
await form.locator('button[type="submit"]').click();
await page.waitForSelector(".swh-enquiry--sent", { timeout: 10000 });
const ref = await page.textContent(".swh-enquiry__ref");
rec("success shows the API's reference", /ENQ-\d{6}/.test(ref ?? ""), ref ?? "");

/* ── Phone layout ────────────────────────────────────────────────────────────────── */
const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
await phone.goto(`${BASE}/${LANG}/#contact`, { waitUntil: "load" });
const overflow = await phone.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
rec("mobile: no horizontal scroll with the form", overflow <= 0, `${overflow}px`);
const cols = await phone.$eval(".swh-enquiry__grid", (g) => getComputedStyle(g).gridTemplateColumns.split(" ").length);
rec("mobile: form stacks to one column", cols === 1, `${cols} columns`);

rec("no console errors or page errors", errors.length === 0, errors.slice(0, 3).join(" / "));

await browser.close();
console.log(fails.length ? `\n${fails.length} failed: ${fails.join(", ")}` : "\nall green");
process.exit(fails.length ? 1 : 0);
