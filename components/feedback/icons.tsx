/* Stroke icons for the feedback surfaces — empty states, the error page and the 404.

   Same rules as SocialIcon: authored paths on a 24px grid, currentColor, no icon font and
   no package. Four glyphs do not justify a dependency. Sizing comes from the caller's CSS;
   every one is decorative (aria-hidden), because the text beside it carries the meaning. */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

/** Magnifier — "nothing matched this search". */
export function SearchIcon() {
  return (
    <svg {...base}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
    </svg>
  );
}

/** Magnifier with a cross — the empty-results state, distinct from the input's own icon. */
export function SearchOffIcon() {
  return (
    <svg {...base}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2M8.8 8.8l4.4 4.4M13.2 8.8l-4.4 4.4" />
    </svg>
  );
}

/** Compass — "this address leads nowhere", for the 404. */
export function CompassIcon() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.2 8.8l-1.9 4.5-4.5 1.9 1.9-4.5z" />
    </svg>
  );
}

/** Warning triangle — the error boundary. */
export function AlertIcon() {
  return (
    <svg {...base}>
      <path d="M10.3 4.2L3.2 16.8a2 2 0 0 0 1.7 3h14.2a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z" />
      <path d="M12 9.5v4M12 16.6v.1" />
    </svg>
  );
}
