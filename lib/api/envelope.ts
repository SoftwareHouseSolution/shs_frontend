/* The Django API's response contract, mirrored.

   Every response — success or error — carries the same six fields. `code` is the stable,
   machine-readable part and the thing to branch on; `message` is already localised for
   the language the request asked for and is safe to show. See backend/README.md for the
   full code list. */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  code: string;
  data: T | null;
  errors: FieldErrors | null;
  meta: ApiMeta | null;
}

/** Field name (as sent in the request) → its messages. `non_field_errors` for the rest. */
export type FieldErrors = Record<string, string[]>;

export interface Pagination {
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  next: string | null;
  previous: string | null;
}

export interface ApiMeta {
  pagination?: Pagination;
  /** Present on 5xx responses — quote it to support; it matches the server log line. */
  requestId?: string;
  /** Seconds, on 429 responses. */
  retryAfter?: number;
  [key: string]: unknown;
}

export type Paginated<T> = ApiResponse<T[]> & { meta: ApiMeta & { pagination: Pagination } };

/** Application codes the frontend acts on. Others are handled generically. */
export const ApiCode = {
  CONTENT_RETRIEVED: "CONTENT_RETRIEVED",
  CONTENT_LIST_RETRIEVED: "CONTENT_LIST_RETRIEVED",
  ENQUIRY_CREATED: "ENQUIRY_CREATED",
  REVIEW_CREATED: "REVIEW_CREATED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  DUPLICATE_ENQUIRY: "DUPLICATE_ENQUIRY",
  DUPLICATE_REVIEW: "DUPLICATE_REVIEW",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

const ENVELOPE_KEYS = ["success", "message", "code", "data", "errors", "meta"] as const;

export function isEnvelope(value: unknown): value is ApiResponse<unknown> {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    ENVELOPE_KEYS.every((k) => k in v) &&
    typeof v.success === "boolean" &&
    typeof v.message === "string" &&
    typeof v.code === "string"
  );
}

/* ── Errors ─────────────────────────────────────────────────────────────────────────
   Four kinds, kept distinguishable so a caller can say the right thing:
     ApiNetworkError     — no response at all (offline, DNS, CORS, server down)
     ApiProtocolError    — a response that is not our envelope (proxy error page, HTML)
     ApiResponseError    — a well-formed envelope with success: false
       └ ApiValidationError — … whose code is VALIDATION_ERROR, with field errors      */

export class ApiError extends Error {}

export class ApiNetworkError extends ApiError {
  constructor(public readonly url: string, cause: unknown) {
    super(`Network error requesting ${url}`, { cause });
    this.name = "ApiNetworkError";
  }
}

export class ApiProtocolError extends ApiError {
  constructor(public readonly url: string, public readonly status: number) {
    super(`Unexpected response (${status}) from ${url}`);
    this.name = "ApiProtocolError";
  }
}

export class ApiResponseError extends ApiError {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors: FieldErrors;
  readonly requestId: string | undefined;
  readonly retryAfter: number | undefined;

  constructor(body: ApiResponse<unknown>, status: number) {
    super(body.message);
    this.name = "ApiResponseError";
    this.code = body.code;
    this.status = status;
    this.fieldErrors = body.errors ?? {};
    this.requestId = body.meta?.requestId;
    this.retryAfter = body.meta?.retryAfter;
  }

  get isNotFound() {
    return this.code === ApiCode.RESOURCE_NOT_FOUND;
  }
}

export class ApiValidationError extends ApiResponseError {
  constructor(body: ApiResponse<unknown>, status: number) {
    super(body, status);
    this.name = "ApiValidationError";
  }
}
