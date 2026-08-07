import React from "react";

/**
 * SpecTable — the "Why Choose SWH?" comparison. Column headers (first column is
 * highlighted, e.g. "SWH"), then rows of check/cross + mono feature text per column.
 *
 * columns: [{ label, highlight? }]
 * rows: [{ cells: [{ ok:boolean, text:string }, ...] }]  // one cell per column
 */
export function SpecTable({ columns = [], rows = [], style, ...rest }) {
  const grid = `repeat(${columns.length}, 1fr)`;
  const Check = ({ ok }) => (
    <span
      aria-hidden="true"
      style={{ color: ok ? "var(--accent)" : "var(--muted)", fontFamily: "var(--f-mono-data)", fontSize: "14px" }}
    >
      {ok ? "✓" : "✕"}
    </span>
  );
  return (
    <div style={{ width: "100%", ...style }} {...rest}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: grid,
          alignItems: "center",
          paddingBottom: "18px",
        }}
      >
        {columns.map((c, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontFamily: "var(--f-serif)",
              fontSize: "26px",
              color: c.highlight ? "var(--ink)" : "var(--muted)",
              background: c.highlight ? "var(--paper)" : "transparent",
              boxShadow: c.highlight ? "var(--sh-2)" : "none",
              borderRadius: c.highlight ? "var(--r-card) var(--r-card) 0 0" : 0,
              padding: c.highlight ? "24px 0" : "24px 0",
            }}
          >
            {c.label}
          </div>
        ))}
      </div>
      {rows.map((r, ri) => (
        <div
          key={ri}
          style={{
            display: "grid",
            gridTemplateColumns: grid,
            borderTop: "1px solid var(--hairline)",
          }}
        >
          {r.cells.map((cell, ci) => (
            <div
              key={ci}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                justifyContent: columns[ci] && columns[ci].highlight ? "flex-start" : "flex-start",
                padding: "20px 28px",
                background: columns[ci] && columns[ci].highlight ? "var(--paper)" : "transparent",
                boxShadow: columns[ci] && columns[ci].highlight ? "var(--sh-2)" : "none",
              }}
            >
              <Check ok={cell.ok} />
              <span
                style={{
                  fontFamily: "var(--f-mono-data)",
                  fontSize: "13px",
                  letterSpacing: "-0.2px",
                  color: cell.ok ? "var(--ink)" : "var(--body)",
                }}
              >
                {cell.text}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
