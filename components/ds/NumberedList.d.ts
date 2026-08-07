import * as React from "react";

export interface NumberedItem {
  /** two-digit index; defaults to padded position (01, 02…) */
  n?: string;
  title: React.ReactNode;
  body?: React.ReactNode;
}

/**
 * Hairline-divided 01–04 numbered list (mono numerals).
 */
export interface NumberedListProps {
  items: NumberedItem[];
  style?: React.CSSProperties;
}

export function NumberedList(props: NumberedListProps): JSX.Element;
