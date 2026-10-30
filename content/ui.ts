/* Interface copy — every user-visible string that is NOT page content.

   Page content — every heading, card, slide, figure, client and event — is edited in the
   CMS (Django admin) and arrives through lib/api. What is left here is the interface
   itself: button labels, aria text, placeholders, form messages, empty states. It is the
   frontend's equivalent of a gettext catalogue, and ships with the code that uses it. They are gathered in one file rather than spread
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
  /** Announced while the first-load screen is up. */
  loading: string;
  /** The light/dark switch: a toggle button, pressed = dark mode on. */
  darkMode: string;
  /** Suffix on the brand link's aria-label: "<company> — home". */
  homeAria: string;
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

  /* ── Hero carousel ────────────────────────────────────────────────────────────── */
  carouselAria: string;
  playSlideshow: string;
  pauseSlideshow: string;
  /** "Show slide {n} of {total}" — both numbers substituted by the component. */
  showSlide: (n: number, total: number) => string;

  /* ── Clients directory ────────────────────────────────────────────────────────── */
  findAClient: string;
  nameOrLocation: string;
  filterByLocation: string;
  allLocations: string;
  searchLocations: string;
  noLocationMatch: string;
  notOnTheMap: string;
  everyClient: string;
  /** Accessible name for the featured-client marquee above the results heading. */
  featuredClientsAria: string;
  /** "{shown} of {total}". Announced to screen readers only — it is no longer drawn.
      See the note at the result heading in components/clients/ClientMap.tsx. */
  countOf: (shown: number, total: number) => string;
  showAll: string;
  /** Empty-state heading; the sentence under it is noClientMatch. */
  noClientTitle: string;
  /** Empty state; `where` is already localised and may be empty. */
  noClientMatch: (query: string, where: string) => string;
  inRegion: (region: string) => string;
  clientLogoAlt: (name: string) => string;
  /** The moving roster's pause/resume button (moving content must be pausable). */
  pauseMotion: string;
  playMotion: string;

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

  /* ── Error and not-found pages ────────────────────────────────────────────────── */
  /* Written to say what happened, whether it is the reader's fault (it is not), and what
     to do next — never a status code on its own, and never the raw error message, which
     stays in the console. See app/[lang]/(site)/error.tsx and app/not-found.tsx. */
  errorEyebrow: string;
  errorHeading: string;
  errorBody: string;
  tryAgain: string;
  backHome: string;
  /** Lead-in for the support link under the error actions: "<this> <messageUs>". */
  stillStuck: string;
  messageUs: string;
  /** <title> fragment for the 404 page. */
  notFoundTitle: string;
  notFoundHeading: string;
  notFoundBody: string;
  contactUs: string;

  /* ── Enquiry form ─────────────────────────────────────────────────────────────── */
  formIntro: string;
  formName: string;
  formEmail: string;
  formPhone: string;
  formCompany: string;
  formMessage: string;
  formOptional: string;
  formSubmit: string;
  formSending: string;
  formSuccessTitle: string;
  formSendAnother: string;
  /** Shown when the request never reached the server. */
  formNetworkError: string;
  /** Shown for unexpected server failures; the reference is appended when available. */
  formServerError: string;
  formReference: (id: string) => string;
  formFixErrors: string;
};

const en: UIStrings = {
  skipToContent: "Skip to content",
  loading: "Loading…",
  darkMode: "Dark mode",
  homeAria: "home",
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

  carouselAria: "Featured",
  playSlideshow: "Play slideshow",
  pauseSlideshow: "Pause slideshow",
  showSlide: (n, total) => `Show slide ${n} of ${total}`,

  findAClient: "Find a client",
  nameOrLocation: "Name or location",
  filterByLocation: "Filter by location",
  allLocations: "All locations",
  searchLocations: "Search locations",
  noLocationMatch: "No matching location",
  notOnTheMap: "Not on the map",
  everyClient: "Every client",
  featuredClientsAria: "Featured clients",
  countOf: (shown, total) => `${shown} of ${total}`,
  showAll: "Show all clients",
  noClientTitle: "No clients found",
  noClientMatch: (query, where) => `No client matches “${query}”${where}. Try a shorter search.`,
  inRegion: (region) => ` in ${region}`,
  clientLogoAlt: (name) => `${name} logo`,
  pauseMotion: "Pause the moving list",
  playMotion: "Play the moving list",

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

  errorEyebrow: "Something went wrong",
  errorHeading: "This page didn’t load.",
  errorBody:
    "A temporary problem stopped this page from loading. It wasn’t anything you did — trying again usually fixes it.",
  tryAgain: "Try again",
  backHome: "Back to home",
  stillStuck: "Still not working?",
  messageUs: "Message us on WhatsApp",
  notFoundTitle: "Page not found",
  notFoundHeading: "This page doesn’t exist.",
  notFoundBody:
    "The link may be out of date, or the page may have moved. Head back to the home page, or get in touch and we’ll point you to it.",
  contactUs: "Contact us",

  formIntro: "Prefer e-mail? Send us a message and the sales team will reply.",
  formName: "Your name",
  formEmail: "E-mail",
  formPhone: "Phone",
  formCompany: "Company",
  formMessage: "How can we help?",
  formOptional: "optional",
  formSubmit: "Send message",
  formSending: "Sending…",
  formSuccessTitle: "Message sent",
  formSendAnother: "Send another message",
  formNetworkError: "We couldn’t reach our server. Check your connection and try again.",
  formServerError: "Something went wrong on our side and your message was not sent. Please try again, or message us on WhatsApp.",
  formReference: (id) => `Reference: ${id}`,
  formFixErrors: "Please correct the highlighted fields.",
};

const ar: UIStrings = {
  skipToContent: "تخطَّ إلى المحتوى",
  loading: "جارٍ التحميل…",
  darkMode: "الوضع الداكن",
  homeAria: "الصفحة الرئيسية",
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

  carouselAria: "عرض مميز",
  playSlideshow: "تشغيل العرض",
  pauseSlideshow: "إيقاف العرض",
  showSlide: (n, total) => `عرض الشريحة ${n} من ${total}`,

  findAClient: "ابحث عن عميل",
  nameOrLocation: "الاسم أو الموقع",
  filterByLocation: "تصفية حسب الموقع",
  allLocations: "كل المواقع",
  searchLocations: "ابحث عن موقع",
  noLocationMatch: "لا يوجد موقع مطابق",
  notOnTheMap: "خارج الخريطة",
  everyClient: "كل العملاء",
  featuredClientsAria: "عملاء مميزون",
  countOf: (shown, total) => `${shown} من ${total}`,
  showAll: "عرض كل العملاء",
  noClientTitle: "لا توجد نتائج",
  noClientMatch: (query, where) => `لا يوجد عميل يطابق «${query}»${where}. جرّب بحثًا أقصر.`,
  inRegion: (region) => ` في ${region}`,
  clientLogoAlt: (name) => `شعار ${name}`,
  pauseMotion: "إيقاف حركة القائمة",
  playMotion: "تشغيل حركة القائمة",

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

  errorEyebrow: "حدث خطأ",
  errorHeading: "تعذّر تحميل هذه الصفحة.",
  errorBody: "منعت مشكلة مؤقتة هذه الصفحة من التحميل. لم يكن ذلك بسببك — غالبًا ما تحل إعادة المحاولة المشكلة.",
  tryAgain: "حاول مرة أخرى",
  backHome: "العودة إلى الرئيسية",
  stillStuck: "ما زالت المشكلة قائمة؟",
  messageUs: "راسلنا على واتساب",
  notFoundTitle: "الصفحة غير موجودة",
  notFoundHeading: "هذه الصفحة غير موجودة.",
  notFoundBody: "ربما يكون الرابط قديمًا أو تم نقل الصفحة. عُد إلى الصفحة الرئيسية، أو تواصل معنا وسنرشدك إليها.",
  contactUs: "تواصل معنا",

  formIntro: "تفضّل البريد الإلكتروني؟ أرسل لنا رسالة وسيرد عليك فريق المبيعات.",
  formName: "الاسم",
  formEmail: "البريد الإلكتروني",
  formPhone: "الهاتف",
  formCompany: "الشركة",
  formMessage: "كيف يمكننا مساعدتك؟",
  formOptional: "اختياري",
  formSubmit: "أرسل الرسالة",
  formSending: "جارٍ الإرسال…",
  formSuccessTitle: "تم إرسال رسالتك",
  formSendAnother: "أرسل رسالة أخرى",
  formNetworkError: "تعذّر الاتصال بالخادم. تحقق من اتصالك ثم حاول مرة أخرى.",
  formServerError: "حدث خطأ من جانبنا ولم تُرسل رسالتك. حاول مرة أخرى، أو راسلنا على واتساب.",
  formReference: (id) => `الرقم المرجعي: ${id}`,
  formFixErrors: "يرجى تصحيح الحقول المحددة.",
};

export const UI: Record<Locale, UIStrings> = { en, ar };
