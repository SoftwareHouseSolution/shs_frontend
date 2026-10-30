/* The areas the location dropdown lists, read out of each client's free-text `location`.

   `location` is typed by hand in the CMS and not translated (see the Client model), so 367
   clients carry 167 different strings: "Heliopolis", "Helipolis" and "Helioplois" are one
   place, and "Obour- Sagha - Heliopolis" is three. Listing those raw would give a dropdown
   of typos where picking "Mansoura" missed the clients spelled "Mansora".

   So each area owns a pattern that is run over the WHOLE string rather than over tokens
   split on punctuation, for two reasons. The separators are not reliable ("Concard Plaza
   New Cairo" has none), and a split would turn "Downtown - Sheikh zayed", a mall, into a
   client in Cairo's Downtown. A client matches every area it names, so a chain with three
   branches is found under all three.

   A location nothing here recognises is not lost: it becomes an area of its own under its
   raw spelling, so a new client in a new city appears in the dropdown without a code
   change. Adding it below is only needed to merge its spellings and give it an Arabic name.

   Grouping under a region is deliberately not stored here. It is taken from the clients
   themselves in ClientMap, so the region keys stay the CMS's. */

import type { Locale } from "@/content/i18n";

type Area = { key: string; en: string; ar: string; match: RegExp };

const AREAS: readonly Area[] = [
  // Greater Cairo
  { key: "abbassia", en: "Abbassia", ar: "العباسية", match: /\babasya\b/i },
  { key: "ain-shams", en: "Ain Shams", ar: "عين شمس", match: /\bain shams\b/i },
  { key: "almaza", en: "Almaza", ar: "ألماظة", match: /\balmaza\b/i },
  { key: "downtown", en: "Downtown", ar: "وسط البلد", match: /^downtown$/i },
  { key: "el-marg", en: "El Marg", ar: "المرج", match: /\bel[- ]marg\b/i },
  { key: "hadayek-el-zeitoun", en: "Hadayek El Zeitoun", ar: "حدائق الزيتون", match: /\bhadayk el zeyton\b/i },
  { key: "heliopolis", en: "Heliopolis", ar: "مصر الجديدة", match: /\bheli|\bmasr el g/i },
  { key: "helwan", en: "Helwan", ar: "حلوان", match: /\bhelwan\b/i },
  { key: "korba", en: "Korba", ar: "الكوربة", match: /\bkorba\b/i },
  { key: "maadi", en: "Maadi", ar: "المعادي", match: /\bma+d+i\b/i },
  { key: "madinaty", en: "Madinaty", ar: "مدينتي", match: /\bmad[ai]ni?ty\b/i },
  { key: "manial", en: "Manial", ar: "المنيل", match: /\bmanial\b/i },
  { key: "matareya", en: "Matareya", ar: "المطرية", match: /\bmatara?ya\b/i },
  { key: "meet-ghamr", en: "Meet Ghamr", ar: "ميت غمر", match: /\bmeet ghamra?\b/i },
  { key: "midan-el-gamea", en: "Midan El Gamea", ar: "ميدان الجامع", match: /\bm[ie]dan el[- ]gam/i },
  { key: "mokattam", en: "Mokattam", ar: "المقطم", match: /\bmoka?t+am\b/i },
  { key: "nasr-city", en: "Nasr City", ar: "مدينة نصر", match: /\bnasr\b/i },
  { key: "new-cairo", en: "New Cairo", ar: "القاهرة الجديدة", match: /\bnew ?cairo\b/i },
  { key: "obour", en: "Obour", ar: "العبور", match: /\bobour\b/i },
  { key: "old-cairo", en: "Old Cairo", ar: "مصر القديمة", match: /\bmasr el qadima\b/i },
  { key: "rehab", en: "Rehab", ar: "الرحاب", match: /\brehab\b/i },
  { key: "sagha", en: "El Sagha", ar: "الصاغة", match: /\bsah?gha\b/i },
  { key: "sheraton", en: "Sheraton", ar: "شيراتون", match: /\bsheraton\b/i },
  { key: "shorouk", en: "El Shorouk", ar: "الشروق", match: /\bshr(ou|oo)k\b/i },
  { key: "shubra", en: "Shubra", ar: "شبرا", match: /\bsho?ubra\b/i },
  // Giza
  { key: "dokki", en: "Dokki", ar: "الدقي", match: /\bdok+i*\b/i },
  { key: "hadayek-el-ahram", en: "Hadayek El Ahram", ar: "حدائق الأهرام", match: /\bahram\b/i },
  { key: "haram", en: "El Haram", ar: "الهرم", match: /\bel haram\b/i },
  { key: "imbaba", en: "Imbaba", ar: "إمبابة", match: /\bimbaba\b/i },
  { key: "mohandessin", en: "Mohandessin", ar: "المهندسين", match: /\bmohand/i },
  { key: "october", en: "6th of October", ar: "6 أكتوبر", match: /\boctober\b/i },
  { key: "zamalek", en: "Zamalek", ar: "الزمالك", match: /\bzamalek\b/i },
  { key: "zayed", en: "Sheikh Zayed", ar: "الشيخ زايد", match: /\bzayed\b/i },
  // Delta & Canal
  { key: "banha", en: "Banha", ar: "بنها", match: /\bbanha\b/i },
  { key: "beheira", en: "Beheira", ar: "البحيرة", match: /\b(beh[ie]ra|bihira)\b/i },
  { key: "damanhour", en: "Damanhour", ar: "دمنهور", match: /\bdama?nhour\b/i },
  { key: "damietta", en: "Damietta", ar: "دمياط", match: /\bdam(ett?ia|iett?a)\b/i },
  { key: "desouk", en: "Desouk", ar: "دسوق", match: /\bdesouk\b/i },
  { key: "gesr-el-suez", en: "Gesr El Suez", ar: "جسر السويس", match: /\bgesr el|\bel syways\b/i },
  { key: "kafr-el-dawar", en: "Kafr El Dawar", ar: "كفر الدوار", match: /\bkafr el dawar\b/i },
  { key: "kafr-el-sheikh", en: "Kafr El Sheikh", ar: "كفر الشيخ", match: /\bkafe?r\s*el[\s-]*sh/i },
  { key: "mahalla", en: "El Mahalla", ar: "المحلة الكبرى", match: /\bmahall?a\b/i },
  { key: "mansoura", en: "Mansoura", ar: "المنصورة", match: /\bmansou?ra\b/i },
  { key: "menoufia", en: "Menoufia", ar: "المنوفية", match: /\bmunofia\b/i },
  { key: "port-said", en: "Port Said", ar: "بورسعيد", match: /\bport ?said\b/i },
  { key: "qalyubia", en: "Qalyubia", ar: "القليوبية", match: /\bqal[uy]bia\b/i },
  { key: "qanater", en: "El Qanater", ar: "القناطر الخيرية", match: /\bqanat/i },
  { key: "shebin-el-kom", en: "Shebin El Kom", ar: "شبين الكوم", match: /\bs(h?[ie]+)?b[ie]+n (al|el)[- ]kom\b/i },
  { key: "tanta", en: "Tanta", ar: "طنطا", match: /\btanta\b/i },
  { key: "zawya", en: "El Zawya", ar: "الزاوية", match: /\bzawya\b/i },
  // Upper Egypt
  { key: "aswan", en: "Aswan", ar: "أسوان", match: /\baswan\b/i },
  { key: "asyut", en: "Asyut", ar: "أسيوط", match: /\bas(uit|yout|wut)\b/i },
  { key: "beni-suef", en: "Beni Suef", ar: "بني سويف", match: /\bbeni s/i },
  { key: "fayoum", en: "Fayoum", ar: "الفيوم", match: /\bfayoum\b/i },
  { key: "minya", en: "Minya", ar: "المنيا", match: /\bmini?ya\b/i },
  { key: "qena", en: "Qena", ar: "قنا", match: /\bqena\b/i },
  { key: "sohag", en: "Sohag", ar: "سوهاج", match: /\bsohag\b/i },
  // Alexandria
  { key: "agami", en: "Agami", ar: "العجمي", match: /\bagami\b/i },
  { key: "amreya", en: "Amreya", ar: "العامرية", match: /\bami?r[iy]+a\b/i },
  // Sinai & Red Sea
  { key: "arish", en: "El Arish", ar: "العريش", match: /\bareesh\b/i },
  { key: "hurghada", en: "Hurghada", ar: "الغردقة", match: /\bhurghada\b/i },
  // Beyond Egypt, and no fixed place
  { key: "lebanon", en: "Lebanon", ar: "لبنان", match: /\blebanon\b/i },
  { key: "online", en: "Online", ar: "أونلاين", match: /\bonline\b/i },
  { key: "uae", en: "UAE", ar: "الإمارات", match: /\bemraties\b/i },
  { key: "usa", en: "USA", ar: "أمريكا", match: /\bamerica\b/i },
];

const BY_KEY = new Map(AREAS.map((a) => [a.key, a]));

/* Says only "Cairo", "Egypt", "Alexandria/ Two Branches": a whole region, or no place at
   all. The region's own row already covers these clients, and an area named "Cairo" beside
   a region named "Greater Cairo" with a quarter of the clients would read as a mistake. */
const GENERIC = /^$|\b(egypt|cairo|giza|alexandria)\b/i;

/** The area keys a client's `location` names. Empty when it only names a whole region. */
export function areasOf(location: string): string[] {
  const named = AREAS.filter((a) => a.match.test(location)).map((a) => a.key);
  const raw = location.trim();
  return named.length > 0 || GENERIC.test(raw) ? named : [raw];
}

export function areaLabel(key: string, lang: Locale): string {
  return BY_KEY.get(key)?.[lang] ?? key;
}

/** The text the dropdown's search looks in. Both languages, whichever page this is. */
export function areaSearchText(key: string): string {
  const area = BY_KEY.get(key);
  return foldText(area ? `${area.en} ${area.ar}` : key);
}

/* Lowercase, and Arabic spelling variants made one: a visitor typing "الاسكندرية" should
   not miss "الإسكندرية" over a hamza. */
export function foldText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");
}
