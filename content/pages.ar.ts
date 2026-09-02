/* Arabic copy for the interior routes — the mirror of content/pages.en.ts.

   Same `Record<PageSlug, PageContent>` shape and the same block sequence per page, so the
   two languages cannot structurally diverge: a page added to one and not the other, or a
   block list that no longer matches, is a type error before it is a layout bug.

   TRANSLATION PROVENANCE: machine-authored, not supplied by the client. It renders the
   same claims as the English — PRODUCT.md's ban on inventing case studies, certifications,
   awards, named outcomes, pricing and timelines applies identically here, so the pages
   that ship an honest "not published yet" body in English ship one in Arabic too. A native
   reviewer should read this file before launch.

   REGISTER. Modern Standard Arabic. Product, company and vendor names — Software House
   Solutions, SWH, ERP, POS, Microsoft, HP, Dell, Zebra, Bixolon, NEBU — stay in Latin
   script, as they do on Arabic-language material across this trade. Western digits
   throughout, matching Egyptian business writing and the English figures.

   Every `href` is stored WITHOUT a locale prefix, exactly as in the English file. */

import type { PageSlug } from "./nav";
import { SITE, regionList } from "./site";
import { EVENTS, TEAM_PHOTOS } from "./events";
import { IMG, HARDWARE_IMG, PARTNER_LOGOS, type PageContent, type StubBlock } from "./pages.types";

/** Reused wherever a page has nothing left to say but a next step. */
const contactCta = (heading: string, body: string): StubBlock => ({
  kind: "cta",
  heading,
  body,
  label: "تحدث إلينا",
  href: SITE.demoHref,
});

/** For pages whose real content would require claims PRODUCT.md says not to invent. */
const notPublishedYet = (what: string): StubBlock => ({
  kind: "intro",
  heading: "قيد الإعداد",
  body: `نعمل حاليًا على تجهيز ${what} للنشر. وبدلًا من ملء هذه الصفحة بادعاءات مؤقتة، نفضّل أن نعرض عليك المادة الحقيقية — تواصل معنا وسنستعرضها معك مباشرة.`,
});

export const PAGES_AR: Record<PageSlug, PageContent> = {
  /* ---------------- About ---------------- */
  "about-company": {
    title: "عن الشركة",
    eyebrow: "من نحن",
    lede: `شركة رائدة إقليميًا ومزوّد حلول متكامل، تطوّر حلول تقنية معلومات متقدمة لشركات من قطاعات متعددة منذ عام ${SITE.since}.`,
    image: IMG.about,
    metaDescription: `تقود Software House Solutions السوق منذ عام ${SITE.since}، ببناء أنظمة ERP وبرمجيات مخصصة لشركات في مصر ودبي والسعودية والولايات المتحدة.`,
    blocks: [
      {
        kind: "intro",
        eyebrow: "من نحن",
        heading: "حلول تقنية وأعمال، منذ 1988.",
        body: "تلتزم Software House Solutions بتقديم خدمات تطوير برمجي متقدمة لعملائها حول العالم. وبفريق من المطورين ذوي المهارة والخبرة العالية، نقدّم هذه الخدمات بأحدث التقنيات، ونتبع منهجية تطوير منظمة، ونسلّم المشروعات في مواعيدها.",
      },
      {
        kind: "cards",
        heading: "ماذا نقدّم",
        items: [
          { title: "ERP للمؤسسات", body: "دفتر الأستاذ العام والمخزون وتتبّع الأصول والتصنيع وإدارة العضويات والرواتب في نظام واحد مترابط." },
          { title: "ERP للذهب والألماس", body: "نظام ERP متكامل مع نقاط البيع، مبني لتجار التجزئة والمصنّعين وتجار الجملة وتجار السبائك." },
          { title: "الأجهزة والشبكات", body: "أجهزة وحلول شبكات عالية الجودة، مدعومة بدعم فني مدى الحياة." },
          { title: "الويب والتطبيقات", body: "نتيح لمنتجك الوصول إلى كل جهاز بأحدث التقنيات." },
        ],
      },
      {
        kind: "cards",
        heading: "الرسالة والرؤية",
        items: [
          { title: "ما يميّزنا", body: "خدمات مبتكرة وتنافسية ومتميزة هي ميزتنا الأساسية على المنافسين، إلى جانب التزامنا بتسليم مشروعاتنا بدقة وكفاءة وفي موعدها." },
          { title: "إلى أين نتجه", body: "بعد أن أصبحنا المزوّد البرمجي المفضّل لمعظم شركات المجوهرات والتجزئة والتوزيع في مصر، نهدف الآن إلى ريادة سوق ERP والحلول المتنقلة في الشرق الأوسط وأفريقيا." },
          { title: "فريقنا", body: "موظفونا هم أهم أصولنا الثابتة. نساعدهم على النمو فرديًا لنبني شركة أقوى." },
        ],
      },
      contactCta("تريد التفاصيل الكاملة؟", "يسعدنا أن نحدثك عن تاريخنا وفريقنا وطريقة عملنا."),
    ],
  },

  "background-capabilities": {
    title: "خبراتنا وإمكانياتنا",
    eyebrow: "من نحن",
    lede: "أربعة عقود من التخصص العميق في تجارة المجوهرات، إلى جانب ممارسة متكاملة في تقنية المعلومات.",
    image: IMG.about,
    metaDescription: "خبرة SWH في أنظمة ERP للذهب والألماس، وإمكانياتها الأوسع في البرمجيات والأجهزة والشبكات وتطوير الويب والتطبيقات.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "الخلفية",
        heading: "نمكّن شركات المجوهرات بالتقنية.",
        body: "نظام ERP لدينا نظام شامل للمجوهرات يمكّن تجار التجزئة والمصنّعين وتجار الجملة وتجار السبائك. تدعم هذه المنصة المتكاملة مع نقاط البيع إدارة الأعمال عبر قطاعات المجوهرات والأحجار الكريمة، وقد ساعدنا مئات العملاء على الانتقال من الإدارة التقليدية إلى الإدارة المعتمدة على التقنية.",
      },
      {
        kind: "numbered",
        heading: "قدراتنا الأساسية",
        items: [
          { title: "أنظمة ERP ودفتر الأستاذ العام", body: "الحسابات ودفتر الأستاذ والتقارير، مصمَّمة للمجوهرات وللمؤسسات على حد سواء." },
          { title: "تتبّع المخزون والأصول", body: "تتبّع كل جرام وكل أصل عبر التجزئة والتصنيع والجملة." },
          { title: "التصنيع والرواتب", body: "الإنتاج وإدارة العضويات والرواتب في نظام واحد مترابط." },
          { title: "التكامل مع نقاط البيع", body: "نقاط بيع متكاملة عبر قطاعات الذهب والألماس والأحجار الكريمة." },
        ],
      },
      {
        kind: "numbered",
        heading: "أبرز إنجازاتنا",
        items: [
          { title: "الأولى في التخصص في الذهب", body: "أول شركة تبني نظام ERP لقطاع الذهب وحده، بدلًا من تكييف نظام عام عليه." },
          { title: "الأولى على كل المنصات", body: "أول شركة مصرية تصدر برنامج محاسبة الذهب كتطبيق سطح مكتب، وتطبيق سحابي، وتطبيقين لـ iPhone وAndroid." },
          { title: "وكلاء Zebra المعتمدون في مصر", body: "نوفّر أجهزة Zebra وندعمها مباشرة، فتأتي أجهزة المسح والطابعات على منضدتك من الجهة نفسها التي تشغّل برنامجك." },
          { title: "نصنّع المستلزمات بأنفسنا", body: "تُصنع بكرات ملصقات المجوهرات في مصانعنا بدقة عالية ووزن ثابت، فتتطابق الملصقات مع النظام." },
          { title: "مبني للمنطقة", body: "تخصيصات مضافة وحزم إضافية مطوّرة لطريقة عمل شركات الشرق الأوسط فعليًا." },
          { title: "مصر ودبي", body: "توسّعنا خارج مصر إلى دبي، مع خطط لمزيد من التوسع." },
        ],
      },
      {
        kind: "spec",
        heading: "أين نختلف",
        columns: [{ label: "SWH", highlight: true }, { label: "مورّد عام" }, { label: "تطوير داخلي" }],
        rows: [
          { cells: [{ ok: true, text: "40 عامًا من التخصص في الذهب والألماس" }, { ok: false, text: "نظام ERP عام" }, { ok: false, text: "البناء من الصفر" }] },
          { cells: [{ ok: true, text: "ERP متكامل مع نقاط البيع" }, { ok: true, text: "نقاط بيع كإضافة" }, { ok: false, text: "إدخال يدوي" }] },
          { cells: [{ ok: true, text: "دعم وتدريب محلي" }, { ok: false, text: "دعم عن بُعد فقط" }, { ok: false, text: "لا يوجد" }] },
          { cells: [{ ok: true, text: "حضور إقليمي" }, { ok: false, text: "سوق واحد" }, { ok: false, text: "لا يوجد" }] },
        ],
      },
    ],
  },

  "our-team": {
    title: "فريق العمل",
    eyebrow: "من نحن",
    lede: "مطورون ومستشارون على مستوى عالٍ من المهارة والخبرة، يبقون مع مشروعك بعد تشغيله.",
    image: IMG.about,
    metaDescription: "الأشخاص خلف Software House Solutions — التطوير والتنفيذ والدعم والتدريب.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "فريقنا",
        heading: "من يقومون بالتنفيذ.",
        body: "نحن روّاد في تطوير البرمجيات وأنظمة ERP، ويتعامل خبراؤنا مع المشروعات الموكلة إليهم بعناية. ويتولى التنفيذ والدعم المحلي والتدريب الأشخاصُ أنفسهم الذين بنوا البرنامج.",
      },
      {
        kind: "steps",
        heading: "أقسامنا",
        items: [
          { n: "01", title: "الفريق الفني", body: "التنفيذ والترحيل وعقود الدعم في الموقع — من يقفون معك يوم الافتتاح." },
          { n: "02", title: "فريق المبيعات", body: "دراسة طبيعة العمل قبل تهيئة أي شيء، ليطابق النظام طريقة تجارتك الحالية." },
          { n: "03", title: "قسم البرمجة", body: "يبني النظام على سطح المكتب والسحابة وiPhone وAndroid، بما في ذلك التخصيص لكل عميل." },
          { n: "04", title: "قسم الشبكات", body: "يصمّم وينفّذ الشبكة التي تعمل عليها الفروع ونقاط البيع." },
          { n: "05", title: "قسم الأجهزة", body: "يوفّر ويخدم أجهزة المسح والطابعات وأجهزة نقاط البيع والمستلزمات، بدعم مدى الحياة." },
        ],
      },
      contactCta("تعرّف على الفريق", "يمكننا تعريفك بالأشخاص الذين سيديرون عملية التنفيذ لديك."),
    ],
  },

  certificates: {
    title: "الشهادات",
    eyebrow: "من نحن",
    lede: "اعتماداتنا وشهادات شركائنا.",
    image: IMG.about,
    metaDescription: "الاعتمادات وشهادات الشركاء التي تحملها Software House Solutions.",
    blocks: [
      notPublishedYet("شهاداتنا الحالية واعتمادات شركائنا"),
      contactCta("تحتاج مستندات؟", "يمكننا إرسال الشهادات الحالية وتفاصيل الاعتمادات عند الطلب."),
    ],
  },

  /* ---------------- Solutions ---------------- */
  solutions: {
    title: "جميع الحلول",
    eyebrow: "الحلول",
    lede: "نظام ERP واحد شامل ومتكامل مع نقاط البيع يحوّل عملياتك إلى بيانات واضحة ومترابطة.",
    image: IMG.solutions,
    metaDescription: "حلول ERP وحلول الأعمال من Software House Solutions، بما فيها منصة المجوهرات المتخصصة للذهب والألماس.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "الحلول",
        heading: "حلول لا محدودة لكل احتياجات عملك.",
        body: "تقنيات متقدمة لتحقيق أقصى درجات الرضا وفائدة ملموسة لتطوير أعمالك — من مورّد متكامل لتقنية المعلومات.",
      },
      {
        kind: "cards",
        items: [
          { title: "ERP للذهب والألماس", body: "أربعون عامًا في خدمة تجزئة الذهب والألماس — الرائد في هذا القطاع." },
          { title: "ERP للمؤسسات", body: "الحسابات والمخزون والتصنيع وإدارة العضويات والرواتب لشركات من أي حجم." },
          { title: "التكامل مع نقاط البيع", body: "نقاط بيع متكاملة عبر قطاعات الذهب والألماس والأحجار الكريمة." },
          { title: "برمجيات مخصصة", body: "نطوّر برمجيات بأعلى جودة، بما يلبي احتياجات عملك." },
        ],
      },
      contactCta("شاهده وهو يعمل", "احجز جولة توضيحية وسنعرض عليك الوحدات التي تناسب طبيعة عملك."),
    ],
  },

  services: {
    title: "جميع الخدمات",
    eyebrow: "الحلول",
    lede: "برمجيات وأجهزة وشبكات وتطوير للويب والتطبيقات — من مورّد واحد.",
    image: IMG.solutions,
    metaDescription: "خدمات Software House Solutions: تطوير البرمجيات، والأجهزة والشبكات، وبناء تطبيقات الويب والهواتف.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "الخدمات",
        heading: "مورّد متكامل لتقنية المعلومات.",
        body: "خدمتنا: حلول لا محدودة لكل احتياجات عملك. نقدّم أحدث التقنيات لضمان أقصى درجات الرضا والفائدة لتطوير أعمالك.",
      },
      {
        kind: "cards",
        items: [
          { title: "البرمجيات", body: "برامج التصنيع والجملة والإدارة، وإدارة الفروع، وبرنامج الذهب والألماس، ومعالجة الفواتير والإيصالات الإلكترونية." },
          { title: "الأجهزة", body: "أجهزة المسح، وطابعات الكروت والحرارية والباركود، والطابعات والأحبار، وأجهزة نقاط البيع، والخوادم وأجهزة الكمبيوتر والمحمول، وبكرات الباركود والأشرطة." },
          { title: "الشبكات", body: "الشبكة التي تعمل عليها فروعك ونقاط البيع، تُصمَّم وتُركَّب مع النظام الذي يستخدمها." },
          { title: "الدعم والتدريب", body: "دعم محلي موثوق وتدريب سريع خلال فترة الانتقال وبعدها." },
        ],
      },
      {
        kind: "hardware",
        heading: "خدمات الأجهزة لدينا",
        items: [
          { n: "01", title: "نقاط البيع وأجهزة المحمول", image: HARDWARE_IMG.pos },
          { n: "02", title: "أجهزة المسح والأجهزة المحمولة", image: HARDWARE_IMG.scanners },
          { n: "03", title: "الطابعات", image: HARDWARE_IMG.printers },
          { n: "04", title: "أشرطة الباركود الملونة", image: HARDWARE_IMG.ribbons },
        ],
      },
      /* Hardware House is the group's own hardware arm and carries the full catalogue,
         stock and pricing that this page only summarises. Sending people there is better
         than growing a second product list here that would immediately fall out of date.
         StubBody detects the absolute URL and opens it in a new tab. */
      {
        kind: "cta",
        heading: "كتالوج الأجهزة الكامل.",
        body: "Hardware House هي ذراعنا المتخصصة في الأجهزة. أجهزة نقاط البيع وأجهزة المسح والطابعات والخوادم والمستلزمات والشبكات — المجموعة الكاملة، وبالدعم المحلي نفسه خلفها.",
        label: "زُر hardwarehouse-sol.com",
        href: "https://hardwarehouse-sol.com/",
      },
      {
        kind: "steps",
        heading: "كيف نعمل",
        items: [
          { n: "01", title: "ابدأ", body: "أدخل كتالوجك ونقاط البيع خلال أيام — انتقال سلس من الإدارة التقليدية." },
          { n: "02", title: "التهيئة والترحيل", body: "نكيّف النظام على قطاعك، ثم نرحّل بياناتك مع دعم وتدريب محلي." },
          { n: "03", title: "نمِّ أعمالك", body: "اتخذ قرارات مدروسة من رؤية واحدة مترابطة، وتوسّع في كل فرع." },
        ],
      },
      {
        kind: "numbered",
        heading: "عقود الخدمة في الموقع",
        items: [
          { title: "قطع الغيار والعمالة مشمولة", body: "تشمل التغطية تكلفة قطع الغيار والعمالة معًا." },
          { title: "ستة أيام أسبوعيًا، على مدار الساعة", body: "الدعم الفني متاح ستة أيام في الأسبوع، أربعًا وعشرين ساعة يوميًا." },
          { title: "إصلاح أو استبدال خلال 24 ساعة", body: "يتم الإصلاح أو الاستبدال خلال 24 ساعة من أول اتصال بحد أقصى." },
          { title: "تغطية الأضرار العارضة", body: "تمتد التغطية إلى الأضرار المادية العارضة في كل المكونات غير الاستهلاكية." },
          { title: "تدريب تنشيطي عند الحاجة", body: "يُعاد التدريب لأعضاء فريقك الحاليين أو الجدد كلما لزم الأمر." },
          { title: "إعادة التركيب مع تغيّر احتياجاتك", body: "نعيد تركيب الحل مع تغيّر احتياجاتك — فرع جديد أو مقر إداري جديد." },
          { title: "أجهزة بديلة في الطوارئ", body: "نوفّر أجهزة مؤقتة بدون مقابل إيجار حين يتوقف عملك لولا ذلك، ويُرتَّب ذلك حالة بحالة." },
        ],
      },
    ],
  },

  /* ---------------- Partners ---------------- */
  "technology-partners": {
    title: "شركاء التقنية",
    eyebrow: "الشركاء",
    lede: "المنصات وموردو الأجهزة الذين تُبنى حلولنا عليهم.",
    image: IMG.partners,
    metaDescription: "شركاء التقنية لدى Software House Solutions — Microsoft وHP وDell وZebra وBixolon — والوكالة المعتمدة لـ Zebra في مصر.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "شركاء التقنية",
        heading: "المنصات التي نبني عليها.",
        body: "تُسلَّم أنظمتنا على أجهزة ومنصات من كبار موردي القطاع، ونحن وكلاء معتمدون لـ Zebra في مصر — فتأتي أجهزة المسح وطابعات الملصقات على منضدتك من الجهة نفسها التي تشغّل برنامجك.",
      },
      {
        kind: "logos",
        label: "شركاؤنا في التقنية",
        logos: PARTNER_LOGOS,
      },
      contactCta("كن شريكًا لنا", "حدثنا عن منصتك وسنجد نقطة الالتقاء."),
    ],
  },

  "business-partners": {
    title: "شركاء الأعمال",
    eyebrow: "الشركاء",
    lede: "موزّعون وشركاء تنفيذ في أنحاء المنطقة.",
    image: IMG.partners,
    metaDescription: "شركاء الأعمال والموزّعون وشركاء التنفيذ لدى Software House Solutions.",
    blocks: [
      notPublishedYet("قائمة شركاء الأعمال الحالية"),
      contactCta("كن موزّعًا معتمدًا", "نعمل مع شركاء في مصر وفي المنطقة الأوسع."),
    ],
  },

  "become-a-partner": {
    title: "كن شريكًا لنا",
    eyebrow: "الشركاء",
    lede: "قدّم نظام ERP الخاص بنا في سوقك، وبدعمنا خلفك.",
    image: IMG.partners,
    metaDescription: "كن شريكًا لـ Software House Solutions لتقديم أنظمة ERP المتخصصة في سوقك.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "كن شريكًا",
        heading: "لنبنِ شيئًا معًا.",
        body: `نعمل مع شركاء في التقنية وفي الأعمال عبر ${regionList("ar")}. إذا كنت تخدم شركات تحتاج أنظمة ERP أو نقاط بيع أو أنظمة متخصصة للمجوهرات، فنحن نودّ أن نسمع منك.`,
      },
      {
        kind: "steps",
        heading: "كيف تسير الشراكة",
        items: [
          { n: "01", title: "تواصل معنا", body: "حدثنا عن سوقك وعملائك وما تبيعه بالفعل." },
          { n: "02", title: "التأهيل", body: "ندرّب فريقك على المنصة وعلى منهجية التنفيذ." },
          { n: "03", title: "الانطلاق للسوق", body: "تبيع وتنفّذ، وبدعمنا خلفك." },
        ],
      },
      contactCta("ابدأ الحوار", `راسلنا على ${SITE.salesEmail} أو اتصل بنا على ${SITE.phone}.`),
    ],
  },

  /* ---------------- Customers ---------------- */
  /* This record supplies the page header only. The body is the searchable directory in
     app/[lang]/(site)/customers/page.tsx, which wins over [slug] because a static route
     segment beats a dynamic one. The record has to stay: PageSlug is derived from NAV, so
     deleting it breaks the Record<PageSlug, PageContent> typecheck. */
  customers: {
    title: "عملاؤنا",
    eyebrow: "العملاء",
    /* The lede states the ROSTER, the page below it lists the PUBLISHED SAMPLE, and those
       are two different numbers on purpose — CLIENTS.length is how many logos we have
       clearance to show, not how many businesses run on the systems. */
    lede: `أكثر من 1,750 شركة مجوهرات ومؤسسة تعمل على أنظمتنا في ${regionList("ar")}.`,
    image: IMG.customers,
    metaDescription: "أكثر من 1,750 من تجار المجوهرات والمصنّعين وتجار الجملة والمؤسسات يعملون على أنظمة Software House Solutions. ابحث في قائمة عملائنا المنشورة وصفِّها حسب القطاع ونوع النشاط والمنطقة.",
    blocks: [],
  },

  testimonials: {
    title: "آراء العملاء",
    eyebrow: "العملاء",
    lede: "ما يقوله عملاؤنا عن العمل معنا.",
    image: IMG.customers,
    metaDescription: "آراء عملاء Software House Solutions.",
    blocks: [
      notPublishedYet("آراء العملاء الموثّقة"),
      contactCta("تحدث إلى أحد عملائنا", "يمكننا ترتيب حوار مع عميل في القطاع نفسه الذي تعمل فيه."),
    ],
  },

  "case-studies": {
    title: "دراسات الحالة",
    eyebrow: "العملاء",
    lede: "عرض تفصيلي لعمليات التنفيذ ونتائجها.",
    image: IMG.customers,
    metaDescription: "دراسات حالة لعمليات التنفيذ من Software House Solutions.",
    blocks: [
      notPublishedYet("دراسات حالة مكتوبة بأرقام موثّقة"),
      contactCta("اطلب التفاصيل", "يمكننا أن نستعرض معك مباشرة عمليات تنفيذ مماثلة."),
    ],
  },

  /* ---------------- Standalone ---------------- */
  "news-events": {
    title: "الأخبار والفعاليات",
    eyebrow: "الشركة",
    lede: "المعارض وافتتاحات العملاء والمناسبات التي نحتفي بها كفريق.",
    image: IMG.events,
    metaDescription: "Software House Solutions في معرض NEBU، وافتتاحات متاجر العملاء، وفعاليات الشركة.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "الأخبار والفعاليات",
        heading: "أين تجدنا.",
        body: "نشارك في معارض القطاع نفسه، ونحضر في الموقع حين يفتح عميل أبوابه. وفيما يلي سجل الاثنين معًا.",
      },
      { kind: "timeline", items: EVENTS.ar },
      contactCta("ستلتقي بنا شخصيًا؟", "أخبرنا بالفعالية التي ستحضرها وسنخصّص لك وقتًا."),
    ],
  },

  /* `blogs` was removed on 2026-08-07 along with its nav entry — see content/nav.ts. */

  /* ---------------- Careers ---------------- */
  vacancies: {
    title: "الوظائف الشاغرة",
    eyebrow: "الوظائف",
    lede: "نبحث دائمًا عن عقول متميزة وشغوفة تشاركنا رؤيتنا.",
    image: IMG.careers,
    metaDescription: "الوظائف المتاحة في Software House Solutions.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "الوظائف الشاغرة",
        heading: "انضم إلى الفريق.",
        body: `نبحث دائمًا عن عقول متميزة وشغوفة تشاركنا رؤيتنا. إذا كنت مهتمًا بالانضمام إلى فريقنا، يسعدنا استقبال سيرتك الذاتية على ${SITE.careersEmail}.`,
      },
      notPublishedYet("قائمة الوظائف المتاحة حاليًا"),
      { kind: "cta", heading: "أرسل سيرتك الذاتية", body: `راسلنا على ${SITE.careersEmail} بسيرتك الذاتية ونوع العمل الذي تبحث عنه.`, label: "راسل قسم التوظيف", href: `mailto:${SITE.careersEmail}` },
    ],
  },

  internships: {
    title: "التدريب",
    eyebrow: "الوظائف",
    lede: "تعلّم المهنة على أنظمة حقيقية، إلى جانب من يبنونها.",
    image: IMG.careers,
    metaDescription: "فرص التدريب في Software House Solutions.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "التدريب",
        heading: "ابدأ من هنا.",
        body: "يعمل المتدربون إلى جانب فرق التطوير والتنفيذ لدينا على أنظمة حقيقية، لا على مشروعات تدريبية. إن كانت هذه هي البداية التي تريدها، فنحن نودّ أن نسمع منك.",
      },
      notPublishedYet("تفاصيل الدفعة الحالية"),
      { kind: "cta", heading: "قدّم الآن", body: `راسلنا على ${SITE.careersEmail} وأخبرنا بما تدرسه وبما يهمّك.`, label: "راسل قسم التوظيف", href: `mailto:${SITE.careersEmail}` },
    ],
  },

  "life-at-swh": {
    title: "الحياة في SWH",
    eyebrow: "الوظائف",
    lede: "كيف نعمل، وكيف هي الحياة هنا.",
    image: IMG.team,
    metaDescription: "العمل في Software House Solutions — الثقافة والفرق وطريقة البناء.",
    blocks: [
      {
        kind: "intro",
        eyebrow: "الحياة في SWH",
        heading: "بناه أشخاص بقوا فيه.",
        body: "نتبع منهجية تطوير منظمة ونلتزم بتسليم المشروعات في مواعيدها. والفريق الذي يبني النظام هو نفسه من ينفّذه ويدعمه ويدرّب مستخدميه — ما يعني أن العمل الذي تنجزه هنا يظل عملك.",
      },
      {
        kind: "gallery",
        heading: "رحلة رمضان",
        items: TEAM_PHOTOS.ar,
      },
      contactCta("لديك فضول؟", "اسألنا أي شيء عن العمل هنا."),
    ],
  },
};
