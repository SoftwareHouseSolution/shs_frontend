import * as React from "react";

/**
 * The Area/SWH capsule CTA button.
 *
 */
export interface PillButtonProps {
  children: React.ReactNode;
  /** primary = blue/white; secondary = soft-blue/ink. @default "primary" */
  variant?: "primary" | "secondary";
  /** show trailing ↗ glyph. @default false */
  arrow?: boolean;
  /** stretch to 100% width (contact-bar CTA). @default false */
  fullWidth?: boolean;
  /** render as <a> when set */
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export function PillButton(props: PillButtonProps): JSX.Element;
