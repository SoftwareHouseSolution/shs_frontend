"use client";

/* A thin progress line along the top edge while the next page is on its way.

   Starts on the click itself — the moment of intent — rather than waiting for the router,
   so feedback is immediate even when the next page is a full document load (PillButton
   links are plain anchors). Completes when the pathname changes. It is a trickle, not a
   measurement: it eases towards most of the width and only fills on arrival, which is the
   honest way to show progress for a request whose size is unknown.

   Ignored: other origins, new tabs, downloads, modified clicks, and links to the page
   already on screen (fragments such as #contact scroll; they do not navigate). */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { samePath } from "@/content/i18n";

type State = "idle" | "loading" | "done";

const SAFETY_MS = 12_000; // a navigation that never completes must not leave the bar up

export function NavigationProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<State>("idle");
  const stateRef = useRef<State>("idle");
  const timers = useRef<number[]>([]);

  const set = (next: State) => {
    stateRef.current = next;
    setState(next);
  };
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const finish = () => {
    if (stateRef.current !== "loading") return;
    clearTimers();
    set("done");
    timers.current.push(window.setTimeout(() => set("idle"), 650));
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (samePath(url.pathname, window.location.pathname)) return;
      clearTimers();
      set("loading");
      timers.current.push(window.setTimeout(finish, SAFETY_MS));
    };
    // Capture phase: runs before Next's <Link> handler, which may prevent the default.
    document.addEventListener("click", onClick, true);
    // Restored from the back/forward cache: a bar left mid-way must not be shown.
    const onShow = (e: PageTransitionEvent) => e.persisted && (clearTimers(), set("idle"));
    window.addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("pageshow", onShow);
      clearTimers();
    };
    // Registered once; reads state through the ref.
  }, []);

  useEffect(() => {
    finish();
  }, [pathname]);

  return (
    <div className="swh-progress" data-state={state} aria-hidden="true">
      <span />
    </div>
  );
}
