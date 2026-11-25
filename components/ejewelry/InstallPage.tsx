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
import { DownloadButton } from "./DownloadButton";
import { QR_PATH, QR_SIZE, QR_URL } from "./qr";
import s from "./install.module.css";

const plex = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600"], display: "swap" });

const TESTFLIGHT_URL = "https://testflight.apple.com/join/x3WVqjbK";

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
    iphone: ["آيفون", "تجريبي على TestFlight"],
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
    iphone: ["iPhone", "Beta on TestFlight"],
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
  const links = [
    f.whatsapp && { href: f.whatsapp, label: "WhatsApp", ltr: false },
    f.phone && { href: f.phoneLink, label: f.phone, ltr: true },
    f.privacy && { href: f.privacy, label: t.privacy, ltr: false },
  ].filter(Boolean) as { href: string; label: string; ltr: boolean }[];

  return (
    <main className={`${s.page} ${lang === "ar" ? plex.className : ""}`} lang={HTML_LANG[lang]} dir={DIR[lang]}>
      <div className={s.wrap}>
        <section className={s.hero} aria-labelledby="ej-name">
          <div className={s.intro}>
            <img className={s.appIcon} src="/e-jewelry/icon.png" alt="" width={88} height={88} />
            <h1 id="ej-name" className={s.name}>
              <span dir="ltr">E-Jewelry</span>
            </h1>
            <p className={s.promise}>{t.promise}</p>
            <DownloadButton lang={lang} label={t.download} mb={t.mb} />
          </div>

          {/* The scene: a phone holding the QR in front of a tablet with the app on its
              home screen. The tablet is decoration; the phone carries the QR. */}
          <div className={s.scene}>
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

        <section className={s.steps} aria-labelledby="ej-first">
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

        <section className={s.stores} aria-label={t.stores}>
          <a className={s.pill} href={TESTFLIGHT_URL} rel="noopener">
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
  );
}
