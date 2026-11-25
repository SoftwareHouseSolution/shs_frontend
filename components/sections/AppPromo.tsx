/* The E-Jewelry app on the home page: one quiet card under the figures that opens the
   install page (/e-jewelry/ in Arabic, /e-jewelry/en/ in English). The whole card is the
   link, so there is one target and one tab stop.

   Plain <a>, not next/link: the install page lives outside app/[lang] with its own look,
   so a full document load is the right transition. */

import type { Locale } from "@/content/i18n";
import s from "./AppPromo.module.css";

const COPY: Record<Locale, { href: string; name: string; line: string; cta: string }> = {
  en: {
    href: "/e-jewelry/en/",
    name: "E-Jewelry app",
    line: "Stock, stock-takes and invoices in your hand",
    cta: "Get the app",
  },
  ar: {
    href: "/e-jewelry/",
    name: "تطبيق E-Jewelry",
    line: "المخزون والجرد والفواتير في إيدك",
    cta: "حمّل التطبيق",
  },
};

export function AppPromo({ lang }: { lang: Locale }) {
  const t = COPY[lang];
  return (
    <section className={s.wrap} aria-label={t.name}>
      <a className={s.card} href={t.href}>
        <img className={s.icon} src="/e-jewelry/icon.png" alt="" width={64} height={64} />
        <span className={s.text}>
          <span className={s.name}>{t.name}</span>
          <span className={s.line}>{t.line}</span>
        </span>
        <span className={s.cta}>
          {t.cta}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" />
          </svg>
        </span>
      </a>
    </section>
  );
}
