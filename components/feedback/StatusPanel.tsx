/* The full-page "something is not here" surface, shared by the 404 and the error boundary.

   One component so the two pages cannot drift into different shapes: an icon, a mono
   eyebrow saying what kind of problem this is, a serif heading saying what happened, a
   sentence saying what to do, then the actions. Same order a reader asks the questions in
   — what happened, was it me, where do I go now.

   Server-safe: no hooks, no directive. The error boundary that renders it is a client
   component (Next requires that), the 404 is not, and both import this unchanged. Styles
   are .swh-status in app/chrome.css. */

import type { HTMLAttributes, ReactNode } from "react";

type Props = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  icon: ReactNode;
  eyebrow: string;
  title: ReactNode;
  /** h1 when this IS the page; h2 when two panels share one (the bilingual 404). */
  titleAs?: "h1" | "h2";
  /** "danger" tints the icon for a failure; "neutral" is for a wrong address. */
  tone?: "neutral" | "danger";
  actions?: ReactNode;
  /** A quieter line under the actions — a support route, never a second CTA. */
  aside?: ReactNode;
  children: ReactNode;
};

export function StatusPanel({
  icon,
  eyebrow,
  title,
  titleAs: Title = "h1",
  tone = "neutral",
  actions,
  aside,
  children,
  className,
  ...rest
}: Props) {
  return (
    <section className={className ? `swh-status ${className}` : "swh-status"} data-tone={tone} {...rest}>
      <span className="swh-status__icon" aria-hidden="true">
        {icon}
      </span>
      <p className="swh-status__eyebrow">{eyebrow}</p>
      <Title className="swh-status__title">{title}</Title>
      <p className="swh-status__body">{children}</p>
      {actions ? <div className="swh-status__actions">{actions}</div> : null}
      {aside ? <p className="swh-status__aside">{aside}</p> : null}
    </section>
  );
}
