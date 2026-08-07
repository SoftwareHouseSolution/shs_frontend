/* Verifies that the copied design-system files are still byte-identical to their source.
   This is the parity guarantee that is STILL LIVE. (The pixel-parity guarantee on `/`
   was intentionally retired when the site-wide navbar and hero carousel landed — see
   README.md and tools/compare.mjs.)

   node tools/check-ds-parity.mjs */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, basename } from "node:path";

const WEB = resolve(import.meta.dirname, "..");

/* The design system lives OUTSIDE this repository — it is a sibling working directory, not
   a dependency, and it is not committed here. So this check only runs on a machine that has
   both, and it exits 0 with a notice rather than failing when the source is absent. A clone
   of this repo alone cannot verify parity, and pretending otherwise would make CI red for a
   reason nobody could fix.

   It moved twice on 2026-08-07: the folder was renamed (apps/softwarehouse-frontend ->
   apps/design_assets) and its contents were then nested one level deeper under
   claude_design/. Candidates are newest-first; the check locates itself by looking for the
   components/ directory rather than trusting any one path. */
const CANDIDATES = [
  "../design_assets/Software House Solutions Design System/claude_design",
  "../design_assets/Software House Solutions Design System",
  "../softwarehouse-frontend/Software House Solutions Design System",
];
const DS = CANDIDATES.map((c) => resolve(WEB, c)).find((p) => {
  try {
    return statSync(join(p, "components")).isDirectory();
  } catch {
    return false;
  }
});

if (!DS) {
  console.log(
    "SKIP  design-system parity: source not found next to this repo.\n" +
      "      Looked for:\n" +
      CANDIDATES.map((c) => "        " + resolve(WEB, c)).join("\n"),
  );
  process.exit(0);
}

/* The two files that gained a "use client" directive when copied. Nothing else in
   components/ds/ may differ from its source at all — except the file below. */
const ALLOWED_ADDED_LINE = '"use client";';
const MAY_ADD_DIRECTIVE = new Set(["Reveal.jsx", "PillButton.jsx"]);

/* BrandLogo.jsx is a DECLARED FORK as of 2026-08-07, not a drift.

   The delivered mark is a blue roof plus an OFF-WHITE "S", so it only works on something
   dark; on the footer's --paper and on the solid navbar the S disappeared and the roof
   floated over nothing. The fix needs a second asset — no CSS filter recolours one part of
   an image — and therefore a component that chooses between two files. That cannot be done
   without editing this component, so parity is knowingly given up for this one file.

   It is listed here rather than silently excluded so the fork stays visible in the check's
   output. If the design system ever ships its own light-surface variant, delete this and
   restore parity. */
const FORKED = new Map([
  ["BrandLogo.jsx", "light-surface mark variant — see tools/make-assets.mjs"],
]);

/* fonts.css is the one token file that legitimately differs: its five src url() paths
   were rewritten from ../assets/fonts/ to /assets/fonts/ so they resolve against public/. */
const TOKEN_EXCEPTION = "fonts.css";

const results = [];
const rec = (name, pass, detail) => {
  results.push({ name, pass, detail });
  if (!pass) console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
};

function findInDs(name, dir = join(DS, "components")) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      const hit = findInDs(name, p);
      if (hit) return hit;
    } else if (e === name) return p;
  }
  return null;
}

/* ---- components/ds ---- */
const dsDir = join(WEB, "components", "ds");
const copied = readdirSync(dsDir);
let checked = 0;

for (const f of copied) {
  const src = findInDs(f);
  if (!src) {
    rec(`${f}: source found in design system`, false, "no matching file in the design system");
    continue;
  }
  const a = readFileSync(src, "utf8");
  const b = readFileSync(join(dsDir, f), "utf8");
  checked++;

  if (a === b) {
    rec(`${f} identical`, true);
    continue;
  }

  // A declared fork is reported as such, so it is never mistaken for accidental drift.
  const fork = FORKED.get(basename(f));
  if (fork) {
    rec(`${f} is a declared fork (${fork})`, true);
    continue;
  }

  const bLines = b.split(/\r?\n/);
  const stripped = bLines[0].trim() === ALLOWED_ADDED_LINE ? bLines.slice(1).join("\n") : null;
  const ok = stripped !== null && stripped === a && MAY_ADD_DIRECTIVE.has(basename(f));
  rec(
    `${f} differs only by "use client"`,
    ok,
    ok ? "" : "unexpected difference from the design-system source",
  );
}

rec("all 22 design-system files checked", checked === 22, `${checked} checked`);

/* ---- styles ---- */
for (const f of readdirSync(join(WEB, "styles", "tokens"))) {
  const a = readFileSync(join(DS, "tokens", f), "utf8");
  const b = readFileSync(join(WEB, "styles", "tokens", f), "utf8");
  if (f === TOKEN_EXCEPTION) {
    const normalised = b
      .replace(/url\("\/assets\/fonts\//g, 'url("../assets/fonts/')
      .replace(/\n\n   PORT NOTE:[\s\S]*?byte-identical to the design system\. \*\//, " */");
    rec(
      `${f} differs only by the documented url() rewrite`,
      normalised === a,
      normalised === a ? "" : "unexpected difference beyond the font paths",
    );
  } else {
    rec(`tokens/${f} identical`, a === b, a === b ? "" : "differs from the design system");
  }
}

const stylesA = readFileSync(join(DS, "styles.css"), "utf8");
const stylesB = readFileSync(join(WEB, "styles", "styles.css"), "utf8");
rec("styles.css identical", stylesA === stylesB);

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} parity checks passed.`);
if (failed.length) process.exitCode = 1;
