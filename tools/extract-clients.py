"""One-off: turn "Company Profile Final 2026.pdf" into content/clients.ts + logo WebPs.

Committed for provenance, NOT part of the build. Re-run only if the PDF is reissued:

    cd apps/web && python tools/extract-clients.py

Requires pymupdf + pillow on the dev machine. Deliberately not in package.json — nothing
at build or request time touches the PDF.

How the parse works. Each client page is a 4-column grid, 1440pt wide, with the cell text
above its logo. Splitting the page's words into four 360pt columns and grouping them into
lines recovers the cells reliably; the business-type line ("Manufacturing - Wholesale -
Retail") is the anchor, with the location on the line above it and the name above that.

Two traps, both already paid for:

  - "Diamond" must NOT be a business-type keyword. It appears inside brand names
    ("Royal Gold & Diamond", "LDC Lab Diamond Center") and treating it as a type
    swallows the name.
  - Logos cannot be pulled by xref. The PDF reuses a single xref across different cells,
    so extracting embedded bitmaps gives the wrong logo. They have to be RENDERED from
    the page, and the clip's x-range has to come from the image placement rather than the
    nominal column, because wide logos overflow their column.
"""
import fitz, re, os, json
import numpy as np
from PIL import Image, ImageChops

PDF = r"C:\Users\Admin\Downloads\Company Profile Final 2026.pdf"
OUT_LOGOS = "public/assets/clients"
OUT_TS = "content/clients.ts"
JEWEL, ERP = range(10, 54), range(54, 57)
# --paper from styles/tokens/colors.css. Logos are composited onto it — see render_trimmed.
PAPER = (0xFA, 0xFA, 0xF8)
COLW, PAGEH = 1440 / 4.0, 810
TYPE_WORDS = {"manufacturing", "wholesale", "retail", "wholesalel"}
# A cell whose "location" is one of these has no location at all — the word is the tail
# of the brand name, sitting one line higher than the layout expects.
TRADE_WORDS = {"gold", "jewelry", "jewellery", "jewelery", "jewels", "diamond", "silver"}
TITLE_CUT = {10: 380, 54: 380}
NOISE = re.compile(
    r"^(software house solution\s*|our jewellery|sector clients|our erp sector|sector|clients|\d{1,3})$", re.I)

REGION_RULES = [
    ("International", ("lebanon", "america", "emrat", "emirat")),
    ("Alexandria", ("alexandr", "agami", "amria", "amirya", "amriya")),
    ("Sinai & Red Sea", ("sinai", "areesh", "hurghada")),
    ("Upper Egypt", ("sohag", "asuit", "asyout", "assiut", "minya", "miniya",
                     "fayoum", "beni s", "qena", "aswan", "luxor")),
    ("Delta & Canal", ("mansour", "mansora", "tanta", "damiet", "damett", "mahal",
                       "kafr", "kafer", "damnhour", "damanhour", "banha", "munofia",
                       "menoufia", "qalub", "qalyb", "behera", "bihira", "shebeen",
                       "shebin", "sbin", "shibin", "desouk", "zawya", "portsaid",
                       "sues", "syways", "gesr", "qanat", "zagazig", "ismail")),
    ("Giza", ("giza", "october", "zayed", "haram", "ahram", "imbaba",
              "mohands", "faisal", "dokk", "dokii", "doki")),
    ("Greater Cairo", ("cairo", "helio", "helipol", "korba", "sagha", "sahgha", "nasr",
                       "shubra", "shoubra", "maadi", "maddi", "madin", "rehab", "obour",
                       "downtown", "ain shams", "helwan", "mokat", "moktam", "zamalek",
                       "matary", "matara", "shrouk", "shorouk", "shrook", "mivida",
                       "sheraton", "abasya", "almaza", "manial", "masr el", "meet ghamra",
                       "midan", "medan", "zeyton", "marg", "mirage", "concard", "mar.v",
                       "gamea", "gama", "kom")),
]

REGION_ORDER = ["Greater Cairo", "Giza", "Alexandria", "Delta & Canal",
                "Upper Egypt", "Sinai & Red Sea", "International", "Other"]


def region_of(loc):
    s = loc.lower()
    for name, keys in REGION_RULES:
        if any(k in s for k in keys):
            return name
    return "Other"


def col_lines(page, ymin):
    """Words -> per-column lists of (y, line-text), top to bottom."""
    cols = {0: [], 1: [], 2: [], 3: []}
    for x0, y0, x1, y1, w, *_ in page.get_text("words"):
        if y0 < ymin:
            continue
        cols[max(0, min(3, int(((x0 + x1) / 2) // COLW)))].append((y0, x0, w))
    out = {}
    for c, ws in cols.items():
        ws.sort(key=lambda t: (round(t[0] / 6), t[1]))
        lines = []
        for y0, x0, w in ws:
            if lines and abs(lines[-1][0] - y0) < 9:
                lines[-1][1].append(w)
            else:
                lines.append([y0, [w]])
        out[c] = [(y, " ".join(t)) for y, t in lines]
    return out


def is_type(t):
    """True when the line is only business types.

    "Diamond" is a qualifier, never a type on its own — "Wholesale Diamond" is a type
    line, but "Royal Gold & Diamond" and "LDC Lab Diamond Center" are brand names, and
    treating the bare word as a type swallows them.

    The camel-case split handles "polisRetail", where the PDF glues the tail of a
    location to the type with no space.
    """
    t = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", t)
    toks = [w.strip(" -&,").lower() for w in re.split(r"[-&/]| ", t) if w.strip(" -&,")]
    if not toks:
        return False
    if toks == ["diamond"]:
        return False
    return all(w in TYPE_WORDS or w == "diamond" for w in toks)


def split_glued_type(t):
    """('Heliopolis', 'Retail') for 'polisRetail'-style lines, else (None, line)."""
    m = re.match(r"^(.*[a-z])([A-Z][a-z]+)$", t.strip())
    if m and m.group(2).lower() in TYPE_WORDS:
        return m.group(1), m.group(2)
    return None, t


def col_of(x0, x1):
    """Column with the greatest horizontal overlap.

    Not the centre: several logos are wider than their cell and drift far enough that
    their midpoint lands in the neighbouring column, which silently steals a logo from
    that column and shifts every pairing below it.
    """
    best, ba = 0, -1.0
    for c in range(4):
        lo, hi = c * COLW, (c + 1) * COLW
        a = max(0.0, min(x1, hi) - max(x0, lo))
        if a > ba:
            best, ba = c, a
    return best


def placements(page):
    out = []
    for x in page.get_image_info(xrefs=True):
        b = x["bbox"]
        if b[0] < -5 or b[2] - b[0] < 60 or b[3] - b[1] < 60:
            continue
        out.append({"x0": b[0], "x1": b[2], "col": col_of(b[0], b[2]),
                    "cx": (b[0] + b[2]) / 2, "cy": (b[1] + b[3]) / 2})
    return out


def dedupe_words(s):
    """"ElBaily Gold Gold" -> "ElBaily Gold".

    One cell repeats a word across the name and location lines. Collapsing adjacent
    duplicates is safe: no brand in this roster legitimately says the same word twice.
    """
    out = []
    for w in s.split():
        if not out or out[-1].lower() != w.lower():
            out.append(w)
    return " ".join(out)


def slugify(s, seen):
    base = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "client"
    slug, n = base, 2
    while slug in seen:
        slug = f"{base}-{n}"
        n += 1
    seen.add(slug)
    return slug


def parse():
    d = fitz.open(PDF)
    rows = []
    for pn in list(JEWEL) + list(ERP):
        sector = "jewellery" if pn in JEWEL else "enterprise"
        page = d[pn - 1]
        cols = col_lines(page, TITLE_CUT.get(pn, 0))
        imgs = placements(page)
        for c, lines in cols.items():
            clean = []
            for y, t in lines:
                if NOISE.match(t.strip()):
                    continue
                # Un-glue "polisRetail" into its own location and type lines so the
                # anchor scan below can see the type.
                loc, tail = split_glued_type(t)
                if loc is not None:
                    # "Helio" / "polisRetail" is one location broken over two lines with
                    # the type glued on. A leading lowercase fragment belongs to the line
                    # above, not to a line of its own.
                    if loc[:1].islower() and clean:
                        clean[-1] = (clean[-1][0], clean[-1][1] + loc)
                    else:
                        clean.append((y - 0.5, loc))
                    clean.append((y, tail))
                else:
                    clean.append((y, t))
            ents = []
            if sector == "jewellery":
                i = 0
                while i < len(clean):
                    if is_type(clean[i][1]):
                        j = i
                        while j + 1 < len(clean) and is_type(clean[j + 1][1]):
                            j += 1
                        # A handful of cells omit the location entirely, leaving the
                        # second line of the NAME sitting where the location should be.
                        # A lone trade word is never a place, so treat it as name.
                        has_loc = i >= 1 and clean[i - 1][1].strip().lower() not in TRADE_WORDS
                        first_name = i - 1 if has_loc else i
                        name, k = [], first_name - 1
                        while k >= 0 and not is_type(clean[k][1]) and len(name) < 3:
                            name.insert(0, clean[k][1])
                            k -= 1
                        ents.append({"name": " ".join(name).strip(),
                                     "location": clean[i - 1][1].strip() if has_loc else "",
                                     "type": " ".join(clean[q][1] for q in range(i, j + 1)),
                                     "ytop": clean[max(k + 1, 0)][0], "ybot": clean[j][0]})
                        i = j + 1
                    else:
                        i += 1
            else:
                groups, cur = [], []
                for y, t in clean:
                    if cur and y - cur[-1][0] > 40:
                        groups.append(cur)
                        cur = []
                    cur.append((y, t))
                if cur:
                    groups.append(cur)
                for g in groups:
                    ents.append({"name": " ".join(t for _, t in g[:-1]).strip(),
                                 "location": g[-1][1].strip(), "type": "",
                                 "ytop": g[0][0], "ybot": g[-1][0]})
            ents.sort(key=lambda e: e["ytop"])
            cimgs = [im for im in imgs if im["col"] == c]
            for n, e in enumerate(ents):
                top = e["ybot"] + 26
                bot = ents[n + 1]["ytop"] - 12 if n + 1 < len(ents) else PAGEH - 6
                bot = max(top + 40, bot)
                # The Y BAND is what identifies the cell — it comes from the cell's own
                # text, so it cannot point at a neighbour. Placements are used only to
                # widen the crop horizontally, because some marks are wider than their
                # column and a column-width clip cuts them in half. Taking the union of
                # every placement centred in the band means a missing placement (some
                # marks are vector, not bitmap) or a spurious extra one both degrade to
                # a sane crop rather than shifting the pairing.
                # Never narrower than the column: get_image_info understates the visual
                # extent for marks drawn through a transform (Oro Bianco's wordmark runs
                # well past its declared bbox and was losing its last few letters). The
                # trim below crops the slack back off, so being generous costs nothing.
                inband = [im for im in cimgs if top - 30 <= im["cy"] <= bot + 30]
                x0, x1 = c * COLW - 24, (c + 1) * COLW + 24
                if inband:
                    x0 = min(x0, min(im["x0"] for im in inband) - 4)
                    x1 = max(x1, max(im["x1"] for im in inband) + 4)
                e.update(page=pn, col=c, sector=sector,
                         clip=[max(0, x0), top, min(1440, x1), bot])
                rows.append(e)
    return d, rows


def drop_hairlines(diff):
    """Erase the profile's column and section rules from a difference mask.

    The clip has to be generous horizontally — several wordmarks run past their declared
    placement — which means it catches the 1px rules the layout draws at the column
    boundaries. Left in, they trim as artwork and every logo ends up with a stray line
    beside it.

    A rule is an isolated near-full-length hairline: high coverage in its own row/column,
    nothing either side. That shape does not occur inside these marks, so the test is
    safe; a logo's own vertical bar has ink next to it and survives.
    """
    a = np.asarray(diff, dtype=np.uint8)
    if a.shape[0] < 8 or a.shape[1] < 8:
        return diff
    a = a.copy()
    ink = a > 8
    for axis in (0, 1):
        cov = ink.mean(axis=axis)                     # coverage per column (0) / row (1)
        neighbours = np.maximum(
            np.concatenate([cov[3:], np.zeros(3)]),
            np.concatenate([np.zeros(3), cov[:-3]]),
        )
        kill = (cov > 0.85) & (neighbours < 0.15)
        if kill.any():
            if axis == 0:
                a[:, kill] = 0
            else:
                a[kill, :] = 0
    return Image.fromarray(a, "L")


def render_trimmed(d, page, clip, dpi=150, greyscale=False, box=360):
    """Render a page region, trim it to its artwork, and re-ground it on the site's paper.

    The profile's own ground (#EEEDEB-ish) is DARKER than the site's --paper, so leaving
    it in place puts every logo in a visible grey rectangle, and `mix-blend-mode: multiply`
    only darkens it further.

    Keying it to real alpha works but triples the file size — WebP's alpha channel costs
    more than the artwork does. Compositing onto --paper instead is visually identical
    wherever the card background is --paper, which is everywhere these are used, and
    keeps the roster at ~4 KB a logo. If a card background ever stops being --paper, this
    is the line to revisit.

    Alpha still does the compositing so antialiased edges stay soft rather than becoming
    a jagged 1-bit cut-out.
    """
    pm = d[page - 1].get_pixmap(clip=fitz.Rect(*clip), dpi=dpi)
    im = Image.frombytes("RGB", (pm.width, pm.height), pm.samples)
    # Inset before trimming: the page's vertical rule line sits at the very edge and
    # would otherwise make the difference-bbox the whole image.
    if im.width > 10 and im.height > 10:
        im = im.crop((4, 4, im.width - 4, im.height - 4))
    bgcol = im.getpixel((1, 1))
    diff = ImageChops.difference(im, Image.new("RGB", im.size, bgcol)).convert("L")
    diff = drop_hairlines(diff)
    bbox = diff.point(lambda v: 255 if v > 12 else 0).getbbox()
    if bbox:
        pad = 6
        crop = (max(0, bbox[0] - pad), max(0, bbox[1] - pad),
                min(im.width, bbox[2] + pad), min(im.height, bbox[3] + pad))
        im, diff = im.crop(crop), diff.crop(crop)
    if greyscale:
        im = im.convert("L").convert("RGB")
    # Below FLOOR the pixel is ground; above CEIL it is solid artwork; between, ramp.
    FLOOR, CEIL = 8, 40
    alpha = diff.point(lambda v: 0 if v <= FLOOR else min(255, int((v - FLOOR) * 255 / (CEIL - FLOOR))))
    im.putalpha(alpha)
    out = Image.new("RGB", im.size, PAPER)
    out.paste(im, mask=alpha)
    out.thumbnail((box, box), Image.LANCZOS)
    return out


def write_ts(clients):
    header = '''/* Client roster — GENERATED by tools/extract-clients.py from the client's
   "Company Profile Final 2026.pdf" (58 pages, received 2026-08-06). Do not hand-edit;
   re-run the script if the PDF is reissued.

   `location` is verbatim from the PDF, spelling variants and all ("Heliopolis",
   "Helioplios" and "Helipolis" all occur). `region` is the normalised bucket used for
   filtering — see REGION_RULES in the script. */

export type Sector = "jewellery" | "enterprise";
export type BusinessType = "Manufacturing" | "Wholesale" | "Retail";
export type Region =
  | "Greater Cairo"
  | "Giza"
  | "Alexandria"
  | "Delta & Canal"
  | "Upper Egypt"
  | "Sinai & Red Sea"
  | "International"
  | "Other";

export type Client = {
  slug: string;
  name: string;
  location: string;
  region: Region;
  types: BusinessType[];
  sector: Sector;
  logo: string;
};

export const CLIENTS: readonly Client[] = [
'''
    body = "".join(
        f'  {{ slug: {json.dumps(c["slug"])}, name: {json.dumps(c["name"])}, '
        f'location: {json.dumps(c["location"])}, region: {json.dumps(c["region"])}, '
        f'types: {json.dumps(c["types"])}, sector: {json.dumps(c["sector"])}, '
        f'logo: {json.dumps(c["logo"])} }},\n' for c in clients)
    present = [r for r in REGION_ORDER if any(c["region"] == r for c in clients)]
    footer = f'''];

export const REGIONS: readonly Region[] = {json.dumps(present)};
export const BUSINESS_TYPES: readonly BusinessType[] = ["Manufacturing", "Wholesale", "Retail"];
'''
    open(OUT_TS, "w", encoding="utf-8", newline="\n").write(header + body + footer)


def main():
    d, rows = parse()
    os.makedirs(OUT_LOGOS, exist_ok=True)
    for f in os.listdir(OUT_LOGOS):
        os.remove(os.path.join(OUT_LOGOS, f))
    seen, clients, skipped = set(), [], []
    for r in rows:
        if not r["name"]:
            skipped.append((r["page"], r["location"]))
            continue
        slug = slugify(r["name"], seen)
        render_trimmed(d, r["page"], r["clip"], box=300).save(
            os.path.join(OUT_LOGOS, slug + ".webp"), "WEBP", quality=82, method=6)
        types = {w.strip(" -&,").capitalize()
                 for w in re.split(r"[-&/ ]+", r["type"]) if w.strip(" -&,")}
        # "Wholesalel" is a typo in the source. "Diamond" is a qualifier on the type
        # line ("Wholesale Diamond"), not a business type — it must not become a facet.
        types = sorted({"Wholesale" if t == "Wholesalel" else t for t in types} - {"Diamond"})
        clients.append({"slug": slug, "name": dedupe_words(r["name"]),
                        "location": " ".join(r["location"].split()),
                        "region": region_of(r["location"]), "types": types,
                        "sector": r["sector"], "logo": f"/assets/clients/{slug}.webp"})
    clients.sort(key=lambda c: c["name"].lower())
    write_ts(clients)
    for pn, loc in skipped:
        print(f"SKIP (no name): page {pn} — {loc!r}")
    print(f"{len(clients)} clients, {len(os.listdir(OUT_LOGOS))} logos")


if __name__ == "__main__":
    main()
