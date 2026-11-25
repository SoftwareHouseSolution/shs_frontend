/* The E-Jewelry install page — /e-jewelry/ (Arabic) and /e-jewelry/en/.

   Deliberately outside app/[lang]/: it is a standalone page in the app's own «Black Card»
   look, not a site page, so it carries none of the site chrome. Like #app, its wrapper
   holds lang and dir, so the Arabic page is right-to-left in the server HTML.

   What the installed app depends on lives in /e-jewelry/android/ (latest.json + the APK),
   served by nginx, not by this app — see docs/e-jewelry.md. Never rename those paths. */

import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { DIR, HTML_LANG, type Locale } from "@/content/i18n";
import { getSite } from "@/lib/api/content";
import { DownloadButton } from "./DownloadButton";
import { QR_PATH, QR_SIZE, QR_URL } from "./qr";
import s from "./install.module.css";

const plex = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600"], display: "swap" });

const TESTFLIGHT_URL = "https://testflight.apple.com/join/x3WVqjbK";

const COPY: Record<
  Locale,
  {
    promise: string;
    download: string;
    mb: string;
    scan: string;
    firstTime: string;
    steps: [string, string][];
    iphone: [string, string];
    play: [string, string];
    other: { href: string; label: string; lang: Locale };
  }
> = {
  ar: {
    promise: "المخزون والجرد والفواتير في إيدك",
    download: "حمّل التطبيق",
    mb: "ميجا",
    scan: "صوّر الكود بالموبايل والتطبيق ينزل على طول",
    firstTime: "أول مرة بس",
    steps: [
      ["امسح E-Jewelry القديم لو عندك", "مرة واحدة، لأن النسخة الجديدة بتوقيع جديد"],
      ["افتح الملف واسمح بـ «تثبيت من هذا المصدر»", ""],
      ["ادخل باسم المستخدم وكلمة السر بتوع Gweb", "أو بالإيميل لو محلك مفعّله. بعد كده التطبيق بيحدّث نفسه"],
    ],
    iphone: ["آيفون", "تجريبي على TestFlight"],
    play: ["Google Play", "قريبًا"],
    other: { href: "/e-jewelry/en/", label: "English", lang: "en" },
  },
  en: {
    promise: "Stock, stock-takes and invoices in your hand",
    download: "Download the app",
    mb: "MB",
    scan: "Scan with your phone and the app downloads",
    firstTime: "First install only",
    steps: [
      ["Uninstall the old E-Jewelry if you have it", "Once only: the new app has a new signing key"],
      ["Open the file and allow “Install from this source”", ""],
      ["Sign in with your Gweb username and password", "Or by email if your shop has turned it on. After that, the app updates itself"],
    ],
    iphone: ["iPhone", "Beta on TestFlight"],
    play: ["Google Play", "Soon"],
    other: { href: "/e-jewelry/", label: "العربية", lang: "ar" },
  },
};

/** Footer details from the CMS. The page must still render when the API is down (or, in
    local dev, not configured), so a failure only drops the footer's extras. */
async function footerInfo(lang: Locale) {
  try {
    const site = await getSite(lang);
    return {
      name: site.settings.siteName,
      whatsapp: site.settings.whatsappUrl,
      phone: site.settings.phoneDisplay,
      phoneLink: site.settings.phoneLink,
      privacy: site.legalPages?.some((p) => p.slug === "privacy") ? `/${lang}/privacy` : "",
    };
  } catch {
    return { name: "Software House Solutions", whatsapp: "", phone: "", phoneLink: "", privacy: "" };
  }
}

export async function InstallPage({ lang }: { lang: Locale }) {
  const t = COPY[lang];
  const f = await footerInfo(lang);

  return (
    <main className={`${s.page} ${lang === "ar" ? plex.className : ""}`} lang={HTML_LANG[lang]} dir={DIR[lang]}>
      <div className={s.column}>
        <header className={s.hero}>
          <div className={s.iconWrap}>
            <img className={s.icon} src="/e-jewelry/icon.png" alt="" width={112} height={112} />
          </div>
          <h1 className={s.name} dir="ltr">
            E-Jewelry
          </h1>
          <p className={s.promise}>{t.promise}</p>
        </header>

        <section className={s.get}>
          <DownloadButton lang={lang} label={t.download} mb={t.mb} />

          <figure className={s.qr}>
            <div className={s.phone}>
              <div className={s.tile}>
                <svg
                  viewBox={`-4 -4 ${QR_SIZE + 8} ${QR_SIZE + 8}`}
                  role="img"
                  aria-label={QR_URL}
                  shapeRendering="crispEdges"
                >
                  <rect x="-4" y="-4" width={QR_SIZE + 8} height={QR_SIZE + 8} fill="#fff" />
                  <path d={QR_PATH} fill="#000" />
                </svg>
              </div>
            </div>
            <figcaption className={s.caption}>{t.scan}</figcaption>
          </figure>
        </section>

        <section className={s.steps} aria-labelledby="ej-first">
          <h2 id="ej-first" className={s.stepsTitle}>
            {t.firstTime}
          </h2>
          <ol>
            {t.steps.map(([main, sub]) => (
              <li key={main}>
                <span className={s.stepMain}>{main}</span>
                {sub && <span className={s.stepSub}>{sub}</span>}
              </li>
            ))}
          </ol>
        </section>

        <ul className={s.stores}>
          <li>
            <a className={s.chip} href={TESTFLIGHT_URL} rel="noopener">
              <span className={s.chipName}>{t.iphone[0]}</span>
              <span className={s.chipSub}>{t.iphone[1]}</span>
            </a>
          </li>
          <li>
            <span className={s.chip} aria-disabled="true">
              <span className={s.chipName}>{t.play[0]}</span>
              <span className={s.chipSub}>{t.play[1]}</span>
            </span>
          </li>
        </ul>

        <footer className={s.footer}>
          <span>{f.name}</span>
          {f.whatsapp && (
            <a href={f.whatsapp} rel="noopener">
              WhatsApp
            </a>
          )}
          {f.phone && (
            <a href={f.phoneLink} dir="ltr">
              {f.phone}
            </a>
          )}
          {f.privacy && <a href={f.privacy}>{lang === "ar" ? "الخصوصية" : "Privacy"}</a>}
          <a href={t.other.href} hrefLang={t.other.lang} lang={HTML_LANG[t.other.lang]}>
            {t.other.label}
          </a>
        </footer>
      </div>
    </main>
  );
}
