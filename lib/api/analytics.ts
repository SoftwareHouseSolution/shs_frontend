/* Browser-side: page-view reports for the CMS's visitor analytics (backend/apps/analytics).

   Sent as text/plain so the request is "simple" (no CORS preflight) and so it can travel
   in navigator.sendBeacon, which is the only transport that reliably survives the tab
   closing. The API parses the body as JSON either way. Failures are swallowed: analytics
   must never surface to a visitor. */

import { apiBaseUrl } from "./client";

export type ViewReport = {
  session_id: string;
  visitor_id: string;
  view_id: string;
  path: string;
  language: string;
  referrer?: string;
  duration_ms: number;
};

export function reportView(report: ViewReport, { leaving = false } = {}) {
  let url: string;
  try {
    url = `${apiBaseUrl()}/analytics/collect/`;
  } catch {
    return;
  }
  const body = JSON.stringify(report);
  if (leaving && typeof navigator.sendBeacon === "function") {
    if (navigator.sendBeacon(url, new Blob([body], { type: "text/plain" }))) return;
  }
  void fetch(url, {
    method: "POST",
    body,
    headers: { "Content-Type": "text/plain" },
    keepalive: true,
    credentials: "omit",
  }).catch(() => {});
}
