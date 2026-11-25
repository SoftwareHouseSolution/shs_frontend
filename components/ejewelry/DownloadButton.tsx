"use client";

/* The one gold action on /e-jewelry/. It reads latest.json at load time — the same file the
   installed app polls — so a new build needs no page edit: the button's href becomes the
   APK and the line under it shows its version, size and upload date.

   Until the JSON answers (or if it never does) the button points at /e-jewelry/download,
   which forwards to the newest APK on its own. `download` is set only once the href is the
   APK itself; on the forwarding page it would save that page's HTML instead. */

import { useEffect, useState } from "react";
import type { Locale } from "@/content/i18n";
import s from "./install.module.css";

export const ANDROID_DIR = "/e-jewelry/android/";
export const APK_NAME = /^EJewelry-\d+\.apk$/;

type Build = { apk: string; meta: string[] };

const DATE_LOCALE: Record<Locale, string> = { ar: "ar-EG-u-nu-latn", en: "en-GB" };

export function DownloadButton({ lang, label, mb }: { lang: Locale; label: string; mb: string }) {
  const [build, setBuild] = useState<Build | null>(null);

  useEffect(() => {
    let live = true;
    fetch(`${ANDROID_DIR}latest.json`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const j = (await res.json()) as { apk?: string; version?: string; size?: number };
        if (!j.apk || !APK_NAME.test(j.apk)) return;
        const meta = [`v${j.version}`];
        if (j.size) meta.push(`${Math.round(j.size / 1e6)} ${mb}`);
        const modified = res.headers.get("last-modified");
        if (modified) {
          meta.push(
            new Intl.DateTimeFormat(DATE_LOCALE[lang], { day: "numeric", month: "long", year: "numeric" }).format(
              new Date(modified),
            ),
          );
        }
        if (live) setBuild({ apk: j.apk, meta });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [lang, mb]);

  return (
    <div className={s.action}>
      <a
        className={s.button}
        href={build ? ANDROID_DIR + build.apk : "/e-jewelry/download"}
        download={build ? build.apk : undefined}
      >
        <svg className={s.buttonIcon} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" />
        </svg>
        {label}
      </a>
      <p className={s.meta} aria-live="polite">
        {build
          ? build.meta.map((m, i) => (
              <span key={m}>
                {i > 0 && <span aria-hidden="true"> · </span>}
                <bdi>{m}</bdi>
              </span>
            ))
          : " "}
      </p>
    </div>
  );
}
