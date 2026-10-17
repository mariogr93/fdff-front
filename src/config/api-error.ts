import axios from "axios";

/**
 * What a component needs to choose a message for a failed API call.
 * Branch on `statusCode` and `error`, never on the body's `message`:
 * that is English prose for developers and can change at any time.
 */
export interface ApiError {
  /** HTTP status, or null when no response arrived. */
  statusCode: number | null;
  /**
   * Exception name from the body, e.g. "InvalidCredentialsException".
   * "Bad Request" for validation errors; null when the body has none (e.g. 429).
   */
  error: string | null;
  /** True when the request was sent but no response came back (offline, timeout, CORS). */
  isNetworkError: boolean;
}

const readErrorName = (body: unknown): string | null => {
  if (typeof body !== "object" || body === null || !("error" in body)) {
    return null;
  }

  return typeof body.error === "string" ? body.error : null;
};

/**
 * Development-only log of a failed API call: "[context] POST /auth/login → 401 Name".
 * Never logs bodies, headers, tokens or query strings (they can hold passwords or
 * personal data). Production builds log nothing.
 */
export const logApiError = (context: string, error: unknown): void => {
  if (!import.meta.env.DEV) {
    return;
  }

  const { statusCode, error: errorName, isNetworkError } = parseApiError(error);
  const config = axios.isAxiosError(error) ? error.config : undefined;
  const method = config?.method?.toUpperCase() ?? "?";
  const path = config?.url?.split("?")[0] ?? "?";
  const outcome = isNetworkError ? "network error" : `${statusCode ?? "?"} ${errorName ?? ""}`;

  console.warn(`[${context}] ${method} ${path} → ${outcome.trim()}`);
};

export const parseApiError = (error: unknown): ApiError => {
  if (!axios.isAxiosError(error) || axios.isCancel(error)) {
    return { statusCode: null, error: null, isNetworkError: false };
  }

  if (!error.response) {
    return { statusCode: null, error: null, isNetworkError: true };
  }

  return {
    statusCode: error.response.status,
    error: readErrorName(error.response.data),
    isNetworkError: false,
  };
};
