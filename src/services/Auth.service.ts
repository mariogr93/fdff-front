import { apiClient } from "../config/api";
import { parseApiError } from "../config/api-error";
import {
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
      console.error("❌ Error in AuthService.login", error);
      throw error;
    }
  },

  register: async (request: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post("/auth/register", request);
      return response.data;
    } catch (error) {
      console.error("❌ Error in AuthService.register", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    await apiClient.post<void>("/auth/logout");
  },

  /**
   * Exchange the HttpOnly refresh cookie for a new access token.
   * 401 is expected when there is no session (e.g. bootstrap on a logged-out visit).
   */
  refresh: async (): Promise<RefreshResponse> => {
    try {
      const response = await apiClient.post<RefreshResponse>("/auth/refresh");
      return response.data;
    } catch (error) {
      if (parseApiError(error).statusCode !== 401) {
        console.error("❌ Error in AuthService.refresh", error);
      }
      throw error;
    }
  },
};
