import * as React from "react";

/**
 * Benefit/service card — serif title + grey body, optional rounded image.
 */
export interface FeatureCardProps {
  title: React.ReactNode;
  children: React.ReactNode;
  /** optional image src (rendered rounded, 4:3, on top) */
  image?: string;
  imageAlt?: string;
  style?: React.CSSProperties;
}

export function FeatureCard(props: FeatureCardProps): JSX.Element;
