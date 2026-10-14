/* Browser-side: the contact form's submission. */

import type { Locale } from "@/content/i18n";
import { apiRequest } from "./client";
import type { EnquiryPayload, EnquiryReceipt } from "./types";

export async function submitEnquiry(lang: Locale, payload: EnquiryPayload, signal?: AbortSignal) {
  return apiRequest<EnquiryReceipt>("enquiries/", { method: "POST", lang, body: payload, cache: "no-store", signal });
}
