/**
 * Hand-mapped from the backend OpenAPI spec (`GET /api/docs-json`, development only).
 * Each type names the backend DTO it mirrors. When a DTO changes in fdff-backend,
 * update the matching type here; do not add fields the spec does not declare.
 */

export type AccountRole = "ADMIN" | "JUDGE" | "ATHLETE";

export type AccountStatus = "PENDING" | "ACTIVE" | "INACTIVE";

/** `LoginDto`: body of `POST /auth/login`. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** `AuthSessionResponseDto`: `200` of `POST /auth/login` and `POST /auth/refresh`. */
export interface LoginResponse {
  accessToken: string;
  accountId: string;
  role: AccountRole;
}

export type RefreshResponse = LoginResponse;

/**
 * `RegisterAccountDto`: body of `POST /auth/register`. Public signup always
 * creates an ATHLETE, so `role` is optional and only `"ATHLETE"` is accepted.
 */
export interface RegisterRequest {
  email: string;
  password: string;
  role?: "ATHLETE";
}

/** `AccountResponseDto`: `201` of `POST /auth/register` and `POST /accounts`. */
export interface AccountResponse {
  id: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
}

export type RegisterResponse = AccountResponse;

/** `CreateAccountDto`: body of `POST /accounts` (ADMIN only, account created ACTIVE). */
export interface CreateAccountRequest {
  email: string;
  password: string;
  role: AccountRole;
}

/** `AccountsPageResponseDto`: `200` of `GET /accounts` (ADMIN only). */
export interface AccountsPageResponse {
  data: AccountResponse[];
  total: number;
  page: number;
  limit: number;
}
