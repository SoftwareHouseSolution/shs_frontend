import * as React from "react";

/**
 * Responsive Crimson Text display heading.
 */
export interface SectionHeadingProps {
  children: React.ReactNode;
  /** display role — controls size/tracking/line-height. @default "head" */
  level?: "hero" | "head" | "sub" | "muted";
  /** rendered element. @default "h2" */
  as?: keyof JSX.IntrinsicElements;
  color?: string;
  /** @default "left" */
  align?: "left" | "center" | "right";
  style?: React.CSSProperties;
}

export function SectionHeading(props: SectionHeadingProps): JSX.Element;
