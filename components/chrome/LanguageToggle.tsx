"use client";

/* The language switch.

   It is a LINK, not a button, and that is the whole design. A button would have to store
   a preference somewhere and re-render; a link has a real destination, so it can be
   opened in a new tab, copied, bookmarked, crawled and prefetched — and there is nothing
   to persist, because the URL already says which language the reader is in.

   It resolves to THE SAME PAGE in the other language rather than to that language's home
   page. Someone reading /en/background-capabilities and pressing this lands on
   /ar/background-capabilities, not back at the top of the site — which is the difference
   between a language switch and a language reset. That works because every route exists
   under both prefixes by construction (one nav tree, one slug list) so the target cannot
   404.

   The label is the OTHER language's endonym, written in that language: an English reader
   sees "العربية", an Arabic reader sees "English". Labelling the switch in the language
   the reader is already using is the common mistake — the person who needs this control
   is by definition the one who cannot read the current language. `lang`/`hrefLang` mark
   it so a screen reader changes voice for that word, and so app/rtl.css can set it in
   Cairo when it appears inside an otherwise English page. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HTML_LANG,
  LOCALE_LABEL,
  href,
  otherLocale,
  pathWithoutLocale,
  type Locale,
} from "@/content/i18n";
import { UI } from "@/content/ui";

type Props = {
  lang: Locale;
  /** The drawer passes its close handler: a same-page language switch is still a
      navigation, but the drawer must not be left open on top of the new page. */
  onNavigate?: () => void;
  className?: string;
};

export function LanguageToggle({ lang, onNavigate, className = "swh-lang" }: Props) {
  const pathname = usePathname();
  const other = otherLocale(lang);
  /* Strip the current locale and re-prefix with the other one. Any hash in the URL is
     deliberately dropped — a fragment is a section id, and while those happen to match
     across languages today, carrying one over would silently break the moment they do not. */
  const target = href(other, pathWithoutLocale(pathname));

  return (
    <Link
      className={className}
      href={target}
      lang={HTML_LANG[other]}
      hrefLang={HTML_LANG[other]}
      aria-label={`${UI[lang].languageAria}: ${LOCALE_LABEL[other]}`}
      onClick={onNavigate}
    >
      {LOCALE_LABEL[other]}
    </Link>
  );
}
