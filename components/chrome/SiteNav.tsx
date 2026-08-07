"use client";

/* The site-wide navigation bar.

   Scroll state comes from an IntersectionObserver on [data-nav-hero], not a scroll
   listener. It fires twice per page visit — once entering the hero, once leaving — so
   setState is the right tool here, unlike the prototype's nav-peek handler which had to
   run at scroll frequency. It also avoids caching the hero height, which would need
   re-measuring on resize and again on font-swap.

   The header element itself carries no transform, filter or backdrop-filter. Any of those
   would make it a containing block for position:fixed and anchor the drawer to the bar.
   Paint lives on .swh-nav__surface so a future glass treatment cannot break that. */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/ds/BrandLogo";
import { PillButton } from "@/components/ds/PillButton";
import { NAV, isGroup, NAV_H_PX } from "@/content/nav";
import { SITE } from "@/content/site";
import { BadgeSlot } from "./BadgeSlot";
import { NavDrawer } from "./NavDrawer";
import { NavMenu } from "./NavMenu";
import { WhatsAppLink } from "./WhatsAppLink";

const idOf = (label: string) => label.toLowerCase().replace(/[^a-z]+/g, "-");

export function SiteNav() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  /* Observe the page's hero band. Re-runs on navigation so the new page's hero is picked
     up; a page with no hero is always solid. */
  useEffect(() => {
    const hero = document.querySelector("[data-nav-hero]");
    if (!hero) {
      setSolid(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setSolid(!e.isIntersecting), {
      rootMargin: `-${NAV_H_PX.base}px 0px 0px 0px`,
      threshold: 0,
    });
    io.observe(hero);
    return () => io.disconnect();
  }, [pathname]);

  // Close everything on navigation.
  useEffect(() => {
    setOpenId(null);
    setDrawerOpen(false);
  }, [pathname]);

  /* HOVER IS THE ONLY STATE. There used to be a second one: clicking a trigger "pinned"
     the panel, and a pinned panel then ignored hover on every other trigger until it was
     dismissed. So the same gesture did different things depending on invisible history —
     sometimes the menu followed the pointer, sometimes it refused to. One state now:
     pointing at a trigger opens it, pointing away closes it, and clicking is just a
     toggle with no memory. Keyboard opening still works through NavMenu's ArrowUp/Down,
     and focus still holds a panel open via the activeElement guard there. */
  /* `close` takes the id of the item ASKING to close. Sliding the pointer along the bar
     fires Partners' leave and Customers' enter back to back, and Partners' 120ms grace
     timer then lands AFTER Customers has already opened — an unconditional close would
     shut the panel the pointer had just arrived at, so moving across the nav flickered
     everything shut. Ignoring a close request from an item that is no longer the open one
     fixes it. Called with no argument it closes whatever is open, which is what Escape
     and a link click want. */
  const close = useCallback(
    (id?: string) => setOpenId((cur) => (id !== undefined && cur !== id ? cur : null)),
    [],
  );
  const open = useCallback((id: string) => setOpenId(id), []);

  /* ArrowLeft/ArrowRight move between top-level triggers. */
  const step = useCallback((id: string, dir: -1 | 1) => {
    const triggers = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>(".swh-nav__trigger, .swh-nav__link") ?? [],
    );
    const cur = triggers.findIndex((t) => t.id === `navtrig-${id}`);
    if (cur === -1 || triggers.length === 0) return;
    triggers[(cur + dir + triggers.length) % triggers.length].focus();
  }, []);

  return (
    <header className="swh-nav" data-nav-state={solid ? "solid" : "over"}>
      <div className="swh-nav__surface" />

      <nav className="swh-nav__inner" aria-label="Primary">
        <Link className="swh-nav__brand" href="/" aria-label={`${SITE.name} — home`}>
          {/* onAccent is a real BrandLogo prop: over the hero it whitens the mark and sets
              the wordmark to --paper; on the solid bar it swaps to the ink-S variant, which
              is the only version of the mark that survives a light background. No src prop
              here — BrandLogo owns both files. */}
          <BrandLogo variant="lockup" height={36} onAccent={!solid} />
        </Link>

        <ul className="swh-nav__list" ref={listRef}>
          {NAV.map((entry) =>
            isGroup(entry) ? (
              <NavMenu
                key={entry.label}
                id={idOf(entry.label)}
                group={entry}
                open={openId === idOf(entry.label)}
                pathname={pathname}
                onOpen={open}
                onClose={close}
                onStep={step}
              />
            ) : (
              <li className="swh-nav__item" key={entry.href}>
                <Link
                  className="swh-nav__link"
                  id={`navtrig-${idOf(entry.label)}`}
                  href={entry.href}
                  aria-current={pathname === entry.href ? "page" : undefined}
                  /* Arrow, not a bare `close`: the handler would pass the PointerEvent as
                     the id, and the guard would then never match. */
                  onPointerEnter={() => close()}
                >
                  {entry.label}
                </Link>
              </li>
            ),
          )}
        </ul>

        <div className="swh-nav__cluster">
          <BadgeSlot />
          <WhatsAppLink />
          <span className="swh-cta">
            <PillButton variant="primary" arrow href={SITE.demoHref}>
              Book a demo
            </PillButton>
          </span>
          <button
            type="button"
            className="swh-burger"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} pathname={pathname} />
    </header>
  );
}
