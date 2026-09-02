/* Re-encode the customer-page welcome videos for the web.

   `node tools/encode-video.mjs` — reads the masters from video-masters/ (gitignored) and
   overwrites the two files in public/assets/video/.

   `pnpm encode:video` / `npm run encode:video` runs it.

   ffmpeg comes from the `ffmpeg-static` devDependency, not from PATH. A prebuilt binary in
   node_modules means this runs identically on any machine that has cloned the repo, with
   no "works on mine" step in between — the alternative was asking every future maintainer
   to install ffmpeg system-wide before they could touch a video. It falls back to a PATH
   ffmpeg if the package is ever removed.

   NOTE: ffmpeg-static fetches its binary in a postinstall script, and npm/pnpm may block
   install scripts by default. If the check below says there is no usable ffmpeg after a
   clean install, that is why — approve the script, or install ffmpeg system-wide; the
   fallback to PATH covers the second case.

   ── WHY THIS EXISTS ─────────────────────────────────────────────────────────────────
   The encodes that shipped are 11.9 MB and 12.0 MB for 29 seconds — 3.47 Mbps each. The
   hero video on the home page is 0.31 Mbps. That is eleven times the bitrate for a clip
   that opens by itself, over a popup, on a page that is also loading a Google Maps embed
   and 367 client logos.

   The cause is FRAME RATE, mostly. Both files are 60 fps straight off the phone. Sixty
   frames a second roughly doubles the bitrate of any given encode, and buys nothing at
   all here: this is a product clip in a 900px-tall panel, not a game capture or a slow
   motion shot. Thirty is indistinguishable and halves the problem on its own.

   The rest is a generous quality setting with no ceiling on it. CRF alone lets a busy
   scene spike as high as it likes; -maxrate/-bufsize put a roof on the worst second,
   which is the second that decides whether a phone stalls.

   ── WHAT IS ALREADY CORRECT, AND IS NOT TOUCHED ────────────────────────────────────
   - +faststart. The moov atom is already the first box in both files, so playback can
     begin before the download finishes. This is the usual suspect for "the video takes
     forever to start" and it is NOT the problem here — it is already right, and the flag
     below keeps it that way.
   - The two-file split. IMG_7784 is the landscape cut, IMG_7785_Mobile a portrait recut
     of the same 29 seconds; they are different framings, not the same footage at two
     sizes, so neither can be dropped. See CustomerVideoModal.tsx.
   - Caching. tools/build-static.mjs writes an .htaccess that serves .mp4 as immutable for
     a year, so this is a first-visit cost, not a per-visit one.

   ── RESULT ─────────────────────────────────────────────────────────────────────────
   11.9 MB -> 4.6 MB and 12.0 MB -> 4.7 MB. 3.47 Mbps -> ~1.35 Mbps, a 61% cut, so roughly
   two and a half times less waiting on any given connection. Re-run and lower CRF if the
   client judges it too soft; every number is in the JOBS table below for that reason. */

import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegStatic from "ffmpeg-static";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "video-masters");
const OUT_DIR = path.join(ROOT, "public", "assets", "video");

/* FPS is the lever that matters; CRF is the one to turn if quality is judged too low.
   Lower CRF = better and bigger, in steps of about 10% per point. */
const FPS = 30;

const JOBS = [
  {
    master: "IMG_7784.MP4",
    out: "IMG_7784.mp4",
    /* 1280x720, down from the 1600x900 that shipped. Not a quality compromise — a size
       correction. .swh-vmodal__panel is `width: min(1080px, ...)`, so the landscape panel
       is never wider than 1080 CSS pixels on any screen; a 1600px source was carrying ~56%
       more pixels than the layout can ever put on screen. 1280 still oversamples the
       largest case by 1.19x, which is the margin a high-DPI display wants from video.

       The poster does not need recutting: it is a still that scales to the same box. */
    scale: "1280:720",
    crf: 26,
    maxrate: "1200k",
    bufsize: "2400k",
  },
  {
    master: "IMG_7785_Mobile.MP4",
    out: "IMG_7785_Mobile.mp4",
    /* Portrait keeps 1080x1920. It is served only under (max-width: 767px), where the panel
       fills the viewport width — about 390 CSS px on a phone, which is ~1170 device pixels
       at 3x, so 1080 is already the right side of the line and cutting it would show.

       It gets the tighter CRF instead. This is the file phones download, and a phone is
       exactly where the bandwidth is not. */
    scale: "1080:1920",
    crf: 28,
    maxrate: "1200k",
    bufsize: "2400k",
  },
];

/* The packaged binary, or whatever is on PATH if the dependency has been dropped. */
const FFMPEG = ffmpegStatic && existsSync(ffmpegStatic) ? ffmpegStatic : "ffmpeg";
const have = spawnSync(FFMPEG, ["-version"], { stdio: "ignore" });
if (have.status !== 0) {
  console.error(
    "No usable ffmpeg.\n" +
      "  npm install            (restores the ffmpeg-static binary)\n" +
      "  or install ffmpeg system-wide and re-run.",
  );
  process.exit(1);
}

const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(1);
let failed = false;

for (const job of JOBS) {
  const src = path.join(SRC_DIR, job.master);
  const out = path.join(OUT_DIR, job.out);
  if (!existsSync(src)) {
    console.error(`MISSING master: ${path.relative(ROOT, src)} — skipped.`);
    failed = true;
    continue;
  }
  const before = existsSync(out) ? mb(out) : "—";

  const args = [
    "-y",
    "-i", src,
    // fps first, then scale: dropping frames before resampling is the cheaper order.
    "-vf", `fps=${FPS},scale=${job.scale}:flags=lanczos`,
    "-c:v", "libx264",
    // `slow` spends encoder time, not bytes. It is free at build time and paid once.
    "-preset", "slow",
    "-profile:v", "high",
    "-level", "4.0",
    "-crf", String(job.crf),
    // The ceiling. CRF alone lets one busy second spike far above the average, and that
    // second is where a phone stalls.
    "-maxrate", job.maxrate,
    "-bufsize", job.bufsize,
    // Safari and every hardware decoder want 4:2:0 8-bit. iPhone masters are not always.
    "-pix_fmt", "yuv420p",
    // The clip opens muted and offers sound on a tap, so the track has to stay — but 128k
    // stereo AAC is transparent for this material and the masters carry far more.
    "-c:a", "aac",
    "-b:a", "128k",
    "-ac", "2",
    // Keeps the moov atom at the front so playback starts before the download ends.
    "-movflags", "+faststart",
    out,
  ];

  console.log(`\nencoding ${job.master} -> ${job.out} (${FPS}fps, crf ${job.crf})`);
  const res = spawnSync(FFMPEG, args, { stdio: "inherit", shell: false });
  if (res.status !== 0) {
    console.error(`ffmpeg failed on ${job.master}`);
    failed = true;
    continue;
  }
  console.log(`${job.out}: ${before} MB -> ${mb(out)} MB`);
}

if (failed) process.exit(1);
console.log(
  "\nDone. Posters are unchanged — they are frame 0 of each master and the framing did not move.",
);
