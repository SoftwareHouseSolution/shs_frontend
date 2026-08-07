import React from "react";

/**
 * NumberedList — the "See the Big Picture" 01–04 list. Each row: Roboto Mono
 * index, then serif/sans copy, separated by hairline dividers.
 * items: [{ n?, title, body? }]  (n defaults to the 01-padded index)
 */
export function NumberedList({ items = [], style, ...rest }) {
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, width: "100%", ...style }} {...rest}>
      {items.map((it, i) => {
        const n = it.n || String(i + 1).padStart(2, "0");
        return (
          <li
            key={i}
            style={{
              display: "flex",
              gap: "36px",
              alignItems: "flex-start",
              padding: "22px 0",
              borderTop: "1px solid var(--hairline)",
            }}
          >
            <span
              style={{
                flex: "0 0 auto",
                fontFamily: "var(--f-mono-data)",
                fontSize: "14px",
                color: "var(--accent)",
                paddingTop: "2px",
              }}
            >
              {n}
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{
                  fontFamily: "var(--f-sans)",
                  fontSize: "16px",
                  lineHeight: 1.4,
                  color: "var(--ink)",
                }}
              >
                {it.title}
              </span>
              {it.body && (
                <span
                  style={{
                    fontFamily: "var(--f-sans)",
                    fontSize: "15px",
                    lineHeight: 1.4,
                    color: "var(--body)",
                  }}
                >
                  {it.body}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
