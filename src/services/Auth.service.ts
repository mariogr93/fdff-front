import axios from "axios";
import apiClient from "../config/api";
import {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/authentication.models";

const AuthService = {
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
      const isUnauthorized =
        axios.isAxiosError(error) && error.response?.status === 401;
      if (!isUnauthorized) {
        console.error("❌ Error in AuthService.refresh", error);
      }
      throw error;
    }
  },
};

export default AuthService;
