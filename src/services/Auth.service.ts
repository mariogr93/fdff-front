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
      const response = await apiClient.post('/auth/login', request);
      return response.data;
    } catch (error) {
      console.error("❌ Error in AuthService.login", error);
      throw error;
    }
  },

  register: async (request: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post('/auth/register', request);
      return response.data;
    } catch (error) {
      console.error("❌ Error in AuthService.register", error);
      throw error;
    }
  },

  refresh: async (): Promise<RefreshResponse> => {
    try {
      const response = await apiClient.post<RefreshResponse>("/auth/refresh");
      return response.data;
    } catch (error) {
      console.error("❌ Error in AuthService.refresh", error);
      throw error;
    }
  },
};

export default AuthService;
