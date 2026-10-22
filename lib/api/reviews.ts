/* Browser-side: the client review page's two requests.

   requestDraft — the client's answers in, a review written in their voice out (AI, on the
                  server). Any failure is the caller's cue to draft locally instead.
   submitReview — the finished review, multipart so the shop photo travels with it;
                  `benefits` is repeated once per choice. */

import type { Locale } from "@/content/i18n";
import type { Benefit, Branches, BusinessType, DraftStyle, Duration, PreviousSystem, Rating } from "@/content/review";
import { apiRequest } from "./client";
import type { ReviewReceipt } from "./types";

export type ReviewAnswers = {
  author_name: string;
  shop_name: string;
  governorate: string;
  area: string;
  duration: Duration;
  support: Rating;
  updates: Rating;
  benefits: Benefit[];
  business_type: BusinessType | "";
  branches: Branches | "";
  previous_system: PreviousSystem | "";
  comment: string;
};

export type ReviewPayload = ReviewAnswers & {
  text: string;
  source: string;
  website: string;
  photo?: Blob | null;
};

export async function requestDraft(
  lang: Locale,
  answers: ReviewAnswers & { style: DraftStyle; previous_draft: string },
  signal?: AbortSignal,
): Promise<string> {
  const res = await apiRequest<{ text: string }>("reviews/draft/", { method: "POST", lang, body: answers, cache: "no-store", signal });
  const text = res.data?.text?.trim();
  if (!text) throw new Error("empty draft");
  return text;
}

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
