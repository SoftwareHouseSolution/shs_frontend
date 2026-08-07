"use client";

/* InfiniteSlider — a seamless, endless marquee.

   Same call signature as motion-primitives' component
   (https://motion-primitives.com/docs/infinite-slider) so the usage in the docs drops
   straight in, but the implementation is rewritten: the original ships as Tailwind
   classes driven by framer-motion, and this project has neither (see PRODUCT.md — plain
   CSS custom properties, no Tailwind, no CSS-in-JS). The dependency would have been two
   packages and a build-system change for one marquee.

   ── WHY IT NEVER SEAMS, STICKS, RESTARTS OR FLASHES ─────────────────────────────────

   1. NO SEAM. The children are rendered twice, each copy inside its own flex group. The
      track is [group][gap][group], so translating by exactly (groupWidth + gap) puts
      copy 2 where copy 1 was — pixel for pixel. Any other distance leaves a visible
      stutter at the wrap, which is the usual reason a marquee looks like it "ends".
      This is why the gap lives on BOTH the track and each group: the seam gap and the
      item gap have to be the same number or the loop is short by one gap.

   2. NO START AND NO END. `iterations: Infinity` with `easing: "linear"`. An eased
      marquee accelerates out of every wrap, which reads exactly like a restart.

   3. NO STICK ON HOVER. The speed change is `playbackRate`, not a new animation and not
      a changed duration. Re-timing a running CSS animation remaps elapsed time onto the
      new duration and the strip visibly jumps; playbackRate leaves the current position
      untouched and only changes how fast it advances from here. It is ramped over
      ~380ms rather than snapped, so hovering feels like the strip leaning rather than
      hitting a gear change.

   4. NO FLASH. Width is measured with a ResizeObserver instead of being guessed, so the
      duration is right from the first frame at whatever the images actually measure —
      no initial wrong-speed frame to correct. When the width does change (font swap,
      resize, a late image), the animation is rebuilt at the SAME PROGRESS rather than
      from zero.

   Reduced motion turns the whole thing into a plain horizontally scrollable row: the
   duplicate copy is dropped, nothing moves, and the content is still reachable. */

import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/components/chrome/useReducedMotion";

const RAMP_MS = 380;

type InfiniteSliderProps = {
  children: ReactNode;
  /** Gap between items, in px. Applied between the two copies as well — see note 1. */
  gap?: number;
  /** Travel speed in px per second. */
  speed?: number;
  /** Speed while the pointer is over the strip, in px per second. 0 pauses it. */
  speedOnHover?: number;
  /** Run right-to-left instead of left-to-right. */
  reverse?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Accessible name for the region. Omit only if an ancestor already labels it. */
  "aria-label"?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  speed = 60,
  speedOnHover,
  reverse = false,
  className,
  style,
  "aria-label": ariaLabel,
}: InfiniteSliderProps) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);
  const rampRef = useRef(0);

  const items = Children.toArray(children);

  /* Ramp playbackRate rather than assigning it, so a hover reads as the strip slowing
     down and not as a cut. Cubic ease-out matches Reveal's curve. */
  const rampTo = useCallback((target: number) => {
    cancelAnimationFrame(rampRef.current);
    const anim = animRef.current;
    if (!anim) return;
    const from = anim.playbackRate;
    if (Math.abs(from - target) < 0.001) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / RAMP_MS);
      anim.playbackRate = from + (target - from) * (1 - Math.pow(1 - t, 3));
      if (t < 1) rampRef.current = requestAnimationFrame(tick);
    };
    rampRef.current = requestAnimationFrame(tick);
  }, []);

  /* useLayoutEffect: the animation must exist before the browser paints, otherwise the
     first frame shows the strip parked at 0 and it visibly lurches into motion. */
  useLayoutEffect(() => {
    if (reduce) return;
    const track = trackRef.current;
    const group = groupRef.current;
    if (!track || !group || typeof track.animate !== "function") return;

    let cancelled = false;

    const build = () => {
      if (cancelled) return;
      const width = group.getBoundingClientRect().width;
      // Images not measured yet. The observer fires again once they are.
      if (width < 1) return;

      const distance = width + gap;
      const duration = (distance / Math.max(speed, 1)) * 1000;

      /* Carry progress across a rebuild. Without this, every resize — and every late
         image load — snaps the strip back to its starting offset. */
      const prev = animRef.current;
      const progress =
        prev && prev.effect
          ? ((prev.currentTime as number) ?? 0) /
            ((prev.effect.getTiming().duration as number) || duration)
          : 0;
      const rate = prev ? prev.playbackRate : 1;
      prev?.cancel();

      const from = reverse ? -distance : 0;
      const to = reverse ? 0 : -distance;
      const anim = track.animate(
        [{ transform: `translate3d(${from}px, 0, 0)` }, { transform: `translate3d(${to}px, 0, 0)` }],
        { duration, iterations: Infinity, easing: "linear" },
      );
      anim.currentTime = (progress % 1) * duration;
      anim.playbackRate = rate;
      animRef.current = anim;
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(group);

    return () => {
      cancelled = true;
      ro.disconnect();
      cancelAnimationFrame(rampRef.current);
      animRef.current?.cancel();
      animRef.current = null;
    };
  }, [reduce, gap, speed, reverse]);

  /* A marquee that keeps animating in a background tab burns battery for nobody. */
  useEffect(() => {
    if (reduce) return;
    const onVisibility = () => {
      const anim = animRef.current;
      if (!anim) return;
      if (document.hidden) anim.pause();
      else anim.play();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [reduce]);

  const hoverRate = speedOnHover != null ? speedOnHover / Math.max(speed, 1) : null;

  const hoverProps =
    hoverRate == null || reduce
      ? {}
      : {
          onPointerEnter: (e: React.PointerEvent) => {
            // Touch fires pointerenter on tap and never leaves — the strip would be stuck
            // at hover speed for the rest of the visit.
            if (e.pointerType !== "mouse") return;
            rampTo(hoverRate);
          },
          onPointerLeave: (e: React.PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            rampTo(1);
          },
        };

  return (
    <div
      className={className ? `swh-slider ${className}` : "swh-slider"}
      style={style}
      data-reduced={reduce ? "true" : undefined}
      role="group"
      aria-label={ariaLabel}
      {...hoverProps}
    >
      <div className="swh-slider__track" ref={trackRef} style={{ gap: `${gap}px` }}>
        <div className="swh-slider__group" ref={groupRef} style={{ gap: `${gap}px` }}>
          {items}
        </div>
        {/* The second copy is what makes the loop seamless. It is decorative repetition,
            so it is hidden from assistive tech and from the tab order — otherwise every
            logo is announced twice. */}
        {!reduce && (
          <div className="swh-slider__group" aria-hidden="true" style={{ gap: `${gap}px` }}>
            {items}
          </div>
        )}
      </div>
    </div>
  );
}
