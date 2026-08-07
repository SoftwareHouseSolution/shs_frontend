import React from "react";

/**
 * TrustedStrip — the wrapping client-logo band. Logos render as a quiet
 * monochrome row (mix-blend-mode:exclusion; opacity .6) on the near-mono canvas.
 * logos: [{ src, alt }]
 */
export function TrustedStrip({ label = "Trusted by:", logos = [], style, ...rest }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        width: "100%",
        ...style,
      }}
      {...rest}
    >
      {label && (
        <span
          style={{
            fontFamily: "var(--f-sans)",
            fontSize: "15px",
            letterSpacing: "-0.075px",
            color: "var(--body)",
          }}
        >
          {label}
        </span>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          columnGap: "40px",
          rowGap: "20px",
        }}
      >
        {logos.map((l, i) => (
          <img
            key={i}
            src={l.src}
            alt={l.alt || ""}
            style={{
              height: "34px",
              width: "auto",
              objectFit: "contain",
              mixBlendMode: "exclusion",
              opacity: 0.6,
            }}
          />
        ))}
      </div>
    </div>
  );
}
