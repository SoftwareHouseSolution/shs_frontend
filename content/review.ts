/* The client review page (/[lang]/review): its copy, its questions and the templates that
   draft a review from the answers.

   The answer CODES (duration, rating, benefit keys) are the API contract — they must match
   apps.reviews.models.Review on the backend, which validates them and counts them on the
   admin dashboard. Labels and sentences are free to change.

   The governorate is always sent by its Arabic name (the backend files reviews under one
   spelling whatever the page language); the English page only shows English labels. */

import type { Locale } from "./i18n";

export type Duration = "lt1" | "1-3" | "3-5" | "5-10" | "10+";
export type Rating = "good" | "ok" | "low";
export type Benefit = "inventory" | "weights" | "accounts" | "daily_reports" | "branches" | "invoices" | "workmanship";

export const DURATIONS: Duration[] = ["lt1", "1-3", "3-5", "5-10", "10+"];
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
  photoChange: string;
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
    photoChange: "غيّر الصورة",
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
    editHint: "لو عايز تغيّر أي كلمة، دوس على الكلام وعدّل.",
    rewrite: "مش عاجبني، اكتبه بشكل تاني",
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
    photoChange: "Change photo",
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
    editHint: "Tap the text to change any word.",
    rewrite: "Not quite — write it another way",
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

/* ── The testimonials page's wall (components/clients/ClientVoices.tsx) ─────────────── */

export const VOICES_COPY: Record<Locale, { cta: string; empty: string }> = {
  ar: { cta: "اكتب رأيك", empty: "كن أول من يشارك تجربته مع سوفت وير هاوس." },
  en: { cta: "Write your review", empty: "Be the first to share your experience with Software House." },
};

/* ── Drafting the review ─────────────────────────────────────────────────────────── */

export type Answers = {
  name: string;
  shop: string;
  place: string;
  duration: Duration;
  support: Rating;
  updates: Rating;
  benefits: Benefit[];
  extra: string;
};

type Templates = {
  duration: Record<Duration, string[]>;
  durationShort: Record<Duration, string>;
  support: Record<Rating, string[]>;
  updates: Record<Rating, string[]>;
  benefit: Record<Benefit, string>;
  closeGood: string[];
  closeMid: string[];
  join: (items: string[]) => string;
  variants: ((a: Answers, pick: <T>(xs: T[]) => T, t: Templates) => string)[];
};

const AR: Templates = {
  duration: {
    lt1: ["بقالي أقل من سنة", "من حوالي سنة"],
    "1-3": ["بقالي حوالي سنتين", "بقالي كام سنة"],
    "3-5": ["بقالي أكتر من ٣ سنين", "بقالي حوالي ٤ سنين"],
    "5-10": ["بقالي أكتر من ٥ سنين", "بقالي سنين طويلة"],
    "10+": ["بقالي أكتر من ١٠ سنين", "من أكتر من ١٠ سنين"],
  },
  durationShort: { lt1: "أقل من سنة", "1-3": "كام سنة", "3-5": "أكتر من ٣ سنين", "5-10": "أكتر من ٥ سنين", "10+": "أكتر من ١٠ سنين" },
  support: {
    good: ["الدعم الفني بصراحة ممتاز، أي مشكلة بتتحل بسرعة", "السبورت بيرد بسرعة وفاهم شغل الصاغة كويس", "الدعم الفني محترم جداً وبيتابع معانا أول بأول"],
    ok: ["الدعم الفني كويس وبيتابع", "السبورت كويس وبيحلوا المشاكل"],
    low: ["الدعم محتاج يبقى أسرع شوية، بس في الآخر المشكلة بتتحل", "السبورت أحياناً بيتأخر، بس بيوصل لحل"],
  },
  updates: {
    good: ["والتحديثات مش بتقف، كل شوية في حاجة جديدة بتسهل الشغل", "والتحديثات بتنزل باستمرار وبتفرق معانا فعلاً"],
    ok: ["والتحديثات كويسة", "والتحديثات ماشية كويس"],
    low: ["ونفسي التحديثات تبقى أكتر من كده", "والتحديثات محتاجة تبقى أكتر شوية"],
  },
  benefit: {
    inventory: "الجرد بقى أسهل وأدق",
    weights: "الأوزان والعيارات مظبوطة بالجرام",
    accounts: "حسابات العملاء والتجار بقت واضحة",
    daily_reports: "بقيت عارف المحل كسبان قد إيه كل يوم",
    branches: "بتابع الفروع من مكاني",
    invoices: "الفواتير بتطلع بسرعة ومن غير أخطاء",
    workmanship: "المصنعيات والدمغة محسوبة صح",
  },
  closeGood: ["أنصح بيه أي حد في السوق.", "شغل محترم بجد وأنصح بيه.", "وأنا مرتاح معاهم جداً."],
  closeMid: ["تجربة كويسة في العموم.", "وفي العموم أنا مرتاح."],
  join: (xs) => (xs.length === 1 ? xs[0] : `${xs.slice(0, -1).join("، ")}، و${xs[xs.length - 1]}`),
  variants: [
    (a, pick, t) => {
      const where = `${a.shop} في ${a.place}`;
      return `${pick(t.duration[a.duration])} شغال على برنامج سوفت وير هاوس في ${where}. ${pick(t.support[a.support])}، ${pick(t.updates[a.updates])}. أكتر حاجة فرقت معايا إن ${t.join(a.benefits.map((b) => t.benefit[b]))}. ${close(a, pick, t)}${a.extra ? `\n${a.extra}` : ""}`;
    },
    (a, pick, t) => {
      const where = `${a.shop} في ${a.place}`;
      return `أنا ${a.name} من ${where}، و${pick(t.duration[a.duration])} شغال على سيستم سوفت وير هاوس.\n${pick(["من ساعة ما اشتغلنا عليه", "من ساعة ما ركبناه"])} ${t.join(a.benefits.map((b) => t.benefit[b]))}.\n${pick(t.support[a.support])}. ${pick(t.updates[a.updates])}.${a.extra ? `\n${a.extra}` : ""}\n${close(a, pick, t)}`;
    },
    (a, pick, t) =>
      `رأيي في برنامج سوفت وير هاوس بعد ${t.durationShort[a.duration]} شغل:\n- الدعم الفني: ${pick(t.support[a.support])}\n- التحديثات: ${pick(t.updates[a.updates]).replace(/^و/, "")}\n- فادني في: ${a.benefits.map((b) => t.benefit[b]).join("، ")}${a.extra ? `\n- ${a.extra}` : ""}\n${close(a, pick, t)}\n${a.name} – ${a.shop} في ${a.place}`,
  ],
};

const EN: Templates = {
  duration: {
    lt1: ["For almost a year now I've been", "For the past year I've been"],
    "1-3": ["For a couple of years I've been", "For a few years now I've been"],
    "3-5": ["For more than three years I've been", "For about four years I've been"],
    "5-10": ["For more than five years I've been", "For many years I've been"],
    "10+": ["For more than ten years I've been", "For over a decade I've been"],
  },
  durationShort: { lt1: "a year", "1-3": "a few years", "3-5": "over three years", "5-10": "over five years", "10+": "over ten years" },
  support: {
    good: ["Technical support is excellent — any problem gets solved quickly", "Support answers fast and really understands the jewellery trade"],
    ok: ["Technical support is good and follows up", "Support is good and solves our problems"],
    low: ["Support could be a bit faster, but problems do get solved", "Support is sometimes slow, but they get there"],
  },
  updates: {
    good: ["and the updates keep coming, each one making the work easier", "and regular updates make a real difference"],
    ok: ["and the updates are good", "and the updates are fine"],
    low: ["though I'd like more frequent updates", "though updates could come more often"],
  },
  benefit: {
    inventory: "stock-taking is easier and more accurate",
    weights: "weights and karats are exact to the gram",
    accounts: "customer and trader accounts are clear",
    daily_reports: "I know what the shop earns every day",
    branches: "I follow my branches from wherever I am",
    invoices: "invoices come out fast and error-free",
    workmanship: "workmanship and hallmarking are calculated correctly",
  },
  closeGood: ["I recommend it to anyone in the trade.", "Truly professional work — recommended.", "I'm very happy with them."],
  closeMid: ["A good experience overall.", "Overall, I'm satisfied."],
  join: (xs) => (xs.length === 1 ? xs[0] : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`),
  variants: [
    (a, pick, t) =>
      `${pick(t.duration[a.duration])} using Software House at ${a.shop} in ${a.place}. ${pick(t.support[a.support])}, ${pick(t.updates[a.updates])}. What made the biggest difference: ${t.join(a.benefits.map((b) => t.benefit[b]))}. ${close(a, pick, t)}${a.extra ? `\n${a.extra}` : ""}`,
    (a, pick, t) =>
      `I'm ${a.name} from ${a.shop} in ${a.place}. ${pick(t.duration[a.duration])} working with the Software House system.\nSince we started, ${t.join(a.benefits.map((b) => t.benefit[b]))}.\n${pick(t.support[a.support])}, ${pick(t.updates[a.updates])}.${a.extra ? `\n${a.extra}` : ""}\n${close(a, pick, t)}`,
    (a, pick, t) =>
      `My review of Software House after ${t.durationShort[a.duration]}:\n- Support: ${pick(t.support[a.support])}\n- Updates: ${capitalise(pick(t.updates[a.updates]).replace(/^(and|though) /, ""))}\n- Helped with: ${a.benefits.map((b) => t.benefit[b]).join("; ")}${a.extra ? `\n- ${a.extra}` : ""}\n${close(a, pick, t)}\n${a.name} – ${a.shop}, ${a.place}`,
  ],
};

function close(a: Answers, pick: <T>(xs: T[]) => T, t: Templates): string {
  return a.support === "low" || a.updates === "low" ? pick(t.closeMid) : pick(t.closeGood);
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TEMPLATES: Record<Locale, Templates> = { ar: AR, en: EN };

/** The three drafts for one set of answers, each with freshly picked wording. */
export function draftReviews(lang: Locale, answers: Answers): string[] {
  const t = TEMPLATES[lang];
  const pick = <T,>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];
  return t.variants.map((variant) => variant(answers, pick, t));
}
