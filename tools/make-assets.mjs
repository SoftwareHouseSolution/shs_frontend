/* Derived brand and partner assets. Run `node tools/make-assets.mjs` when a source file
   changes; the outputs are committed so a normal build needs neither sharp nor this file.

   Three jobs, all fixing the same class of problem — a delivered asset that only works on
   the background it happened to be exported against.

   1. app/icon.png + app/apple-icon.png — the browser tab icon.
   2. public/assets/brand/swh-logo-ink.png — the mark for LIGHT surfaces.
   3. public/assets/partners/hp.webp — repairs a bad PDF extraction.

   THE MARK'S PROBLEM: swh-logo.png is a blue roof plus an OFF-WHITE "S" on transparency.
   It was drawn to sit on something dark. On the footer's --paper and on the solid navbar
   the S disappears completely, leaving a roof floating over nothing — which is exactly
   what it looked like. `filter: brightness(0) invert(1)` already handles the reverse case
   (white-on-photo), but no CSS filter can recolour ONE part of an image, so the light
   variant has to be a real second file. */

import sharp from "sharp";
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MARK = path.join(ROOT, "public/assets/brand/swh-logo.png");
const INK = { r: 0x16, g: 0x19, b: 0x1d };
const HP_BLUE = { r: 0x00, g: 0x96, b: 0xd6 }; // HP's own brand blue

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

/* ── 3. HP partner mark ────────────────────────────────────────────────────────── */
/* The delivered hp.webp is a bad crop out of the company-profile PDF: a very faint blue
   outline of the roundel on the left, and the white corner of an unrelated product shot
   on the right. Rendered on --paper it read as a ghost next to a white blob.

   This crops to the roundel's measured bounding box and remaps it: how far a pixel is
   from white becomes the alpha, and the colour becomes HP's own blue. The result is a
   clean transparent mark at full strength rather than a 50%-grey ghost.

   It is a repair of a bad extraction, not a redraw. If HP's real logo file turns up, drop
   it in and delete this block. */

{
  const SRC = path.join(ROOT, "public/assets/partners/hp.webp");
  const BOX = { left: 0, top: 16, width: 162, height: 162 }; // measured; 2px bleed
  /* Read the bytes ourselves rather than handing sharp the path: libvips keeps the source
     file mapped, and on Windows that blocks writing the repaired version back over it. */
  const src = await readFile(SRC);
  const { data, info } = await sharp(src)
    .extract(BOX)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // 255 → fully transparent, 130 (the measured darkest ink) → fully opaque.
    const alpha = Math.max(0, Math.min(1, (250 - lum) / (250 - 130)));
    out[i] = HP_BLUE.r;
    out[i + 1] = HP_BLUE.g;
    out[i + 2] = HP_BLUE.b;
    out[i + 3] = Math.round(alpha * 255);
  }

  /* Buffer first, then write: sharp cannot stream a file back over the same path it is
     reading from, and the repair is genuinely in place. */
  const webp = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 92, alphaQuality: 100 })
    .toBuffer();
  await writeFile(SRC, webp);
  console.log("wrote", path.relative(ROOT, SRC), "(repaired in place)");
}
