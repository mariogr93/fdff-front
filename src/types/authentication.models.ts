export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  accountId: string;
  role: string;
}

export type RefreshResponse = LoginResponse;


export interface RegisterRequest {
  email: string;
  password: string;
  role: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  role: string;
}