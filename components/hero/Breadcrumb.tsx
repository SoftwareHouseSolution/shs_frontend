import Link from "next/link";

export type Crumb = { label: string; href?: string };

/* Server component. The leaf carries aria-current="page" and no link. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="swh-crumb" aria-label="Breadcrumb">
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
