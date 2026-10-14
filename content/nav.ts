/* Navigation helpers. The navigation TREE itself is edited in the CMS (Django admin →
   Navigation) and arrives as SiteData.navigation; this file holds only the logic and the
   layout constants that pair with app/chrome.css.

   `key` is the stable, language-independent handle. DOM ids and open-menu state key off
   it — never off a label, which changes with the language. */

import type { NavEntry, NavLeaf } from "@/lib/api/types";

export type { NavEntry, NavLeaf };
export type NavGroup = NavEntry;

/** A top-level entry with children is a dropdown group; without, a plain link. */
export function isGroup(e: NavEntry): boolean {
  return e.children.length > 0;
}

/** Stable DOM/state handle for any entry. */
export function entryId(e: NavLeaf): string {
  return e.key;
}

/* Media queries cannot read custom properties, so these mirror values in app/chrome.css.
   Keep them in sync — the CSS is the source of truth for paint, these for logic. */
export const NAV_MENU_BP = 1024; // --- must equal the drawer breakpoint in chrome.css
export const NAV_H_PX = { base: 64, md: 80 }; // must equal --nav-h at <800 / >=800
