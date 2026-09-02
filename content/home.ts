/* Home-page section copy, in both languages.

   Supersedes components/sections/data.js, which held SERVICES / MODULES / QUOTE / STEPS
   as bare English arrays, and the headings that were inline JSX literals in
   Services.jsx, BigPicture.jsx, Specs.jsx, HowTo.jsx, Contact.jsx, StatsBand.tsx,
   LogoWall.tsx, StatsRow.tsx and EventsRail.tsx. Same words, one place, two languages.

   English is unchanged from what shipped — it is product truth taken from the prototype
   and PRODUCT.md, so it is transcribed here verbatim rather than reworded. The Arabic is
   machine-authored; see the provenance note in content/ui.ts.

   The hero slides live here too. Slide 1 is the client's newer copy from
   ui_ux/.../"website start and end and numbers.docx"; slides 2-4 are SWH's own rotating
   hero messages from the legacy site, recorded in extract/impeccable_frontend_prd. */

import type { Locale } from "./i18n";

export type Card = { title: string; body: string };
export type Step = { n: string; title: string; body: string };

export type HeroSlide = {
  /** Photo slide: the still. Video slide: the poster frame. */
  image: string;
  /** Video slides only. WebM first so browsers that support it skip the MP4. */
  video?: { webm: string; mp4: string };
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  /** Unprefixed — i18n.href() adds the locale at render time. */
  ctaHref: string;
};

export type HomeCopy = {
  hero: HeroSlide[];

  figuresAria: string;
  figuresEyebrow: string;

  proofLede: string;
  proofStripAria: string;
  proofCta: string;

  servicesEyebrow: string;
  servicesHeading: string;
  servicesBody: string;
  servicesImageAlt: string;
  services: Card[];

  bigPictureHeading: string;
  bigPictureBody: string;
  bigPictureImageAlt: string;
  modules: Card[];
  discoverMore: string;

  specsEyebrow: string;
  specsHeading: string;
  specColumns: string[];
  /** Row cells align 1:1 with specColumns; `ok` drives the tick/cross, never the text. */
  specRows: { ok: boolean; text: string }[][];

  quote: string;
  quoteAttribution: string;

  howToHeading: string;
  steps: Step[];

  eventsEyebrow: string;
  eventsHeading: string;
  eventsBody: string;
  eventsCta: string;

  bandHeading: string;
  bandBody: string;
  bandCta: string;

  contactHeading: string;
  contactBody: string;
  contactCta: string;
};

/* Shared between the two languages: paths are not copy. Declared once so a renamed asset
   cannot be fixed in one language and missed in the other. */
const HERO_MEDIA = [
  {
    image: "/assets/video/hero-workstation-poster.jpg",
    video: { webm: "/assets/video/hero-workstation.webm", mp4: "/assets/video/hero-workstation.mp4" },
  },
  { image: "/assets/imagery/slider_01.jpg" },
  { image: "/assets/imagery/slider_02.jpg" },
  { image: "/assets/imagery/slider_03.jpg" },
] as const;

const en: HomeCopy = {
  hero: [
    {
      ...HERO_MEDIA[0],
      eyebrow: "Gold & Diamond ERP",
      title: "Empowering the jewellery industry since 1988.",
      body: "For more than three decades we have built ERP systems that help gold and diamond businesses simplify operations, manage inventory with precision, and grow.",
      ctaLabel: "Explore our solutions",
      ctaHref: "/solutions",
    },
    {
      ...HERO_MEDIA[1],
      eyebrow: "Software Solutions Services",
      title: "Built for your maximum satisfaction.",
      body: "We endeavour to offer you the best solutions to achieve your maximum satisfaction.",
      ctaLabel: "Explore solutions",
      ctaHref: "/solutions",
    },
    {
      ...HERO_MEDIA[2],
      eyebrow: "Enterprise Resource Planning",
      title: "Effective software, delivered.",
      body: "We are the masters in offering effective software development solutions.",
      ctaLabel: "See our services",
      ctaHref: "/services",
    },
    {
      ...HERO_MEDIA[3],
      /* The legacy line ended "...and we prove it with our certifications". That clause is
         dropped until the certificates are documented — PRODUCT.md records them as
         unconfirmed, and the rest of the sentence carries the meaning without the claim. */
      eyebrow: "Gold & Diamond Solutions",
      title: "Credence, built on quality standards.",
      body: "Developing credence by ensuring quality standards across every jewellery segment.",
      /* "Contact us", not "Book a demo": this scrolls to the contact section on the same
         page, so the persistent-CTA label would promise a booking flow that does not exist. */
      ctaLabel: "Contact us",
      ctaHref: "/#contact",
    },
  ],

  figuresAria: "Company figures",
  figuresEyebrow: "Trusted by the jewellery industry",

  proofLede: "Trusted by 1,750+ jewellery stores & manufacturers across Egypt, Dubai, KSA & USA",
  proofStripAria: "A selection of our 1,750+ clients",
  proofCta: "See all 1,750+ clients",

  servicesEyebrow: "Services",
  servicesHeading: "Unlimited solutions to every business need.",
  servicesBody:
    "Cutting-edge technology for maximum satisfaction and measurable benefit to your business development — from a full-stack IT vendor.",
  servicesImageAlt: "SWH team and delivery",
  services: [
    { title: "Software Services", body: "We develop the finest quality software, with a taste of ART, in a manner satisfying your business needs." },
    { title: "Hardware & Networking", body: "Premium quality hardware and networking solutions, backed by lifetime support." },
    { title: "Gold & Diamond ERP", body: "40 years servicing Gold & Diamond retail — the market leader in the G&D industry." },
    { title: "Web & Mobile", body: "We give your product access to every device with the most cutting-edge technologies." },
  ],

  bigPictureHeading: "See the big picture.",
  bigPictureBody:
    "One comprehensive, POS-integrated ERP turns your operation into clear, connected data — across every location and segment.",
  bigPictureImageAlt: "Gold & Diamond ERP",
  modules: [
    { title: "ERP Systems & General Ledger", body: "Financials, GL and reporting built for jewellery and enterprise alike." },
    { title: "Inventory & Asset Tracking", body: "Track every gram and asset across retail, manufacturing and wholesale." },
    { title: "Manufacturing & Payroll", body: "Production, membership management and payroll in one connected system." },
    { title: "POS Integration", body: "Point-of-sale integrated across gold, diamond and precious-stone segments." },
  ],
  discoverMore: "Discover More",

  specsEyebrow: "Specs",
  specsHeading: "Why choose SWH?",
  specColumns: ["SWH", "Generic vendor", "In-house"],
  specRows: [
    [{ ok: true, text: "40 yrs Gold & Diamond domain" }, { ok: false, text: "Generic ERP" }, { ok: false, text: "Build from zero" }],
    [{ ok: true, text: "POS-integrated ERP" }, { ok: true, text: "Add-on POS" }, { ok: false, text: "Manual entry" }],
    [{ ok: true, text: "Local support + training" }, { ok: false, text: "Remote only" }, { ok: false, text: "None" }],
    [{ ok: true, text: "Regional presence" }, { ok: false, text: "Single market" }, { ok: false, text: "None" }],
    [{ ok: true, text: "1,750+ jewellery clients" }, { ok: true, text: "Varies" }, { ok: false, text: "Unproven" }],
  ],

  quote:
    "They delivered my project on time, with a highly skilled, experienced and professional team. Software House Solutions explained every detail of the software.",
  quoteAttribution: "Mr. Mohammed Wassem — Wassem Jewellery",

  howToHeading: "Map your success.",
  steps: [
    { n: "01", title: "Get Started", body: "Onboard your catalogue and POS in days — a smooth transition from traditional management." },
    { n: "02", title: "Configure & Migrate", body: "We adapt the ERP to your segment, then migrate your data with local support and training." },
    { n: "03", title: "Grow Your Business", body: "Make informed decisions from one connected view and scale across every location." },
  ],

  eventsEyebrow: "News & events",
  eventsHeading: "Where you will find us.",
  eventsBody:
    "We exhibit at the trade’s own events, and we turn up on site when a client opens their doors.",
  eventsCta: "All news & events",

  bandHeading: "Ready to transform your jewellery business?",
  bandBody:
    "Whether you are opening your first store, managing multiple branches or expanding internationally, our jewellery management system covers inventory, sales, production, accounting and business performance in one platform.",
  bandCta: "Schedule your free demo",

  contactHeading: "Connect with us.",
  contactBody: "Let us give you more details about our software solutions.",
  contactCta: "Message us on WhatsApp",
};

const ar: HomeCopy = {
  hero: [
    {
      ...HERO_MEDIA[0],
      eyebrow: "نظام ERP للذهب والألماس",
      title: "نُمكّن صناعة المجوهرات منذ عام 1988.",
      body: "على مدى أكثر من ثلاثة عقود بنينا أنظمة ERP تساعد شركات الذهب والألماس على تبسيط عملياتها وإدارة مخزونها بدقة والنمو.",
      ctaLabel: "استكشف حلولنا",
      ctaHref: "/solutions",
    },
    {
      ...HERO_MEDIA[1],
      eyebrow: "خدمات الحلول البرمجية",
      title: "مصمَّمة لتحقيق أقصى رضاك.",
      body: "نسعى لتقديم أفضل الحلول التي تحقق لك أقصى درجات الرضا.",
      ctaLabel: "استكشف الحلول",
      ctaHref: "/solutions",
    },
    {
      ...HERO_MEDIA[2],
      eyebrow: "تخطيط موارد المؤسسات",
      title: "برمجيات فعّالة، تُسلَّم في موعدها.",
      body: "نحن روّاد في تقديم حلول تطوير برمجية فعّالة.",
      ctaLabel: "اطّلع على خدماتنا",
      ctaHref: "/services",
    },
    {
      ...HERO_MEDIA[3],
      eyebrow: "حلول الذهب والألماس",
      title: "ثقة مبنية على معايير الجودة.",
      body: "نبني الثقة بالالتزام بمعايير الجودة في كل قطاعات المجوهرات.",
      ctaLabel: "تواصل معنا",
      ctaHref: "/#contact",
    },
  ],

  figuresAria: "أرقام الشركة",
  figuresEyebrow: "ثقة صناعة المجوهرات",

  proofLede: "أكثر من 1,750 متجرًا ومصنعًا للمجوهرات يثقون بنا في مصر ودبي والسعودية والولايات المتحدة",
  proofStripAria: "مجموعة مختارة من عملائنا الذين يزيدون على 1,750 عميلًا",
  proofCta: "شاهد كل عملائنا (+1,750)",

  servicesEyebrow: "خدماتنا",
  servicesHeading: "حلول لا محدودة لكل احتياجات عملك.",
  servicesBody:
    "أحدث التقنيات لتحقيق أقصى درجات الرضا وفائدة ملموسة لتطوير أعمالك — من مزوّد متكامل لحلول تقنية المعلومات.",
  servicesImageAlt: "فريق SWH أثناء العمل",
  services: [
    { title: "الخدمات البرمجية", body: "نطوّر برمجيات بأعلى جودة، بلمسة فنية، وبما يلبي احتياجات عملك." },
    { title: "الأجهزة والشبكات", body: "أجهزة وحلول شبكات عالية الجودة، مدعومة بدعم فني مدى الحياة." },
    { title: "نظام ERP للذهب والألماس", body: "أربعون عامًا في خدمة تجزئة الذهب والألماس — الرائد في هذا القطاع." },
    { title: "الويب والتطبيقات", body: "نتيح لمنتجك الوصول إلى كل جهاز بأحدث التقنيات." },
  ],

  bigPictureHeading: "انظر إلى الصورة الكاملة.",
  bigPictureBody:
    "نظام ERP واحد شامل ومتكامل مع نقاط البيع يحوّل عملياتك إلى بيانات واضحة ومترابطة — عبر كل فرع وكل قطاع.",
  bigPictureImageAlt: "نظام ERP للذهب والألماس",
  modules: [
    { title: "أنظمة ERP ودفتر الأستاذ العام", body: "الحسابات ودفتر الأستاذ والتقارير، مصمَّمة للمجوهرات وللمؤسسات على حد سواء." },
    { title: "تتبّع المخزون والأصول", body: "تتبّع كل جرام وكل أصل عبر التجزئة والتصنيع والجملة." },
    { title: "التصنيع والرواتب", body: "الإنتاج وإدارة العضويات والرواتب في نظام واحد مترابط." },
    { title: "التكامل مع نقاط البيع", body: "نقاط بيع متكاملة عبر قطاعات الذهب والألماس والأحجار الكريمة." },
  ],
  discoverMore: "اكتشف المزيد",

  specsEyebrow: "المواصفات",
  specsHeading: "لماذا تختار SWH؟",
  specColumns: ["SWH", "مورّد عام", "تطوير داخلي"],
  specRows: [
    [{ ok: true, text: "40 عامًا من التخصص في الذهب والألماس" }, { ok: false, text: "نظام ERP عام" }, { ok: false, text: "البناء من الصفر" }],
    [{ ok: true, text: "ERP متكامل مع نقاط البيع" }, { ok: true, text: "نقاط بيع كإضافة" }, { ok: false, text: "إدخال يدوي" }],
    [{ ok: true, text: "دعم وتدريب محلي" }, { ok: false, text: "دعم عن بُعد فقط" }, { ok: false, text: "لا يوجد" }],
    [{ ok: true, text: "حضور إقليمي" }, { ok: false, text: "سوق واحد" }, { ok: false, text: "لا يوجد" }],
    [{ ok: true, text: "أكثر من 1,750 عميلًا في المجوهرات" }, { ok: true, text: "متفاوت" }, { ok: false, text: "غير مُثبت" }],
  ],

  quote:
    "سلّموا مشروعي في موعده، بفريق عالي المهارة وذي خبرة واحترافية. شرحت Software House Solutions كل تفصيلة في البرنامج.",
  quoteAttribution: "الأستاذ محمد وسيم — مجوهرات وسيم",

  howToHeading: "ارسم طريق نجاحك.",
  steps: [
    { n: "01", title: "ابدأ", body: "أدخل كتالوجك ونقاط البيع خلال أيام — انتقال سلس من الإدارة التقليدية." },
    { n: "02", title: "التهيئة والترحيل", body: "نكيّف النظام على قطاعك، ثم نرحّل بياناتك مع دعم وتدريب محلي." },
    { n: "03", title: "نمِّ أعمالك", body: "اتخذ قرارات مدروسة من رؤية واحدة مترابطة، وتوسّع في كل فرع." },
  ],

  eventsEyebrow: "الأخبار والفعاليات",
  eventsHeading: "أين تجدنا.",
  eventsBody: "نشارك في معارض القطاع نفسه، ونحضر في الموقع حين يفتح عميل أبوابه.",
  eventsCta: "كل الأخبار والفعاليات",

  bandHeading: "هل أنت مستعد لتطوير أعمالك في المجوهرات؟",
  bandBody:
    "سواء كنت تفتتح متجرك الأول أو تدير عدة فروع أو تتوسّع دوليًا، يغطي نظامنا لإدارة المجوهرات المخزون والمبيعات والإنتاج والحسابات وأداء الأعمال في منصة واحدة.",
  bandCta: "احجز عرضك التوضيحي المجاني",

  contactHeading: "تواصل معنا.",
  contactBody: "دعنا نطلعك على مزيد من التفاصيل حول حلولنا البرمجية.",
  contactCta: "راسلنا على واتساب",
};

export const HOME: Record<Locale, HomeCopy> = { en, ar };
