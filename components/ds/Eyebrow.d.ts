import * as React from "react";

/**
 * Mono eyebrow label (blue) that caps a section heading.
 */
export interface EyebrowProps {
  children: React.ReactNode;
  /** override color (default accent blue) */
  color?: string;
  style?: React.CSSProperties;
}

export function Eyebrow(props: EyebrowProps): JSX.Element;
