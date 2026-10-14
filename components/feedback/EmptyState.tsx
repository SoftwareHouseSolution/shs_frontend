/* "Nothing to show here" — with the reason, and the way back.

   It replaced a single centred sentence under the client grid. That sentence was correct
   but read like a footnote: after typing a name and watching 367 cards vanish, a reader
   needs a clear stop (the icon and heading), the cause in plain words (the body), and a
   one-tap way out (the action) — not a hunt for the small underlined reset link that sits
   up beside the section heading.

   Presentational and server-safe. The action is passed in so the caller owns its state. */

import type { ReactNode } from "react";
import { SearchOffIcon } from "./icons";

type Props = {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ title, children, icon = <SearchOffIcon />, action }: Props) {
  return (
    <div className="swh-empty">
      <span className="swh-empty__icon" aria-hidden="true">
        {icon}
      </span>
      {/* h3: it sits under the "Every client" h2, so the outline stays well-formed. */}
      <h3 className="swh-empty__title">{title}</h3>
      <p className="swh-empty__body">{children}</p>
      {action ? <div className="swh-empty__action">{action}</div> : null}
    </div>
  );
}
