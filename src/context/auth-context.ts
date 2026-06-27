import { createContext } from "react";

export interface AuthSession {
  accessToken: string;
  accountId: string;
  role: string;
}

export interface AuthContextValue {
  accessToken: string | null;
  accountId: string | null;
  role: string | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
