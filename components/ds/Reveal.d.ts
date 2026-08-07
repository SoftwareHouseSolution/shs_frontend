import * as React from "react";

/**
 * Signature rise-in-on-scroll wrapper (fade + upward translate, once).
 */
export interface RevealProps {
  children: React.ReactNode;
  /** upward travel distance in px. 9 for text/cards, ~50 for the hero visual. @default 9 */
  y?: number;
  /** seconds. @default 0.6 */
  duration?: number;
  /** seconds; stagger siblings by ~0.08 increments. @default 0 */
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
  /** reveal only once. @default true */
  once?: boolean;
  style?: React.CSSProperties;
}

export function Reveal(props: RevealProps): JSX.Element;
