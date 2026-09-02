import { UI } from "@/content/ui";
import type { Locale } from "@/content/i18n";

/* First focusable thing on the page. Hidden until focused.

   `lang` is a prop rather than a hook because this renders inside the server layout, and
   because it must be correct in the very first byte of HTML: the skip link is what a
   keyboard user reaches before anything else on the page. */
export function SkipLink({ lang }: { lang: Locale }) {
  return (
    <a className="swh-skip" href="#main">
      {UI[lang].skipToContent}
    </a>
  );
}
