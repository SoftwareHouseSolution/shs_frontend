"use client";

/* Full-bleed hero: a slow Ken Burns zoom on each slide, crossfading between slides.

   Two structural rules, both inherited from the device hero this sits above:
     - The FADING element and the ZOOMING element are never the same node. Opacity lives
       on .hero-slide, transform lives on the child <img>. Collapsing them breaks both.
     - The zoom is not restarted mid-fade. `enter` and `exit` declare an identical
       animation-name in CSS, so a slide that starts fading out keeps zooming and
       `forwards` holds the end scale. See app/chrome.css.

   Slide 1 is video, slides 2-4 are stills. The video carries no ken-burns of its own —
   see the .hero-slide__video note at the render site.

   Copy for slides 2-4 is SWH's own rotating hero messages from the legacy site, recorded
   in extract/impeccable_frontend_prd/product.md. Typos cleaned, meaning kept. Slide 1 is
   the client's newer hero copy from ui_ux/…/website start and end and numbers.docx. */

import { useCallback, useEffect, useRef, useState } from "react";
import { PillButton } from "@/components/ds/PillButton";
import { Eyebrow } from "@/components/ds/Eyebrow";
import { useReducedMotion } from "@/components/chrome/useReducedMotion";
import { SITE } from "@/content/site";

/** Must match --hero-hold in app/chrome.css. */
const HOLD_MS = 7000;

type Slide = {
  /** Photo slide: the still. Video slide: the poster frame. */
  image: string;
  /** Video slides only. WebM is listed first so browsers that support it skip the MP4. */
  video?: { webm: string; mp4: string };
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
};

const SLIDES: Slide[] = [
  {
    /* SWH's own product footage, not stock: an iMac running the SoftwareHouse sign-in
       screen. Copy is from the client's "website start and end and numbers.docx"; the
       one edit is "Jewelry" -> "jewellery", because the rest of the site is consistently
       British and mixed spelling in a single viewport reads as a mistake. */
    image: "/assets/video/hero-workstation-poster.jpg",
    video: { webm: "/assets/video/hero-workstation.webm", mp4: "/assets/video/hero-workstation.mp4" },
    eyebrow: "Gold & Diamond ERP",
    title: "Empowering the jewellery industry since 1988.",
    body: "For more than three decades we have built ERP systems that help gold and diamond businesses simplify operations, manage inventory with precision, and grow.",
    cta: { label: "Explore our solutions", href: "/solutions" },
  },
  {
    image: "/assets/imagery/slider_01.jpg",
    eyebrow: "Software Solutions Services",
    title: "Built for your maximum satisfaction.",
    body: "We endeavour to offer you the best solutions to achieve your maximum satisfaction.",
    cta: { label: "Explore solutions", href: "/solutions" },
  },
  {
    image: "/assets/imagery/slider_02.jpg",
    eyebrow: "Enterprise Resource Planning",
    title: "Effective software, delivered.",
    body: "We are the masters in offering effective software development solutions.",
    cta: { label: "See our services", href: "/services" },
  },
  {
    image: "/assets/imagery/slider_03.jpg",
    /* The legacy line ended "...and we prove it with our certifications". That clause is
       dropped until the certificates are documented — PRODUCT.md records them as
       unconfirmed, and the rest of the sentence carries the meaning without the claim. */
    eyebrow: "Gold & Diamond Solutions",
    title: "Credence, built on quality standards.",
    body: "Developing credence by ensuring quality standards across every jewellery segment.",
    /* "Contact us", not "Book a demo": demoHref is /#contact, the contact section on this
       same page, so the old label promised a booking flow that does not exist. The nav and
       the drawer keep "Book a demo" — a persistent CTA can afford to name the outcome,
       whereas this one sits directly above the form it scrolls to. */
    cta: { label: "Contact us", href: SITE.demoHref },
  },
];

export function HeroCarousel() {
  /* index and prev live in one state object so the updater stays pure — calling a second
     setter from inside an updater would fire twice under StrictMode. */
  const [{ index, prev }, setSlide] = useState({ index: 0, prev: -1 });
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false); // pointer or focus inside, or tab hidden
  const [userControlled, setUserControlled] = useState(false);
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const goTo = useCallback((next: number) => {
    setSlide((s) => {
      const target = ((next % SLIDES.length) + SLIDES.length) % SLIDES.length;
      return target === s.index ? s : { index: target, prev: s.index };
    });
  }, []);

  /* setTimeout keyed on `index`, not setInterval: a manual advance restarts the clock
     instead of racing a fixed-phase interval. */
  useEffect(() => {
    if (reduce || paused || held) return;
    const t = setTimeout(() => goTo(index + 1), HOLD_MS);
    return () => clearTimeout(t);
  }, [index, reduce, paused, held, goTo]);

  /* Playback is driven from here rather than from an `autoPlay` attribute. autoPlay would
     start the video during SSR hydration, before useReducedMotion has reported — so a
     reduced-motion visitor would see a frame or two of movement before it was corrected.
     With no autoPlay the poster holds until this effect decides.

     The pause button owns the video too. It is the WCAG 2.2.2 control for this region, so
     stopping "the slideshow" while footage keeps playing behind the copy would be a lie. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    /* The media query is read here rather than trusted from `reduce`. useReducedMotion
       returns false on the first client render by design (it avoids a hydration
       mismatch), so on that pass this effect would call play() and the correction would
       only land on the next render — about four milliseconds of footage that a
       reduced-motion visitor asked not to see. `reduce` stays in the dep array so a
       visitor toggling the OS setting still re-runs this. */
    const reduceNow =
      reduce || (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    const wanted = SLIDES[index]?.video !== undefined && !reduceNow && !paused;
    if (wanted) {
      /* Autoplay can still be refused (a muted inline video rarely is). Swallowing the
         rejection leaves the poster up, which is the correct fallback anyway. */
      void v.play().catch(() => {});
    } else {
      v.pause();
      /* Rewind only for reduced motion. Pausing via the toggle should resume where it
         stopped; a reduced-motion visitor should be left on the poster frame exactly. */
      if (reduceNow) v.currentTime = 0;
    }
  }, [index, reduce, paused]);

  /* Pause while the tab is hidden so a backgrounded page does not burn through slides. */
  useEffect(() => {
    const onVis = () => setHeld(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setUserControlled(true);
      goTo(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setUserControlled(true);
      goTo(index - 1);
    }
  };

  const active = SLIDES[index];
  const autoRotating = !reduce && !paused && !userControlled;

  return (
    <section
      ref={rootRef}
      className="hero-carousel"
      data-nav-hero=""
      role="group"
      aria-roledescription="carousel"
      aria-label="Featured"
      onKeyDown={onKeyDown}
      /* NO pointer hold. It used to stop the slideshow whenever the pointer was anywhere
         over the hero, which on a 100svh hero is most of the time a visitor spends near
         the top of the page — so it looked broken, not considerate. WCAG 2.2.2 is
         satisfied by the explicit pause button below, not by hover.

         Focus still holds: a keyboard user tabbing to a slide's CTA must not have the
         slide, and therefore that CTA's destination, change underneath them. */
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHeld(false);
      }}
    >
      {/* Decorative. The slide copy below is real DOM text, so the images carry no meaning. */}
      <div className="hero-carousel__stage" aria-hidden="true">
        {SLIDES.map((s, i) => (
          <div
            key={s.image}
            className="hero-slide"
            data-state={i === index ? "enter" : i === prev ? "exit" : "idle"}
          >
            {s.video ? (
              /* .hero-slide__video, not __img: the footage already has its own camera
                 move, so it must not also carry swh-hero-zoom. That rule is scoped to
                 .hero-slide__img, so the distinct class is what keeps them apart. */
              <video
                ref={videoRef}
                className="hero-slide__video"
                poster={s.image}
                muted
                loop
                playsInline
                preload="auto"
              >
                <source src={s.video.webm} type="video/webm" />
                <source src={s.video.mp4} type="video/mp4" />
              </video>
            ) : (
              <img
                className="hero-slide__img"
                src={s.image}
                alt=""
                decoding="async"
              />
            )}
          </div>
        ))}
      </div>

      <div className="hero-carousel__scrim" aria-hidden="true" />

      <div className="hero-carousel__content">
        {/* aria-live is off while the carousel rotates on its own and polite once the
            user takes control — announcing unrequested changes is noise. */}
        <div aria-live={autoRotating ? "off" : "polite"} aria-atomic="true">
          {/* key remounts the block so the entry animation replays per slide. */}
          <div className="hero-carousel__copy" key={index}>
            {/* `color` rather than a className: Eyebrow's shipped .d.ts declares only
                children/color/style, and design-system files are never edited. */}
            <Eyebrow color="rgba(250,250,248,.82)">{active.eyebrow}</Eyebrow>
            <h1 className="hero-carousel__title">{active.title}</h1>
            <p className="hero-carousel__body">{active.body}</p>
            <div className="hero-carousel__actions">
              <PillButton variant="primary" arrow href={active.cta.href}>
                {active.cta.label}
              </PillButton>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-carousel__ui">
        {/* WCAG 2.2.2: content that auto-updates past 5s needs an explicit control.
            Pausing on hover and focus does not satisfy it. */}
        <button
          type="button"
          className="hero-carousel__toggle"
          onClick={() => {
            setPaused((p) => !p);
            setUserControlled(true);
          }}
          aria-label={paused ? "Play slideshow" : "Pause slideshow"}
        >
          {paused ? (
            <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
              <path d="M2 1l9 5-9 5z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
              <rect x="2" y="1" width="3" height="10" fill="currentColor" />
              <rect x="7" y="1" width="3" height="10" fill="currentColor" />
            </svg>
          )}
        </button>
        {/* data-running drives the fill's animation-play-state, so the bar visibly stops
            with the slideshow rather than continuing to run against a frozen slide. */}
        <div className="hero-carousel__dots" data-running={!reduce && !paused && !held}>
          {SLIDES.map((s, i) => (
            <button
              key={s.image}
              type="button"
              className="hero-carousel__dot"
              aria-current={i === index}
              aria-label={`Show slide ${i + 1} of ${SLIDES.length}`}
              onClick={() => {
                setUserControlled(true);
                goTo(i);
              }}
            >
              {/* The fill is a child rather than a ::after so the animation is guaranteed
                  to restart on every advance: React keys it by `index`, so the element is
                  genuinely new each time and cannot inherit a half-finished run — which is
                  what happens when a four-slide loop returns to a dot it has already
                  filled. Only the active dot has one. */}
              {i === index && <span key={index} className="hero-carousel__dot-fill" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
