import React from "react";

/**
 * StepCard — a "Map Your Success" how-to step: giant muted serif numeral over a
 * hairline top divider, then serif title + grey body.
 */
export function StepCard({ n, title, children, style, ...rest }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        borderTop: "1px solid var(--hairline)",
        paddingTop: "24px",
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          fontFamily: "var(--f-serif)",
          fontSize: "92px",
          lineHeight: 1,
          color: "var(--muted)",
          letterSpacing: "-2px",
        }}
      >
        {n}
      </span>
      <h3
        style={{
          margin: "20px 0 0",
          fontFamily: "var(--f-serif)",
          fontWeight: 400,
          fontSize: "22px",
          lineHeight: 1.1,
          color: "var(--ink)",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--f-sans)",
          fontSize: "15px",
          lineHeight: 1.4,
          color: "var(--body)",
        }}
      >
        {children}
      </p>
    </div>
  );
}
