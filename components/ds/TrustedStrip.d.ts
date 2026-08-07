import * as React from "react";

export interface TrustedLogo {
  src: string;
  alt?: string;
}

/**
 * Wrapping client-logo trust band (quiet monochrome via mix-blend + opacity).
 */
export interface TrustedStripProps {
  /** lead label. @default "Trusted by:" */
  label?: string;
  logos: TrustedLogo[];
  style?: React.CSSProperties;
}

export function TrustedStrip(props: TrustedStripProps): JSX.Element;
