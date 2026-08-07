/* Interior page header — a shorter version of the hero treatment.

   Server component: the zoom is a pure CSS animation with no timer and no state, so
   nothing here needs the client.

   ── NO data-nav-hero HERE, DELIBERATELY ─────────────────────────────────────────────
   It used to carry that attribute, which put the navbar into its transparent state over
   this header. The header is --ink under an image, under __scrim, which stacks
   --hero-scrim-top (0.44 at the very top) on --overlay (0.25) — roughly 0.58 of darkening
   in exactly the band the bar occupies. The result was a navbar that turned solid black on
   every interior page, and that looked different again on the home page depending on which
   carousel slide happened to be showing. Two different bars on one site.

   The transparent bar now belongs to the home carousel alone, which is the full-bleed
   100svh photograph where it reads as intentional. Every interior page gets the same
   --paper bar. SiteNav needs no change for this: it already sets solid=true when a page
   has no [data-nav-hero].

   The zoom runs slower than the carousel's (18s to 1.06 rather than 8.2s to 1.104) on
   purpose: a page header never leaves the screen, so applying the carousel's rate over an
   unbounded dwell would keep growing. */

import { Breadcrumb, type Crumb } from "./Breadcrumb";

type Props = {
  title: string;
  eyebrow: string;
  lede: string;
  image: string;
  crumbs: Crumb[];
};

export function PageHeader({ title, eyebrow, lede, image, crumbs }: Props) {
  return (
    <header className="swh-page-header">
      <img className="swh-page-header__img" src={image} alt="" decoding="async" fetchPriority="high" />
      <div className="swh-page-header__scrim" aria-hidden="true" />
      <div className="swh-page-header__inner">
        <Breadcrumb items={crumbs} />
        <p
          style={{
            margin: 0,
            fontFamily: "var(--f-mono)",
            fontWeight: 500,
            fontSize: "var(--caption-size)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(250,250,248,.82)",
          }}
        >
          {eyebrow}
        </p>
        <h1 className="swh-page-header__title">{title}</h1>
        <p className="swh-page-header__lede">{lede}</p>
      </div>
    </header>
  );
}
