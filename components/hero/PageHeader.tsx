/* Interior page header — a shorter version of the hero treatment.

   Server component: the zoom is a pure CSS animation with no timer and no state, so
   nothing here needs the client.

   Carries data-nav-hero so SiteNav's IntersectionObserver knows where the transparent band
   ends on this page — the bar is transparent over this header and solid below it.

   That transparency is why __scrim has its OWN gradient rather than reusing the carousel's
   (see --ph-scrim-* in app/chrome.css). Sharing --hero-scrim-top stacked 0.44 on top of
   --overlay's 0.25, about 0.58 of darkening in exactly the band the navbar occupies. Over a
   dark photograph that rendered as a solid black bar. The carousel gets away with it because
   it is 100svh, so its top scrim is a small fraction of the image; this header is ~400px, so
   the same gradient sits over a quarter of it.

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
    <header className="swh-page-header" data-nav-hero="">
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
