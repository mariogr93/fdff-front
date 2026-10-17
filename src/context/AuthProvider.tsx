import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  broadcastLogout,
  getAccessToken,
  onLogoutInOtherTab,
  registerAuthLifecycleHandlers,
  setAccessToken,
  type SessionRefreshPayload,
} from "../auth/auth-session.store";
import { AuthContext, type AuthContextValue, type AuthIdentity } from "./auth-context";
import { AuthService } from "../services/Auth.service";
import { logApiError } from "../config/api-error";
import type { LoginRequest, LoginResponse } from "../types/authentication.models";

/**
 * Owns the session. The access token goes only to the in-memory store used by the
 * Axios interceptors; React state and the context hold identity (account and role).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState<AuthIdentity | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const startSession = useCallback((session: LoginResponse) => {
    setAccessToken(session.accessToken);
    setIdentity({ accountId: session.accountId, role: session.role });
  }, []);

  const endSession = useCallback(() => {
    setAccessToken(null);
    setIdentity(null);
  }, []);

  useEffect(() => {
    registerAuthLifecycleHandlers({
      onSessionRefreshed: (payload: SessionRefreshPayload) => {
        setIdentity({ accountId: payload.accountId, role: payload.role });
      },
      onAuthFailure: () => {
        endSession();
        navigate("/login", { replace: true });
      },
    });
  }, [navigate, endSession]);

  // Another tab signed out. Only a tab that had a session is sent to the login page;
  // a signed-out visitor on a public page stays where they are.
  useEffect(
    () =>
      onLogoutInOtherTab(() => {
        if (getAccessToken() === null) {
          return;
        }

        endSession();
        navigate("/login", { replace: true });
      }),
    [navigate, endSession]
  );

  // Restore session from HttpOnly refresh cookie after a full page reload.
  // Memory was wiped; the cookie may still be valid.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const session = await AuthService.refresh();
        if (!cancelled) {
          startSession(session);
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
  }, [startSession]);

  const login = useCallback(
    async (request: LoginRequest) => {
      startSession(await AuthService.login(request));
    },
    [startSession]
  );

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      logApiError("logout", error);
    } finally {
      endSession();
      broadcastLogout();
    }
  }, [endSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accountId: identity?.accountId ?? null,
      role: identity?.role ?? null,
      isAuthenticated: identity !== null,
      isBootstrapping,
      login,
      logout,
    }),
    [identity, isBootstrapping, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
