/* Interface copy — every user-visible string that is NOT page content.

   Page bodies live in content/pages.*.ts, home-page section copy in content/home.ts, and
   the roster in content/clients.ts. What is left here is chrome: button labels, aria
   text, placeholders, empty states. They are gathered in one file rather than spread
   through the components because a translator needs to read them together to keep the
   register consistent, and because a missing key must be a TYPE ERROR rather than an
   English word surfacing inside an Arabic page.

   That guarantee comes from the shape: `Record<Locale, UIStrings>`. Adding a key to `en`
   without adding it to `ar` does not compile.

   ── ARABIC REGISTER ────────────────────────────────────────────────────────────────
   Modern Standard Arabic, addressing the reader with the masculine singular imperative
   for CTAs ("احجز", "اكتشف"), which is the convention in Egyptian B2B marketing. Product
   and company names — Software House Solutions, SWH, ERP, POS, Zebra, WhatsApp — stay in
   Latin script, as they do on Arabic-language sites across the trade.

   TRANSLATION PROVENANCE: machine-authored, not supplied by the client. See PRODUCT.md.
   A native reviewer should pass over these before launch. */

import type { Locale } from "./i18n";

export type UIStrings = {
  /* ── Chrome ───────────────────────────────────────────────────────────────────── */
  skipToContent: string;
  /** Suffix on the brand link's aria-label: "<company> — home". */
  homeAria: string;
  bookDemo: string;
  openMenu: string;
  closeMenu: string;
  siteMenu: string;
  showSocial: string;
  hideSocial: string;
  /** aria-label on the language toggle. */
  languageAria: string;
  /** Prefix for the WhatsApp link's aria-label: "<this> <phone>". */
  whatsappAria: string;
  /** The hover label beside the contact rail's WhatsApp button. Short — it sits in a
      tooltip, and the full sentence is already the accessible name. */
  whatsappLabel: string;
  /** Appended to links that open elsewhere: "<label> <this>". */
  opensInNewTab: string;
  primaryNavAria: string;
  breadcrumbAria: string;
  crumbHome: string;

  /* ── Footer ───────────────────────────────────────────────────────────────────── */
  footerNavAria: string;
  footerCompany: string;
  footerExplore: string;
  footerWorkWithUs: string;
  footerBlurb: string;
  allRightsReserved: string;

  /* ── Hero carousel ────────────────────────────────────────────────────────────── */
  carouselAria: string;
  playSlideshow: string;
  pauseSlideshow: string;
  /** "Show slide {n} of {total}" — both numbers substituted by the component. */
  showSlide: (n: number, total: number) => string;

  /* ── Clients directory ────────────────────────────────────────────────────────── */
  findAClient: string;
  nameOrLocation: string;
  notOnTheMap: string;
  everyClient: string;
  /** Accessible name for the featured-client marquee above the results heading. */
  featuredClientsAria: string;
  /** "{shown} of {total}". Announced to screen readers only — it is no longer drawn.
      See the note at the result heading in components/clients/ClientMap.tsx. */
  countOf: (shown: number, total: number) => string;
  showAll: string;
  /** Empty state; `where` is already localised and may be empty. */
  noClientMatch: (query: string, where: string) => string;
  inRegion: (region: string) => string;
  clientLogoAlt: (name: string) => string;
  /* The superseded faceted directory (components/clients/ClientDirectory.tsx). It is not
     rendered anywhere — ClientMap replaced it — but it is kept on disk as reference and
     is therefore kept translated, so it can be dropped back in without a half-English UI. */
  search: string;
  clientOrLocation: string;
  facetSector: string;
  facetBusiness: string;
  facetRegion: string;
  sort: string;
  sortAZ: string;
  sortZA: string;
  sortRegion: string;
  countClients: (shown: number, total: number) => string;
  clearFilters: string;
  noFilterMatch: string;

  /* ── Video modal ──────────────────────────────────────────────────────────────── */
  videoDialogAria: string;
  playVideo: string;
  closeVideo: string;
  play: string;
  pause: string;
  seek: string;
  /** Spoken position for the seek slider: "0:04 of 0:28". */
  videoPosition: (elapsed: string, total: string) => string;
  tapForSound: string;
  mute: string;
  unmute: string;

  /* ── Events ───────────────────────────────────────────────────────────────────── */
  eventsRailAria: string;
  eventDetailsAria: string;
  /** Marker for the one event whose date is not established — see content/events.ts. */
  recent: string;
};

const en: UIStrings = {
  skipToContent: "Skip to content",
  homeAria: "home",
  bookDemo: "Book a demo",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  siteMenu: "Site menu",
  showSocial: "Show social links",
  hideSocial: "Hide social links",
  languageAria: "Change language",
  whatsappAria: "Message us on WhatsApp at",
  whatsappLabel: "Chat with us",
  opensInNewTab: "— opens in a new tab",
  primaryNavAria: "Primary",
  breadcrumbAria: "Breadcrumb",
  crumbHome: "Home",

  footerNavAria: "Footer",
  footerCompany: "Company",
  footerExplore: "Explore",
  footerWorkWithUs: "Work with us",
  footerBlurb:
    "POS-integrated ERP for the gold and diamond trade, plus enterprise software, hardware and networking. Leading the market since",
  allRightsReserved: "All Rights Reserved",

  carouselAria: "Featured",
  playSlideshow: "Play slideshow",
  pauseSlideshow: "Pause slideshow",
  showSlide: (n, total) => `Show slide ${n} of ${total}`,

  findAClient: "Find a client",
  nameOrLocation: "Name or location",
  notOnTheMap: "Not on the map",
  everyClient: "Every client",
  featuredClientsAria: "Featured clients",
  countOf: (shown, total) => `${shown} of ${total}`,
  showAll: "Show all clients",
  noClientMatch: (query, where) => `No client matches “${query}”${where}. Try a shorter search.`,
  inRegion: (region) => ` in ${region}`,
  clientLogoAlt: (name) => `${name} logo`,
  search: "Search",
  clientOrLocation: "Client or location",
  facetSector: "Sector",
  facetBusiness: "Business",
  facetRegion: "Region",
  sort: "Sort",
  sortAZ: "Name A–Z",
  sortZA: "Name Z–A",
  sortRegion: "Region",
  countClients: (shown, total) => `${shown} of ${total} clients`,
  clearFilters: "Clear filters",
  noFilterMatch: "No clients match those filters. Try clearing one.",

  videoDialogAria: "A look inside Software House Solutions",
  playVideo: "Play video",
  closeVideo: "Close video",
  play: "Play",
  pause: "Pause",
  seek: "Seek",
  videoPosition: (elapsed, total) => `${elapsed} of ${total}`,
  tapForSound: "Tap for sound",
  mute: "Mute",
  unmute: "Unmute",

  eventsRailAria: "Events",
  eventDetailsAria: "Event details",
  recent: "Recent",
};

const ar: UIStrings = {
  skipToContent: "تخطَّ إلى المحتوى",
  homeAria: "الصفحة الرئيسية",
  bookDemo: "احجز عرضًا توضيحيًا",
  openMenu: "فتح القائمة",
  closeMenu: "إغلاق القائمة",
  siteMenu: "قائمة الموقع",
  showSocial: "إظهار روابط التواصل",
  hideSocial: "إخفاء روابط التواصل",
  languageAria: "تغيير اللغة",
  whatsappAria: "راسلنا على واتساب على الرقم",
  whatsappLabel: "تحدث معنا",
  opensInNewTab: "— يفتح في تبويب جديد",
  primaryNavAria: "التنقل الرئيسي",
  breadcrumbAria: "مسار التنقل",
  crumbHome: "الرئيسية",

  footerNavAria: "تذييل الموقع",
  footerCompany: "الشركة",
  footerExplore: "استكشف",
  footerWorkWithUs: "اعمل معنا",
  footerBlurb:
    "نظام ERP متكامل مع نقاط البيع لتجارة الذهب والألماس، إلى جانب برمجيات المؤسسات والأجهزة والشبكات. نقود السوق منذ",
  allRightsReserved: "جميع الحقوق محفوظة",

  carouselAria: "عرض مميز",
  playSlideshow: "تشغيل العرض",
  pauseSlideshow: "إيقاف العرض",
  showSlide: (n, total) => `عرض الشريحة ${n} من ${total}`,

  findAClient: "ابحث عن عميل",
  nameOrLocation: "الاسم أو الموقع",
  notOnTheMap: "خارج الخريطة",
  everyClient: "كل العملاء",
  featuredClientsAria: "عملاء مميزون",
  countOf: (shown, total) => `${shown} من ${total}`,
  showAll: "عرض كل العملاء",
  noClientMatch: (query, where) => `لا يوجد عميل يطابق «${query}»${where}. جرّب بحثًا أقصر.`,
  inRegion: (region) => ` في ${region}`,
  clientLogoAlt: (name) => `شعار ${name}`,
  search: "بحث",
  clientOrLocation: "اسم العميل أو الموقع",
  facetSector: "القطاع",
  facetBusiness: "نوع النشاط",
  facetRegion: "المنطقة",
  sort: "الترتيب",
  sortAZ: "الاسم: أ إلى ي",
  sortZA: "الاسم: ي إلى أ",
  sortRegion: "المنطقة",
  countClients: (shown, total) => `${shown} من ${total} عميل`,
  clearFilters: "مسح عوامل التصفية",
  noFilterMatch: "لا يوجد عملاء يطابقون هذه المعايير. جرّب إزالة أحدها.",

  videoDialogAria: "جولة داخل Software House Solutions",
  playVideo: "تشغيل الفيديو",
  closeVideo: "إغلاق الفيديو",
  play: "تشغيل",
  pause: "إيقاف مؤقت",
  seek: "التنقل في الفيديو",
  videoPosition: (elapsed, total) => `${elapsed} من ${total}`,
  tapForSound: "اضغط لتشغيل الصوت",
  mute: "كتم الصوت",
  unmute: "تشغيل الصوت",

  eventsRailAria: "الفعاليات",
  eventDetailsAria: "تفاصيل الفعالية",
  recent: "حديثًا",
};

export const UI: Record<Locale, UIStrings> = { en, ar };
