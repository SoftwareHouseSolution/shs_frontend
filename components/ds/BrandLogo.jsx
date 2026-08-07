import React from "react";

/**
 * BrandLogo — the SWH mark. `variant`:
 *  - "mark"     : house+S glyph only (footer / favicon / app-icon)
 *  - "lockup"   : mark + "Software House Solutions" wordmark (header, default)
 *  - "wordmark" : text only
 * The delivered mark PNG is blue line-art; on the near-mono canvas it reads as
 * a lighter tint of the accent. Set `onAccent` for the white-on-blue badge.
 */
export function BrandLogo({
  variant = "lockup",
  height = 40,
  onAccent = false,
  src = "/assets/brand/swh-logo.png",
  style,
  ...rest
}) {
  const wordColor = onAccent ? "var(--paper)" : "var(--ink)";
  const mark = (
    <img
      src={src}
      alt="Software House Solutions"
      style={{
        height: `${height}px`,
        width: "auto",
        display: "block",
        filter: onAccent ? "brightness(0) invert(1)" : "none",
      }}
    />
  );
  const word = (
    <span
      style={{
        fontFamily: "var(--f-mono)",
        fontWeight: 500,
        fontSize: `${Math.max(10, height * 0.24)}px`,
        letterSpacing: "0.02em",
        lineHeight: 1.05,
        textTransform: "uppercase",
        color: wordColor,
      }}
    >
      Software House
      <br />
      Solutions
    </span>
  );
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: "12px", ...style }}
      {...rest}
    >
      {variant !== "wordmark" && mark}
      {variant !== "mark" && word}
    </span>
  );
}
