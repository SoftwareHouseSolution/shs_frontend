/* The client review page (/[lang]/review): its copy and its questions. Drafting a review
   from the answers lives in content/reviewDrafts.ts.

   The answer CODES (duration, rating, benefit, business, branches, previous system) are the
   API contract — they must match apps.reviews.models.Review on the backend, which validates
   them and counts them on the admin dashboard. Labels and sentences are free to change.

   The governorate is always sent by its Arabic name (the backend files reviews under one
   spelling whatever the page language); the English page only shows English labels. */

import type { Locale } from "./i18n";

export type Duration = "lt1" | "1-3" | "3-5" | "5-10" | "10+";
export type Rating = "good" | "ok" | "low";
export type Benefit = "inventory" | "weights" | "accounts" | "daily_reports" | "branches" | "invoices" | "workmanship";

export type BusinessType = "retail" | "wholesale" | "manufacturing";
export type Branches = "1" | "2-3" | "4+";
export type PreviousSystem = "paper" | "excel" | "other" | "none";
export type DraftStyle = "casual" | "detailed" | "short";

export const DURATIONS: Duration[] = ["lt1", "1-3", "3-5", "5-10", "10+"];
export const BUSINESS_TYPES: BusinessType[] = ["retail", "wholesale", "manufacturing"];
export const BRANCH_COUNTS: Branches[] = ["1", "2-3", "4+"];
export const PREVIOUS_SYSTEMS: PreviousSystem[] = ["paper", "excel", "other", "none"];
export const DRAFT_STYLES: DraftStyle[] = ["casual", "detailed", "short"];
export const RATINGS: Rating[] = ["good", "ok", "low"];
export const BENEFITS: Benefit[] = ["inventory", "weights", "accounts", "daily_reports", "branches", "invoices", "workmanship"];

/** Arabic name (sent to the API) → English label and the Arabic area list. */
export const GOVERNORATES: { ar: string; en: string; areas: string[] }[] = [
  { ar: "القاهرة", en: "Cairo", areas: ["الصاغة – الموسكي", "وسط البلد", "مصر الجديدة", "مدينة نصر", "المعادي", "شبرا", "عين شمس", "المطرية", "الزيتون", "حلوان", "التجمع الخامس", "المقطم", "السيدة زينب", "حدائق القبة", "المرج", "الشروق"] },
  { ar: "الجيزة", en: "Giza", areas: ["الدقي", "المهندسين", "الهرم", "فيصل", "العمرانية", "إمبابة", "بولاق الدكرور", "6 أكتوبر", "الشيخ زايد", "الحوامدية", "البدرشين"] },
  { ar: "الإسكندرية", en: "Alexandria", areas: ["المنشية", "محطة الرمل", "العطارين", "سيدي بشر", "ميامي", "العصافرة", "سموحة", "المندرة", "العجمي", "برج العرب", "كرموز", "الإبراهيمية"] },
  { ar: "القليوبية", en: "Qalyubia", areas: ["بنها", "شبرا الخيمة", "قليوب", "الخانكة", "العبور", "طوخ", "القناطر الخيرية"] },
  { ar: "الدقهلية", en: "Dakahlia", areas: ["المنصورة", "ميت غمر", "طلخا", "السنبلاوين", "أجا", "دكرنس", "المنزلة"] },
  { ar: "الغربية", en: "Gharbia", areas: ["طنطا", "المحلة الكبرى", "كفر الزيات", "زفتى", "السنطة", "سمنود"] },
  { ar: "الشرقية", en: "Sharqia", areas: ["الزقازيق", "العاشر من رمضان", "بلبيس", "منيا القمح", "أبو كبير", "فاقوس", "ههيا"] },
  { ar: "المنوفية", en: "Monufia", areas: ["شبين الكوم", "منوف", "السادات", "أشمون", "قويسنا", "الباجور", "تلا"] },
  { ar: "البحيرة", en: "Beheira", areas: ["دمنهور", "كفر الدوار", "إيتاي البارود", "رشيد", "أبو حمص", "كوم حمادة"] },
  { ar: "كفر الشيخ", en: "Kafr El Sheikh", areas: ["كفر الشيخ", "دسوق", "بيلا", "فوه", "الحامول"] },
  { ar: "دمياط", en: "Damietta", areas: ["دمياط", "دمياط الجديدة", "فارسكور", "كفر سعد"] },
  { ar: "بورسعيد", en: "Port Said", areas: ["حي الشرق", "حي العرب", "بورفؤاد"] },
  { ar: "الإسماعيلية", en: "Ismailia", areas: ["الإسماعيلية", "القنطرة", "فايد"] },
  { ar: "السويس", en: "Suez", areas: ["السويس", "الأربعين", "فيصل"] },
  { ar: "الفيوم", en: "Faiyum", areas: ["الفيوم", "سنورس", "إطسا", "طامية"] },
  { ar: "بني سويف", en: "Beni Suef", areas: ["بني سويف", "الواسطى", "ببا", "الفشن"] },
  { ar: "المنيا", en: "Minya", areas: ["المنيا", "ملوي", "مغاغة", "بني مزار", "سمالوط", "أبو قرقاص"] },
  { ar: "أسيوط", en: "Asyut", areas: ["أسيوط", "ديروط", "منفلوط", "أبنوب", "القوصية"] },
  { ar: "سوهاج", en: "Sohag", areas: ["سوهاج", "جرجا", "طهطا", "أخميم", "البلينا"] },
  { ar: "قنا", en: "Qena", areas: ["قنا", "نجع حمادي", "قوص", "دشنا"] },
  { ar: "الأقصر", en: "Luxor", areas: ["الأقصر", "إسنا", "أرمنت"] },
  { ar: "أسوان", en: "Aswan", areas: ["أسوان", "كوم أمبو", "إدفو"] },
  { ar: "البحر الأحمر", en: "Red Sea", areas: ["الغردقة", "سفاجا", "القصير"] },
  { ar: "مطروح", en: "Matrouh", areas: ["مرسى مطروح", "العلمين"] },
  { ar: "شمال سيناء", en: "North Sinai", areas: ["العريش"] },
  { ar: "جنوب سيناء", en: "South Sinai", areas: ["شرم الشيخ", "الطور", "دهب"] },
  { ar: "الوادي الجديد", en: "New Valley", areas: ["الخارجة", "الداخلة"] },
  { ar: "خارج مصر", en: "Outside Egypt", areas: [] },
];
export const ABROAD = "خارج مصر";

export type ReviewCopy = {
  metaTitle: string;
  metaDescription: string;
  brand: string;
  title: string;
  lede: string;
  badges: [string, string, string];
  stepNames: [string, string, string];
  stepOf: (n: number) => string;
  next: string;
  back: string;
  // Step 1
  aboutYou: string;
  name: string;
  namePlaceholder: string;
  shop: string;
  shopPlaceholder: string;
  governorate: string;
  chooseGovernorate: string;
  area: string;
  chooseArea: string;
  chooseGovernorateFirst: string;
  otherArea: string;
  otherAreaAbroad: string;
  areaPlaceholder: string;
  areaPlaceholderAbroad: string;
  photo: string;
  optional: string;
  photoDrop: string;
  photoHint: string;
  photoChange: string;
  photoRemove: string;
  step1Error: string;
  // Step 2
  questions: string;
  qDuration: string;
  durations: Record<Duration, string>;
  qSupport: string;
  support: Record<Rating, string>;
  qUpdates: string;
  updates: Record<Rating, string>;
  qBenefits: string;
  pickSeveral: string;
  benefits: Record<Benefit, string>;
  moreTitle: string;
  moreHint: string;
  qBusiness: string;
  business: Record<BusinessType, string>;
  qBranches: string;
  branches: Record<Branches, string>;
  qBefore: string;
  before: Record<PreviousSystem, string>;
  qExtra: string;
  extraPlaceholder: string;
  micStart: string;
  micListening: string;
  micHint: string;
  micUnsupported: string;
  micDenied: string;
  micNoSpeech: string;
  micDone: string;
  step2Error: string;
  writeIt: string;
  // Step 3
  yourReview: string;
  editHint: string;
  styleLabel: string;
  styles: Record<DraftStyle, string>;
  writing: string;
  writtenForYou: string;
  chars: (n: number) => string;
  rewrite: string;
  send: string;
  sending: string;
  backToQuestions: string;
  // After sending
  thanksTitle: string;
  reference: (ref: string) => string;
  shareTitle: string;
  shareBody: string;
  shareButton: string;
  copied: string;
  copyFailed: string;
  // Errors
  fixErrors: string;
  networkError: string;
  serverError: string;
};

export const REVIEW_COPY: Record<Locale, ReviewCopy> = {
  ar: {
    metaTitle: "قيّم تجربتك",
    metaDescription: "رأيك في برنامج سوفت وير هاوس يفرق معانا ومع زمايلك في السوق.",
    brand: "SOFTWARE HOUSE · من 1988",
    title: "رأيك يفرق معانا ومع زمايلك في السوق",
    lede: "دقيقتين بس: تختار إجاباتك، وإحنا نكتب لك الريفيو، وانت تعدل فيه براحتك.",
    badges: ["دقيقتين بس", "إحنا نكتبهولك", "تعدّل براحتك"],
    stepNames: ["بياناتك", "تجربتك", "الريفيو"],
    stepOf: (n) => `الخطوة ${["١", "٢", "٣"][n - 1]} من ٣`,
    next: "التالي",
    back: "رجوع",
    aboutYou: "عرّفنا بيك",
    name: "اسمك",
    namePlaceholder: "مثلاً: الحاج طارق",
    shop: "اسم المحل",
    shopPlaceholder: "مثلاً: مجوهرات النور",
    governorate: "المحافظة",
    chooseGovernorate: "اختار المحافظة",
    area: "المنطقة",
    chooseArea: "اختار المنطقة",
    chooseGovernorateFirst: "اختار المحافظة الأول",
    otherArea: "منطقة تانية",
    otherAreaAbroad: "اكتب البلد والمدينة",
    areaPlaceholder: "اكتب اسم المنطقة",
    areaPlaceholderAbroad: "مثلاً: دبي – ديرة",
    photo: "صورة المحل أو الكارت",
    optional: "اختياري",
    photoDrop: "اضغط هنا وارفع صورة المحل أو الكارت",
    photoHint: "صورة واحدة — بنصغّرها لوحدنا قبل الرفع",
    photoChange: "غيّر الصورة",
    photoRemove: "شيل الصورة",
    step1Error: "اكتب اسمك واسم المحل، واختار المحافظة والمنطقة عشان نكمل.",
    questions: "جاوب على ٤ أسئلة",
    qDuration: "١. بقالك قد إيه شغال على البرنامج؟",
    durations: { lt1: "أقل من سنة", "1-3": "١–٣ سنين", "3-5": "٣–٥ سنين", "5-10": "٥–١٠ سنين", "10+": "أكتر من ١٠" },
    qSupport: "٢. الدعم الفني عامل معاك إزاي؟",
    support: { good: "ممتاز وبيرد بسرعة", ok: "كويس", low: "محتاج يتحسن" },
    qUpdates: "٣. التحديثات اللي بتنزل على البرنامج؟",
    updates: { good: "مستمرة وبتفرق", ok: "كويسة", low: "قليلة" },
    qBenefits: "٤. البرنامج فادك في إيه؟",
    pickSeveral: "اختار أكتر من حاجة",
    benefits: {
      inventory: "الجرد",
      weights: "الأوزان والعيارات",
      accounts: "حسابات العملاء والتجار",
      daily_reports: "التقارير اليومية",
      branches: "متابعة الفروع",
      invoices: "الفواتير",
      workmanship: "المصنعيات والدمغة",
    },
    moreTitle: "عرّفنا أكتر",
    moreHint: "اختياري — بس بيخلّي الريفيو شبهك انت ومش شبه غيرك",
    qBusiness: "نوع شغلك",
    business: { retail: "محل قطاعي", wholesale: "جملة", manufacturing: "مصنع / ورشة" },
    qBranches: "عدد الفروع",
    branches: { "1": "محل واحد", "2-3": "٢–٣ فروع", "4+": "٤ فروع أو أكتر" },
    qBefore: "قبل سوفت وير هاوس كنت شغال على إيه؟",
    before: { paper: "دفاتر وورق", excel: "إكسيل", other: "برنامج تاني", none: "ده أول سيستم" },
    qExtra: "عايز تضيف حاجة بكلامك؟",
    extraPlaceholder: "أو اكتب هنا لو تحب...",
    micStart: "دوس واتكلم بالعربي",
    micListening: "بسمعك... دوس تاني لما تخلص",
    micHint: "اتكلم براحتك، والكلام هيتكتب لوحده هنا تحت.",
    micUnsupported: "الموبايل ده مش بيدعم الكتابة بالصوت من الصفحة. افتح اللينك من Chrome أو اكتب بإيدك.",
    micDenied: "المايك مقفول. دوس على علامة القفل جنب اللينك فوق، وخلّي «الميكروفون» على سماح، وارجع دوس على المايك.",
    micNoSpeech: "مسمعتش حاجة، دوس تاني وقرّب الموبايل.",
    micDone: "تمام، اتكتب. تقدر تعدّل فيه أو تسجّل تاني.",
    step2Error: "جاوب على الأسئلة الأربعة عشان نكتب لك الريفيو.",
    writeIt: "اكتب لي الريفيو",
    yourReview: "ده الريفيو بتاعك",
    editHint: "اتكتب من إجاباتك انت. لو عايز تغيّر أي كلمة، دوس على الكلام وعدّل.",
    styleLabel: "أسلوب الكتابة",
    styles: { casual: "عفوي", detailed: "مفصّل", short: "مختصر" },
    writing: "بنكتبلك ريفيو على مقاسك…",
    writtenForYou: "مكتوب من إجاباتك",
    chars: (n) => `${n} حرف`,
    rewrite: "اكتبه بشكل تاني",
    send: "ابعت الريفيو",
    sending: "بيتبعت...",
    backToQuestions: "رجوع للأسئلة",
    thanksTitle: "شكراً ليك!",
    reference: (ref) => `رقم الريفيو: ${ref}`,
    shareTitle: "عايز تساعد زمايلك كمان؟",
    shareBody: "انسخ الريفيو وحطه كومنت على بوست جروب أهل الصاغة. هننسخه لك ونفتح البوست، وانت اعمل «لصق» في خانة الكومنت.",
    shareButton: "انسخ الريفيو وافتح البوست",
    copied: "الريفيو اتنسخ، اعمل لصق في كومنت على البوست",
    copyFailed: "اعمل نسخ للريفيو يدوي وبعدين الصقه في الكومنت",
    fixErrors: "في حاجة محتاجة تتظبط، راجع الخانات اللي باللون الأحمر.",
    networkError: "مش قادرين نوصل للسيرفر. اتأكد من النت وجرّب تاني.",
    serverError: "حصلت مشكلة عندنا. جرّب تاني بعد شوية.",
  },
  en: {
    metaTitle: "Review us",
    metaDescription: "Your opinion of Software House helps us — and your colleagues in the trade.",
    brand: "SOFTWARE HOUSE · SINCE 1988",
    title: "Your opinion helps us — and your colleagues in the trade",
    lede: "Two minutes: pick your answers, we draft the review, and you edit it as you like.",
    badges: ["Two minutes", "We write it for you", "Edit freely"],
    stepNames: ["About you", "Your experience", "Your review"],
    stepOf: (n) => `Step ${n} of 3`,
    next: "Next",
    back: "Back",
    aboutYou: "About you",
    name: "Your name",
    namePlaceholder: "e.g. Tarek Hassan",
    shop: "Shop name",
    shopPlaceholder: "e.g. Al Nour Jewellery",
    governorate: "Governorate",
    chooseGovernorate: "Choose a governorate",
    area: "Area",
    chooseArea: "Choose an area",
    chooseGovernorateFirst: "Choose a governorate first",
    otherArea: "Another area",
    otherAreaAbroad: "Type the country and city",
    areaPlaceholder: "Type the area",
    areaPlaceholderAbroad: "e.g. Dubai – Deira",
    photo: "Photo of the shop or business card",
    optional: "optional",
    photoDrop: "Tap to add a photo of the shop or business card",
    photoHint: "One photo — we resize it before uploading",
    photoChange: "Change photo",
    photoRemove: "Remove photo",
    step1Error: "Enter your name and shop, and choose the governorate and area to continue.",
    questions: "Answer 4 questions",
    qDuration: "1. How long have you used the system?",
    durations: { lt1: "Under a year", "1-3": "1–3 years", "3-5": "3–5 years", "5-10": "5–10 years", "10+": "Over 10 years" },
    qSupport: "2. How is technical support?",
    support: { good: "Excellent and quick", ok: "Good", low: "Needs improvement" },
    qUpdates: "3. How are the system's updates?",
    updates: { good: "Regular and useful", ok: "Good", low: "Too few" },
    qBenefits: "4. What has the system helped you with?",
    pickSeveral: "choose any",
    benefits: {
      inventory: "Inventory",
      weights: "Weights and karats",
      accounts: "Customer and trader accounts",
      daily_reports: "Daily reports",
      branches: "Branch monitoring",
      invoices: "Invoices",
      workmanship: "Workmanship and hallmarking",
    },
    moreTitle: "Tell us a little more",
    moreHint: "Optional — it makes the review sound like you, not like everyone else",
    qBusiness: "Your business",
    business: { retail: "Retail shop", wholesale: "Wholesale", manufacturing: "Factory / workshop" },
    qBranches: "Branches",
    branches: { "1": "One shop", "2-3": "2–3 branches", "4+": "4 or more" },
    qBefore: "Before Software House you used",
    before: { paper: "Paper ledgers", excel: "Excel", other: "Another program", none: "Nothing — first system" },
    qExtra: "Anything to add in your own words?",
    extraPlaceholder: "Or type here if you prefer...",
    micStart: "Tap and speak",
    micListening: "Listening... tap again when you're done",
    micHint: "Speak freely; your words appear below.",
    micUnsupported: "This browser can't type from speech. Open the link in Chrome, or type instead.",
    micDenied: "The microphone is blocked. Tap the lock next to the address, allow the microphone, then tap the button again.",
    micNoSpeech: "We didn't hear anything. Tap again and hold the phone closer.",
    micDone: "Done. You can edit it or record again.",
    step2Error: "Answer all four questions so we can draft your review.",
    writeIt: "Draft my review",
    yourReview: "Your review",
    editHint: "Written from your own answers. Tap the text to change any word.",
    styleLabel: "Writing style",
    styles: { casual: "Casual", detailed: "Detailed", short: "Short" },
    writing: "Writing a review that sounds like you…",
    writtenForYou: "Written from your answers",
    chars: (n) => `${n} characters`,
    rewrite: "Write it another way",
    send: "Send review",
    sending: "Sending...",
    backToQuestions: "Back to the questions",
    thanksTitle: "Thank you!",
    reference: (ref) => `Review reference: ${ref}`,
    shareTitle: "Want to help your colleagues too?",
    shareBody: "Post your review as a comment on the Ahl El-Sagha group post. We'll copy it and open the post; just paste it into the comment box.",
    shareButton: "Copy the review and open the post",
    copied: "Review copied — paste it as a comment on the post",
    copyFailed: "Copy the review by hand, then paste it into the comment",
    fixErrors: "Something needs fixing — check the fields marked in red.",
    networkError: "We couldn't reach our server. Check your connection and try again.",
    serverError: "Something went wrong on our side. Please try again shortly.",
  },
};

/* ── The testimonials page (components/testimonials/) ────────────────────────────── */

export type TestimonialsCopy = {
  spotlight: string;
  counter: (current: number, total: number) => string;
  previous: string;
  next: string;
  pause: string;
  play: string;
  show: (name: string) => string;
  moreTitle: string;
  readMore: string;
  readLess: string;
  inviteEyebrow: string;
  inviteTitle: string;
  inviteBody: string;
  cta: string;
  empty: string;
};

export const TESTIMONIALS_COPY: Record<Locale, TestimonialsCopy> = {
  ar: {
    spotlight: "آراء العملاء",
    counter: (current, total) => `${current} من ${total}`,
    previous: "الرأي السابق",
    next: "الرأي التالي",
    pause: "إيقاف التقليب",
    play: "تشغيل التقليب",
    show: (name) => `عرض رأي ${name}`,
    moreTitle: "المزيد من آراء عملائنا",
    readMore: "اقرأ المزيد",
    readLess: "عرض أقل",
    inviteEyebrow: "شاركنا رأيك",
    inviteTitle: "عندك تجربة مع سوفت وير هاوس؟",
    inviteBody: "شاركها في دقيقتين. رأيك بيساعد زمايلك في السوق يختاروا صح.",
    cta: "اكتب رأيك",
    empty: "كن أول من يشارك تجربته مع سوفت وير هاوس.",
  },
  en: {
    spotlight: "Client testimonials",
    counter: (current, total) => `${current} of ${total}`,
    previous: "Previous testimonial",
    next: "Next testimonial",
    pause: "Pause rotation",
    play: "Resume rotation",
    show: (name) => `Show ${name}'s testimonial`,
    moreTitle: "More from our clients",
    readMore: "Read more",
    readLess: "Show less",
    inviteEyebrow: "Share your experience",
    inviteTitle: "Working with Software House?",
    inviteBody: "Tell us in two minutes — your review helps others in the trade choose well.",
    cta: "Write your review",
    empty: "Be the first to share your experience with Software House.",
  },
};
