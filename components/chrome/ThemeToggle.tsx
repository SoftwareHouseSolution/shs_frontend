"use client";

/* Light/dark switch, in the navbar (desktop) and the drawer (mobile).

   The theme is the <html data-theme> attribute — set before paint by app/layout.tsx and
   changed only here. The icon is chosen by CSS from that attribute, never by React state,
   so the server HTML is right for every visitor and nothing flips after hydration.
   aria-pressed (is dark mode on?) is filled in after mount, when the theme is known.

   A choice is remembered only when it differs from the system setting; choosing what the
   system already says forgets it, so the site goes back to following the device — and
   while nothing is remembered, a change of system setting applies live.

   THE TRANSITION. Three tiers, chosen per switch:
   1. View Transitions API: the browser snapshots the page, the new theme is drawn live,
      and it is revealed as a circle growing from the button until it covers the screen.
      One composited animation however many elements change, so it never stutters.
   2. No View Transitions: every colour cross-fades together for a fraction of a second.
   3. Reduced motion: an instant switch — a sweeping reveal is exactly what that setting
      asks to avoid.
   Page colour transitions are suspended during tiers 1 and 3 (they would otherwise
   animate inside the reveal at their own speeds); the button's icon keeps its own. */

import { useEffect, useSyncExternalStore } from "react";
import { UI } from "@/content/ui";
import type { Locale } from "@/content/i18n";
import { DARK_QUERY, THEME_ATTRIBUTE, THEME_STORAGE_KEY, type Theme } from "@/content/theme";

const root = () => document.documentElement;

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(root(), { attributes: true, attributeFilter: [THEME_ATTRIBUTE] });
  return () => observer.disconnect();
}
const snapshot = () => (root().getAttribute(THEME_ATTRIBUTE) === "dark" ? "dark" : "light") as Theme;
const serverSnapshot = () => null;

const REVEAL_MS = 620;
const REVEAL_EASING = "cubic-bezier(0.65, 0, 0.35, 1)"; // ease-in-out: leaves and lands softly
const FADE_MS = 280;

/* The theme a switch is heading to. The reveal writes the attribute a frame after the
   click (the browser snapshots the old page first), so a quick second click must toggle
   from where the first is GOING, not from what is on screen — or two clicks flip once. */
let pending: Theme | null = null;
const current = (): Theme => pending ?? snapshot();
const settle = (theme: Theme) => {
  if (pending === theme) pending = null;
};

/* An interrupted reveal still resolves `finished`; only the latest switch may clean up,
   or it would strip the classes the reveal now running depends on. */
let latestSwitch = 0;

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/** Switch instantly, with page transitions held off until the new colours have painted. */
async function swap(theme: Theme) {
  const el = root();
  el.classList.add("swh-theme-switching");
  el.setAttribute(THEME_ATTRIBUTE, theme);
  settle(theme);
  await nextFrame();
  await nextFrame();
  el.classList.remove("swh-theme-switching");
}

function apply(theme: Theme, origin?: { x: number; y: number }) {
  const el = root();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  pending = theme;

  // Tier 3, and any programmatic change (a system switch) that has no button to grow from.
  if (reduce || !origin) {
    void swap(theme);
    return;
  }

  // Tier 2: a uniform cross-fade.
  if (typeof document.startViewTransition !== "function") {
    el.classList.add("swh-theme-fading");
    el.setAttribute(THEME_ATTRIBUTE, theme);
    settle(theme);
    window.setTimeout(() => el.classList.remove("swh-theme-fading"), FADE_MS + 40);
    return;
  }

  // Tier 1: the circular reveal. The radius reaches the farthest corner from the button.
  const { x, y } = origin;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const id = ++latestSwitch;
  el.classList.add("swh-theme-vt", "swh-theme-switching");
  const transition = document.startViewTransition(() => {
    el.setAttribute(THEME_ATTRIBUTE, theme);
    settle(theme);
  });
  transition.ready
    .then(() => {
      el.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: REVEAL_MS, easing: REVEAL_EASING, pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {}); // skipped (e.g. the tab was hidden): the theme is already applied
  transition.finished.finally(() => {
    if (id === latestSwitch) el.classList.remove("swh-theme-vt", "swh-theme-switching");
  });
}

function systemTheme(): Theme {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

export function ThemeToggle({ lang }: { lang: Locale }) {
  const theme = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const ui = UI[lang];

  // Follow the system while the visitor has not chosen.
  useEffect(() => {
    const mq = window.matchMedia(DARK_QUERY);
    const onSystem = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(THEME_STORAGE_KEY);
      } catch {}
      if (!saved) apply(mq.matches ? "dark" : "light"); // no origin: switches without a reveal
    };
    mq.addEventListener("change", onSystem);
    return () => mq.removeEventListener("change", onSystem);
  }, []);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = current() === "dark" ? "light" : "dark";
    // From the button's centre — the same for a click, a tap or the keyboard.
    const box = e.currentTarget.getBoundingClientRect();
    apply(next, { x: box.left + box.width / 2, y: box.top + box.height / 2 });
    try {
      if (next === systemTheme()) localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
  };

  return (
    <button
      type="button"
      className="swh-theme"
      onClick={toggle}
      aria-label={ui.darkMode}
      aria-pressed={theme === null ? undefined : theme === "dark"}
      title={ui.darkMode}
    >
      {/* Both icons share one cell and swap with a rotate-and-scale (app/theme.css). */}
      <span className="swh-theme__icons" aria-hidden="true">
        <svg className="swh-theme__icon swh-theme__moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M20.4 14.6A8.5 8.5 0 0 1 9.4 3.6a8.5 8.5 0 1 0 11 11Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
        <svg className="swh-theme__icon swh-theme__sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="swh-theme__label">{ui.darkMode}</span>
    </button>
  );
}
