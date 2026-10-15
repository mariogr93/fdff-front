import { apiClient } from "../config/api";
import type {
  AccountResponse,
  CreateAccountRequest,
} from "../types/authentication.models";

/** Admin account management (`/accounts`). Every route is ADMIN only on the server. */
export const AccountService = {
  /** Creates an account with an explicit role. It starts ACTIVE, unlike public signup. */
  create: async (request: CreateAccountRequest): Promise<AccountResponse> => {
    const response = await apiClient.post<AccountResponse>("/accounts", request);
    return response.data;
  },
};
