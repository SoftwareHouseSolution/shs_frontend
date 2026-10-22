"use client";

/* The client review page: three short steps, then the review is saved in the CMS.

     1. about you     — name, shop, governorate, area, optional photo
     2. experience    — four tapped answers, three optional ones that make the review sound
                        like this client, and anything in their own words (typed or spoken)
     3. the review    — written FROM those answers, editable, re-writable in three styles

   DRAFTING. The page first asks the API (POST reviews/draft/), where Claude writes the review
   in this client's voice from their answers and own words. When that is not available — no
   key configured, offline, rate-limited — it drafts locally (content/reviewDrafts.ts) and
   stops asking for the rest of the visit. Either way "write it another way" never repeats
   the previous draft: the API is told what to avoid, the local engine changes its angle.

   "Send" posts everything to /api/v1/reviews/, where it lands in Admin → Client reviews.
   Only after it is stored is the client offered to also post it on Facebook (Site settings
   → "Facebook post for reviews"; empty hides the offer).

   As in the contact form, validation is the server's: per-field messages come back in the
   page's language and the wizard returns to the earliest step that needs fixing. */

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { PillButton, type PillButtonProps } from "@/components/ds/PillButton";
import { useReducedMotion } from "@/components/chrome/useReducedMotion";
import type { Locale } from "@/content/i18n";
import {
  ABROAD,
  BENEFITS,
  BRANCH_COUNTS,
  BUSINESS_TYPES,
  DRAFT_STYLES,
  DURATIONS,
  GOVERNORATES,
  PREVIOUS_SYSTEMS,
  RATINGS,
  REVIEW_COPY,
  type Benefit,
  type Branches,
  type BusinessType,
  type DraftStyle,
  type Duration,
  type PreviousSystem,
  type Rating,
} from "@/content/review";
import { draftReview, type Draft } from "@/content/reviewDrafts";
import { ApiCode, ApiResponseError, ApiValidationError, type FieldErrors } from "@/lib/api/envelope";
import { requestDraft, submitReview, type ReviewAnswers } from "@/lib/api/reviews";

/* PillButton.d.ts declares no `type`/`disabled`; widened at the call site, as in EnquiryForm. */
const Button = PillButton as React.ComponentType<
  PillButtonProps & Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled">
>;

type Step = 1 | 2 | 3;
const OTHER = "__other__";
const STEP_OF_FIELD: Record<string, Step> = {
  author_name: 1, shop_name: 1, governorate: 1, area: 1, photo: 1,
  duration: 2, support: 2, updates: 2, benefits: 2, business_type: 2, branches: 2, previous_system: 2, comment: 2,
  text: 3,
};
const PHOTO_MAX_SIDE = 1600;
const LOCAL_THINKING_MS = 450;

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; message: string; reference: string }
  | { kind: "error"; message: string };

export function ReviewWizard({ lang, shareUrl }: { lang: Locale; shareUrl: string }) {
  const t = REVIEW_COPY[lang];
  const id = useId();
  const reduced = useReducedMotion();
  const topRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);

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
  const [business, setBusiness] = useState<BusinessType | "">("");
  const [branches, setBranches] = useState<Branches | "">("");
  const [before, setBefore] = useState<PreviousSystem | "">("");
  const [extra, setExtra] = useState("");
  const [style, setStyle] = useState<DraftStyle>("casual");
  const [text, setText] = useState("");
  const [writing, setWriting] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [stepError, setStepError] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [toast, setToast] = useState("");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const aiOff = useRef(false); // the API could not draft once: draft locally from now on
  const lastAngle = useRef<Draft["angle"] | undefined>(undefined);
  const draftedFor = useRef(""); // the answers the current draft was written from
  const runId = useRef(0); // a newer draft request makes older results stale

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
  }, [text, step, writing]);

  function go(next: Step) {
    setStep(next);
    setStepError("");
    topRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const small = await shrink(file);
    setPhoto(small);
    setPhotoUrl(URL.createObjectURL(small));
  }

  function removePhoto() {
    setPhoto(null);
    setPhotoUrl("");
    if (photoInput.current) photoInput.current.value = "";
  }

  function answers(): ReviewAnswers {
    return {
      author_name: name.trim(),
      shop_name: shop.trim(),
      governorate: gov,
      area,
      duration: duration!,
      support: support!,
      updates: updates!,
      benefits,
      business_type: business,
      branches,
      previous_system: before,
      comment: extra.trim(),
    };
  }

  function toStep2() {
    if (!name.trim() || !shop.trim() || !gov || !area) return setStepError(t.step1Error);
    go(2);
  }

  function toStep3() {
    if (!duration || !support || !updates || benefits.length === 0) return setStepError(t.step2Error);
    go(3);
    /* Answers changed since the last draft (or there is none yet): write a fresh one. */
    const key = JSON.stringify(answers());
    if (key !== draftedFor.current || !text) write(style, "");
  }

  /** Writes a draft in `nextStyle`: AI first, local templates when that is unavailable. */
  async function write(nextStyle: DraftStyle, avoid: string) {
    const run = ++runId.current;
    const a = answers();
    draftedFor.current = JSON.stringify(a);
    setWriting(true);
    setErrors((e) => ({ ...e, text: [] }));

    let out = "";
    if (!aiOff.current) {
      try {
        out = await requestDraft(lang, { ...a, style: nextStyle, previous_draft: avoid });
      } catch {
        aiOff.current = true;
      }
    }
    if (!out) {
      const draft = draftReview(
        lang,
        { name: a.author_name, shop: a.shop_name, place, duration: a.duration, support: a.support, updates: a.updates,
          benefits: a.benefits, business: a.business_type, branches: a.branches, before: a.previous_system, extra: a.comment },
        nextStyle,
        lastAngle.current,
      );
      lastAngle.current = draft.angle;
      out = draft.text;
      await new Promise((r) => setTimeout(r, reduced ? 0 : LOCAL_THINKING_MS));
    }
    if (run !== runId.current) return;
    setWriting(false);
    reveal(out, run);
  }

  /* The draft types itself in, word by word, so it reads as written for this client.
     Instant under reduced motion. */
  function reveal(full: string, run: number) {
    if (reduced) return setText(full);
    const words = full.split(/(\s+)/);
    const total = words.length;
    const started = performance.now();
    const span = Math.min(1400, 280 + total * 18);
    setRevealing(true);
    const tick = (now: number) => {
      if (run !== runId.current) return;
      const shown = Math.ceil(Math.min(1, (now - started) / span) * total);
      setText(words.slice(0, shown).join(""));
      if (shown < total) requestAnimationFrame(tick);
      else setRevealing(false);
    };
    requestAnimationFrame(tick);
  }

  function changeStyle(next: DraftStyle) {
    if (next === style || writing) return;
    setStyle(next);
    write(next, text);
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
        ...answers(),
        text: text.trim(),
        source: new URLSearchParams(window.location.search).get("src") ?? "",
        website: (document.getElementById(`${id}-website`) as HTMLInputElement | null)?.value ?? "",
        photo,
      });
      setStatus({ kind: "sent", message: res.message, reference: res.data?.reference ?? "" });
      topRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
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
    errors[field]?.length ? <p className="swh-rv__error">{errors[field].join(" ")}</p> : null;

  /* ── After sending ─────────────────────────────────────────────────────────────── */
  if (status.kind === "sent") {
    return (
      <div className="swh-rv" ref={topRef}>
        <section className="swh-rv__card swh-rv__done" role="status">
          <span className="swh-rv__done-mark" aria-hidden="true"><IconCheck /></span>
          <h2 className="swh-rv__title">{t.thanksTitle}</h2>
          <p className="swh-rv__lede">{status.message}</p>
          {status.reference ? <p className="swh-rv__ref">{t.reference(status.reference)}</p> : null}
        </section>
        {shareUrl ? (
          <section className="swh-rv__card swh-rv__share-card">
            <h2 className="swh-rv__title">{t.shareTitle}</h2>
            <p className="swh-rv__hint">{t.shareBody}</p>
            <a className="swh-rv__share" href={shareUrl} target="_blank" rel="noopener" onClick={share}>
              {t.shareButton}
            </a>
          </section>
        ) : null}
        {toast ? <div className="swh-rv__toast" role="status">{toast}</div> : null}
      </div>
    );
  }

  const sending = status.kind === "sending";
  return (
    <div className="swh-rv" ref={topRef}>
      <ol className="swh-rv__stepper" aria-label={t.stepOf(step)}>
        {t.stepNames.map((label, i) => {
          const n = (i + 1) as Step;
          return (
            <li key={label} className={n < step ? "is-done" : n === step ? "is-current" : undefined} aria-current={n === step ? "step" : undefined}>
              <span className="swh-rv__dot">{n < step ? <IconCheck /> : n}</span>
              <span className="swh-rv__step-name">{label}</span>
            </li>
          );
        })}
      </ol>

      {/* ── Step 1 ─────────────────────────────────────────────────────────────── */}
      {step === 1 ? (
        <section className="swh-rv__card" aria-labelledby={`${id}-s1`} key="s1">
          <header className="swh-rv__head">
            <p className="swh-rv__eyebrow">{t.stepOf(1)}</p>
            <h2 className="swh-rv__title" id={`${id}-s1`}>{t.aboutYou}</h2>
          </header>

          <div className="swh-rv__grid">
            <Field id={`${id}-name`} label={t.name} error={fieldError("author_name")}>
              <Control icon={<IconUser />}>
                <input id={`${id}-name`} className="swh-rv__input" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder} autoComplete="name" maxLength={120} aria-invalid={errors.author_name?.length ? true : undefined} />
              </Control>
            </Field>
            <Field id={`${id}-shop`} label={t.shop} error={fieldError("shop_name")}>
              <Control icon={<IconStore />}>
                <input id={`${id}-shop`} className="swh-rv__input" value={shop} onChange={(e) => setShop(e.target.value)}
                  placeholder={t.shopPlaceholder} autoComplete="organization" maxLength={160} aria-invalid={errors.shop_name?.length ? true : undefined} />
              </Control>
            </Field>
            <Field id={`${id}-gov`} label={t.governorate} error={fieldError("governorate")}>
              <Control icon={<IconPin />} select>
                <select id={`${id}-gov`} className="swh-rv__input" value={gov}
                  onChange={(e) => { setGov(e.target.value); setAreaChoice(""); setAreaOther(""); }}>
                  <option value="">{t.chooseGovernorate}</option>
                  {GOVERNORATES.map((g) => <option key={g.ar} value={g.ar}>{lang === "ar" ? g.ar : g.en}</option>)}
                </select>
              </Control>
            </Field>
            <Field id={`${id}-area`} label={t.area} error={fieldError("area")}>
              {lang === "ar" && !abroad ? (
                <Control icon={<IconMap />} select>
                  <select id={`${id}-area`} className="swh-rv__input" value={areaChoice} disabled={!gov}
                    onChange={(e) => setAreaChoice(e.target.value)}>
                    <option value="">{gov ? t.chooseArea : t.chooseGovernorateFirst}</option>
                    {governorate?.areas.map((a) => <option key={a} value={a}>{a}</option>)}
                    {gov ? <option value={OTHER}>{t.otherArea}</option> : null}
                  </select>
                </Control>
              ) : null}
              {typedArea ? (
                <Control icon={<IconMap />}>
                  <input id={lang === "ar" && !abroad ? `${id}-area-other` : `${id}-area`} className="swh-rv__input" value={areaOther}
                    onChange={(e) => setAreaOther(e.target.value)} maxLength={120} disabled={!gov}
                    placeholder={!gov ? t.chooseGovernorateFirst : abroad ? t.areaPlaceholderAbroad : t.areaPlaceholder}
                    aria-label={abroad ? t.otherAreaAbroad : t.area} />
                </Control>
              ) : null}
            </Field>
          </div>

          <div className="swh-rv__field">
            <span className="swh-rv__label" id={`${id}-photo-label`}>
              {t.photo} <span className="swh-rv__optional">{t.optional}</span>
            </span>
            {photoUrl ? (
              <div className="swh-rv__photo-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="" />
                <div className="swh-rv__photo-actions">
                  <button type="button" className="swh-rv__ghost" onClick={() => photoInput.current?.click()}>{t.photoChange}</button>
                  <button type="button" className="swh-rv__ghost swh-rv__ghost--danger" onClick={removePhoto}>{t.photoRemove}</button>
                </div>
              </div>
            ) : (
              <button type="button" className="swh-rv__drop" onClick={() => photoInput.current?.click()} aria-labelledby={`${id}-photo-label`}>
                <span className="swh-rv__drop-icon" aria-hidden="true"><IconCamera /></span>
                <span className="swh-rv__drop-text">{t.photoDrop}</span>
                <span className="swh-rv__drop-hint">{t.photoHint}</span>
              </button>
            )}
            <input ref={photoInput} id={`${id}-photo`} type="file" accept="image/*" onChange={onPhoto} hidden />
            {fieldError("photo")}
          </div>

          {stepError ? <p className="swh-rv__error swh-rv__error--block" role="alert">{stepError}</p> : null}
          <div className="swh-rv__actions">
            <Button variant="primary" arrow type="button" onClick={toStep2}>{t.next}</Button>
          </div>
        </section>
      ) : null}

      {/* ── Step 2 ─────────────────────────────────────────────────────────────── */}
      {step === 2 ? (
        <section className="swh-rv__card" aria-labelledby={`${id}-s2`} key="s2">
          <header className="swh-rv__head">
            <p className="swh-rv__eyebrow">{t.stepOf(2)}</p>
            <h2 className="swh-rv__title" id={`${id}-s2`}>{t.questions}</h2>
          </header>

          <Question label={t.qDuration} labelId={`${id}-q1`}>
            <Choices options={DURATIONS} selected={duration ? [duration] : []} text={(d) => t.durations[d]} onPick={setDuration} variant="segment" />
          </Question>
          <Question label={t.qSupport} labelId={`${id}-q2`}>
            <RatingCards options={RATINGS} selected={support} text={(r) => t.support[r]} onPick={setSupport} />
          </Question>
          <Question label={t.qUpdates} labelId={`${id}-q3`}>
            <RatingCards options={RATINGS} selected={updates} text={(r) => t.updates[r]} onPick={setUpdates} />
          </Question>
          <Question label={t.qBenefits} hint={t.pickSeveral} labelId={`${id}-q4`}>
            <Choices options={BENEFITS} selected={benefits} text={(b) => t.benefits[b]} onPick={toggleBenefit} check />
            {fieldError("benefits")}
          </Question>

          <div className="swh-rv__more">
            <div className="swh-rv__more-head">
              <span className="swh-rv__more-icon" aria-hidden="true"><IconSpark /></span>
              <div>
                <p className="swh-rv__more-title">{t.moreTitle}</p>
                <p className="swh-rv__hint">{t.moreHint}</p>
              </div>
            </div>
            <Question label={t.qBusiness} labelId={`${id}-q5`} small>
              <Choices options={BUSINESS_TYPES} selected={business ? [business] : []} text={(x) => t.business[x]}
                onPick={(x) => setBusiness((c) => (c === x ? "" : x))} />
            </Question>
            <Question label={t.qBranches} labelId={`${id}-q6`} small>
              <Choices options={BRANCH_COUNTS} selected={branches ? [branches] : []} text={(x) => t.branches[x]}
                onPick={(x) => setBranches((c) => (c === x ? "" : x))} />
            </Question>
            <Question label={t.qBefore} labelId={`${id}-q7`} small>
              <Choices options={PREVIOUS_SYSTEMS} selected={before ? [before] : []} text={(x) => t.before[x]}
                onPick={(x) => setBefore((c) => (c === x ? "" : x))} />
            </Question>
          </div>

          <div className="swh-rv__field">
            <label className="swh-rv__label" htmlFor={`${id}-extra`}>
              {t.qExtra} <span className="swh-rv__optional">{t.optional}</span>
            </label>
            <Dictation lang={lang} value={extra} onChange={setExtra} />
            <textarea id={`${id}-extra`} className="swh-rv__input swh-rv__textarea" rows={3} maxLength={2000} value={extra}
              onChange={(e) => setExtra(e.target.value)} placeholder={t.extraPlaceholder} />
            {fieldError("comment")}
          </div>

          {stepError ? <p className="swh-rv__error swh-rv__error--block" role="alert">{stepError}</p> : null}
          <div className="swh-rv__actions">
            <Button variant="secondary" type="button" onClick={() => go(1)}>{t.back}</Button>
            <Button variant="primary" arrow type="button" onClick={toStep3}>{t.writeIt}</Button>
          </div>
        </section>
      ) : null}

      {/* ── Step 3 ─────────────────────────────────────────────────────────────── */}
      {step === 3 ? (
        <section className="swh-rv__card" aria-labelledby={`${id}-s3`} key="s3">
          <header className="swh-rv__head">
            <p className="swh-rv__eyebrow">{t.stepOf(3)}</p>
            <h2 className="swh-rv__title" id={`${id}-s3`}>{t.yourReview}</h2>
            <p className="swh-rv__hint">{t.editHint}</p>
          </header>

          <div className="swh-rv__style" role="radiogroup" aria-label={t.styleLabel}>
            <span className="swh-rv__style-label">{t.styleLabel}</span>
            <div className="swh-rv__segment">
              {DRAFT_STYLES.map((s) => (
                <button key={s} type="button" role="radio" aria-checked={style === s} disabled={writing || revealing}
                  className="swh-rv__segment-btn" onClick={() => changeStyle(s)}>
                  {t.styles[s]}
                </button>
              ))}
            </div>
          </div>

          <div className={`swh-rv__draft${writing ? " is-writing" : ""}`} aria-busy={writing}>
            <div className="swh-rv__draft-bar">
              <span className="swh-rv__badge"><IconSpark /> {t.writtenForYou}</span>
              {!writing ? <span className="swh-rv__count">{t.chars(text.trim().length)}</span> : null}
            </div>
            {writing ? (
              <div className="swh-rv__writing" role="status">
                <span className="swh-rv__line" />
                <span className="swh-rv__line" />
                <span className="swh-rv__line" />
                <span className="swh-rv__line swh-rv__line--short" />
                <p className="swh-rv__writing-text">{t.writing}</p>
              </div>
            ) : (
              <textarea ref={draftRef} className="swh-rv__draft-text" rows={6} maxLength={4000} value={text} readOnly={revealing}
                aria-label={t.yourReview} aria-invalid={errors.text?.length ? true : undefined} onChange={(e) => setText(e.target.value)} />
            )}
          </div>
          {fieldError("text")}

          <div className="swh-rv__draft-foot">
            <div className="swh-rv__who">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" />
              ) : (
                <span className="swh-rv__who-initial" aria-hidden="true">{name.trim().slice(0, 1)}</span>
              )}
              <span>
                <strong>{name.trim()}</strong>
                <small>{shop.trim()} · {place}</small>
              </span>
            </div>
            <button type="button" className="swh-rv__again" onClick={() => write(style, text)} disabled={writing || revealing}>
              <IconRefresh /> {t.rewrite}
            </button>
          </div>

          {/* Honeypot. Off-screen, unfocusable, unannounced. */}
          <div className="swh-vh" aria-hidden="true">
            <label>Website<input id={`${id}-website`} type="text" tabIndex={-1} autoComplete="off" /></label>
          </div>

          <div className="swh-rv__actions">
            <Button variant="secondary" type="button" onClick={() => go(2)} disabled={sending}>{t.backToQuestions}</Button>
            <Button variant="primary" arrow type="button" onClick={send}
              disabled={sending || writing || revealing || !hydrated || text.trim().length < 20}>
              {sending ? t.sending : t.send}
            </Button>
          </div>
        </section>
      ) : null}

      <p className="swh-rv__status" role={status.kind === "error" ? "alert" : undefined} aria-live="polite">
        {status.kind === "error" ? status.message : ""}
      </p>
    </div>
  );
}

/* ── Pieces ──────────────────────────────────────────────────────────────────────── */

function Field({ id, label, error, children }: { id: string; label: string; error: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="swh-rv__field">
      <label className="swh-rv__label" htmlFor={id}>{label}</label>
      {children}
      {error}
    </div>
  );
}

function Control({ icon, select = false, children }: { icon: React.ReactNode; select?: boolean; children: React.ReactNode }) {
  return (
    <div className={`swh-rv__control${select ? " swh-rv__control--select" : ""}`}>
      <span className="swh-rv__control-icon" aria-hidden="true">{icon}</span>
      {children}
      {select ? <span className="swh-rv__chevron" aria-hidden="true"><IconChevron /></span> : null}
    </div>
  );
}

function Question({ label, hint, labelId, small = false, children }: {
  label: string; hint?: string; labelId: string; small?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={`swh-rv__q${small ? " swh-rv__q--small" : ""}`} role="group" aria-labelledby={labelId}>
      <p className="swh-rv__q-label" id={labelId}>
        {label} {hint ? <span className="swh-rv__optional">{hint}</span> : null}
      </p>
      {children}
    </div>
  );
}

function Choices<T extends string>({ options, selected, text, onPick, check = false, variant = "chip" }: {
  options: readonly T[]; selected: T[]; text: (o: T) => string; onPick: (o: T) => void; check?: boolean; variant?: "chip" | "segment";
}) {
  return (
    <div className={variant === "segment" ? "swh-rv__segments" : "swh-rv__chips"}>
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button key={o} type="button" className={variant === "segment" ? "swh-rv__seg" : "swh-rv__chip"} aria-pressed={on} onClick={() => onPick(o)}>
            {check ? <span className="swh-rv__chip-check" aria-hidden="true"><IconCheck /></span> : null}
            {text(o)}
          </button>
        );
      })}
    </div>
  );
}

function RatingCards({ options, selected, text, onPick }: {
  options: readonly Rating[]; selected: Rating | null; text: (r: Rating) => string; onPick: (r: Rating) => void;
}) {
  return (
    <div className="swh-rv__ratings">
      {options.map((r) => (
        <button key={r} type="button" className={`swh-rv__rating swh-rv__rating--${r}`} aria-pressed={selected === r} onClick={() => onPick(r)}>
          <span className="swh-rv__face" aria-hidden="true"><IconFace mood={r} /></span>
          <span>{text(r)}</span>
        </button>
      ))}
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
    <div className="swh-rv__mic-row">
      <button type="button" className={`swh-rv__mic${listening ? " is-live" : ""}`} onClick={toggle} aria-pressed={listening}>
        <span className="swh-rv__mic-icon" aria-hidden="true"><IconMic /></span>
        {listening ? t.micListening : t.micStart}
        {listening ? <span className="swh-rv__wave" aria-hidden="true"><i /><i /><i /><i /></span> : null}
      </button>
      <p className="swh-rv__hint" aria-live="polite">{message}</p>
    </div>
  );
}

/* ── Icons (stroke, currentColor) ──────────────────────────────────────────────────── */

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const IconUser = () => <svg {...svg}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>;
const IconStore = () => <svg {...svg}><path d="M4 9.5 5.5 4h13L20 9.5" /><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" /><path d="M5.5 12v8h13v-8M10 20v-4.5h4V20" /></svg>;
const IconPin = () => <svg {...svg}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.4" /></svg>;
const IconMap = () => <svg {...svg}><path d="m9 4-5 2v14l5-2 6 2 5-2V4l-5 2-6-2Z" /><path d="M9 4v14M15 6v14" /></svg>;
const IconCamera = () => <svg {...svg}><path d="M4 8h3l1.6-2.4h6.8L17 8h3v11H4Z" /><circle cx="12" cy="13" r="3.4" /></svg>;
const IconChevron = () => <svg {...svg}><path d="m6 9 6 6 6-6" /></svg>;
const IconCheck = () => <svg {...svg} strokeWidth={2.4}><path d="m5 12.5 4.2 4.2L19 7" /></svg>;
const IconMic = () => <svg {...svg}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>;
const IconRefresh = () => <svg {...svg}><path d="M20 11a8 8 0 0 0-14.6-4.5M4 4v4h4" /><path d="M4 13a8 8 0 0 0 14.6 4.5M20 20v-4h-4" /></svg>;
const IconSpark = () => <svg {...svg}><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="m12 8 1.6 2.4L16 12l-2.4 1.6L12 16l-1.6-2.4L8 12l2.4-1.6Z" /></svg>;
function IconFace({ mood }: { mood: Rating }) {
  const mouth = mood === "good" ? "M8.5 14.5a4 4 0 0 0 7 0" : mood === "ok" ? "M9 15h6" : "M8.5 16.5a4 4 0 0 1 7 0";
  return <svg {...svg}><circle cx="12" cy="12" r="8.5" /><path d="M9 10h.01M15 10h.01" strokeWidth={2.6} /><path d={mouth} /></svg>;
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
