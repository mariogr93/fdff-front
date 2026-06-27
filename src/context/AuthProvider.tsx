import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  registerAuthLifecycleHandlers,
  setAccessToken,
  type SessionRefreshPayload,
} from "../auth/auth-session.store";
import { AuthContext, type AuthContextValue, type AuthSession } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSessionState] = useState<AuthSession | null>(null);

  const setSession = useCallback((next: AuthSession) => {
    setAccessToken(next.accessToken);
    setSessionState(next);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setSessionState(null);
  }, []);

  useEffect(() => {
    registerAuthLifecycleHandlers({
      onSessionRefreshed: (payload: SessionRefreshPayload) => {
        setSessionState((current) =>
          current
            ? { ...current, accessToken: payload.accessToken }
            : {
                accessToken: payload.accessToken,
                accountId: payload.accountId,
                role: payload.role,
              }
        );
      },
      onAuthFailure: () => {
        setAccessToken(null);
        setSessionState(null);
        navigate("/login", { replace: true });
      },
    });
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: session?.accessToken ?? null,
      accountId: session?.accountId ?? null,
      role: session?.role ?? null,
      isAuthenticated: session !== null,
      setSession,
      clearSession,
    }),
    [session, setSession, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
