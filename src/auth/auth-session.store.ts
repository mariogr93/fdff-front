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

/** The session ended for good (refresh answered 401): sign out here and in other tabs. */
export function notifyAuthFailure(): void {
  setAccessToken(null);
  lifecycleHandlers?.onAuthFailure();
  broadcastLogout();
}

/**
 * Cross-tab sign-out. Carries only the word "logout", never a token.
 * A tab does not receive its own messages. Without BroadcastChannel, other tabs
 * find out on their next API call, when the refresh answers 401.
 */
const AUTH_CHANNEL_NAME = "fdff-auth";
const LOGOUT_MESSAGE = "logout";

const authChannel =
  typeof BroadcastChannel === "undefined"
    ? null
    : new BroadcastChannel(AUTH_CHANNEL_NAME);

export function broadcastLogout(): void {
  authChannel?.postMessage(LOGOUT_MESSAGE);
}

/** Calls `handler` when another tab signs out. Returns the unsubscribe function. */
export function onLogoutInOtherTab(handler: () => void): () => void {
  if (!authChannel) {
    return () => {};
  }

  const listener = (event: MessageEvent) => {
    if (event.data === LOGOUT_MESSAGE) {
      handler();
    }
  };

  authChannel.addEventListener("message", listener);
  return () => authChannel.removeEventListener("message", listener);
}
