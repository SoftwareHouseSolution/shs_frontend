import React from "react";

/**
 * Eyebrow — the mono section label ("SERVICES", "SPECS"). Reddit Mono, blue,
 * small, slightly tracked. Sits above a SectionHeading.
 */
export function Eyebrow({ children, color = "var(--accent)", style, ...rest }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "var(--f-mono)",
        fontWeight: 500,
        fontSize: "var(--caption-size)",
        letterSpacing: "0.08em",
        lineHeight: "var(--caption-lh)",
        textTransform: "uppercase",
        color,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
