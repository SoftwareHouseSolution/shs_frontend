"""One-off companion to extract-clients.py: the technology-partner marks (PDF page 6)
and the hardware product shots (page 5).

    cd apps/web && python tools/extract-extras.py

Both pages place their images through transforms whose declared bboxes overlap and run
off-page, so the clip rects here are read off a render rather than off get_image_info.
Partner marks keep their colour — they are other companies' brands and desaturating them
misrepresents the mark.
"""
import importlib.util as _u
import os

_spec = _u.spec_from_file_location("_ec", os.path.join(os.path.dirname(__file__), "extract-clients.py"))
_ec = _u.module_from_spec(_spec)
_spec.loader.exec_module(_ec)

import fitz  # noqa: E402

PARTNERS = [
    # Inset from the tile's top-right: the page number "06" sits over it and the tile's
    # rounded corner otherwise trims in as artwork.
    ("microsoft", 6, (835, 58, 1412, 278)),
    ("hp",        6, (809, 313, 1432, 568)),
    ("bixolon",   6, (93, 457, 652, 559)),
    ("dell",      6, (30, 597, 720, 805)),
    ("zebra",     6, (809, 597, 1432, 805)),
]

HARDWARE = [
    ("pos-laptops",       5, (85, 500, 661, 763)),
    ("scanners-handheld", 5, (661, 483, 890, 788)),
    ("printers",          5, (1068, 534, 1297, 746)),
    ("rat-tail-ribbons",  5, (1017, 110, 1271, 364)),
]


def run(items, outdir, box):
    d = fitz.open(_ec.PDF)
    os.makedirs(outdir, exist_ok=True)
    for name, page, clip in items:
        im = _ec.render_trimmed(d, page, list(clip), dpi=150, box=box)
        path = os.path.join(outdir, name + ".webp")
        im.save(path, "WEBP", quality=84, method=6)
        print(f"{path}  {im.size[0]}x{im.size[1]}  {os.path.getsize(path) // 1024} KB")


if __name__ == "__main__":
    run(PARTNERS, "public/assets/partners", 320)
    run(HARDWARE, "public/assets/hardware", 520)
