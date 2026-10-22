/* Drafting a review in the browser, from one client's answers.

   This is the fallback: when the API can draft with AI (apps/reviews/drafting.py) the page
   uses that, and only falls back here when it cannot (no key configured, offline, a
   refusal). It still has to give every client their own review, so instead of three fixed
   templates it assembles one from parts:

     angle     how the review opens — chosen at random among the angles THIS client's
               answers support (no "before" angle without a previous system, no praise-led
               opening when they rated something low), never the angle of the last draft
     phrases   several wordings for every answer, picked independently
     shape     the style decides which parts appear and in what order
     own words whatever the client typed or said is always woven in, near the end

   Honesty rules hold whatever is picked: a low rating always reads as a polite remark, and
   no part states a fact the client did not give (no invented numbers or events). */

import type { Locale } from "./i18n";
import type { Benefit, Branches, BusinessType, DraftStyle, Duration, PreviousSystem, Rating } from "./review";

export type Answers = {
  name: string;
  shop: string;
  place: string;
  duration: Duration;
  support: Rating;
  updates: Rating;
  benefits: Benefit[];
  business?: BusinessType | "";
  branches?: Branches | "";
  before?: PreviousSystem | "";
  extra: string;
};

export type Draft = { text: string; angle: Angle };

type Angle = "duration" | "before" | "benefit" | "support" | "colleague" | "business" | "intro" | "everyday";
type Pick = <T>(xs: readonly T[]) => T;

type Bank = {
  dur: Record<Duration, string[]>;
  sinceDur: (d: string) => string[];
  support: Record<Rating, string[]>;
  updates: Record<Rating, string[]>;
  benefit: Record<Benefit, string[]>;
  before: Record<PreviousSystem, string[]>;
  business: Record<BusinessType, string[]>;
  branches: Record<"2-3" | "4+", string[]>;
  closeGood: string[];
  closeMid: string[];
  join: (xs: string[]) => string;
  and: string;
  openers: Record<Angle, (a: Answers, p: Pick, b: Bank) => string>;
  afterBefore: string[];
  helpedList: string;
};

/* ── Arabic (Egyptian, the way a shop owner in the trade talks) ─────────────────────── */

const AR: Bank = {
  dur: {
    lt1: ["أقل من سنة", "حوالي سنة", "كام شهر"],
    "1-3": ["حوالي سنتين", "كام سنة", "سنتين تلاتة"],
    "3-5": ["أكتر من تلات سنين", "كذا سنة", "سنين مش قليلة"],
    "5-10": ["أكتر من خمس سنين", "سنين طويلة", "أكتر من ٥ سنين"],
    "10+": ["أكتر من عشر سنين", "سنين طويلة جداً", "أكتر من ١٠ سنين"],
  },
  sinceDur: (d) => [
    `بقالي ${d} شغال على برنامج سوفت وير هاوس`,
    `من ${d} وإحنا معتمدين على سيستم سوفت وير هاوس`,
    `بقالنا ${d} مع سوفت وير هاوس`,
  ],
  support: {
    good: [
      "الدعم الفني ممتاز، أي مشكلة بتتحل بسرعة",
      "السبورت بيرد بسرعة وفاهم طبيعة شغل الصاغة",
      "فريق الدعم محترم جداً وبيتابع معانا أول بأول",
      "لما بنحتاج حاجة بنلاقي الدعم موجود ومش بيسيبنا غير والمشكلة محلولة",
    ],
    ok: ["الدعم الفني كويس وبيتابع", "السبورت بيحل المشاكل اللي بتقابلنا", "الدعم شغال كويس معانا"],
    low: [
      "الدعم محتاج يبقى أسرع شوية، بس في الآخر المشكلة بتتحل",
      "ساعات الرد بيتأخر، ودي الحاجة اللي نفسي تتحسن",
      "سرعة رد الدعم محتاجة اهتمام أكتر",
    ],
  },
  updates: {
    good: [
      "التحديثات مش بتقف، وكل شوية في حاجة جديدة بتسهل الشغل",
      "التحديثات بتنزل باستمرار وبتفرق معانا فعلاً",
      "البرنامج بيتطور على طول ومش واقف على حاله",
    ],
    ok: ["التحديثات كويسة", "التحديثات ماشية كويس", "التحديثات مغطية اللي محتاجينه"],
    low: ["نفسي التحديثات تبقى أكتر من كده", "التحديثات محتاجة تبقى أكتر شوية", "ياريت التحديثات تنزل على فترات أقرب"],
  },
  benefit: {
    inventory: ["الجرد بقى أسهل وأدق بكتير", "الجرد بقى بيخلص أسرع ومن غير لخبطة", "بقيت عارف كل قطعة في المحل فين"],
    weights: ["الأوزان والعيارات مظبوطة بالجرام", "حساب الأوزان والعيارات بقى دقيق ومفيش فروق", "مبقاش فيه غلط في الوزن ولا العيار"],
    accounts: ["حسابات العملاء والتجار بقت واضحة قدامي", "بقيت عارف مين ليه ومين عليه من غير دفاتر", "حسابات التجار بقت منظمة ومفيش حاجة بتضيع"],
    daily_reports: ["بقيت عارف المحل كسبان قد إيه كل يوم", "التقارير اليومية بتوريني الصورة كاملة آخر اليوم", "آخر اليوم بشوف المكسب والحركة في دقيقة"],
    branches: ["بتابع الفروع كلها من مكاني", "متابعة الفروع بقت سهلة وأنا في مكان واحد", "كل فرع بقى قدامي على الشاشة"],
    invoices: ["الفواتير بتطلع بسرعة ومن غير أخطاء", "الفاتورة بتطلع في ثواني ومظبوطة", "الفواتير بقت منظمة ومظبوطة"],
    workmanship: ["المصنعيات والدمغة محسوبة صح", "حساب المصنعية والدمغة بقى أوتوماتيك ومظبوط", "مبقيناش نحسب المصنعيات بإيدينا"],
  },
  before: {
    paper: ["زمان كنا شغالين بالدفاتر والورق، وأي حساب كان بياخد وقت", "قبل كده كان كل حاجة في دفاتر"],
    excel: ["قبل كده كنا ماشيين على إكسيل، وكل حاجة كانت محتاجة شغل يدوي", "كنا معتمدين على شيتات إكسيل"],
    other: ["كنا على برنامج تاني قبل كده", "جربنا برنامج تاني قبل سوفت وير هاوس"],
    none: ["ده أول سيستم ندخله المحل", "مكانش عندنا أي سيستم قبل كده"],
  },
  business: {
    retail: ["في محل قطاعي زي بتاعنا كل يوم فيه بيع وشرا", "شغلنا قطاعي والبيع اليومي محتاج تنظيم"],
    wholesale: ["شغلنا جملة والحسابات فيه كتير ومحتاجة دقة", "في شغل الجملة مفيش مجال للغلط في الحساب"],
    manufacturing: ["شغلنا تصنيع، والمصنعيات والأوزان محتاجة دقة", "عندنا ورشة تصنيع، وكل جرام فارق"],
  },
  branches: {
    "2-3": ["وعندنا أكتر من فرع", "ومعانا كذا فرع"],
    "4+": ["وعندنا فروع كتير", "ومعانا فروع في أكتر من مكان"],
  },
  closeGood: ["أنصح بيه أي حد في السوق.", "شغل محترم بجد وأنصح بيه.", "وأنا مرتاح معاهم جداً.", "ولو حد من زمايلي سألني، هقوله يجرب من غير تفكير.", "تجربة تستاهل."],
  closeMid: ["تجربة كويسة في العموم.", "وفي العموم أنا مرتاح.", "وبشكل عام البرنامج مفيد وبنعتمد عليه."],
  join: (xs) => (xs.length === 1 ? xs[0] : `${xs.slice(0, -1).join("، ")}، و${xs[xs.length - 1]}`),
  and: "، و",
  afterBefore: ["من ساعة ما دخلنا سوفت وير هاوس الشغل اتغير", "لما نقلنا لسوفت وير هاوس الدنيا اتظبطت", "دلوقتي الشغل بقى أريح بكتير"],
  helpedList: "من ساعة ما اشتغلنا عليه",
  openers: {
    duration: (a, p, b) => `${p(b.sinceDur(p(b.dur[a.duration])))}.`,
    before: (a, p, b) => `${p(b.before[a.before as PreviousSystem])}${b.and}${p(b.afterBefore)}.`,
    benefit: (a, p, b) => `${p(["أكتر حاجة فرقت معايا إن", "أهم حاجة بالنسبالي إن", "أول حاجة لاحظتها إن"])} ${p(b.benefit[a.benefits[0]])}.`,
    support: (a, p, b) => `${p(b.support.good)}، ${p(["ودي أهم حاجة عندي", "وده اللي مخليني مطمن"])}.`,
    colleague: (_a, p) => `${p(["لو حد من زمايلي في السوق بيسأل على سيستم للمحل،", "أي حد في الصاغة بيدوّر على برنامج،"])} ${p(["بنصحه بسوفت وير هاوس", "أول اسم بقوله سوفت وير هاوس"])}.`,
    business: (a, p, b) => `${p(b.business[a.business as BusinessType])}، ${p(["وعشان كده كنت محتاج سيستم يفهم الشغل ده", "وسوفت وير هاوس فاهم الطبيعة دي"])}.`,
    intro: (a, p) => `${p([`أنا ${a.name}، صاحب ${a.shop} في ${a.place}.`, `أنا ${a.name} من ${a.shop} في ${a.place}.`])}`,
    everyday: (a, p) => `${p([`في ${a.shop} سوفت وير هاوس بقى جزء من شغلنا اليومي.`, `البرنامج بقى أساسي في يومنا في ${a.shop}.`])}`,
  },
};

/* ── English ────────────────────────────────────────────────────────────────────────── */

const EN: Bank = {
  dur: {
    lt1: ["less than a year", "about a year", "a few months"],
    "1-3": ["about two years", "a couple of years", "a few years"],
    "3-5": ["more than three years", "several years", "a good few years"],
    "5-10": ["more than five years", "many years", "over five years"],
    "10+": ["more than ten years", "over a decade", "well over ten years"],
  },
  sinceDur: (d) => [`I've been using Software House for ${d}`, `We've relied on the Software House system for ${d}`, `${d.charAt(0).toUpperCase()}${d.slice(1)} with Software House now`],
  support: {
    good: ["Support is excellent — problems get solved quickly", "The support team answers fast and understands the jewellery trade", "Support is genuinely helpful and follows up"],
    ok: ["Support is good and follows up", "Support solves the problems we run into", "Support works well for us"],
    low: ["Support could be quicker, though problems do get solved", "Replies are sometimes slow — that's the one thing I'd improve", "Response times from support need more attention"],
  },
  updates: {
    good: ["the updates keep coming and make the work easier", "regular updates make a real difference", "the system keeps improving"],
    ok: ["the updates are good", "the updates cover what we need", "the updates are fine"],
    low: ["I'd like more frequent updates", "updates could come more often", "updates are a bit too few"],
  },
  benefit: {
    inventory: ["stock-taking is easier and more accurate", "stock counts finish faster and without confusion", "I know where every piece in the shop is"],
    weights: ["weights and karats are exact to the gram", "weight and karat calculations are precise", "there are no more weight or karat mistakes"],
    accounts: ["customer and trader accounts are clear", "I know who owes what without ledgers", "trader accounts are organised"],
    daily_reports: ["I know what the shop earns every day", "the daily reports show me the full picture", "at the end of the day I see profit and activity in a minute"],
    branches: ["I follow every branch from one place", "keeping track of branches is easy now", "every branch is on my screen"],
    invoices: ["invoices come out fast and error-free", "an invoice takes seconds and it's right", "invoicing is organised and accurate"],
    workmanship: ["workmanship and hallmark fees are calculated correctly", "workmanship and hallmarking are calculated automatically", "we no longer work out fees by hand"],
  },
  before: {
    paper: ["We used to run everything on paper ledgers", "Before, everything was in ledgers"],
    excel: ["We used to manage with Excel sheets", "Before this we relied on Excel"],
    other: ["We used another program before", "We tried a different program first"],
    none: ["This is the first system we've used in the shop", "We had no system before this one"],
  },
  business: {
    retail: ["In a retail shop like ours there's buying and selling every day", "We're a retail shop, so daily sales need to be organised"],
    wholesale: ["We work in wholesale, where the accounts are many and must be exact", "In wholesale there's no room for errors"],
    manufacturing: ["We manufacture, so workmanship and weights need precision", "We run a workshop where every gram counts"],
  },
  branches: { "2-3": ["and we have more than one branch", "with a few branches"], "4+": ["and we have many branches", "across several branches"] },
  closeGood: ["I recommend it to anyone in the trade.", "Truly professional work.", "I'm very happy with them.", "If a colleague asked, I'd tell them to go for it."],
  closeMid: ["A good experience overall.", "Overall, I'm satisfied.", "On the whole it's useful and we rely on it."],
  join: (xs) => (xs.length === 1 ? xs[0] : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`),
  and: ", and ",
  afterBefore: ["since switching to Software House the work has changed", "moving to Software House sorted things out", "now the work is much easier"],
  helpedList: "Since we started,",
  openers: {
    duration: (a, p, b) => `${p(b.sinceDur(p(b.dur[a.duration])))}.`,
    before: (a, p, b) => `${p(b.before[a.before as PreviousSystem])}${b.and}${p(b.afterBefore)}.`,
    benefit: (a, p, b) => `${p(["What made the biggest difference:", "The first thing I noticed:", "What matters most to me:"])} ${p(b.benefit[a.benefits[0]])}.`,
    support: (_a, p, b) => `${p(b.support.good)}, ${p(["and that matters most to me", "which is what keeps me confident"])}.`,
    colleague: (_a, p) => `${p(["If a colleague in the trade asks me about a system for the shop,", "Whenever someone in the jewellery business asks for a recommendation,"])} ${p(["I point them to Software House", "Software House is the first name I give"])}.`,
    business: (a, p, b) => `${p(b.business[a.business as BusinessType])}, ${p(["so I needed a system that understands this work", "and Software House understands that"])}.`,
    intro: (a, p) => p([`I'm ${a.name}, owner of ${a.shop} in ${a.place}.`, `I'm ${a.name} from ${a.shop} in ${a.place}.`]),
    everyday: (a, p) => p([`At ${a.shop}, Software House is part of our daily work.`, `The system is now central to our day at ${a.shop}.`]),
  },
};

const BANKS: Record<Locale, Bank> = { ar: AR, en: EN };

/* ── Assembly ───────────────────────────────────────────────────────────────────────── */

function anglesFor(a: Answers): Angle[] {
  const praise = a.support !== "low" && a.updates !== "low";
  const out: Angle[] = ["duration", "benefit", "intro", "everyday"];
  if (a.before) out.push("before");
  if (a.business) out.push("business");
  if (a.support === "good") out.push("support");
  if (praise) out.push("colleague");
  return out;
}

function shuffle<T>(xs: T[], rand: () => number): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** A finished sentence: capitalised (Latin script) and ending in a full stop. */
function sentence(s: string): string {
  const t = s.trim().replace(/^\p{Ll}/u, (c) => c.toUpperCase());
  return /[.!؟?]$/.test(t) ? t : `${t}.`;
}

/** One review for these answers in this style, opening from a different angle than
    `avoid` when another is available. */
export function draftReview(
  lang: Locale,
  a: Answers,
  style: DraftStyle,
  avoid?: Angle,
  rand: () => number = Math.random,
): Draft {
  const b = BANKS[lang];
  const p: Pick = (xs) => xs[Math.floor(rand() * xs.length)];
  const choices = anglesFor(a).filter((x) => x !== avoid);
  const angle = p(choices.length ? choices : anglesFor(a));
  const praise = a.support !== "low" && a.updates !== "low";
  const benefits = shuffle(a.benefits, rand);
  const extra = a.extra.trim();
  /* The opener and the body read the same shuffled list, so a benefit-led opening is never
     repeated in the body. */
  const opener = b.openers[angle]({ ...a, benefits }, p, b);
  const rest = angle === "benefit" ? benefits.slice(1) : benefits;
  const parts: Record<string, string> = {
    duration: sentence(p(b.sinceDur(p(b.dur[a.duration])))),
    before: a.before ? sentence(`${p(b.before[a.before])}${b.and}${p(b.afterBefore)}`) : "",
    business: a.business
      ? sentence(`${p(b.business[a.business])}${a.branches && a.branches !== "1" ? ` ${p(b.branches[a.branches])}` : ""}`)
      : "",
    benefits: rest.length ? sentence(b.join(rest.slice(0, 2).map((x) => p(b.benefit[x])))) : "",
    service: sentence(`${p(b.support[a.support])}${b.and}${p(b.updates[a.updates])}`),
  };
  if (angle === "duration") parts.duration = "";
  if (angle === "before") parts.before = "";
  if (angle === "business") parts.business = "";
  if (angle === "support") parts.service = sentence(p(b.updates[a.updates]));
  const close = p(praise ? b.closeGood : b.closeMid);

  let body: string[];
  if (style === "short") {
    const one = angle === "benefit" || angle === "colleague" ? "" : sentence(p(b.benefit[benefits[0]]));
    body = [opener, one, extra ? sentence(extra) : "", close];
  } else if (style === "detailed") {
    const middle = shuffle([parts.duration, parts.before, parts.business].filter(Boolean), rand);
    const list = rest.length > 2 ? sentence(`${b.helpedList} ${b.join(rest.map((x) => p(b.benefit[x])))}`) : parts.benefits;
    body = [opener, ...middle, list, parts.service, extra ? sentence(extra) : "", close];
  } else {
    const middle = shuffle([parts.benefits, parts.service, rand() < 0.5 ? parts.before : parts.business].filter(Boolean), rand);
    body = [opener, ...middle, extra ? sentence(extra) : "", close];
  }
  const text = body.filter(Boolean).join(style === "detailed" ? "\n" : " ");
  return { text, angle };
}
