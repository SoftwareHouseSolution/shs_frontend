/* The E-Jewelry install page — /e-jewelry/ (Arabic) and /e-jewelry/en/.

   Outside app/[lang]/ so it carries none of the site chrome, but it is painted with the
   site's own tokens (--surface, --ink, --accent-fill …) and follows the site's light/dark
   theme. Like #app, its wrapper holds lang and dir, so the Arabic page is right-to-left in
   the server HTML.

   What the installed app depends on lives in /e-jewelry/android/ (latest.json + the APK),
   served by nginx, not by this app — see docs/e-jewelry.md. Never rename those paths. */

import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { DIR, HTML_LANG, type Locale } from "@/content/i18n";
import { getSite } from "@/lib/api/content";
import { HtmlLangSync } from "@/components/chrome/HtmlLangSync";
import { SiteProvider } from "@/components/chrome/SiteContext";
import { SiteNav } from "@/components/chrome/SiteNav";
import { DownloadButton } from "./DownloadButton";
import { IOS_QR_PATH, IOS_QR_SIZE, IOS_QR_URL, QR_PATH, QR_SIZE, QR_URL } from "./qr";
import s from "./install.module.css";

const plex = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600"], display: "swap" });

const TESTFLIGHT_URL = IOS_QR_URL;

/* Runs before paint: marks <html> with the visitor's platform, used ONLY to choose which
   download button a phone sees (iPhone → TestFlight, Android → the APK). Desktop shows
   both QRs. <html> already carries suppressHydrationWarning for the theme script. */
const PLATFORM = `(function(){try{var u=navigator.userAgent,p=/iPhone|iPad|iPod/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1)?"ios":/Android/.test(u)?"android":"desktop";document.documentElement.setAttribute("data-ej-platform",p)}catch(e){}})();`;

type Step = { title: string; note: string; icon: "remove" | "allow" | "signin" };

const COPY: Record<
  Locale,
  {
    promise: string;
    download: string;
    mb: string;
    scan: string;
    firstTime: string;
    steps: Step[];
    stores: string;
    iphone: [string, string];
    ios: { title: string; beta: string; scan: string; open: string; steps: string[]; signin: string };
    play: [string, string];
    privacy: string;
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
      { icon: "remove", title: "امسح E-Jewelry القديم لو عندك", note: "مرة واحدة، لأن النسخة الجديدة بتوقيع جديد" },
      { icon: "allow", title: "افتح الملف واسمح بـ «تثبيت من هذا المصدر»", note: "" },
      {
        icon: "signin",
        title: "ادخل باسم المستخدم وكلمة السر بتوع Gweb",
        note: "أو بالإيميل لو محلك مفعّله. بعد كده التطبيق بيحدّث نفسه",
      },
    ],
    stores: "المتاجر",
    iphone: ["للآيفون على TestFlight", "تجريبي"],
    ios: {
      title: "للآيفون",
      beta: "تجريبي",
      scan: "صوّر الكود بالآيفون، هيفتح TestFlight، نزّله وافتح الدعوة",
      open: "افتح على TestFlight",
      steps: ["نزّل TestFlight من App Store", "افتح الرابط", "اضغط «قبول» وبعدين «تثبيت»"],
      signin: "الدخول زي أندرويد: اسم المستخدم بتاع Gweb، أو بالإيميل لو محلك مفعّله",
    },
    play: ["Google Play", "قريبًا"],
    privacy: "الخصوصية",
    other: { href: "/e-jewelry/en/", label: "English", lang: "en" },
  },
  en: {
    promise: "Stock, stock-takes and invoices in your hand",
    download: "Download the app",
    mb: "MB",
    scan: "Scan with your phone and the app downloads",
    firstTime: "First install only",
    steps: [
      { icon: "remove", title: "Uninstall the old E‑Jewelry if you have it", note: "Once only: the new app has a new signing key" },
      { icon: "allow", title: "Open the file and allow “Install from this source”", note: "" },
      {
        icon: "signin",
        title: "Sign in with your Gweb username and password",
        note: "Or by email if your shop has turned it on. After that, the app updates itself",
      },
    ],
    stores: "Stores",
    iphone: ["iPhone, on TestFlight", "Beta"],
    ios: {
      title: "On iPhone",
      beta: "Beta",
      scan: "Scan with your iPhone: it opens TestFlight; install it, then accept the invite",
      open: "Open in TestFlight",
      steps: ["Install TestFlight from the App Store", "Open the link", "Tap “Accept”, then “Install”"],
      signin: "Sign in as on Android: your Gweb username, or email if your shop turned it on",
    },
    play: ["Google Play", "Soon"],
    privacy: "Privacy",
    other: { href: "/e-jewelry/", label: "العربية", lang: "ar" },
  },
};

/* Line icons, one stroke weight. */
const STEP_ICON: Record<Step["icon"], React.ReactNode> = {
  remove: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V4.5h6V7" />
      <path d="M6 7l1 12.5h10L18 7" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </>
  ),
  allow: (
    <>
      <path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6z" />
      <path d="m8.8 12.2 2.3 2.3 4.2-4.4" />
    </>
  ),
  signin: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
    </>
  ),
};

/** The site data (for the nav) and the footer details from the CMS. The page must still
    render when the API is down (or, in local dev, not configured), so a failure only drops
    the nav and the footer's extras. */
async function footerInfo(lang: Locale) {
  try {
    const site = await getSite(lang);
    return {
      site,
      name: site.settings.siteName,
      whatsapp: site.settings.whatsappUrl,
      phone: site.settings.phoneDisplay,
      phoneLink: site.settings.phoneLink,
      privacy: site.legalPages?.some((p) => p.slug === "privacy") ? `/${lang}/privacy` : "",
    };
  } catch {
    return { site: null, name: "Software House Solutions", whatsapp: "", phone: "", phoneLink: "", privacy: "" };
  }
}

export async function InstallPage({ lang }: { lang: Locale }) {
  const t = COPY[lang];
  const f = await footerInfo(lang);
  const links = [
    f.whatsapp && { href: f.whatsapp, label: "WhatsApp", ltr: false },
    f.phone && { href: f.phoneLink, label: f.phone, ltr: true },
    f.privacy && { href: f.privacy, label: t.privacy, ltr: false },
  ].filter(Boolean) as { href: string; label: string; ltr: boolean }[];

  return (
    <>
      {/* The site's own nav bar, as on every site page (app/[lang]/layout.tsx does the
          same: lang/dir on a wrapper, then copied up to <html>). With no hero on this page
          the bar is always solid. */}
      <script dangerouslySetInnerHTML={{ __html: PLATFORM }} />
      <HtmlLangSync lang={HTML_LANG[lang]} dir={DIR[lang]} />
      {f.site && (
        <div lang={HTML_LANG[lang]} dir={DIR[lang]}>
          <SiteProvider site={f.site}>
            <SiteNav lang={lang} />
          </SiteProvider>
        </div>
      )}
      <main
        className={`${s.page} ${f.site ? s.withNav : ""} ${lang === "ar" ? plex.className : ""}`}
        lang={HTML_LANG[lang]}
        dir={DIR[lang]}
      >
        <div className={s.wrap}>
          <section className={s.hero} aria-labelledby="ej-name">
            <div className={s.intro}>
              <img className={s.appIcon} src="/e-jewelry/icon.png" alt="" width={88} height={88} />
              <h1 id="ej-name" className={s.name}>
                <span dir="ltr">E-Jewelry</span>
              </h1>
              <p className={s.promise}>{t.promise}</p>
              <div className={s.androidOnly}>
                <DownloadButton lang={lang} label={t.download} mb={t.mb} />
              </div>
              <a className={`${s.button} ${s.iosButton}`} href={TESTFLIGHT_URL} target="_blank" rel="noopener">
                {t.ios.open}
              </a>
            </div>

            {/* The scene: a phone holding the QR in front of a tablet with the app on its
                home screen. The tablet is decoration; the phone carries the QR. */}
            <div className={`${s.scene} ${s.androidOnly}`}>
              <div className={s.tablet} aria-hidden="true">
                <div className={s.tabletScreen}>
                  {Array.from({ length: 16 }, (_, i) =>
                    i === 7 ? (
                      <div key={i} className={s.homeApp}>
                        <img src="/e-jewelry/icon.png" alt="" />
                        <span>E-Jewelry</span>
                      </div>
                    ) : (
                      <i key={i} className={s.tile} data-tone={i % 3} />
                    ),
                  )}
                </div>
              </div>
              <figure className={s.phone}>
                <div className={s.phoneScreen}>
                  <span className={s.island} aria-hidden="true" />
                  <div className={s.qrBox}>
                    <svg
                      className={s.qr}
                      viewBox={`-4 -4 ${QR_SIZE + 8} ${QR_SIZE + 8}`}
                      role="img"
                      aria-label={QR_URL}
                      shapeRendering="crispEdges"
                    >
                      <rect x="-4" y="-4" width={QR_SIZE + 8} height={QR_SIZE + 8} fill="#fff" />
                      <path d={QR_PATH} fill="#000" />
                    </svg>
                    <span className={s.scanLine} aria-hidden="true" />
                  </div>
                  <figcaption className={s.qrCap}>{t.scan}</figcaption>
                </div>
              </figure>
            </div>
          </section>

          <section className={`${s.steps} ${s.androidOnly}`} aria-labelledby="ej-first">
            <h2 id="ej-first" className={s.stepsTitle}>
              {t.firstTime}
            </h2>
            <ol className={s.cards}>
              {t.steps.map((step, i) => (
                <li key={step.icon} className={s.card}>
                  <div className={s.cardTop}>
                    <span className={s.num} aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className={s.ico} aria-hidden="true">
                      <svg viewBox="0 0 24 24">{STEP_ICON[step.icon]}</svg>
                    </span>
                  </div>
                  <h3>{step.title}</h3>
                  {step.note && <p>{step.note}</p>}
                </li>
              ))}
            </ol>
          </section>

          <section className={`${s.iosCard} ${s.iosOnly}`} aria-labelledby="ej-ios">
            <h2 id="ej-ios" className={s.iosTitle}>
              {t.ios.title} <span className={s.beta}>{t.ios.beta}</span>
            </h2>
            <div className={s.iosBody}>
              <figure className={s.iosQr}>
                <svg
                  viewBox={`-4 -4 ${IOS_QR_SIZE + 8} ${IOS_QR_SIZE + 8}`}
                  role="img"
                  aria-label={IOS_QR_URL}
                  shapeRendering="crispEdges"
                >
                  <rect x="-4" y="-4" width={IOS_QR_SIZE + 8} height={IOS_QR_SIZE + 8} fill="#fff" />
                  <path d={IOS_QR_PATH} fill="#000" />
                </svg>
                <figcaption>{t.ios.scan}</figcaption>
              </figure>
              <div>
                <ol className={s.iosSteps}>
                  {t.ios.steps.map((step, i) => (
                    <li key={step}>
                      <span className={s.num} aria-hidden="true">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <p className={s.iosSignin}>{t.ios.signin}</p>
              </div>
            </div>
          </section>

          <section className={s.stores} aria-label={t.stores}>
            <a className={s.pill} href={TESTFLIGHT_URL} target="_blank" rel="noopener">
              <span className={s.pillIco} aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <rect x="7" y="2.5" width="10" height="19" rx="2.6" />
                  <path d="M10.5 5.5h3" />
                </svg>
              </span>
              <span>
                <b>{t.iphone[0]}</b>
                <small>{t.iphone[1]}</small>
              </span>
            </a>
            <span className={s.pill} aria-disabled="true">
              <span className={s.pillIco} aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M6.5 3.8v16.4a.8.8 0 0 0 1.2.7l13-8.2a.8.8 0 0 0 0-1.4l-13-8.2a.8.8 0 0 0-1.2.7z" />
                </svg>
              </span>
              <span>
                <b lang="en">{t.play[0]}</b>
                <small>{t.play[1]}</small>
              </span>
            </span>
          </section>

          <footer className={s.footer}>
            <span className={s.brand} lang="en">
              {f.name}
            </span>
            {links.map((l) => (
              <a key={l.href} href={l.href} dir={l.ltr ? "ltr" : undefined} rel="noopener">
                {l.label}
              </a>
            ))}
            <a href={t.other.href} hrefLang={t.other.lang} lang={HTML_LANG[t.other.lang]}>
              {t.other.label}
            </a>
          </footer>
        </div>
      </main>
    </>
  );
}
