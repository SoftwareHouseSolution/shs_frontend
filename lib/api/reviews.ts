/* Browser-side: the client review page's submission. Multipart, so the shop photo travels
   with the answers; `benefits` is repeated once per choice. */

import type { Locale } from "@/content/i18n";
import type { Benefit, Duration, Rating } from "@/content/review";
import { apiRequest } from "./client";
import type { ReviewReceipt } from "./types";

export type ReviewPayload = {
  author_name: string;
  shop_name: string;
  governorate: string;
  area: string;
  duration: Duration;
  support: Rating;
  updates: Rating;
  benefits: Benefit[];
  comment: string;
  text: string;
  consent: boolean;
  source: string;
  website: string;
  photo?: Blob | null;
};

export async function submitReview(lang: Locale, payload: ReviewPayload, signal?: AbortSignal) {
  const body = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (key === "benefits") (value as Benefit[]).forEach((b) => body.append("benefits", b));
    else if (key === "photo") {
      if (value) body.append("photo", value as Blob, "shop.jpg");
    } else body.append(key, String(value));
  }
  return apiRequest<ReviewReceipt>("reviews/", { method: "POST", lang, body, cache: "no-store", signal });
}
