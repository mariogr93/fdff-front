import { apiClient, refreshSession } from "../config/api";
import { logApiError, parseApiError } from "../config/api-error";
import {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/authentication.models";

export const AuthService = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post("/auth/login", request);
      return response.data;
    } catch (error) {
      logApiError("login", error);
      throw error;
    }
  },

  register: async (request: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post("/auth/register", request);
      return response.data;
    } catch (error) {
      logApiError("register", error);
      throw error;
    }
  },

  /** `204`: the backend ended every session, this one included. */
  changePassword: async (request: ChangePasswordRequest): Promise<void> => {
    try {
      await apiClient.post<void>("/auth/change-password", request);
    } catch (error) {
      logApiError("change-password", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    await apiClient.post<void>("/auth/logout");
  },

  /**
   * Exchange the HttpOnly refresh cookie for a new access token. Shares the single
   * in-flight refresh with the 401 interceptor (see refreshSession in config/api.ts).
   * 401 is expected when there is no session (e.g. bootstrap on a logged-out visit).
   */
  refresh: async (): Promise<RefreshResponse> => {
    try {
      return await refreshSession();
    } catch (error) {
      if (parseApiError(error).statusCode !== 401) {
        logApiError("refresh", error);
      }
      throw error;
    }
  },
};
