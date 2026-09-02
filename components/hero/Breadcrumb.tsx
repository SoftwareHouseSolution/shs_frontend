import Link from "next/link";
import { UI } from "@/content/ui";
import type { Locale } from "@/content/i18n";

/** `href` is expected ALREADY locale-prefixed — the caller builds the trail. */
export type Crumb = { label: string; href?: string };

/* Server component. The leaf carries aria-current="page" and no link. */
export function Breadcrumb({ items, lang }: { items: Crumb[]; lang: Locale }) {
  return (
    <nav className="swh-crumb" aria-label={UI[lang].breadcrumbAria}>
      <ol>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} aria-current={last ? "page" : undefined}>
              {c.href && !last ? <Link href={c.href}>{c.label}</Link> : c.label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
