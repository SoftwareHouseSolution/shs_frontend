import React from "react";

/**
 * SectionHeading — Crimson Text display heading at one of the responsive roles.
 *  level: "hero" (giant) | "head" (section) | "sub" (sub-head) | "muted" (grey xl)
 * Line-height and letter-spacing follow the responsive type tokens automatically.
 */
export function SectionHeading({
  children,
  level = "head",
  as = "h2",
  color,
  align = "left",
  style,
  ...rest
}) {
  const Tag = as;
  const roles = {
    hero: { size: "var(--hero-size)", ls: "var(--hero-ls)", lh: "var(--hero-lh)", c: "var(--ink)" },
    head: { size: "var(--head-size)", ls: "var(--head-ls)", lh: "var(--head-lh)", c: "var(--ink)" },
    sub: { size: "var(--sub-size)", ls: "var(--sub-ls)", lh: "var(--sub-lh)", c: "var(--ink)" },
    muted: { size: "var(--mutedxl-size)", ls: "var(--mutedxl-ls)", lh: "var(--mutedxl-lh)", c: "var(--muted)" },
  };
  const r = roles[level] || roles.head;
  return (
    <Tag
      style={{
        margin: 0,
        fontFamily: "var(--f-serif)",
        fontWeight: 400,
        fontSize: r.size,
        letterSpacing: r.ls,
        lineHeight: r.lh,
        color: color || r.c,
        textAlign: align,
        textWrap: "balance",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
