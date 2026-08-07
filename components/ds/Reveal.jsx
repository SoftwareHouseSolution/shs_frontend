"use client";
import React from "react";

/**
 * Reveal — the signature "rise + fade in on scroll, once" wrapper. Every
 * section, heading and card uses it. IntersectionObserver-driven; upward travel
 * only (9px default; the hero visual uses ~50px). Honours prefers-reduced-motion.
 */
export function Reveal({
  children,
  y = 9,
  duration = 0.6,
  delay = 0,
  as = "div",
  once = true,
  style,
  ...rest
}) {
  const Tag = as;
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            if (once) io.unobserve(e.target);
          } else if (!once) {
            setShown(false);
          }
        });
      },
      { rootMargin: "-10% 0px -10% 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
        willChange: "opacity, transform",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
