import * as React from "react";

export interface SpecColumn {
  label: React.ReactNode;
  /** emphasized column (the SWH card). @default false */
  highlight?: boolean;
}
export interface SpecCell {
  ok: boolean;
  text: string;
}
export interface SpecRow {
  /** one cell per column, in order */
  cells: SpecCell[];
}

/**
 * "Why choose us?" 3-column check/cross comparison table (mono cells).
 */
export interface SpecTableProps {
  columns: SpecColumn[];
  rows: SpecRow[];
  style?: React.CSSProperties;
}

export function SpecTable(props: SpecTableProps): JSX.Element;
