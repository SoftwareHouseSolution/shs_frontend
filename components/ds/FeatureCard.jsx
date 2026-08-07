import React from "react";

/**
 * FeatureCard — a benefits/services item: serif title + grey sans body, optional
 * rounded image on top. Used in the 4-up benefits grid and services grid.
 */
export function FeatureCard({ title, children, image, imageAlt = "", style, ...rest }) {
  return (
    <article style={{ display: "flex", flexDirection: "column", gap: "12px", ...style }} {...rest}>
      {image && (
        <img
          src={image}
          alt={imageAlt}
          style={{
            width: "100%",
            aspectRatio: "4 / 3",
            objectFit: "cover",
            borderRadius: "var(--r-card)",
            marginBottom: "4px",
          }}
        />
      )}
      <h3
        style={{
          margin: 0,
          fontFamily: "var(--f-serif)",
          fontWeight: 400,
          fontSize: "22px",
          lineHeight: 1.1,
          letterSpacing: "-0.2px",
          color: "var(--ink)",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--f-sans)",
          fontWeight: 400,
          fontSize: "15px",
          lineHeight: 1.4,
          color: "var(--body)",
        }}
      >
        {children}
      </p>
    </article>
  );
}
