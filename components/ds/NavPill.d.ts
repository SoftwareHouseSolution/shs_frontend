import * as React from "react";

export interface NavLink {
  label: string;
  href?: string;
}

/**
 * Fixed blurred glass navigation pill (the only fixed element).
 *
 */
export interface NavPillProps {
  /** primary nav links, e.g. [{label:"Benefits",href:"#benefits"}] */
  links: NavLink[];
  style?: React.CSSProperties;
}

export function NavPill(props: NavPillProps): JSX.Element;
