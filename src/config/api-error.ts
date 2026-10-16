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
