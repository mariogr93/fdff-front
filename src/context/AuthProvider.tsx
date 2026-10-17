import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  getAccessToken,
  onLogoutInOtherTab,
  registerAuthLifecycleHandlers,
  setAccessToken,
  type SessionRefreshPayload,
} from "../auth/auth-session.store";
import { AuthContext, type AuthContextValue, type AuthSession } from "./auth-context";
import { AuthService } from "../services/Auth.service";

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

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

  // Another tab signed out. Only a tab that had a session is sent to the login page;
  // a signed-out visitor on a public page stays where they are.
  useEffect(
    () =>
      onLogoutInOtherTab(() => {
        if (getAccessToken() === null) {
          return;
        }

        setAccessToken(null);
        setSessionState(null);
        navigate("/login", { replace: true });
      }),
    [navigate]
  );

  // Restore session from HttpOnly refresh cookie after a full page reload.
  // Memory was wiped; the cookie may still be valid.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await AuthService.refresh();
        if (!cancelled) {
          setSession({
            accessToken: data.accessToken,
            accountId: data.accountId,
            role: data.role,
          });
        }
      } catch {
        // No cookie / expired / network — stay logged out. Do not redirect.
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: session?.accessToken ?? null,
      accountId: session?.accountId ?? null,
      role: session?.role ?? null,
      isAuthenticated: session !== null,
      isBootstrapping,
      setSession,
      clearSession,
    }),
    [session, isBootstrapping, setSession, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
