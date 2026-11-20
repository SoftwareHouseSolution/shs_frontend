import type { CSSProperties } from "react";

/* The admin's per-client "logo size (%)". The logo CSS multiplies its slot by --logo-scale,
   so one logo that looks small or big next to the others can be corrected from the CMS. */
export const logoScaleStyle = (percent: number | undefined) =>
  ({ "--logo-scale": (percent ?? 100) / 100 }) as CSSProperties;
