/* Derived brand and partner assets. Run `node tools/make-assets.mjs` when a source file
   changes; the outputs are committed so a normal build needs neither sharp nor this file.

   Two jobs, both fixing the same class of problem — a delivered asset that only works on
   the background it happened to be exported against.

   1. app/icon.png + app/apple-icon.png — the browser tab icon.
   2. public/assets/brand/swh-logo-ink.png — the mark for LIGHT surfaces.

   A third job used to live here: rebuilding the HP partner mark from a faint outline crop
   in the company-profile PDF. It is gone. The reconstruction shipped ragged strokes and a
   fill that leaked past the rim, and it wrote its output back over its own input, so a
   second run would have flattened the mark to a white disc. The logo is now authored
   geometry in public/assets/partners/hp.svg and needs no build step.

   THE MARK'S PROBLEM: swh-logo.png is a blue roof plus an OFF-WHITE "S" on transparency.
   It was drawn to sit on something dark. On the footer's --paper and on the solid navbar
   the S disappears completely, leaving a roof floating over nothing — which is exactly
   what it looked like. `filter: brightness(0) invert(1)` already handles the reverse case
   (white-on-photo), but no CSS filter can recolour ONE part of an image, so the light
   variant has to be a real second file. */

import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MARK = path.join(ROOT, "public/assets/brand/swh-logo.png");
const INK = { r: 0x16, g: 0x19, b: 0x1d };

/* ── 1. App icons ──────────────────────────────────────────────────────────────── */

async function icon(size, out, padRatio, radiusRatio) {
  const inner = Math.round(size * (1 - padRatio * 2));
  const mark = await sharp(MARK)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const plate = await sharp({
    create: { width: size, height: size, channels: 4, background: { ...INK, alpha: 1 } },
  })
    .composite([{ input: mark, top: Math.round(size * padRatio), left: Math.round(size * padRatio) }])
    .png()
    .toBuffer();

  if (radiusRatio > 0) {
    const r = Math.round(size * radiusRatio);
    const mask = Buffer.from(
      `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#fff"/></svg>`,
    );
    await sharp(plate).composite([{ input: mask, blend: "dest-in" }]).png().toFile(out);
  } else {
    await sharp(plate).png().toFile(out);
  }
  console.log("wrote", path.relative(ROOT, out));
}

// Favicon: tight padding and a light round, because it renders at 16–32px.
await icon(512, path.join(ROOT, "app/icon.png"), 0.14, 0.14);
// Apple touch icon: iOS applies its own mask, so this one ships square.
await icon(180, path.join(ROOT, "app/apple-icon.png"), 0.18, 0);

/* ── 2. Light-surface mark ─────────────────────────────────────────────────────── */

{
  const { data, info } = await sharp(MARK).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += info.channels) {
    const [r, g, b, a] = [out[i], out[i + 1], out[i + 2], out[i + 3]];
    if (a < 8) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    /* Bright and near-neutral = the "S". The roof is bright too, but it is blue, so the
       saturation test is what separates them — a luminance threshold alone would flatten
       the whole mark to ink. */
    if (max > 200 && max - min < 30) {
      out[i] = INK.r;
      out[i + 1] = INK.g;
      out[i + 2] = INK.b;
    }
  }
  const dest = path.join(ROOT, "public/assets/brand/swh-logo-ink.png");
  await sharp(out, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png()
    .toFile(dest);
  console.log("wrote", path.relative(ROOT, dest));
}
