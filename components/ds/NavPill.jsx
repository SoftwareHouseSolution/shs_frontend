import React from "react";

/**
 * NavPill — the fixed blurred glass navigation pill. The ONLY fixed element in
 * the Area/SWH layout. Contains just the primary nav links; logo and CTA live
 * outside it in normal flow and scroll away.
 */
export function NavPill({ links = [], style, ...rest }) {
  return (
    <nav
      style={{
        position: "fixed",
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "27px",
        padding: "20px 24px",
        borderRadius: "var(--r-nav)",
        background: "var(--nav-glass)",
        backdropFilter: "blur(var(--blur-nav))",
        WebkitBackdropFilter: "blur(var(--blur-nav))",
        transition: "transform .2s ease-in-out",
        ...style,
      }}
      {...rest}
    >
      {links.map((l, i) => (
        <a
          key={i}
          href={l.href || "#"}
          style={{
            fontFamily: "var(--f-sans)",
            fontWeight: 700,
            fontSize: "14px",
            letterSpacing: "-0.35px",
            color: "var(--ink)",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          {l.label}
        </a>
      ))}
    </nav>
  );
}
