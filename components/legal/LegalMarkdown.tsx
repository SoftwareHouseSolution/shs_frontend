/* The legal pages' text, from the simple Markdown edited in Admin → Site → Legal pages.

   Deliberately a small subset, built straight into React elements — never HTML — so nothing
   typed in the admin can inject markup or script:

     ## Heading          → <h2>          (### → <h3>)
     - item             → list item     (consecutive lines form one list)
     **bold**           → <strong>
     [text](/en#contact)→ link          (site paths, #anchors, https:, mailto: — nothing else)
     blank line         → new paragraph; a single line break stays a line break

   Server component: no state, nothing shipped to the browser. */

import Link from "next/link";
import { Fragment, type ReactNode } from "react";

type Block = { kind: "h2" | "h3" | "p"; text: string } | { kind: "ul"; items: string[] };

const SAFE_HREF = /^(\/|#|https:\/\/|mailto:)/;

function blocks(source: string): Block[] {
  const out: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] | null = null;
  const flush = () => {
    if (paragraph.length) out.push({ kind: "p", text: paragraph.join("\n") });
    if (list) out.push({ kind: "ul", items: list });
    paragraph = [];
    list = null;
  };
  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
    } else if (/^###\s+/.test(line)) {
      flush();
      out.push({ kind: "h3", text: line.replace(/^###\s+/, "") });
    } else if (/^##\s+/.test(line)) {
      flush();
      out.push({ kind: "h2", text: line.replace(/^##\s+/, "") });
    } else if (/^\s*[-*]\s+/.test(line)) {
      if (paragraph.length) flush();
      (list ??= []).push(line.replace(/^\s*[-*]\s+/, ""));
    } else {
      if (list) flush();
      paragraph.push(line.trim());
    }
  }
  flush();
  return out;
}

/** The ## headings, for the page's contents list; ids match the rendered headings. */
export function outline(source: string): { id: string; text: string }[] {
  return blocks(source)
    .filter((b): b is { kind: "h2"; text: string } => b.kind === "h2")
    .map((b, i) => ({ id: `section-${i + 1}`, text: b.text.replace(/\*\*/g, "") }));
}

/** **bold** and [text](href), with line breaks kept. */
function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let key = 0;
  const plain = (s: string) =>
    s.split("\n").forEach((part, i) => {
      if (i) nodes.push(<br key={`br${key++}`} />);
      if (part) nodes.push(part);
    });
  for (const m of text.matchAll(pattern)) {
    plain(text.slice(last, m.index));
    if (m[1] !== undefined) {
      nodes.push(<strong key={key++}>{inline(m[1])}</strong>);
    } else {
      const [label, href] = [m[2], m[3]];
      if (!SAFE_HREF.test(href)) nodes.push(label);
      else if (href.startsWith("/")) nodes.push(<Link key={key++} href={href}>{label}</Link>);
      else nodes.push(<a key={key++} href={href} {...(href.startsWith("https") ? { target: "_blank", rel: "noopener" } : {})}>{label}</a>);
    }
    last = (m.index ?? 0) + m[0].length;
  }
  plain(text.slice(last));
  return nodes;
}

export function LegalMarkdown({ source }: { source: string }) {
  let section = 0;
  return (
    <div className="swh-legal__body">
      {blocks(source).map((b, i) => {
        if (b.kind === "ul") {
          return (
            <ul key={i}>
              {b.items.map((item, j) => <li key={j}>{inline(item)}</li>)}
            </ul>
          );
        }
        if (b.kind === "h2") return <h2 key={i} id={`section-${++section}`}>{inline(b.text)}</h2>;
        const Tag = b.kind;
        return <Fragment key={i}><Tag>{inline(b.text)}</Tag></Fragment>;
      })}
    </div>
  );
}
