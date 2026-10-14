/* Content shapes returned by the API, after lib/api/client.ts has camel-cased them.
   Mirrors backend serializers; the OpenAPI document at /api/v1/docs/ is the reference. */

import type { Dir, Locale } from "@/content/i18n";

export type Cta = { label: string; url: string };
export type Photo = { src: string; alt: string };

/* ── Site ─────────────────────────────────────────────────────────────────────────── */

export type NavLeaf = { key: string; label: string; url: string };
export type NavEntry = NavLeaf & { children: NavLeaf[] };

export type SiteSettings = {
  siteName: string;
  shortName: string;
  sinceYear: number;
  logoOnLight: string | null;
  logoOnDark: string | null;
  favicon: string | null;
  ogImage: string | null;
  phoneDisplay: string;
  phoneLink: string;
  whatsappUrl: string;
  salesEmail: string;
  careersEmail: string;
  address: string;
  primaryCta: Cta;
  contact: { heading: string; body: string; ctaLabel: string };
  footerBlurb: string;
  copyrightYear: string;
  rightsText: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
};

export type FooterColumn = { key: string; title: string; links: { label: string; url: string }[] };
export type SocialLink = { platform: string; label: string; url: string; isPlaceholder: boolean };
export type Badge = { src: string; alt: string; href: string };

export type SiteData = {
  language: { code: Locale; dir: Dir };
  settings: SiteSettings;
  navigation: NavEntry[];
  footerColumns: FooterColumn[];
  socialLinks: SocialLink[];
  badges: Badge[];
};

/* ── Home ─────────────────────────────────────────────────────────────────────────── */

export type HeroSlide = {
  id: number;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  image: string;
  video: { webm: string | null; mp4: string } | null;
};

/** A number counts up; a text value (a year, "24/7") is shown as written. */
export type Stat = { label: string; value: number | null; prefix: string; suffix: string; text: string | null };

export type SectionItem = { n: string; title: string; body: string };
export type ClientLogo = { slug: string; name: string; logo: string };

export type SpecColumn = { label: string; highlight: boolean };
export type SpecCell = { ok: boolean; text: string };
export type SpecGrid = { columns: SpecColumn[]; rows: { cells: SpecCell[] }[] };

export type Testimonial = {
  id: number;
  quote: string;
  authorName: string;
  authorCompany: string;
  attribution: string;
  avatar: string | null;
};

export type EventSummary = { slug: string; year: string | null; title: string; summary: string; photo: Photo | null };

export type HomeData = {
  seo: { metaTitle: string | null; metaDescription: string | null };
  hero: HeroSlide[];
  figures: { eyebrow: string; ariaLabel: string; stats: Stat[] };
  proof: { lede: string; stripAriaLabel: string; cta: Cta; highlighted: ClientLogo[]; strip: ClientLogo[] };
  services: { eyebrow: string; heading: string; body: string; image: string | null; imageAlt: string; items: SectionItem[] };
  bigPicture: { heading: string; body: string; image: string | null; imageAlt: string; items: SectionItem[] };
  discoverMoreLabel: string;
  specs: (SpecGrid & { eyebrow: string; heading: string }) | null;
  testimonial: Testimonial | null;
  howTo: { heading: string; cta: Cta; items: SectionItem[] };
  events: { eyebrow: string; heading: string; body: string; cta: Cta; items: EventSummary[] };
  band: { heading: string; body: string; cta: Cta };
};

/* ── Pages ────────────────────────────────────────────────────────────────────────── */

export type TimelineEntry = { slug: string; year: string | null; title: string; paras: string[]; photos: Photo[] };

/** One content block. `kind` decides the rest — mirrors backend/apps/pages/blocks.py. */
export type Block =
  | { kind: "intro"; eyebrow: string | null; heading: string; body: string }
  | { kind: "cards" | "numbered"; heading: string | null; items: { title: string; body: string }[] }
  | { kind: "steps"; heading: string | null; items: SectionItem[] }
  | { kind: "logos"; label: string; logos: { src: string; alt: string; href: string | null }[] }
  | { kind: "hardware"; heading: string | null; items: { n: string; title: string; image: string | null }[] }
  | ({ kind: "spec"; heading: string | null } & SpecGrid)
  | { kind: "timeline"; items: TimelineEntry[] }
  | { kind: "gallery"; heading: string | null; items: Photo[] }
  | { kind: "testimonials"; heading: string | null; items: Testimonial[] }
  | { kind: "cta"; heading: string; body: string; label: string; href: string };

export type PageSummary = { slug: string; template: "standard" | "customers"; title: string; updatedAt: string };

export type PageVideo = { desktop: string; mobile: string | null; posterDesktop: string | null; posterMobile: string | null };

export type PageData = {
  slug: string;
  template: "standard" | "customers";
  title: string;
  eyebrow: string;
  lede: string;
  headerImage: string;
  metaTitle: string;
  metaDescription: string;
  breadcrumbParent: string | null;
  video: PageVideo | null;
  blocks: Block[];
};

/* ── Clients ──────────────────────────────────────────────────────────────────────── */

export type Client = {
  slug: string;
  name: string;
  location: string;
  region: string;
  sector: string;
  businessTypes: string[];
  logo: string;
  featuredOrder: number | null;
};

export type LatLng = { lat: number; lng: number };
export type Region = { key: string; name: string; clientCount: number; mapPin: LatLng | null };
export type TaxonomyItem = { key: string; name: string };
export type ClientTaxonomy = {
  regions: Region[];
  sectors: TaxonomyItem[];
  businessTypes: TaxonomyItem[];
  totalClients: number;
};

/* ── Enquiries ────────────────────────────────────────────────────────────────────── */

export type EnquiryPayload = {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  source_path?: string;
  website?: string;
};
export type EnquiryReceipt = { reference: string; createdAt: string };
