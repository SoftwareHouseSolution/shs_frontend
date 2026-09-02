/* Locale primitives — the single source of truth for "which languages exist" and "how a
   URL carries one". Pure and isomorphic: no React, no next/*, so a server component, a
   client hook, a route's generateStaticParams and a build script can all import it.

   URL SHAPE. Both languages are prefixed — /en/... and /ar/... — rather than English
   living at the bare root. An unprefixed default sounds tidier but means every link
   helper has to special-case one locale, and the export then has two URLs (/ and /en)
   for the same document. app/page.tsx is a redirect stub that sends / to one of them.

   Next's built-in i18n routing is NOT used, and cannot be: it needs a server, and this
   app ships as `output: "export"` to a plain Apache host (see next.config.ts). The lang
   segment is an ordinary dynamic route instead, prerendered for both values. */

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

/** Where / sends a visitor whose browser asks for neither language. */
export const DEFAULT_LOCALE: Locale = "en";

export type Dir = "ltr" | "rtl";
export const DIR: Record<Locale, Dir> = { en: "ltr", ar: "rtl" };

/** Endonyms — a language picker is read by people who do not speak the other language,
    so "العربية", never "Arabic". */
export const LOCALE_LABEL: Record<Locale, string> = { en: "English", ar: "العربية" };

/** Short form for the nav's toggle, where there is room for two or three characters. */
export const LOCALE_SHORT: Record<Locale, string> = { en: "EN", ar: "ع" };

/** BCP 47 tags for <html lang> and hreflang. */
export const HTML_LANG: Record<Locale, string> = { en: "en", ar: "ar" };

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (LOCALES as readonly string[]).includes(value);
}

/** The other locale — the language toggle is binary, so this is all it needs. */
export function otherLocale(lang: Locale): Locale {
  return lang === "en" ? "ar" : "en";
}

/* Anything that is not an internal path: absolute URLs, mailto/tel, and bare fragments.
   A bare "#contact" must stay bare — prefixing it would turn a same-page scroll into a
   navigation. */
const EXTERNAL = /^([a-z][a-z0-9+.-]*:|\/\/|#)/i;

/**
 * Prefix an internal href with the active locale. Pass every internal link through this;
 * hrefs are stored unprefixed (content/nav.ts, content/pages.ts) so the same content tree
 * serves both languages.
 *
 *   href("ar", "/")             -> "/ar"
 *   href("ar", "/customers")    -> "/ar/customers"
 *   href("ar", "/#contact")     -> "/ar/#contact"
 *   href("ar", "#contact")      -> "#contact"        (same page, untouched)
 *   href("ar", "mailto:a@b.co") -> "mailto:a@b.co"   (untouched)
 */
export function href(lang: Locale, to: string): string {
  if (EXTERNAL.test(to)) return to;
  if (to === "/") return `/${lang}`;
  return `/${lang}${to.startsWith("/") ? to : `/${to}`}`;
}

/**
 * Read the locale back out of a pathname. Used by the client chrome, which knows its URL
 * but not its route params. Falls back to the default rather than throwing — a pathname
 * with no locale segment only happens on the / redirect stub and on 404s.
 */
export function localeFromPathname(pathname: string): Locale {
  const first = pathname.split("/")[1];
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

/**
 * Strip the locale segment, giving the shared path. Feed the result back to `href` with
 * the other locale to build the language toggle's target, so switching language keeps
 * the visitor on the page they are reading.
 */
export function pathWithoutLocale(pathname: string): string {
  const parts = pathname.split("/");
  if (isLocale(parts[1])) parts.splice(1, 1);
  const rest = parts.join("/");
  return rest === "" ? "/" : rest;
}

/** A string that exists in every language. The shape every piece of copy in content/ uses. */
export type Localized = Readonly<Record<Locale, string>>;

/** Pick the active language out of any per-locale record. */
export function t<T>(dict: Readonly<Record<Locale, T>>, lang: Locale): T {
  return dict[lang];
}
