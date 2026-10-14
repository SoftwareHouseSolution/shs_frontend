"use client";

/* The customer-page welcome video.

   Opens on its own a beat after the page paints, plays muted — the only autoplay every
   browser allows — and offers sound as a single tap. Esc, the scrim, the close button,
   the focus trap and the scroll lock all mirror NavDrawer, which is this app's other
   modal surface; the scrollbar-compensation trick is copied from it verbatim and for the
   same reason (locking body scroll removes the scrollbar, which would shift the fixed
   navbar left by its width).

   TWO SOURCES, NOT ONE. IMG_7784 is a 2560x1440 landscape cut; IMG_7785_Mobile is a
   1440x2560 portrait recut of the same 29 seconds. They are different framings, so
   neither can stand in for the other: the landscape file letterboxed into a phone leaves
   two thirds of the screen black. The choice is made ONCE, at open time, and never
   re-evaluated — swapping `src` mid-playback restarts the video, and <source media="...">
   is only read when the element first loads, so it cannot do this job either.

   The one knob is OPEN_ONCE_PER_SESSION below. */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/components/chrome/useFocusTrap";
import { UI } from "@/content/ui";
import type { Locale } from "@/content/i18n";
import type { PageVideo } from "@/lib/api/types";

/* false — the popup opens on every visit to /customers.
   true  — it opens only the first time per browser tab (sessionStorage). */
const OPEN_ONCE_PER_SESSION = false;
const SESSION_KEY = "swh:customers-video-seen";

/* Upload web encodes, not camera masters — tools/encode-video.mjs produces them
   (`pnpm encode:video`). Posters are frame 0 of each, so the panel opens on the image
   rather than on black. */

/* The phone edge. Mirrored nowhere else, so it lives here rather than in chrome.css. */
const MOBILE_MQ = "(max-width: 767px)";

const OPEN_DELAY = 550; // let the page header paint first — the popup should arrive, not ambush
const EXIT_MS = 260; // must match the exit transition in chrome.css
const UI_IDLE_MS = 2800;

const fmt = (s: number) => {
  const n = Number.isFinite(s) && s > 0 ? s : 0;
  return `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;
};

/* The files are the Customers page's intro video in the CMS (Pages → Customers → Intro
   video). The portrait cut and both posters are optional; the landscape file is not. */
export function CustomerVideoModal({ lang, video }: { lang: Locale; video: PageVideo }) {
  const DESKTOP_SRC = video.desktop;
  const MOBILE_SRC = video.mobile ?? video.desktop;
  const DESKTOP_POSTER = video.posterDesktop ?? undefined;
  const MOBILE_POSTER = video.posterMobile ?? video.posterDesktop ?? undefined;
  const ui = UI[lang];
  const [mounted, setMounted] = useState(false); // in the DOM at all
  const [open, setOpen] = useState(false); // drives the enter/exit transition
  const [portrait, setPortrait] = useState(false);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [waiting, setWaiting] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [uiVisible, setUiVisible] = useState(true);

  const panelRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusTrap(panelRef, mounted);

  /* ── Open ──────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (OPEN_ONCE_PER_SESSION) {
      try {
        if (sessionStorage.getItem(SESSION_KEY)) return;
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* Private mode or blocked storage — show it rather than swallow it. */
      }
    }

    // Read the viewport once, here, rather than on every resize. See the header note.
    setPortrait(window.matchMedia(MOBILE_MQ).matches);

    const t = setTimeout(() => {
      setMounted(true);
      // One painted frame at data-open="false" so the entrance has a state to leave.
      requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
    }, OPEN_DELAY);
    return () => clearTimeout(t);
  }, []);

  /* ── Close ─────────────────────────────────────────────────────────────────────── */
  const close = useCallback(() => {
    setOpen(false);
    videoRef.current?.pause();
    if (exitTimer.current) clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => setMounted(false), EXIT_MS);
  }, []);

  useEffect(
    () => () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    },
    [],
  );

  /* ── Esc + scroll lock, lifted from NavDrawer ──────────────────────────────────── */
  useEffect(() => {
    if (!mounted) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    document.documentElement.style.setProperty("--swh-lock-pad", `${scrollbar}px`);
    /* The END side, not the right: the scrollbar sits on the LEFT in Arabic, so padding
       the right there pads the wrong edge and the page jumps sideways as the modal opens.
       NavDrawer does the same thing for the same reason. */
    body.style.paddingInlineEnd = `${scrollbar}px`;

    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingInlineEnd = "";
      document.documentElement.style.setProperty("--swh-lock-pad", "0px");
    };
  }, [mounted, close]);

  /* ── Autoplay ──────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!mounted) return;
    const v = videoRef.current;
    if (!v) return;
    /* React writes `muted` as an ATTRIBUTE, which the browser reads only once. The
       property is what actually governs playback, so it is set here and in toggleSound. */
    v.muted = true;
    v.play().catch(() => {
      /* A policy or a data-saver setting refused. The centre play button is the fallback. */
      setPlaying(false);
    });
  }, [mounted]);

  /* ── Controls auto-hide ────────────────────────────────────────────────────────── */
  const wakeUi = useCallback(() => {
    setUiVisible(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setUiVisible(false);
    }, UI_IDLE_MS);
  }, []);

  useEffect(() => {
    if (mounted) wakeUi();
  }, [mounted, wakeUi]);

  /* ── Video actions ─────────────────────────────────────────────────────────────── */
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
    wakeUi();
  };

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setMuted(next);
    // Unmuting is a user gesture, so it is also the moment a blocked autoplay can start.
    if (!next && v.paused) v.play().catch(() => {});
    wakeUi();
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const to = Number(e.target.value);
    v.currentTime = to;
    setTime(to);
    wakeUi();
  };

  if (!mounted) return null;

  const pct = duration > 0 ? (time / duration) * 100 : 0;

  /* PORTAL, not a plain render. .page-content is `position:relative; z-index:1`
     (prototype.css), which makes it a stacking context — and .swh-nav is its SIBLING at
     z-index 10000. Left in place, no z-index this component can name would lift it above
     the navbar, and on phones the burger sat directly on top of the close button and
     swallowed the tap. Rendering into <body> puts the modal in the root stacking context,
     where its z-index actually means what it says. */
  return createPortal(
    <div className="swh-vmodal" data-open={open}>
      <div className="swh-vmodal__scrim" onClick={close} aria-hidden="true" />

      <div className="swh-vmodal__stage">
        <div
          ref={panelRef}
          className="swh-vmodal__panel"
          data-orient={portrait ? "portrait" : "landscape"}
          /* Paused means the viewer is reading the controls, so they never fade then. */
          data-ui={uiVisible || !playing}
          role="dialog"
          aria-modal="true"
          aria-label={ui.videoDialogAria}
          onPointerMove={wakeUi}
          onFocus={wakeUi}
        >
          <video
            ref={videoRef}
            className="swh-vmodal__video"
            src={portrait ? MOBILE_SRC : DESKTOP_SRC}
            poster={portrait ? MOBILE_POSTER : DESKTOP_POSTER}
            playsInline
            muted
            loop
            preload="auto"
            onClick={togglePlay}
            onPlay={() => {
              setPlaying(true);
              wakeUi();
            }}
            onPause={() => {
              setPlaying(false);
              setUiVisible(true);
            }}
            onWaiting={() => setWaiting(true)}
            onPlaying={() => setWaiting(false)}
            onCanPlay={() => setWaiting(false)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          />

          {waiting && <div className="swh-vmodal__spinner" aria-hidden="true" />}

          {/* Shown only when playback is actually stopped — normally that means autoplay
              was refused, and the bar's small play button would be too quiet an answer. */}
          {!playing && !waiting && (
            <button
              type="button"
              className="swh-vmodal__big-play"
              onClick={togglePlay}
              aria-label={ui.playVideo}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
              </svg>
            </button>
          )}

          {/* The most important control here: muted autoplay is the default, so the way
              back to sound has to be obvious rather than discoverable. */}
          {muted && (
            <button type="button" className="swh-vmodal__sound-nudge" onClick={toggleSound}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4zM16 9.5a4 4 0 0 1 0 5M18.5 7a7.5 7.5 0 0 1 0 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              {ui.tapForSound}
            </button>
          )}

          <button
            type="button"
            className="swh-vmodal__close"
            onClick={close}
            aria-label={ui.closeVideo}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* dir="ltr", ALWAYS — this bar does not mirror in Arabic.

              A transport bar measures TIME, not text. Left to inherit the page direction it
              came out genuinely broken rather than merely unfamiliar: the range input's
              thumb travelled right-to-left while its track gradient, which is a physical
              `to right`, kept filling left-to-right — so the played portion and the play
              head sat at opposite ends of the bar and moved away from each other. The time
              label reversed too, reading "0:28 / 0:06" with the duration first.

              Forcing the direction here fixes all of it at once — flex order, the input's
              travel, and the bidi run in the label — and matches what an Arabic speaker
              already uses every day: YouTube, Netflix and Vimeo all keep the timeline
              left-to-right in their RTL interfaces. Same reasoning as the play triangle,
              which app/rtl.css also declines to mirror.

              `lang` is deliberately NOT overridden: the content is still Arabic, and the
              aria-labels on these controls must still be announced as Arabic. Only the
              layout direction is pinned. */}
          <div className="swh-vmodal__bar" dir="ltr">
            <button
              type="button"
              className="swh-vmodal__btn"
              onClick={togglePlay}
              aria-label={playing ? ui.pause : ui.play}
            >
              {playing ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M8 5.5h3v13H8zM13 5.5h3v13h-3z" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                </svg>
              )}
            </button>

            <input
              className="swh-vmodal__seek"
              style={{ "--vm-pct": `${pct}%` } as React.CSSProperties}
              type="range"
              min={0}
              max={duration || 0}
              step="any"
              value={time}
              onChange={seek}
              aria-label={ui.seek}
              aria-valuetext={ui.videoPosition(fmt(time), fmt(duration))}
            />

            <span className="swh-vmodal__time">
              {fmt(time)} <i>/</i> {fmt(duration)}
            </span>

            <button
              type="button"
              className="swh-vmodal__btn"
              onClick={toggleSound}
              aria-label={muted ? ui.unmute : ui.mute}
            >
              {muted ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4zM16 9.5l5 5M21 9.5l-5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4zM16 9.5a4 4 0 0 1 0 5M18.5 7a7.5 7.5 0 0 1 0 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
