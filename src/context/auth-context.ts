import { createContext } from "react";
import type {
  AccountRole,
  LoginRequest,
} from "../types/authentication.models";

/** Who is signed in. The access token is deliberately absent: it lives only in src/auth. */
export interface AuthIdentity {
  accountId: string;
  role: AccountRole;
  /** Signed in with a temporary password: only the change-password page is usable. */
  mustChangePassword: boolean;
}

export interface AuthContextValue {
  accountId: string | null;
  role: AccountRole | null;
  mustChangePassword: boolean;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  /** Signs in; rejects with the API error so the form can show a message. */
  login: (request: LoginRequest) => Promise<void>;
  /** Ends the session on the server, here, and in other tabs. Never rejects. */
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
