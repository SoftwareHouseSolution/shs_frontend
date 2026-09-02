/* The shape of an interior page. Split out of content/pages.ts when that file became two
   files — one per language — so the English copy, the Arabic copy and the assembler can
   all agree on a structure without any of them importing another's words.

   StubBody renders these blocks; adding a variant here means adding a case there. */

export type StubBlock =
  | { kind: "intro"; eyebrow?: string; heading: string; body: string }
  | { kind: "cards"; heading?: string; items: { title: string; body: string }[] }
  | { kind: "numbered"; heading?: string; items: { title: string; body: string }[] }
  | { kind: "steps"; heading?: string; items: { n: string; title: string; body: string }[] }
  /* Full paths, not filenames: the old shape hardcoded /assets/clients/ and derived alt
     text from the slug ("el-handasia"). Partner marks live elsewhere and need real names. */
  | { kind: "logos"; label: string; logos: { src: string; alt: string }[] }
  | { kind: "hardware"; heading?: string; items: { n: string; title: string; image: string }[] }
  | {
      kind: "spec";
      heading?: string;
      columns: { label: string; highlight?: boolean }[];
      rows: { cells: { ok: boolean; text: string }[] }[];
    }
  | { kind: "timeline"; items: TimelineEntry[] }
  | { kind: "gallery"; heading?: string; items: Photo[] }
  /* `href` is stored UNPREFIXED where it is internal — StubBody passes it through
     i18n.href() so a CTA lands on the reader's own language. Absolute URLs and mailto:
     links pass through untouched. */
  | { kind: "cta"; heading: string; body: string; label: string; href: string };

export type Photo = { src: string; alt: string };

export type TimelineEntry = {
  /** Shown as the marker label. Omitted when the date is not established — see events.ts. */
  year?: string;
  title: string;
  /** One <p> each. */
  paras: string[];
  photos: Photo[];
};

export type PageContent = {
  /** <h1> and the breadcrumb leaf. */
  title: string;
  /** Mono label above the h1 — normally the parent nav group. */
  eyebrow: string;
  /** One sentence under the h1. */
  lede: string;
  /** Public path to the header image. */
  image: string;
  metaDescription: string;
  blocks: StubBlock[];
};

/* Header imagery. Shared by both languages — a photograph is not copy, and duplicating
   these paths would let one language keep pointing at a renamed file. */
export const IMG = {
  about: "/assets/imagery/slider_01.jpg",
  solutions: "/assets/imagery/slider_02.jpg",
  /* Was parallax_04.jpg. That file is a pre-darkened parallax plate — the black wash is
     BAKED INTO the pixels, so the page header's own scrim darkened an already-darkened
     image and the transparent navbar over it rendered as a solid black bar. No scrim value
     could fix that; the file itself was the problem. about_02 is unretouched, bright, and
     happens to be four hands joined over a desk, which is a better Partners image anyway. */
  partners: "/assets/imagery/about_02.jpg",
  customers: "/assets/imagery/slider_03.jpg",
  careers: "/assets/services/hardware.jpeg",
  /* Real photography now that it exists — the team under the stand sign, and the whole
     company at the Ramadan outing. Both beat the stock crops these pages used before. */
  events: "/assets/events/nebu-2024-04.jpg",
  team: "/assets/events/ramadan-2025-03.jpg",
} as const;

/* Hardware thumbnails and partner marks: paths and brand names, shared for the same
   reason. Only the `title` of a hardware tile is copy, so that stays in the language
   files and these hold the images alone. */
export const HARDWARE_IMG = {
  pos: "/assets/hardware/pos-laptops.webp",
  scanners: "/assets/hardware/scanners-handheld.webp",
  printers: "/assets/hardware/printers.webp",
  ribbons: "/assets/hardware/rat-tail-ribbons.webp",
} as const;

/** Partner marks. `alt` is a company name in both languages — a trademark, not copy. */
export const PARTNER_LOGOS = [
  { src: "/assets/partners/microsoft.webp", alt: "Microsoft" },
  { src: "/assets/partners/hp.svg", alt: "HP" },
  { src: "/assets/partners/dell.webp", alt: "Dell" },
  { src: "/assets/partners/zebra.webp", alt: "Zebra" },
  { src: "/assets/partners/bixolon.webp", alt: "Bixolon" },
];
