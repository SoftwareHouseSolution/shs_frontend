"use client";

/* One top-level nav item that owns a dropdown.

   This is the WAI-ARIA Disclosure Navigation pattern with arrow-key support, NOT
   role="menu". role="menu" puts screen readers into application mode and strips the link
   role from every item, which is wrong for site navigation — these are links to pages,
   not commands.

   Visibility is `inert` plus CSS, never the `hidden` attribute: `hidden` sets
   display:none and would kill the open/close transition. */

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { NavGroup } from "@/content/nav";

const CLOSE_GRACE_MS = 120;

type Props = {
  group: NavGroup;
  id: string;
  open: boolean;
  pathname: string;
  onOpen: (id: string) => void;
  /** Pass `id` to close only if this item is still the open one — see SiteNav. */
  onClose: (id?: string) => void;
  /** Move focus to the previous/next top-level trigger. */
  onStep: (id: string, dir: -1 | 1) => void;
};

export function NavMenu({ group, id, open, pathname, onOpen, onClose, onStep }: Props) {
  const itemRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const graceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(graceTimer.current), []);

  const links = () =>
    Array.from(panelRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);

  const focusLink = (i: number) => {
    const l = links();
    if (l.length === 0) return;
    l[((i % l.length) + l.length) % l.length].focus();
  };

  const closeAndRefocus = () => {
    onClose();
    triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        onOpen(id);
        requestAnimationFrame(() => focusLink(0));
        break;
      case "ArrowUp":
        e.preventDefault();
        onOpen(id);
        requestAnimationFrame(() => focusLink(-1));
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          onClose();
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        onStep(id, 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        onStep(id, -1);
        break;
    }
  };

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    const l = links();
    const at = l.indexOf(document.activeElement as HTMLAnchorElement);
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusLink(at + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusLink(at - 1);
        break;
      case "Home":
        e.preventDefault();
        focusLink(0);
        break;
      case "End":
        e.preventDefault();
        focusLink(-1);
        break;
      case "Escape":
        e.preventDefault();
        closeAndRefocus();
        break;
    }
  };

  return (
    <li
      ref={itemRef}
      className="swh-nav__item"
      data-open={open}
      onPointerEnter={() => {
        clearTimeout(graceTimer.current);
        onOpen(id);
      }}
      onPointerLeave={() => {
        clearTimeout(graceTimer.current);
        // Grace period plus the CSS bridge in chrome.css: either alone flickers when the
        // pointer crosses the gap between the trigger and the panel.
        graceTimer.current = setTimeout(() => {
          /* Do not yank a panel out from under the keyboard. A user can open with
             ArrowDown and then move the mouse anywhere; without this the pointerleave
             would close the panel their focus is currently inside. */
          if (itemRef.current?.contains(document.activeElement)) return;
          onClose(id);
        }, CLOSE_GRACE_MS);
      }}
      onBlur={(e) => {
        // Covers Tab, Shift+Tab and click-away-to-focus in one check.
        if (!e.currentTarget.contains(e.relatedTarget as Node)) onClose(id);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="swh-nav__trigger"
        id={`navtrig-${id}`}
        aria-controls={`navmenu-${id}`}
        aria-expanded={open}
        aria-haspopup="true"
        /* A plain toggle with no memory — see the note in SiteNav. It exists for keyboard
           and touch; a mouse never needs it, because hover already did the work. */
        onClick={() => (open ? onClose() : onOpen(id))}
        onKeyDown={onTriggerKeyDown}
      >
        {group.label}
        <svg className="swh-nav__chev" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
          <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>

      <div
        ref={panelRef}
        id={`navmenu-${id}`}
        className="swh-nav__panel"
        inert={!open}
        onKeyDown={onPanelKeyDown}
      >
        <ul>
          {group.children.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                aria-current={pathname === c.href ? "page" : undefined}
                /* Arrow, not a bare `onClose`: the handler would pass the MouseEvent as
                   the id, and the guard in SiteNav would then never match. */
                onClick={() => onClose()}
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
