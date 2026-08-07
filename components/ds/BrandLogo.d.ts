import * as React from "react";

/**
 * The Software House Solutions brand mark / lockup.
 *
 */
export interface BrandLogoProps {
  /** mark only · mark+wordmark · wordmark only. @default "lockup" */
  variant?: "mark" | "lockup" | "wordmark";
  /** mark height in px. @default 40 */
  height?: number;
  /** invert to white for placement on the blue accent. @default false */
  onAccent?: boolean;
  /** override the mark image path (default /assets/brand/swh-logo.png) */
  src?: string;
  style?: React.CSSProperties;
}

export function BrandLogo(props: BrandLogoProps): JSX.Element;
