/* Verifies that the copied design-system files are still byte-identical to their source.
   This is the parity guarantee that is STILL LIVE. (The pixel-parity guarantee on `/`
   was intentionally retired when the site-wide navbar and hero carousel landed — see
   README.md and tools/compare.mjs.)

   node tools/check-ds-parity.mjs */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, basename } from "node:path";

const WEB = resolve(import.meta.dirname, "..");
const DS = resolve(
  WEB,
  "../softwarehouse-frontend/Software House Solutions Design System",
);

/* The two files that gained a "use client" directive when copied. Nothing else in
   components/ds/ may differ from its source at all. */
const ALLOWED_ADDED_LINE = '"use client";';
const MAY_ADD_DIRECTIVE = new Set(["Reveal.jsx", "PillButton.jsx"]);

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
