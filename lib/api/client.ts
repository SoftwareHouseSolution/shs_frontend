/* One request function for the whole app. It owns the base URL, the language parameter,
   envelope validation, error classification and the snake_case → camelCase boundary, so
   no component ever touches fetch() or a raw response.

   Isomorphic: server components call it through lib/api/content.ts (with Next's cache
   options); the browser calls it for the enquiry form. */

import type { Locale } from "@/content/i18n";
import {
  ApiCode,
  ApiNetworkError,
  ApiProtocolError,
  ApiResponseError,
  ApiValidationError,
  isEnvelope,
  type ApiResponse,
} from "./envelope";

/** Server-side callers may use a private address (API_INTERNAL_URL); the browser always
    uses the public one. Both point at …/api/v1. */
export function apiBaseUrl(): string {
  const internal = typeof window === "undefined" ? process.env.API_INTERNAL_URL : undefined;
  const base = internal || process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.local.");
  }
  return base.replace(/\/$/, "");
}

/* The API speaks snake_case (Python), the components camelCase (TypeScript). Converted
   once, here. `errors` is deliberately NOT converted: its keys are the request's own field
   names, which the form maps back onto its inputs. */
const camel = (key: string) => key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

function camelize<T>(value: unknown): T {
  if (Array.isArray(value)) return value.map((v) => camelize(v)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [camel(k), camelize(v)]),
    ) as T;
  }
  return value as T;
}

/* Server-side concurrency cap. A build prerenders every route in parallel across several
   workers, and each page issues a few requests — dozens at once against an API that may be
   a single small process. Capping in-flight requests per process keeps the burst inside
   what such a host accepts. The browser makes one request at a time anyway and is not
   limited. */
const MAX_SERVER_CONCURRENCY = 4;
let inFlight = 0;
const waiting: (() => void)[] = [];

async function withSlot<T>(run: () => Promise<T>): Promise<T> {
  if (typeof window !== "undefined") return run();
  if (inFlight >= MAX_SERVER_CONCURRENCY) await new Promise<void>((r) => waiting.push(r));
  inFlight++;
  try {
    return await run();
  } finally {
    inFlight--;
    waiting.shift()?.();
  }
}

export type RequestOptions = {
  lang?: Locale;
  query?: Record<string, string | number | boolean | undefined>;
  method?: "GET" | "POST";
  body?: unknown;
  /** Next.js fetch extensions (server only): cache lifetime and tags. */
  next?: { revalidate?: number | false; tags?: string[] };
  cache?: RequestCache;
  signal?: AbortSignal;
};

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<ApiResponse<T>> {
  const url = new URL(`${apiBaseUrl()}/${path.replace(/^\//, "")}`);
  if (opts.lang) url.searchParams.set("lang", opts.lang);
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }

  const method = opts.method ?? "GET";
  const init = {
    method,
    headers: {
      Accept: "application/json",
      ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: opts.cache,
    signal: opts.signal,
    ...(opts.next ? { next: opts.next } : {}),
  } as RequestInit;

  /* A GET is safe to repeat, so a transient connection failure (a refused socket while the
     API is busy — e.g. a build prerendering dozens of pages at once) is retried three times with
     a growing backoff before it is reported. A POST is never retried: the enquiry might
     already have been stored, and the duplicate check would then answer 409. */
  const attempts = method === "GET" ? 4 : 1;
  let response: Response | undefined;
  for (let attempt = 1; ; attempt++) {
    try {
      response = await withSlot(() => fetch(url, init));
      break;
    } catch (cause) {
      if (attempt >= attempts || opts.signal?.aborted) throw new ApiNetworkError(url.toString(), cause);
      await new Promise((r) => setTimeout(r, 300 * 3 ** (attempt - 1))); // 0.3s, 0.9s, 2.7s
    }
  }

  let raw: unknown;
  try {
    raw = await response.json();
  } catch {
    throw new ApiProtocolError(url.toString(), response.status);
  }
  if (!isEnvelope(raw)) throw new ApiProtocolError(url.toString(), response.status);

  const body: ApiResponse<T> = {
    ...raw,
    data: camelize<T>(raw.data),
    meta: camelize(raw.meta),
    errors: raw.errors,
  };

  /* A 2xx status is not proof of success — the envelope's own flag is checked too. */
  if (!response.ok || !body.success) {
    if (body.code === ApiCode.VALIDATION_ERROR) throw new ApiValidationError(body, response.status);
    throw new ApiResponseError(body, response.status);
  }
  return body;
}
