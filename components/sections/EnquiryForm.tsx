"use client";

/* The contact form — the site's first form, made possible by the enquiries API.

   Validation is the server's: the API returns per-field messages already in the reader's
   language (the browser's built-in bubbles would speak the BROWSER's language, which on
   an Arabic page is often English), so the form is `noValidate` and maps `errors` straight
   onto the fields. Four failure kinds stay distinct, because each needs different words:

     validation (400)      → messages under the fields, focus on the first one
     duplicate / rate limit → the API's own localised sentence
     server failure (5xx)  → a generic apology plus the request reference for support
     network / non-JSON    → "check your connection" — nothing reached us

   A honeypot field (`website`) is visually hidden and skipped by keyboard and screen
   readers; only bots fill it, and the API quietly discards those. */

import { useEffect, useId, useRef, useState } from "react";
import { PillButton, type PillButtonProps } from "@/components/ds/PillButton";
import { UI } from "@/content/ui";
import type { Locale } from "@/content/i18n";
import { ApiCode, ApiResponseError, ApiValidationError, type FieldErrors } from "@/lib/api/envelope";
import { submitEnquiry } from "@/lib/api/enquiries";

/* PillButton.d.ts (a byte-identical design-system copy) declares no `type`/`disabled`,
   though the component spreads them onto its <button>. Widened here, at the call site,
   rather than by editing the design system — the same approach app/page.tsx takes for
   NavPill. */
const Button = PillButton as React.ComponentType<
  PillButtonProps & Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled">
>;

type Field = "full_name" | "email" | "phone" | "company" | "message";
const FIELDS: Field[] = ["full_name", "email", "phone", "company", "message"];

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; message: string; reference: string }
  | { kind: "error"; message: string };

export function EnquiryForm({ lang }: { lang: Locale }) {
  const ui = UI[lang];
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<FieldErrors>({});
  /* Until React has hydrated, a click on "Send" would fall through to the browser's native
     form submission. The button stays disabled until then, and the form is method="post"
     regardless, so a visitor's details can never end up in a URL (and from there in
     history, logs and referrers). */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  /* Focus the first invalid field once the errors have rendered. Not inside the submit
     handler: the inputs are still disabled there (sending), and a disabled input cannot
     take focus — the call would silently do nothing. */
  useEffect(() => {
    const first = FIELDS.find((f) => errors[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }, [errors]);

  const labels: Record<Field, string> = {
    full_name: ui.formName,
    email: ui.formEmail,
    phone: ui.formPhone,
    company: ui.formCompany,
    message: ui.formMessage,
  };
  const optional: Partial<Record<Field, true>> = { phone: true, company: true };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "sending") return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const value = (k: string) => String(data.get(k) ?? "").trim();

    setStatus({ kind: "sending" });
    setErrors({});
    try {
      const res = await submitEnquiry(lang, {
        full_name: value("full_name"),
        email: value("email"),
        phone: value("phone"),
        company: value("company"),
        message: value("message"),
        website: value("website"),
        source_path: window.location.pathname,
      });
      form.reset();
      setStatus({ kind: "sent", message: res.message, reference: res.data?.reference ?? "" });
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setErrors(err.fieldErrors);
        setStatus({ kind: "error", message: ui.formFixErrors });
      } else if (err instanceof ApiResponseError) {
        const expected = err.code === ApiCode.DUPLICATE_ENQUIRY || err.code === ApiCode.RATE_LIMIT_EXCEEDED;
        const message = expected || err.status < 500
          ? err.message
          : [ui.formServerError, err.requestId ? ui.formReference(err.requestId) : ""].filter(Boolean).join(" ");
        setStatus({ kind: "error", message });
      } else {
        setStatus({ kind: "error", message: ui.formNetworkError });
      }
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="swh-enquiry swh-enquiry--sent" role="status">
        <p className="swh-enquiry__sent-title">{ui.formSuccessTitle}</p>
        <p className="swh-enquiry__sent-body">{status.message}</p>
        {status.reference ? <p className="swh-enquiry__ref">{ui.formReference(status.reference)}</p> : null}
        <PillButton variant="secondary" onClick={() => setStatus({ kind: "idle" })}>
          {ui.formSendAnother}
        </PillButton>
      </div>
    );
  }

  const sending = status.kind === "sending";
  return (
    <form ref={formRef} className="swh-enquiry" method="post" noValidate onSubmit={onSubmit} aria-busy={sending}>
      <p className="swh-enquiry__intro">{ui.formIntro}</p>

      <div className="swh-enquiry__grid">
        {FIELDS.map((f) => {
          const fieldId = `${id}-${f}`;
          const errId = `${fieldId}-err`;
          const fieldErrors = errors[f];
          const common = {
            id: fieldId,
            name: f,
            className: "swh-enquiry__input",
            "aria-invalid": fieldErrors ? true : undefined,
            "aria-describedby": fieldErrors ? errId : undefined,
            disabled: sending,
          } as const;
          return (
            <div key={f} className={`swh-enquiry__field swh-enquiry__field--${f}`}>
              <label className="swh-enquiry__label" htmlFor={fieldId}>
                {labels[f]}
                {optional[f] ? <span className="swh-enquiry__optional"> ({ui.formOptional})</span> : null}
              </label>
              {f === "message" ? (
                <textarea {...common} rows={5} maxLength={5000} />
              ) : (
                <input
                  {...common}
                  type={f === "email" ? "email" : f === "phone" ? "tel" : "text"}
                  autoComplete={{ full_name: "name", email: "email", phone: "tel", company: "organization" }[f]}
                  /* E-mail and phone are LTR in both languages; typing them into an RTL
                     field puts the cursor and the "+" at the wrong end. */
                  dir={f === "email" || f === "phone" ? "ltr" : undefined}
                  maxLength={f === "email" ? 254 : f === "phone" ? 30 : 160}
                />
              )}
              {fieldErrors ? (
                <p id={errId} className="swh-enquiry__error">
                  {fieldErrors.join(" ")}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Honeypot. Off-screen, unfocusable, unannounced. */}
      <div className="swh-vh" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="swh-enquiry__actions">
        <Button variant="primary" arrow type="submit" disabled={sending || !hydrated}>
          {sending ? ui.formSending : ui.formSubmit}
        </Button>
        <p className="swh-enquiry__status" role={status.kind === "error" ? "alert" : undefined} aria-live="polite">
          {status.kind === "error" ? status.message : ""}
        </p>
      </div>
    </form>
  );
}
