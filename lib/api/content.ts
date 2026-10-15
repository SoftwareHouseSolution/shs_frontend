/* Server-side content loaders. Every page and layout reads the CMS through these.

   CACHING. Each fetch is cached by Next with a time-based lifetime (CMS_REVALIDATE_SECONDS,
   default 10) and the "cms" tag. On `next start` an edit in the admin therefore appears
   within seconds without a rebuild — the first visit after the window still gets the old
   page while the new one is fetched, so it is the visit after that which shows the edit.
   Not lower: the frontend server's fetches count against the API's anonymous rate limit
   (600/min by default), and at 10s even every page regenerating at once stays under it. A static export (`pnpm build:static`) fetches once at
   build time — rebuild after editing content. `cache()` additionally dedupes identical
   calls within one render (the layout and a page both asking for the site settings). */

import { cache } from "react";
import type { Locale } from "@/content/i18n";
import { apiRequest } from "./client";
import type { Client, ClientTaxonomy, HomeData, PageData, PageSummary, SiteData } from "./types";

const REVALIDATE = Number(process.env.CMS_REVALIDATE_SECONDS ?? 10);
const NEXT = { revalidate: Number.isFinite(REVALIDATE) ? REVALIDATE : 10, tags: ["cms"] };

async function get<T>(path: string, lang?: Locale, query?: Record<string, string | number>) {
  const res = await apiRequest<T>(path, { lang, query, next: NEXT });
  return res;
}

export const getSite = cache(async (lang: Locale): Promise<SiteData> => (await get<SiteData>("site/", lang)).data!);

export const getHome = cache(async (lang: Locale): Promise<HomeData> => (await get<HomeData>("home/", lang)).data!);

export const getPage = cache(
  async (lang: Locale, slug: string): Promise<PageData> => (await get<PageData>(`pages/${slug}/`, lang)).data!,
);

/** Every published page — the route list for generateStaticParams. */
export const getPageList = cache(async (): Promise<PageSummary[]> => {
  const out: PageSummary[] = [];
  for (let page = 1; ; page++) {
    const res = await get<PageSummary[]>("pages/", undefined, { page, page_size: 100 });
    out.push(...res.data!);
    if (!res.meta?.pagination?.next) return out;
  }
});

/** The whole roster. The directory filters client-side, so it loads every page. */
export const getClients = cache(async (lang: Locale): Promise<Client[]> => {
  const out: Client[] = [];
  for (let page = 1; ; page++) {
    const res = await get<Client[]>("clients/", lang, { page, page_size: 500 });
    out.push(...res.data!);
    if (!res.meta?.pagination?.next) return out;
  }
});

export const getClientTaxonomy = cache(
  async (lang: Locale): Promise<ClientTaxonomy> => (await get<ClientTaxonomy>("clients/taxonomy/", lang)).data!,
);
