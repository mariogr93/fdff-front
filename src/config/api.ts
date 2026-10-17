import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  getAccessToken,
  notifyAuthFailure,
  notifySessionRefreshed,
} from "../auth/auth-session.store";
import type { LoginResponse } from "../types/authentication.models";
import { parseApiError } from "./api-error";

export interface ApiConfig {
  baseURL: string;
  timeout: number;
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  return "/api";
};

const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/logout", "/auth/register", "/auth/refresh"];

const isPublicAuthRoute = (url?: string) =>
  PUBLIC_AUTH_PATHS.some((path) => url?.includes(path));

const isLoginOrRegisterRoute = (url?: string) =>
  url?.includes("/auth/login") || url?.includes("/auth/register") || url?.includes("/auth/logout");

/**
 * Dedicated client for token refresh — no auth interceptors to prevent loops.
 */
const refreshClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000", 10),
  withCredentials: true,
});

/**
 * The refresh cookie is single-use: two refreshes sent with the same cookie make one
 * fail, and the backend may treat the late one as reuse and end the session. So:
 * - within a tab, every caller (401 interceptor, page-load bootstrap, StrictMode's
 *   second run) shares one in-flight promise;
 * - across tabs, the Web Lock makes refreshes run one after another, so each tab
 *   sends the cookie the previous one received.
 * The lock wait is capped so a lock that is never released cannot hang the app.
 */
const REFRESH_LOCK_NAME = "fdff-refresh";
const REFRESH_LOCK_WAIT_MS = 15_000;

let refreshInFlight: Promise<LoginResponse> | null = null;

const withRefreshLock = <T>(task: () => Promise<T>): Promise<T> => {
  if (typeof navigator === "undefined" || !navigator.locks) {
    return task();
  }

  return navigator.locks.request(
    REFRESH_LOCK_NAME,
    { signal: AbortSignal.timeout(REFRESH_LOCK_WAIT_MS) },
    task
  );
};

const requestRefresh = async (): Promise<LoginResponse> => {
  const { data } = await refreshClient.post<LoginResponse>("/auth/refresh");
  return data;
};

/** Exchanges the refresh cookie for a new session. At most one refresh runs per browser. */
export const refreshSession = (): Promise<LoginResponse> => {
  refreshInFlight ??= withRefreshLock(requestRefresh)
    .then((data) => {
      notifySessionRefreshed(data);
      return data;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
};

const attachRequestInterceptor = (client: AxiosInstance) => {
  client.interceptors.request.use(
    (config) => {
      if (isPublicAuthRoute(config.url)) {
        return config;
      }

      const token = getAccessToken();
      if (!token) {
        throw new axios.Cancel("No access token available");
      }

      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );
};

const attachResponseInterceptor = (client: AxiosInstance) => {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;

      if (!error.response || error.response.status !== 401 || !originalRequest) {
        return Promise.reject(error);
      }

      if (
        isLoginOrRegisterRoute(originalRequest.url) ||
        originalRequest.url?.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const { accessToken } = await refreshSession();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        // Only a 401 means the session is over. A network error or lock timeout
        // leaves the session in place so the next call can try again.
        if (parseApiError(refreshError).statusCode === 401) {
          notifyAuthFailure();
        }
        return Promise.reject(refreshError);
      }
    }
  );
};

const apiConfig: ApiConfig = {
  baseURL: getBaseUrl(),
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000", 10),
};

export const apiClient: AxiosInstance = axios.create({
  ...apiConfig,
  withCredentials: true,
});


export const uploadApiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 5 * 60 * 1000,
  withCredentials: true,
});

attachRequestInterceptor(apiClient);
attachResponseInterceptor(apiClient);

attachRequestInterceptor(uploadApiClient);
attachResponseInterceptor(uploadApiClient);
