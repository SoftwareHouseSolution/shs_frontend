import * as React from "react";

/**
 * How-to step — giant muted serif numeral + title + body, hairline top.
 */
export interface StepCardProps {
  /** step numeral, e.g. "01" */
  n: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function StepCard(props: StepCardProps): JSX.Element;
