import React from "react";

/**
 * BrandLogo — the SWH mark. `variant`:
 *  - "mark"     : house+S glyph only (footer / favicon / app-icon)
 *  - "lockup"   : mark + "Software House Solutions" wordmark (header, default)
 *  - "wordmark" : text only
 *
 * TWO FILES, NOT ONE FILTERED FILE. The delivered mark is a blue roof plus an OFF-WHITE
 * "S", so it only works on something dark — on --paper the S vanishes and the roof floats
 * over nothing. `onAccent` still whitens the whole mark with a filter, which is fine
 * because that flattens it deliberately. The light-surface case cannot be done that way:
 * no CSS filter recolours ONE part of an image, so it is a real second asset built by
 * tools/make-assets.mjs.
 */
const SRC_ON_DARK = "/assets/brand/swh-logo.png"; // blue roof + off-white S
const SRC_ON_LIGHT = "/assets/brand/swh-logo-ink.png"; // blue roof + ink S

export function BrandLogo({
  variant = "lockup",
  height = 40,
  onAccent = false,
  src = SRC_ON_DARK,
  srcOnLight = SRC_ON_LIGHT,
  style,
  ...rest
}) {
  const wordColor = onAccent ? "var(--paper)" : "var(--ink)";
  const mark = (
    <img
      src={onAccent ? src : srcOnLight}
      alt="Software House Solutions"
      style={{
        height: `${height}px`,
        width: "auto",
        display: "block",
        // Over a photo the whole mark goes solid white; the roof's blue would not hold
        // enough contrast against a bright slide region on its own.
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
