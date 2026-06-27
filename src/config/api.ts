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

export interface ApiConfig {
  baseURL: string;
  timeout: number;
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  return "/api";
};

const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

const isPublicAuthRoute = (url?: string) =>
  PUBLIC_AUTH_PATHS.some((path) => url?.includes(path));

const isLoginOrRegisterRoute = (url?: string) =>
  url?.includes("/auth/login") || url?.includes("/auth/register");

const apiConfig: ApiConfig = {
  baseURL: getBaseUrl(),
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000", 10),
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(token!);
  });
  failedQueue = [];
};

/**
 * Dedicated client for token refresh — no auth interceptors to prevent loops.
 */
const refreshClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000", 10),
  withCredentials: true,
});

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

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refreshClient.post<LoginResponse>("/auth/refresh");
        notifySessionRefreshed(data);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        notifyAuthFailure();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
};

const apiClient: AxiosInstance = axios.create({
  ...apiConfig,
  withCredentials: true,
});

attachRequestInterceptor(apiClient);
attachResponseInterceptor(apiClient);

export const uploadApiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 5 * 60 * 1000,
  withCredentials: true,
});

attachRequestInterceptor(uploadApiClient);
attachResponseInterceptor(uploadApiClient);

export default apiClient;
