import Link from "next/link";
import { SectionHeading } from "@/components/ds/SectionHeading";

/* Root-level 404. It sits outside the (site) route group, so it renders without the
   PageShell — no sticky footer to reveal on a page with almost no content. The navbar
   still appears, because that lives in the root layout. */
export default function NotFound() {
  return (
    <main
      id="main"
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "20px",
        maxWidth: "var(--max-content)",
        margin: "0 auto",
        padding: "calc(var(--nav-h) + 40px) var(--gutter) 80px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "var(--f-mono)",
          fontSize: "var(--caption-size)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}
      >
        404
      </p>
      <SectionHeading level="head">This page doesn&apos;t exist.</SectionHeading>
      <p style={{ margin: 0, font: "var(--body-copy)", color: "var(--body)", maxWidth: "48ch" }}>
        The link may be out of date, or the page may have moved. Everything else is reachable from
        the menu above.
      </p>
      <Link
        href="/"
        style={{
          font: "var(--nav-link)",
          letterSpacing: "-0.35px",
          color: "var(--accent)",
        }}
      >
        Back to home
      </Link>
    </main>
  );
}
