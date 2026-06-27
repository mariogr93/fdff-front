/**
 * Volatile in-memory token store for Axios interceptors.
 * Intentionally outside React so api.ts does not depend on context.
 */
let accessToken: string | null = null;

export interface SessionRefreshPayload {
  accessToken: string;
  accountId: string;
  role: string;
}

export interface AuthLifecycleHandlers {
  onSessionRefreshed: (session: SessionRefreshPayload) => void;
  onAuthFailure: () => void;
}

let lifecycleHandlers: AuthLifecycleHandlers | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function registerAuthLifecycleHandlers(
  handlers: AuthLifecycleHandlers
): void {
  lifecycleHandlers = handlers;
}

export function notifySessionRefreshed(session: SessionRefreshPayload): void {
  setAccessToken(session.accessToken);
  lifecycleHandlers?.onSessionRefreshed(session);
}

export function notifyAuthFailure(): void {
  setAccessToken(null);
  lifecycleHandlers?.onAuthFailure();
}
