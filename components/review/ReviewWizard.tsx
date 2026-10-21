"use client";

/* The client review page: three short steps, then the review is saved in the CMS.

     1. who you are   — name, shop, governorate, area, optional photo
     2. four answers  — tapped chips, plus anything in their own words (typed or spoken)
     3. the review    — drafted from the answers (content/review.ts), editable, re-draftable

   "Send" posts everything to /api/v1/reviews/, where it lands in Admin → Client reviews.
   Only after it is stored is the client offered to also post it on Facebook (the post is
   Site settings → "Facebook post for reviews"; empty hides the offer).

   As in the contact form, validation is the server's: per-field messages come back in the
   page's language and the wizard returns to the earliest step that needs fixing. */

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { PillButton, type PillButtonProps } from "@/components/ds/PillButton";
import type { Locale } from "@/content/i18n";
import {
  ABROAD,
  BENEFITS,
  DURATIONS,
  GOVERNORATES,
  RATINGS,
  REVIEW_COPY,
  draftReviews,
  type Benefit,
  type Duration,
  type Rating,
} from "@/content/review";
import { ApiCode, ApiResponseError, ApiValidationError, type FieldErrors } from "@/lib/api/envelope";
import { submitReview } from "@/lib/api/reviews";

/* PillButton.d.ts declares no `type`/`disabled`; widened at the call site, as in EnquiryForm. */
const Button = PillButton as React.ComponentType<
  PillButtonProps & Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled">
>;

type Step = 1 | 2 | 3;
const OTHER = "__other__";
const STEP_OF_FIELD: Record<string, Step> = {
  author_name: 1, shop_name: 1, governorate: 1, area: 1, photo: 1,
  duration: 2, support: 2, updates: 2, benefits: 2, comment: 2,
  text: 3,
};
const PHOTO_MAX_SIDE = 1600;

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; message: string; reference: string }
  | { kind: "error"; message: string };

export function ReviewWizard({ lang, shareUrl }: { lang: Locale; shareUrl: string }) {
  const t = REVIEW_COPY[lang];
  const id = useId();
  const topRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [shop, setShop] = useState("");
  const [gov, setGov] = useState("");
  const [areaChoice, setAreaChoice] = useState("");
  const [areaOther, setAreaOther] = useState("");
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [duration, setDuration] = useState<Duration | null>(null);
  const [support, setSupport] = useState<Rating | null>(null);
  const [updates, setUpdates] = useState<Rating | null>(null);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [extra, setExtra] = useState("");
  const [drafts, setDrafts] = useState<string[]>([]);
  const [draftIndex, setDraftIndex] = useState(0);
  const [text, setText] = useState("");
  const [stepError, setStepError] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [toast, setToast] = useState("");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const governorate = GOVERNORATES.find((g) => g.ar === gov);
  const abroad = gov === ABROAD;
  /* English areas are typed: the area list exists in Arabic only. */
  const typedArea = abroad || lang === "en" || areaChoice === OTHER;
  const area = typedArea ? areaOther.trim() : areaChoice;
  const place = abroad ? area : area && area !== gov ? (lang === "ar" ? `${area}، ${gov}` : `${area}, ${governorate?.en ?? gov}`) : lang === "ar" ? gov : governorate?.en ?? gov;

  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl); }, [photoUrl]);

  /* A step's "fill these in" message goes as soon as the client starts fixing it. */
  useEffect(() => setStepError(""), [name, shop, gov, areaChoice, areaOther, duration, support, updates, benefits]);

  /* The draft box grows with the review, so the whole text is visible while editing. */
  useLayoutEffect(() => {
    const el = draftRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [text, step]);

  function go(next: Step) {
    setStep(next);
    setStepError("");
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const small = await shrink(file);
    setPhoto(small);
    setPhotoUrl(URL.createObjectURL(small));
  }

  function toStep2() {
    if (!name.trim() || !shop.trim() || !gov || !area) return setStepError(t.step1Error);
    go(2);
  }

  function toStep3() {
    if (!duration || !support || !updates || benefits.length === 0) return setStepError(t.step2Error);
    redraft(0);
    go(3);
  }

  function redraft(index: number) {
    if (!duration || !support || !updates) return;
    const fresh =
      index === 0 || drafts.length === 0
        ? draftReviews(lang, { name: name.trim(), shop: shop.trim(), place, duration, support, updates, benefits, extra: extra.trim() })
        : drafts;
    setDrafts(fresh);
    setDraftIndex(index);
    setText(fresh[index]);
  }

  function toggleBenefit(b: Benefit) {
    setBenefits((current) => (current.includes(b) ? current.filter((x) => x !== b) : [...current, b]));
  }

  async function send() {
    if (status.kind === "sending" || !duration || !support || !updates) return;
    setStatus({ kind: "sending" });
    setErrors({});
    try {
      const res = await submitReview(lang, {
        author_name: name.trim(),
        shop_name: shop.trim(),
        governorate: gov,
        area,
        duration,
        support,
        updates,
        benefits,
        comment: extra.trim(),
        text: text.trim(),
        source: new URLSearchParams(window.location.search).get("src") ?? "",
        website: (document.getElementById(`${id}-website`) as HTMLInputElement | null)?.value ?? "",
        photo,
      });
      setStatus({ kind: "sent", message: res.message, reference: res.data?.reference ?? "" });
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setErrors(err.fieldErrors);
        const first = Math.min(...Object.keys(err.fieldErrors).map((f) => STEP_OF_FIELD[f] ?? 3)) as Step;
        if (first !== step) go(first);
        setStatus({ kind: "error", message: t.fixErrors });
      } else if (err instanceof ApiResponseError) {
        const expected = err.code === ApiCode.DUPLICATE_REVIEW || err.code === ApiCode.RATE_LIMIT_EXCEEDED;
        setStatus({ kind: "error", message: expected || err.status < 500 ? err.message : t.serverError });
      } else {
        setStatus({ kind: "error", message: t.networkError });
      }
    }
  }

  async function share() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = false;
    }
    setToast(ok ? t.copied : t.copyFailed);
    window.setTimeout(() => setToast(""), 4000);
  }

  const fieldError = (field: string) =>
    errors[field] ? <p className="swh-review__error">{errors[field].join(" ")}</p> : null;

  /* ── After sending ─────────────────────────────────────────────────────────────── */
  if (status.kind === "sent") {
    return (
      <div className="swh-review" ref={topRef}>
        <section className="swh-review__card swh-review__card--done" role="status">
          <span className="swh-review__done-mark" aria-hidden="true">✓</span>
          <h2 className="swh-review__h">{t.thanksTitle}</h2>
          <p className="swh-review__lede">{status.message}</p>
          {status.reference ? <p className="swh-review__ref">{t.reference(status.reference)}</p> : null}
        </section>
        {shareUrl ? (
          <section className="swh-review__card">
            <h2 className="swh-review__h">{t.shareTitle}</h2>
            <p className="swh-review__hint">{t.shareBody}</p>
            <a className="swh-review__share" href={shareUrl} target="_blank" rel="noopener" onClick={share}>
              {t.shareButton}
            </a>
          </section>
        ) : null}
        {toast ? <div className="swh-review__toast" role="status">{toast}</div> : null}
      </div>
    );
  }

  const sending = status.kind === "sending";
  return (
    <div className="swh-review" ref={topRef}>
      <ol className="swh-review__steps" aria-hidden="true">
        {[1, 2, 3].map((n) => <li key={n} className={n <= step ? "is-on" : undefined} />)}
      </ol>

      {/* ── Step 1 ─────────────────────────────────────────────────────────────── */}
      {step === 1 ? (
        <section className="swh-review__card" aria-labelledby={`${id}-s1`}>
          <p className="swh-review__step">{t.stepOf(1)}</p>
          <h2 className="swh-review__h" id={`${id}-s1`}>{t.aboutYou}</h2>

          <div className="swh-review__field">
            <label htmlFor={`${id}-name`}>{t.name}</label>
            <input id={`${id}-name`} className="swh-review__input" value={name} onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder} autoComplete="name" maxLength={120} aria-invalid={errors.author_name ? true : undefined} />
            {fieldError("author_name")}
          </div>
          <div className="swh-review__field">
            <label htmlFor={`${id}-shop`}>{t.shop}</label>
            <input id={`${id}-shop`} className="swh-review__input" value={shop} onChange={(e) => setShop(e.target.value)}
              placeholder={t.shopPlaceholder} autoComplete="organization" maxLength={160} aria-invalid={errors.shop_name ? true : undefined} />
            {fieldError("shop_name")}
          </div>
          <div className="swh-review__field">
            <label htmlFor={`${id}-gov`}>{t.governorate}</label>
            <select id={`${id}-gov`} className="swh-review__input" value={gov}
              onChange={(e) => { setGov(e.target.value); setAreaChoice(""); setAreaOther(""); }}>
              <option value="">{t.chooseGovernorate}</option>
              {GOVERNORATES.map((g) => <option key={g.ar} value={g.ar}>{lang === "ar" ? g.ar : g.en}</option>)}
            </select>
            {fieldError("governorate")}
          </div>
          <div className="swh-review__field">
            <label htmlFor={`${id}-area`}>{t.area}</label>
            {lang === "ar" && !abroad ? (
              <select id={`${id}-area`} className="swh-review__input" value={areaChoice} disabled={!gov}
                onChange={(e) => setAreaChoice(e.target.value)}>
                <option value="">{gov ? t.chooseArea : t.chooseGovernorateFirst}</option>
                {governorate?.areas.map((a) => <option key={a} value={a}>{a}</option>)}
                {gov ? <option value={OTHER}>{t.otherArea}</option> : null}
              </select>
            ) : null}
            {typedArea && gov ? (
              <input id={lang === "ar" && !abroad ? `${id}-area-other` : `${id}-area`} className="swh-review__input" value={areaOther}
                onChange={(e) => setAreaOther(e.target.value)} maxLength={120}
                placeholder={abroad ? t.areaPlaceholderAbroad : t.areaPlaceholder} aria-label={abroad ? t.otherAreaAbroad : t.area} />
            ) : null}
            {lang === "en" && !gov ? <input className="swh-review__input" disabled placeholder={t.chooseGovernorateFirst} aria-label={t.area} /> : null}
            {fieldError("area")}
          </div>
          <div className="swh-review__field">
            <label htmlFor={`${id}-photo`}>
              {t.photo} <span className="swh-review__optional">({t.optional})</span>
            </label>
            <div className="swh-review__photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {photoUrl ? <img src={photoUrl} alt="" /> : null}
              <input id={`${id}-photo`} type="file" accept="image/*" onChange={onPhoto} />
            </div>
            {fieldError("photo")}
          </div>

          {stepError ? <p className="swh-review__error" role="alert">{stepError}</p> : null}
          <Button variant="primary" arrow type="button" onClick={toStep2}>{t.next}</Button>
        </section>
      ) : null}

      {/* ── Step 2 ─────────────────────────────────────────────────────────────── */}
      {step === 2 ? (
        <section className="swh-review__card" aria-labelledby={`${id}-s2`}>
          <p className="swh-review__step">{t.stepOf(2)}</p>
          <h2 className="swh-review__h" id={`${id}-s2`}>{t.questions}</h2>

          <Chips label={t.qDuration} labelId={`${id}-q1`} options={DURATIONS} selected={duration ? [duration] : []}
            text={(d) => t.durations[d]} onPick={(d) => setDuration(d)} />
          <Chips label={t.qSupport} labelId={`${id}-q2`} options={RATINGS} selected={support ? [support] : []}
            text={(r) => t.support[r]} onPick={(r) => setSupport(r)} />
          <Chips label={t.qUpdates} labelId={`${id}-q3`} options={RATINGS} selected={updates ? [updates] : []}
            text={(r) => t.updates[r]} onPick={(r) => setUpdates(r)} />
          <Chips label={t.qBenefits} hint={t.pickSeveral} labelId={`${id}-q4`} options={BENEFITS} selected={benefits}
            text={(b) => t.benefits[b]} onPick={toggleBenefit} />
          {fieldError("benefits")}

          <div className="swh-review__field">
            <label htmlFor={`${id}-extra`}>
              {t.qExtra} <span className="swh-review__optional">({t.optional})</span>
            </label>
            <Dictation lang={lang} value={extra} onChange={setExtra} />
            <textarea id={`${id}-extra`} className="swh-review__input" rows={3} maxLength={2000} value={extra}
              onChange={(e) => setExtra(e.target.value)} placeholder={t.extraPlaceholder} />
            {fieldError("comment")}
          </div>

          {stepError ? <p className="swh-review__error" role="alert">{stepError}</p> : null}
          <div className="swh-review__row">
            <Button variant="secondary" type="button" onClick={() => go(1)}>{t.back}</Button>
            <Button variant="primary" arrow type="button" onClick={toStep3}>{t.writeIt}</Button>
          </div>
        </section>
      ) : null}

      {/* ── Step 3 ─────────────────────────────────────────────────────────────── */}
      {step === 3 ? (
        <section className="swh-review__card" aria-labelledby={`${id}-s3`}>
          <p className="swh-review__step">{t.stepOf(3)}</p>
          <h2 className="swh-review__h" id={`${id}-s3`}>{t.yourReview}</h2>
          <p className="swh-review__hint">{t.editHint}</p>

          <div className="swh-review__draft">
            <textarea ref={draftRef} className="swh-review__input" rows={8} maxLength={4000} value={text} aria-label={t.yourReview}
              aria-invalid={errors.text ? true : undefined} onChange={(e) => setText(e.target.value)} />
          </div>
          {fieldError("text")}
          <div className="swh-review__who">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {photoUrl ? <img src={photoUrl} alt="" /> : null}
            <span>{name.trim()} · {shop.trim()} · {place}</span>
          </div>
          <button type="button" className="swh-review__link" onClick={() => redraft((draftIndex + 1) % 3)}>{t.rewrite}</button>

          {/* Honeypot. Off-screen, unfocusable, unannounced. */}
          <div className="swh-vh" aria-hidden="true">
            <label>Website<input id={`${id}-website`} type="text" tabIndex={-1} autoComplete="off" /></label>
          </div>

          <div className="swh-review__row">
            <Button variant="secondary" type="button" onClick={() => go(2)} disabled={sending}>{t.backToQuestions}</Button>
            <Button variant="primary" arrow type="button" onClick={send} disabled={sending || !hydrated || text.trim().length < 20}>
              {sending ? t.sending : t.send}
            </Button>
          </div>
        </section>
      ) : null}

      <p className="swh-review__status" role={status.kind === "error" ? "alert" : undefined} aria-live="polite">
        {status.kind === "error" ? status.message : ""}
      </p>
    </div>
  );
}

/* ── Pieces ──────────────────────────────────────────────────────────────────────── */

function Chips<T extends string>({
  label, hint, labelId, options, selected, text, onPick,
}: {
  label: string;
  hint?: string;
  labelId: string;
  options: T[];
  selected: T[];
  text: (option: T) => string;
  onPick: (option: T) => void;
}) {
  return (
    <div className="swh-review__q" role="group" aria-labelledby={labelId}>
      <p className="swh-review__qlabel" id={labelId}>
        {label} {hint ? <span className="swh-review__optional">({hint})</span> : null}
      </p>
      <div className="swh-review__chips">
        {options.map((o) => (
          <button key={o} type="button" className="swh-review__chip" aria-pressed={selected.includes(o)} onClick={() => onPick(o)}>
            {text(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Speech-to-text into the "own words" box, where the browser supports it (Chrome on
   Android does; most iPhones do not, and the button says so). */
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function Dictation({ lang, value, onChange }: { lang: Locale; value: string; onChange: (v: string) => void }) {
  const t = REVIEW_COPY[lang];
  const rec = useRef<Recognition | null>(null);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState(t.micHint);

  useEffect(() => () => rec.current?.stop(), []);

  function toggle() {
    if (listening) return rec.current?.stop();
    const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return setMessage(t.micUnsupported);
    const r = new Ctor();
    r.lang = lang === "ar" ? "ar-EG" : "en-US";
    r.continuous = true;
    r.interimResults = true;
    const base = value.trim();
    r.onresult = (e) => {
      let heard = "";
      for (let i = 0; i < e.results.length; i++) heard += e.results[i][0].transcript + (e.results[i].isFinal ? " " : "");
      onChange(`${base ? `${base} ` : ""}${heard.trim()}`);
    };
    r.onerror = (e) => {
      setListening(false);
      setMessage(e.error === "not-allowed" || e.error === "service-not-allowed" ? t.micDenied : e.error === "no-speech" ? t.micNoSpeech : t.micHint);
    };
    r.onend = () => {
      setListening((was) => {
        if (was) setMessage(t.micDone);
        return false;
      });
    };
    rec.current = r;
    try {
      r.start();
      setListening(true);
      setMessage(t.micListening);
    } catch {
      setMessage(t.micHint);
    }
  }

  return (
    <>
      <button type="button" className={`swh-review__mic${listening ? " is-live" : ""}`} onClick={toggle} aria-pressed={listening}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </svg>
        {listening ? t.micListening : t.micStart}
      </button>
      <p className="swh-review__hint" aria-live="polite">{message}</p>
    </>
  );
}

/** Phone photos are often 4–12 MB; the server accepts 8. Re-encode at most 1600px on the
    long side as JPEG — a few hundred KB — and fall back to the original if the browser
    cannot decode it. */
async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}
