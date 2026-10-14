"use client";

/* The error boundary for every page under the site shell.

   Placed in (site) rather than in [lang] on purpose: an error.tsx does not wrap the layout
   beside it, so here the navbar, the footer and the contact rail all survive a failing
   page. The reader keeps the whole site around the broken part, rather than being dropped
   onto a bare screen.

   Never shows `error.message`. In production a server error's message is replaced with a
   generic string anyway, and a client one can be anything — a stack fragment, a property
   name — none of which helps the person reading. The real error goes to the console for
   whoever is debugging; the page says what happened, that it was not the reader's doing,
   and what to do next.

   `retry`, not `reset`: retry re-fetches the segment before re-rendering, which is what
   actually recovers from the transient failures this is here for (a dropped chunk or RSC
   payload on a flaky connection). */

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { PillButton } from "@/components/ds/PillButton";
import { StatusPanel } from "@/components/feedback/StatusPanel";
import { AlertIcon } from "@/components/feedback/icons";
import { DEFAULT_LOCALE, href as localeHref, isLocale } from "@/content/i18n";
import { UI } from "@/content/ui";
import { useOptionalSite } from "@/components/chrome/SiteContext";

export default function SiteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const params = useParams<{ lang: string }>();
  const lang = isLocale(params?.lang) ? params.lang : DEFAULT_LOCALE;
  const ui = UI[lang];
  /* Optional: if the failure was the CMS itself, the layout may have rendered without
     site data — the page must still explain itself, just without the WhatsApp link. */
  const whatsapp = useOptionalSite()?.settings.whatsappUrl;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="swh-status-page">
      <StatusPanel
        role="alert"
        tone="danger"
        icon={<AlertIcon />}
        eyebrow={ui.errorEyebrow}
        title={ui.errorHeading}
        actions={
          <>
            <PillButton variant="primary" onClick={() => retry()}>
              {ui.tryAgain}
            </PillButton>
            <PillButton variant="secondary" href={localeHref(lang, "/")}>
              {ui.backHome}
            </PillButton>
          </>
        }
        aside={
          whatsapp ? (
          <>
            {ui.stillStuck}{" "}
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${ui.messageUs} ${ui.opensInNewTab}`}
            >
              {ui.messageUs}
            </a>
          </>
          ) : undefined
        }
      >
        {ui.errorBody}
      </StatusPanel>
    </div>
  );
}
