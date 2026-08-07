"use client";
import React from "react";

/**
 * PillButton — the Area/SWH capsule CTA. Two variants:
 *  - "primary"   : accent (SWH blue) background, white text  (Learn More ↗)
 *  - "secondary" : soft-accent background, ink text            (Discover More)
 * Optional trailing ↗ arrow glyph. `fullWidth` gives the contact-section bar.
 */
export function PillButton({
  children,
  variant = "primary",
  arrow = false,
  fullWidth = false,
  href,
  onClick,
  style,
  ...rest
}) {
  const isPrimary = variant === "primary";
  const base = {
    display: fullWidth ? "flex" : "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: fullWidth ? "100%" : "auto",
    padding: fullWidth ? "22px 32px" : "14px 22px",
    borderRadius: "var(--r-pill)",
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    fontFamily: "var(--f-sans)",
    fontWeight: 700,
    fontSize: "14px",
    letterSpacing: "-0.35px",
    lineHeight: 1,
    background: isPrimary ? "var(--accent)" : "var(--accent-soft)",
    color: isPrimary ? "var(--paper)" : "var(--ink)",
    transition: "background .18s ease, transform .12s ease",
    ...style,
  };
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={onClick}
      style={base}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isPrimary
          ? "var(--accent-hover)"
          : "#C9D9EE";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isPrimary
          ? "var(--accent)"
          : "var(--accent-soft)";
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.98)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      {...rest}
    >
      <span>{children}</span>
      {arrow && <span aria-hidden="true" style={{ fontSize: "1.05em" }}>↗</span>}
    </Tag>
  );
}
