"use client";

/* Anonymous visit analytics: which pages a visit goes through, in order, and how long
   each one is actually on screen. Shown to the team in the CMS dashboard.

   - Ids are random: a visitor id per browser (localStorage) and a session id per tab
     (sessionStorage). No cookies, nothing personal.
   - Time counts only while the page is visible. A tab in the background is not reading.
   - A page view is reported when it opens, every HEARTBEAT_MS while visible, and when it
     is left (navigation, tab hidden, tab closed). The API upserts by view id and keeps the
     largest duration, so the repeats are safe and a lost final report costs at most one
     heartbeat of accuracy.
   - Nothing is sent when the browser asks not to be tracked (Do-Not-Track or Global
     Privacy Control), or when NEXT_PUBLIC_ANALYTICS=off. */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/content/i18n";
import { reportView } from "@/lib/api/analytics";

const HEARTBEAT_MS = 15_000;
const VISITOR_KEY = "swh:visitor";
const SESSION_KEY = "swh:session";

function uuid(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // randomUUID needs a secure context; an http:// deployment still gets a valid v4 id.
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** Storage can throw (privacy modes, blocked site data); an in-memory id still works. */
function persistentId(store: () => Storage, key: string): string {
  try {
    const existing = store().getItem(key);
    if (existing) return existing;
    const id = uuid();
    store().setItem(key, id);
    return id;
  } catch {
    return uuid();
  }
}

function trackingAllowed(): boolean {
  if (process.env.NEXT_PUBLIC_ANALYTICS === "off") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
  const dnt = nav.doNotTrack ?? (window as Window & { doNotTrack?: string }).doNotTrack ?? nav.msDoNotTrack;
  return !(dnt === "1" || dnt === "yes" || nav.globalPrivacyControl === true);
}

type View = { id: string; path: string; activeMs: number; visibleSince: number | null };

export function VisitTracker({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const ids = useRef<{ visitor: string; session: string; firstView: boolean } | null>(null);
  const view = useRef<View | null>(null);
  const langRef = useRef(lang);
  langRef.current = lang;

  /* Elapsed visible time for the current view, without stopping the clock. */
  const elapsed = (v: View) => v.activeMs + (v.visibleSince !== null ? performance.now() - v.visibleSince : 0);

  const send = (v: View, leaving = false, referrer?: string) => {
    if (!ids.current) return;
    reportView(
      {
        session_id: ids.current.session,
        visitor_id: ids.current.visitor,
        view_id: v.id,
        path: v.path,
        language: langRef.current,
        duration_ms: Math.round(elapsed(v)),
        ...(referrer ? { referrer } : {}),
      },
      { leaving },
    );
  };

  /* Page lifecycle: pause while hidden, report on hide and on close, heartbeat while
     visible. Registered once; reads the current view through the ref. */
  useEffect(() => {
    if (!trackingAllowed()) return;
    ids.current = {
      visitor: persistentId(() => localStorage, VISITOR_KEY),
      session: persistentId(() => sessionStorage, SESSION_KEY),
      firstView: true,
    };

    const onVisibility = () => {
      const v = view.current;
      if (!v) return;
      if (document.visibilityState === "hidden") {
        if (v.visibleSince !== null) {
          v.activeMs += performance.now() - v.visibleSince;
          v.visibleSince = null;
        }
        send(v, true);
      } else if (v.visibleSince === null) {
        v.visibleSince = performance.now();
      }
    };
    const onPageHide = () => view.current && send(view.current, true);
    const beat = window.setInterval(() => {
      const v = view.current;
      if (v && document.visibilityState === "visible") send(v);
    }, HEARTBEAT_MS);

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.clearInterval(beat);
    };
    // Registered once; `send` reads everything it needs through refs.
  }, []);

  /* A new page: close the previous view with its final time, open the next. */
  useEffect(() => {
    if (!ids.current || !pathname) return;
    const previous = view.current;
    if (previous && previous.path === pathname) return; // same page (e.g. a #fragment)
    if (previous) send(previous, true);

    const next: View = {
      id: uuid(),
      path: pathname,
      activeMs: 0,
      visibleSince: document.visibilityState === "visible" ? performance.now() : null,
    };
    view.current = next;
    // Where the visit came from — only meaningful on its first page.
    const referrer = ids.current.firstView ? document.referrer : undefined;
    ids.current.firstView = false;
    send(next, false, referrer);
  }, [pathname]);

  return null;
}
