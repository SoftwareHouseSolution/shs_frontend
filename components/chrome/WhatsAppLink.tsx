"use client";

import { UI } from "@/content/ui";
import { useSite } from "./SiteContext";
import type { Locale } from "@/content/i18n";

/* Inline SVG using currentColor, so the caller's class decides the colour.
   No icon dependency — one glyph does not justify a package.

   `className` is REQUIRED, with no default. It used to default to "swh-wa", the navbar
   variant, and there is no navbar variant any more: the only place this renders is the top
   of the contact rail (components/chrome/SocialRail.tsx). A default pointing at a class
   that no stylesheet defines is worse than making the caller say which one it wants.

   The phone number is appended to the label rather than translated into it: a number is a
   number in both languages, and no `dir` is needed because an aria-label is read, not
   laid out. */
export function WhatsAppLink({
  lang,
  className,
  hoverLabel,
}: {
  lang: Locale;
  className: string;
  /** Short text for a CSS-rendered hover label, read back with content: attr(data-label).
      It is passed as a data attribute rather than rendered as a child so this component
      stays unaware of the rail's markup — the caller's stylesheet decides whether there is
      a label at all, and omitting it simply produces no pseudo-element content. */
  hoverLabel?: string;
}) {
  const { settings } = useSite();
  return (
    <a
      className={className}
      href={settings.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${UI[lang].whatsappAria} ${settings.phoneDisplay}`}
      data-label={hoverLabel}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.25-8.23a8.23 8.23 0 0 1 8.24 8.24c0 4.54-3.7 8.22-8.24 8.22Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.16 1.73 2.65 4.2 3.72.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z"
        />
      </svg>
    </a>
  );
}
