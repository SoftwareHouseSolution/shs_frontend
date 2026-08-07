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
   OUTLINE of the roundel on the left, and the white corner of an unrelated product shot on
   the right.

   The first repair only cropped it and pushed the outline to full strength. That was still
   wrong, and obviously so next to Microsoft, Dell, Zebra and Bixolon — they are solid marks
   and HP was a wireframe. A line drawing among filled logos reads as a loading state.

   HP's actual logo is a SOLID blue disc with the "hp" slashes knocked out in white, so that
   is what this builds: paint the disc, then use the extracted line art's own darkness as an
   alpha mask to lay white strokes over it. The source's rim line falls on the disc edge and
   disappears into it; the letterform strokes become the white "hp". Nothing is invented —
   every stroke position comes from the delivered file.

   Still a repair, not a licensed asset. If HP's real logo file turns up, drop it in and
   delete this block. */

{
  const SRC = path.join(ROOT, "public/assets/partners/hp.webp");
  const SIZE = 320; // rendered at ~76px; 4x gives clean edges
  /* Read the bytes ourselves rather than handing sharp the path: libvips keeps the source
     file mapped, and on Windows that blocks writing the repaired version back over it. */
  const src = await readFile(SRC);

  /* The roundel's measured bounding box in the original 320x191 crop. Re-measure with the
     bbox scan in the git history if the source is ever reissued. */
  const BOX = { left: 0, top: 16, width: 162, height: 162 };
  const { data, info } = await sharp(src)
    .extract(BOX)
    .resize(SIZE, SIZE, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  /* The source draws the letters as OUTLINES, so painting the ink white gives hollow
     letters — a wireframe on a disc, which is what the previous attempt looked like. The
     letters have to be filled.

     Two flood fills do it without knowing anything about letterforms:
       1. From the four corners, across every non-ink pixel. That floods the area OUTSIDE
          the roundel and stops at the rim.
       2. From a seed just inside the rim at mid-height — between the rim and the "h" — for
          the disc's own background.
     Whatever is left is enclosed by ink but is neither outside nor disc background: the
     insides of the h and the p. Those get filled white along with the strokes themselves. */
  const ink = new Float32Array(SIZE * SIZE);
  for (let p = 0; p < SIZE * SIZE; p++) {
    const i = p * 4;
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    ink[p] = Math.max(0, Math.min(1, (250 - lum) / (250 - 130)));
  }

  /* The outlines are antialiased and, at this scale, have sub-pixel gaps. A flood fill
     leaks straight through those, which is why the first fill attempt still came out
     hollow. So the WALL mask is the ink mask dilated by one pixel — a 3x3 max filter,
     the cheap half of a morphological close. It seals hairline gaps without thickening
     the strokes, because only the wall mask is dilated; the alpha still comes from the
     original ink. */
  const INK_AT = 0.16;
  const wall = new Uint8Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let hit = 0;
      for (let dy = -1; dy <= 1 && !hit; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE) continue;
          if (ink[ny * SIZE + nx] >= INK_AT) {
            hit = 1;
            break;
          }
        }
      }
      wall[y * SIZE + x] = hit;
    }
  }

  const seen = new Uint8Array(SIZE * SIZE);
  const flood = (seeds) => {
    const stack = seeds.filter((p) => !seen[p] && !wall[p]);
    stack.forEach((p) => (seen[p] = 1));
    while (stack.length) {
      const p = stack.pop();
      const x = p % SIZE;
      const y = (p / SIZE) | 0;
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE) continue;
        const n = ny * SIZE + nx;
        if (seen[n] || wall[n]) continue;
        seen[n] = 1;
        stack.push(n);
      }
    }
  };

  // 1. Outside the roundel.
  const border = [];
  for (let x = 0; x < SIZE; x++) border.push(x, (SIZE - 1) * SIZE + x);
  for (let y = 0; y < SIZE; y++) border.push(y * SIZE, y * SIZE + SIZE - 1);
  flood(border);
  // 2. The disc's background, seeded on the ring between the rim and the letters.
  flood([
    Math.round(SIZE * 0.5) * SIZE + Math.round(SIZE * 0.06),
    Math.round(SIZE * 0.5) * SIZE + Math.round(SIZE * 0.94),
    Math.round(SIZE * 0.06) * SIZE + Math.round(SIZE * 0.5),
    Math.round(SIZE * 0.94) * SIZE + Math.round(SIZE * 0.5),
  ]);

  const strokes = Buffer.alloc(data.length);
  for (let p = 0; p < SIZE * SIZE; p++) {
    const i = p * 4;
    // Enclosed and unreached = letter interior, so opaque; otherwise follow the ink.
    const a = seen[p] ? ink[p] : 1;
    strokes[i] = 255;
    strokes[i + 1] = 255;
    strokes[i + 2] = 255;
    strokes[i + 3] = Math.round(a * 255);
  }

  const disc = Buffer.from(
    `<svg width="${SIZE}" height="${SIZE}"><circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2 - 1}" fill="rgb(${HP_BLUE.r},${HP_BLUE.g},${HP_BLUE.b})"/></svg>`,
  );

  const webp = await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: disc },
      { input: strokes, raw: { width: info.width, height: info.height, channels: 4 } },
    ])
    .webp({ quality: 94, alphaQuality: 100 })
    .toBuffer();

  await writeFile(SRC, webp);
  console.log("wrote", path.relative(ROOT, SRC), "(rebuilt as a solid mark)");
}
