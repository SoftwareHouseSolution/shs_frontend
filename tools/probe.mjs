/* Localises geometry differences between the prototype and the port, section by section. */
import { chromium } from "playwright";

const PROTO = "http://localhost:4173/ui_kits/swh-marketing/";
const PORT = "http://localhost:3000/";

const measure = (pg) => pg.evaluate(() => {
  const kids = [...document.querySelectorAll("#app > .page-content > *")];
  const r = (el) => { const b = el.getBoundingClientRect(); return { top: +(b.top + window.scrollY).toFixed(3), h: +b.height.toFixed(3) }; };
  const footer = document.querySelector(".sticky-footer");
  const spacer = footer?.previousElementSibling;
  return {
    sections: kids.map((el, i) => ({ i, tag: el.tagName.toLowerCase(), id: el.id || "", ...r(el) })),
    docHeight: document.documentElement.scrollHeight,
    bodyHeight: +document.body.getBoundingClientRect().height.toFixed(3),
    pageContent: +document.querySelector(".page-content").getBoundingClientRect().height.toFixed(3),
    footerH: footer ? +footer.getBoundingClientRect().height.toFixed(3) : null,
    footerOffsetH: footer ? footer.offsetHeight : null,
    spacerH: spacer ? spacer.style.height : null,
    bodyChildren: [...document.body.children].map((e) => `${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""}`),
  };
});

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
const load = async (url) => {
  const pg = await ctx.newPage();
  await pg.goto(url, { waitUntil: "networkidle" });
  await pg.waitForFunction(() => Array.from(document.images).every((i) => i.complete));
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(2000);
  return measure(pg);
};
const a = await load(PROTO);
const b = await load(PORT);

console.log("doc  ", a.docHeight, "vs", b.docHeight, " delta", b.docHeight - a.docHeight);
console.log("body ", a.bodyHeight, "vs", b.bodyHeight);
console.log("page-content", a.pageContent, "vs", b.pageContent, " delta", (b.pageContent - a.pageContent).toFixed(3));
console.log("footer rect", a.footerH, "vs", b.footerH, "| offsetHeight", a.footerOffsetH, "vs", b.footerOffsetH, "| spacer", a.spacerH, "vs", b.spacerH);
console.log("body children proto:", a.bodyChildren.join(", "));
console.log("body children port :", b.bodyChildren.join(", "));
console.log("\nsection            proto-top   port-top    dTop   proto-h     port-h      dH");
a.sections.forEach((s, i) => {
  const t = b.sections[i];
  const label = `${s.i} ${s.tag}${s.id ? "#" + s.id : ""}`.padEnd(18);
  console.log(`${label} ${String(s.top).padEnd(11)} ${String(t.top).padEnd(11)} ${(t.top - s.top).toFixed(3).padStart(6)}  ${String(s.h).padEnd(11)} ${String(t.h).padEnd(11)} ${(t.h - s.h).toFixed(3).padStart(7)}`);
});
await browser.close();
