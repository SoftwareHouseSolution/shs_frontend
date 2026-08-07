/* Behavioural checks for the hero carousel. Run against `next start`.
   node tools/check-hero.mjs   (override with PORT_URL) */
import { chromium } from "playwright";

const URL = process.env.PORT_URL ?? "http://localhost:3001/";
const results = [];
const rec = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch();

/* ---------- normal motion ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(URL, { waitUntil: "networkidle" });
  /* Only the hero's own images: the page below the fold now carries lazy-loaded
     client logos and event photography that never report complete until they are
     scrolled into view, so waiting on document.images would never resolve. */
  await p.waitForFunction(() =>
    Array.from(document.querySelectorAll(".hero-slide__img, .swh-page-header__img"))
      .every((i) => i.complete));

  rec("carousel is present and marked as the nav hero",
    await p.locator(".hero-carousel[data-nav-hero]").count() === 1);
  rec("four slides rendered", await p.locator(".hero-slide").count() === 4);

  // Slide 1 is video. It must carry the crossfade but never the ken-burns, and it must be
  // playing muted and inline rather than waiting on a click.
  const video = await p.evaluate(async () => {
    const v = document.querySelector('.hero-slide[data-state="enter"] .hero-slide__video');
    if (!v) return null;
    await new Promise((r) => setTimeout(r, 600));
    return {
      tag: v.tagName,
      muted: v.muted,
      loop: v.loop,
      playing: !v.paused,
      anim: getComputedStyle(v).animationName,
      zoomSibling: !!document.querySelector('.hero-slide[data-state="enter"] .hero-slide__img'),
    };
  });
  rec("slide 1 is a playing muted video", !!video && video.tag === "VIDEO" && video.muted && video.loop && video.playing,
    video ? `muted=${video.muted} loop=${video.loop} playing=${video.playing}` : "no video element");
  rec("video slide carries no ken burns", !!video && video.anim === "none" && !video.zoomSibling,
    video ? `animation=${video.anim}` : "");

  // The pause button is the WCAG 2.2.2 control for this region, so it must stop the
  // footage too — not just the slide timer.
  await p.locator(".hero-carousel__toggle").click();
  await p.waitForTimeout(200);
  const vPaused = await p.$eval(".hero-slide__video", (v) => v.paused);
  await p.locator(".hero-carousel__toggle").click();
  await p.waitForTimeout(300);
  const vResumed = await p.$eval(".hero-slide__video", (v) => !v.paused);
  rec("pause control stops and resumes the video", vPaused && vResumed,
    `paused=${vPaused} resumed=${vResumed}`);

  // Advance to a photo slide, and confirm the outgoing slide enters `exit`.
  await p.locator(".hero-carousel__dot").nth(1).click();
  await p.waitForTimeout(120);
  const states0 = await p.$$eval(".hero-slide", (els) => els.map((e) => e.dataset.state));
  rec("dot advances and previous slide exits",
    states0[1] === "enter" && states0[0] === "exit", states0.join(","));

  // Ken Burns actually moves the image (checked on a photo slide).
  const zoom = await p.evaluate(async () => {
    const img = document.querySelector('.hero-slide[data-state="enter"] .hero-slide__img');
    const read = () => new DOMMatrixReadOnly(getComputedStyle(img).transform).a;
    const a = read();
    await new Promise((r) => setTimeout(r, 1500));
    return { from: a, to: read() };
  });
  rec("ken burns is zooming", zoom.to > zoom.from,
    `scale ${zoom.from.toFixed(4)} -> ${zoom.to.toFixed(4)}`);

  // Opacity lives on the wrapper, transform on the child — never the same node.
  const layering = await p.evaluate(() => {
    const slide = document.querySelector('.hero-slide[data-state="enter"]');
    const img = slide.querySelector(".hero-slide__img");
    return {
      slideTransform: getComputedStyle(slide).transform,
      imgOpacity: getComputedStyle(img).opacity,
    };
  });
  rec("fade and zoom are on separate nodes",
    layering.slideTransform === "none" && layering.imgOpacity === "1",
    `slide transform=${layering.slideTransform}, img opacity=${layering.imgOpacity}`);

  // Advance photo -> photo and confirm the outgoing slide keeps its animation.
  await p.locator(".hero-carousel__dot").nth(2).click();
  await p.waitForTimeout(120);
  const states = await p.$$eval(".hero-slide", (els) => els.map((e) => e.dataset.state));
  rec("second advance exits the previous photo slide",
    states[2] === "enter" && states[1] === "exit", states.join(","));
  const exitAnim = await p.evaluate(() =>
    getComputedStyle(document.querySelector('.hero-slide[data-state="exit"] .hero-slide__img')).animationName);
  rec("exiting slide keeps zooming (no mid-fade snap-back)", exitAnim === "swh-hero-zoom", exitAnim);

  // Pause control.
  await p.locator(".hero-carousel__toggle").click();
  const before = await p.$eval(".hero-slide[data-state='enter']", (e) => e.previousElementSibling ? 1 : 0);
  void before;
  const idxBefore = await p.$$eval(".hero-slide", (els) => els.findIndex((e) => e.dataset.state === "enter"));
  await p.waitForTimeout(8500);
  const idxAfter = await p.$$eval(".hero-slide", (els) => els.findIndex((e) => e.dataset.state === "enter"));
  rec("pause control stops auto-advance", idxBefore === idxAfter, `slide ${idxBefore} -> ${idxAfter}`);

  // Keyboard.
  await p.locator(".hero-carousel__toggle").focus();
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(150);
  const idxKey = await p.$$eval(".hero-slide", (els) => els.findIndex((e) => e.dataset.state === "enter"));
  rec("ArrowRight advances the carousel", idxKey === (idxAfter + 1) % 4, `slide ${idxAfter} -> ${idxKey}`);

  for (const w of [375, 800, 1024, 1199, 1440]) {
    await p.setViewportSize({ width: w, height: 900 });
    await p.waitForTimeout(150);
    const ok = await p.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth);
    rec(`no horizontal overflow @${w}`, ok);
  }

  rec("console clean", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

/* ---------- reduced motion ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: "networkidle" });
  /* Only the hero's own images: the page below the fold now carries lazy-loaded
     client logos and event photography that never report complete until they are
     scrolled into view, so waiting on document.images would never resolve. */
  await p.waitForFunction(() =>
    Array.from(document.querySelectorAll(".hero-slide__img, .swh-page-header__img"))
      .every((i) => i.complete));

  // The video never starts. It holds on its poster instead — the whole point of driving
  // playback from an effect rather than from an autoPlay attribute.
  await p.waitForTimeout(800);
  const vr = await p.$eval(".hero-slide__video", (v) => ({ paused: v.paused, t: v.currentTime }));
  rec("reduced motion: video never plays", vr.paused && vr.t === 0, `paused=${vr.paused} t=${vr.t}`);

  const i0 = await p.$$eval(".hero-slide", (els) => els.findIndex((e) => e.dataset.state === "enter"));
  await p.waitForTimeout(9000);
  const i1 = await p.$$eval(".hero-slide", (els) => els.findIndex((e) => e.dataset.state === "enter"));
  rec("reduced motion: frozen on slide 1", i0 === 0 && i1 === 0, `${i0} -> ${i1}`);

  // Manual control must still work — reduced motion removes involuntary motion, not agency.
  await p.locator(".hero-carousel__dot").nth(2).click();
  await p.waitForTimeout(150);
  const i2 = await p.$$eval(".hero-slide", (els) => els.findIndex((e) => e.dataset.state === "enter"));
  rec("reduced motion: manual controls still work", i2 === 2, `now slide ${i2}`);

  rec("reduced motion: no zoom animation on the photo slide",
    (await p.evaluate(() => getComputedStyle(document.querySelector('.hero-slide[data-state="enter"] .hero-slide__img')).animationName)) === "none");
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) process.exitCode = 1;
