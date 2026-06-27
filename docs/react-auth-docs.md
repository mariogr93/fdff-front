# React Authentication — Technical Reference

**Repository:** `fdff-front`  
**Scope:** Client-side authentication infrastructure (Axios, session state, API conventions)  
**Audience:** Developers building features that call the FDFF REST API

For narrative context on *why* these decisions were made, see [`auth-flow.md`](./auth-flow.md). For a file-by-file changelog of what shipped, see [`react-auth-changelog.md`](./react-auth-changelog.md).

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Module Reference](#module-reference)
3. [In-Memory State Management](#in-memory-state-management)
4. [Axios Client & Interceptors](#axios-client--interceptors)
5. [Making Authenticated API Calls](#making-authenticated-api-calls)
6. [Session Lifecycle](#session-lifecycle)
7. [Environment Configuration](#environment-configuration)
8. [Extension Guidelines](#extension-guidelines)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The SPA uses a **dual-token model**:

| Token | Lifetime | Storage | Transport |
|-------|----------|---------|-----------|
| Access token (JWT, RS256) | ~15 minutes | Volatile memory only | `Authorization: Bearer <token>` header |
| Refresh token (opaque) | ~7 days | HttpOnly cookie (`refresh_token`) | Browser sends automatically with `withCredentials: true` |

```text
┌──────────────┐     Bearer header      ┌──────────────┐
│  apiClient   │ ─────────────────────► │  NestJS API  │
│ (interceptors)│ ◄── 401 if expired ── │  /api/*      │
└──────┬───────┘                        └──────┬───────┘
       │                                         │
       │ POST /auth/refresh                      │ Set-Cookie
       │ (refreshClient, cookie only)            │ refresh_token
       ▼                                         ▼
┌──────────────┐                        ┌──────────────┐
│ auth-session │ ◄── notify*() ──────── │ AuthProvider │
│    .store    │                        │  (React)     │
└──────────────┘                        └──────────────┘
```

**Design constraint:** Axios interceptors run outside the React render tree. They cannot call `useAuth()`. A module-level store (`auth-session.store.ts`) bridges Axios and React Context via explicit lifecycle callbacks.

---

## Module Reference

| Module | Path | Responsibility |
|--------|------|----------------|
| HTTP client | `src/config/api.ts` | Axios instances, request/response interceptors, refresh queue |
| Token store | `src/auth/auth-session.store.ts` | In-memory `accessToken`; lifecycle notifications |
| React session | `src/context/AuthProvider.tsx` | UI-facing session state; `useAuth()` hook |
| Auth API | `src/services/Auth.service.ts` | `login`, `register`, `refresh` endpoints |
| Types | `src/types/authentication.models.ts` | Request/response interfaces |
| App bootstrap | `src/main.jsx` | `BrowserRouter` → `AuthProvider` → routes |

### Exported HTTP clients

```ts
import apiClient, { uploadApiClient } from "../config/api";
```

| Export | Timeout | Use when |
|--------|---------|----------|
| `apiClient` (default) | `VITE_API_TIMEOUT` (default 10s) | Standard JSON API calls |
| `uploadApiClient` | 5 minutes | File uploads or long-running transfers |

Both clients share identical auth interceptors.

---

## In-Memory State Management

Session state is split across two layers by design.

### Layer 1: `auth-session.store.ts` (interceptor layer)

A closure-scoped variable holds the access token for synchronous reads inside Axios interceptors.

```ts
// Read — used by request interceptor
getAccessToken(): string | null

// Write — used by AuthProvider on login/logout
setAccessToken(token: string | null): void

// Called by response interceptor after successful refresh
notifySessionRefreshed(session: SessionRefreshPayload): void

// Called by response interceptor when refresh fails
notifyAuthFailure(): void

// Registered once by AuthProvider on mount
registerAuthLifecycleHandlers(handlers: AuthLifecycleHandlers): void
```

**Rules:**

- Only `AuthProvider` and the interceptors in `api.ts` should mutate this store.
- Feature code must **not** import `setAccessToken` directly — use `setSession()` / `clearSession()` from `useAuth()`.
- Never persist `accessToken` to `localStorage`, `sessionStorage`, IndexedDB, or a JS-readable cookie.

### Layer 2: `AuthProvider` (UI layer)

React Context exposes session data and actions to components.

```ts
interface AuthContextValue {
  accessToken: string | null;
  accountId: string | null;
  role: string | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
}
```

```ts
const { isAuthenticated, role, setSession, clearSession } = useAuth();
```

**Synchronization contract:**

| Event | `auth-session.store` | `AuthProvider` state |
|-------|----------------------|---------------------|
| Login (`setSession`) | `setAccessToken(token)` | Full session object |
| Silent refresh | `notifySessionRefreshed()` updates token | `accessToken` updated; `accountId`/`role` preserved |
| Refresh failure | `notifyAuthFailure()` clears token | Session cleared; redirect to `/login` |
| Logout (`clearSession`) | `setAccessToken(null)` | Session set to `null` |

`AuthProvider` registers lifecycle handlers in a `useEffect` so interceptors can push token updates into React without creating a circular import between `api.ts` and context.

### Provider placement

```tsx
// src/main.jsx
<BrowserRouter>
  <AuthProvider>
    <FDFFRoutes />
  </AuthProvider>
</BrowserRouter>
```

`useAuth()` throws if called outside `AuthProvider`. `AuthProvider` must be rendered inside `BrowserRouter` because it uses `useNavigate()` for auth-failure redirects.

---

## Axios Client & Interceptors

All configuration lives in `src/config/api.ts`.

### Base configuration

```ts
const apiClient = axios.create({
  baseURL: getBaseUrl(),   // "/api" in dev, or VITE_API_BASE_URL
  timeout: 10_000,         // VITE_API_TIMEOUT
  withCredentials: true,   // Required for HttpOnly refresh cookie
});
```

`withCredentials: true` is mandatory. Without it, the browser will not send or store the `refresh_token` cookie across origins.

### Public routes

These paths skip the `Authorization` header in the **request** interceptor:

```ts
const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];
```

Matching is substring-based (`url?.includes(path)`), so `/api/auth/login` and `/auth/login` both qualify.

### Request interceptor

```text
Incoming request
       │
       ▼
  Is public auth route? ──yes──► Forward without Bearer token
       │
       no
       ▼
  getAccessToken() exists? ──no──► Cancel request (axios.Cancel)
       │
       yes
       ▼
  Set Authorization: Bearer <token>
```

Protected requests without an in-memory token are cancelled **before** they reach the network. This is intentional: unauthenticated calls should fail fast rather than produce a misleading `401` from the server.

### Response interceptor — 401 handling

```text
Response error
       │
       ▼
  status === 401? ──no──► reject(error)
       │
       yes
       ▼
  Is /auth/login, /auth/register, or /auth/refresh? ──yes──► reject(error)
       │
       no
       ▼
  originalRequest._retry === true? ──yes──► reject(error)   [loop guard]
       │
       no
       ▼
  isRefreshing === true? ──yes──► Enqueue in failedQueue; replay after refresh
       │
       no
       ▼
  Set _retry = true, isRefreshing = true
  POST /auth/refresh via refreshClient
       │
       ├── success ──► notifySessionRefreshed()
       │                 processQueue(token)
       │                 Replay original request
       │
       └── failure ──► processQueue(error)
                         notifyAuthFailure() → clear session, /login
       │
       finally: isRefreshing = false
```

### Refresh queue

Module-level state prevents concurrent refresh storms:

```ts
let isRefreshing = false;
let failedQueue: QueueItem[] = [];
```

When multiple protected requests fail with `401` simultaneously, only the first triggers `POST /auth/refresh`. The rest wait in `failedQueue` and are replayed with the new token once refresh succeeds.

### `refreshClient` (loop isolation)

Token refresh uses a **separate** Axios instance with no interceptors:

```ts
const refreshClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});
```

This prevents the response interceptor from intercepting its own refresh call and entering an infinite retry loop.

### Retry flag

```ts
type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};
```

Each failed request is retried at most once. If the replayed request still returns `401` (e.g., insufficient permissions, not expiry), the error propagates to the caller without another refresh attempt.

---

## Making Authenticated API Calls

### Standard pattern (recommended)

Create a service module per domain. Import the shared client; do not create new Axios instances for authenticated routes.

```ts
// src/services/Events.service.ts
import apiClient from "../config/api";

export interface EventDto {
  id: string;
  name: string;
}

const EventsService = {
  list: async (): Promise<EventDto[]> => {
    const { data } = await apiClient.get<EventDto[]>("/events");
    return data;
  },

  getById: async (id: string): Promise<EventDto> => {
    const { data } = await apiClient.get<EventDto>(`/events/${id}`);
    return data;
  },

  create: async (payload: { name: string }): Promise<EventDto> => {
    const { data } = await apiClient.post<EventDto>("/events", payload);
    return data;
  },
};

export default EventsService;
```

**You do not need to:**

- Manually set `Authorization` headers
- Handle `401` and call `/auth/refresh` yourself
- Pass `withCredentials` per request (it is set on the client)

**You do need to:**

- Ensure the user has an active session (`isAuthenticated === true`) before calling protected endpoints from UI flows
- Handle rejected promises for business errors (`400`, `403`, `404`, `500`, etc.)

### Using auth state in components

```tsx
import { useAuth } from "../context/AuthProvider";
import EventsService from "../services/Events.service";

function EventsPage() {
  const { isAuthenticated } = useAuth();

  const loadEvents = async () => {
    if (!isAuthenticated) return;
    const events = await EventsService.list();
    // ...
  };

  // ...
}
```

For conditional rendering (nav, guards), prefer `isAuthenticated`, `role`, and `accountId` from `useAuth()`. Do not read `getAccessToken()` in components.

### File uploads

Use `uploadApiClient` for endpoints that may exceed the default timeout:

```ts
import { uploadApiClient } from "../config/api";

const formData = new FormData();
formData.append("file", file);

const { data } = await uploadApiClient.post("/uploads", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
```

The upload client applies the same Bearer injection and silent refresh logic.

### Public (unauthenticated) endpoints

If an endpoint does not require auth and is **not** under `/auth/login`, `/auth/register`, or `/auth/refresh`, you have two options:

1. **Preferred:** Add the path to `PUBLIC_AUTH_PATHS` in `api.ts` if it is a first-class public API route.
2. **Alternative:** Accept that the request interceptor will cancel the call if no token is in memory. Public feature endpoints should be explicitly allowlisted.

### Anti-patterns

| Do not | Why |
|--------|-----|
| `axios.create()` per feature | Bypasses interceptors and refresh queue |
| `fetch("/api/...")` without credentials | Refresh cookie not sent; no silent refresh |
| `localStorage.setItem("token", ...)` | XSS can exfiltrate bearer credentials |
| `useAuth().accessToken` in service files | Services must stay decoupled from React |
| Call `AuthService.refresh()` in feature code | Production refresh is interceptor-driven |

---

## Session Lifecycle

### Establishing a session (login)

```ts
// Typically in AuthPage — not in a generic service caller
const response = await AuthService.login({ email, password });

setSession({
  accessToken: response.accessToken,
  accountId: response.accountId,
  role: response.role,
});
```

`setSession()` writes to both the module store and React state. The HttpOnly refresh cookie is stored by the browser automatically from the login response.

### Maintaining a session (silent refresh)

Automatic. Any `401` on a protected route triggers the interceptor flow described above. No application code is required.

### Ending a session (logout)

```ts
const { clearSession } = useAuth();

clearSession();
navigate("/");
```

`clearSession()` removes the in-memory access token and React session. **Note:** The HttpOnly refresh cookie remains until the backend implements a logout endpoint that clears it via `Set-Cookie` with `Max-Age=0`. Until then, a silent refresh could theoretically re-establish a session if called before cookie expiry.

### Auth failure redirect

When `/auth/refresh` returns `401` or network failure during refresh:

1. `notifyAuthFailure()` clears all client session state
2. `AuthProvider` navigates to `/login` with `{ replace: true }`
3. All queued requests are rejected

---

## Environment Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `/api` | API base URL. Unset in local dev uses Vite proxy. |
| `VITE_API_TIMEOUT` | No | `10000` | Default Axios timeout (ms) |

```bash
# .env.example
VITE_API_TIMEOUT=10000
```

**Local development:** Leave `VITE_API_BASE_URL` unset. Vite proxies `/api` → `http://localhost:3000/api`.

**Direct API (no proxy):**

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

CORS on the backend must allow your frontend origin with `credentials: true` when not using the dev proxy.

---

## Extension Guidelines

### Adding a new protected service

1. Create `src/services/<Domain>.service.ts`
2. Import `apiClient` (or `uploadApiClient`)
3. Type your DTOs in `src/types/` or colocate interfaces
4. Call endpoints with standard Axios verbs (`get`, `post`, `put`, `patch`, `delete`)
5. Let errors propagate; handle them in the UI layer

### Adding route guards (future)

When protecting routes by role:

```tsx
// Pattern sketch — implement in src/components/ or src/guards/
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
}
```

Use `role` from `useAuth()` for RBAC checks aligned with backend `@Roles()` decorators.

### Bootstrap on page load (future)

To restore sessions after a hard refresh without forcing re-login:

1. On `AuthProvider` mount, if `!isAuthenticated`, call `POST /auth/refresh` via `refreshClient` or `AuthService.refresh()`
2. On success, call `setSession()` with the response
3. On failure, remain unauthenticated (cookie absent or expired)

This is not yet implemented. See [Troubleshooting](#troubleshooting).

### Adding a new public API path

Update `PUBLIC_AUTH_PATHS` in `src/config/api.ts`:

```ts
const PUBLIC_AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/public/health", // example
];
```

---

## Troubleshooting

### Request cancelled: "No access token available"

**Cause:** A protected endpoint was called while `getAccessToken()` is `null`.

**Fix:** Ensure `setSession()` ran after login, or guard the UI with `isAuthenticated`. For post-refresh page loads, implement bootstrap refresh (see Extension Guidelines).

### Cookie not sent on refresh

**Cause:** `withCredentials` disabled, CORS misconfiguration, or cross-origin request without proper `Access-Control-Allow-Credentials`.

**Fix:** Confirm `apiClient` has `withCredentials: true`. In dev, prefer the `/api` Vite proxy. Verify backend `FRONTEND_URL` matches your origin.

### Infinite redirect to `/login`

**Cause:** Protected page fires API calls immediately on mount before session exists, refresh fails, `notifyAuthFailure()` redirects.

**Fix:** Gate data fetching on `isAuthenticated`, or implement bootstrap refresh on mount.

### Multiple `/auth/refresh` calls in Network tab

**Expected:** One refresh per expiry window. If you see many, check for Axios instances created outside `api.ts` or requests bypassing the queue.

### `401` on login/register not refreshing

**Expected:** Login and register `401` responses are credential errors, not token expiry. The interceptor deliberately does not attempt refresh for those paths.

---

## Quick Reference

```ts
// Authenticated API call
import apiClient from "../config/api";
const { data } = await apiClient.get("/my-resource");

// Auth state in UI
import { useAuth } from "../context/AuthProvider";
const { isAuthenticated, role, setSession, clearSession } = useAuth();

// Login (page-level only)
import AuthService from "../services/Auth.service";
const res = await AuthService.login({ email, password });
setSession(res);
```

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [`auth-flow.md`](./auth-flow.md) | Cross-stack architecture blueprint (Phases 1–5) |
| [`react-auth-changelog.md`](./react-auth-changelog.md) | Team changelog: what changed and why |
| `fdff-backend/docs/README-IAM.md` | Server-side IAM: JWT, cookies, throttling, refresh rotation |
