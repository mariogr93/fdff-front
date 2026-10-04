# React Authentication Changelog

**Audience:** FDFF frontend team  
**Repository:** `fdff-front`  
**Last updated:** June 2026

This document records what changed in the React SPA during the authentication hardening initiative, why we abandoned browser storage for tokens, and how login and silent refresh behave from the browser’s point of view.

---

## Summary

We replaced an ad-hoc auth approach with a layered, security-first client architecture:

1. **Signup hardening** — Zod + React Hook Form validate input before it reaches the API; only the minimum auth fields are sent to the backend.
2. **In-memory access tokens** — The short-lived JWT lives only in volatile memory, never in `localStorage` or `sessionStorage`.
3. **HttpOnly refresh cookies** — The long-lived refresh token is set by the server as an HttpOnly cookie; JavaScript cannot read or write it.
4. **Silent refresh** — An Axios response interceptor catches `401 Unauthorized`, refreshes the session once, queues concurrent failures, and replays them automatically.

---

## Why We Moved Away from `localStorage`

### The problem

Storing JWTs in `localStorage` or `sessionStorage` is convenient, but it exposes tokens to **any JavaScript running on the page**. If an attacker injects script via:

- A compromised npm dependency
- A stored XSS vulnerability
- A malicious browser extension

…they can run `localStorage.getItem('token')` and exfiltrate the credential. Access tokens are bearer tokens: possession equals authentication.

### Our decision

| Token | Where it lives | Who can access it |
|-------|----------------|-------------------|
| **Access token** (short-lived, ~15 min) | Volatile in-memory store + React Context | Only our app code during the active tab session |
| **Refresh token** (long-lived, ~7 days) | HttpOnly cookie set by NestJS | Browser sends it automatically; **JavaScript cannot read it** |

### Trade-off the team should know

In-memory storage means a **full page reload clears the access token** from React state. The user may still have a valid refresh cookie, but today we do not automatically bootstrap a new access token on mount—that is a planned follow-up. Until then, users may need to log in again after a hard refresh unless silent refresh is triggered by an API call while the cookie is still valid.

---

## Files Added or Changed

### New files

| File | Purpose |
|------|---------|
| `src/auth/auth-session.store.ts` | Module-level in-memory token store for Axios interceptors, plus lifecycle callbacks to sync with React after refresh or auth failure |
| `src/context/AuthProvider.tsx` | React Context holding `accessToken`, `accountId`, `role`, `isAuthenticated`, `setSession()`, `clearSession()` |
| `src/config/api.ts` | Central Axios client with request/response interceptors, refresh queue, and dedicated `refreshClient` |
| `src/services/Auth.service.ts` | Thin API wrapper: `login()`, `register()`, `refresh()` |
| `src/types/authentication.models.ts` | TypeScript contracts for auth request/response payloads |
| `src/schemas/auth-fields.schema.ts` | Shared Zod primitives (`emailSchema`, `loginPasswordSchema`) |
| `src/schemas/login.schema.ts` | Login form validation schema |
| `src/schemas/signup.schema.ts` | Signup form validation with password entropy rules |
| `src/utils/login.mapper.ts` | Maps validated login form → `LoginRequest` |
| `src/utils/signup.mapper.ts` | Maps validated signup form → `RegisterRequest` (profile fields stripped) |
| `src/components/LoginForm.tsx` | Login UI with React Hook Form + Zod |
| `src/components/SigninForm.tsx` | Signup UI with React Hook Form + Zod |
| `src/pages/AuthPage.tsx` | `/login` and `/register` page; wires forms to `AuthService` and `setSession()` |
| `src/Routes.tsx` | App routing including auth routes |

### Modified files

| File | Change |
|------|--------|
| `src/main.jsx` | Wraps the app in `BrowserRouter` → `AuthProvider` → `FDFFRoutes` |
| `src/components/Header.tsx` | Reads `useAuth()` for login/logout UI instead of reading tokens from storage |
| `src/App.jsx` | Shell layout with global `Header` and `<Outlet />` for nested routes |

### Intentionally removed pattern

- **No `localStorage` / `sessionStorage` usage for tokens** anywhere in `src/`. Grep the repo for `localStorage` before adding auth utilities.

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│  React UI (LoginForm, Header, protected pages)                  │
│       │                                                         │
│       ▼                                                         │
│  AuthProvider (Context)  ◄──── lifecycle callbacks ────┐         │
│       │                                                 │         │
│       ▼                                                 │         │
│  auth-session.store.ts (in-memory accessToken) ◄─────┤         │
│       ▲                                                 │         │
│       │ getAccessToken()                                │         │
│       ▼                                                 │         │
│  api.ts (Axios interceptors) ──► notifySessionRefreshed()       │
│       │                         notifyAuthFailure() ───┘         │
│       ▼                                                         │
│  NestJS API  (/api/auth/login, /register, /refresh)             │
│       │                                                         │
│       └── Set-Cookie: refresh_token (HttpOnly)                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key design choice:** `api.ts` cannot import React Context (circular dependency risk). The `auth-session.store.ts` module sits between Axios and React, giving interceptors synchronous token access while still notifying `AuthProvider` when refresh succeeds or fails.

---

## Step-by-Step: Login Flow (Client Perspective)

Here is what happens when a user submits the login form.

### 1. User fills out the form

- `LoginForm` uses **React Hook Form** with a **Zod** resolver (`login.schema.ts`).
- Client-side checks run first: valid email format, password length 8–20 characters.
- Invalid input never leaves the browser.

### 2. Form data is mapped to the API contract

- `toLoginRequest()` in `login.mapper.ts` produces `{ email, password }` — nothing else.

### 3. `AuthService.login()` posts to the API

- Request goes to `POST /api/auth/login` via `apiClient`.
- `withCredentials: true` is enabled so the browser can **receive** the HttpOnly cookie in the response.
- `/auth/login` is listed as a **public route** — the request interceptor does **not** attach a `Bearer` token.

### 4. Server responds

- **JSON body:** `{ accessToken, accountId, role }`
- **Set-Cookie header:** `refresh_token=…; HttpOnly; SameSite=Strict; Path=/api/auth` (and `Secure` in production)

The refresh token is **not** in the JSON body. Our frontend code never sees it.

### 5. Session is stored in memory

- `AuthPage.onLogin()` calls `setSession()` from `useAuth()`.
- `AuthProvider.setSession()`:
  1. Writes `accessToken` to `auth-session.store.ts` (for Axios)
  2. Stores `{ accessToken, accountId, role }` in React state (for UI)

### 6. User is redirected

- `navigate("/")` sends the user to the home page.
- `Header` reads `isAuthenticated` and `role` from context to show Logout vs Login buttons.

### 7. Subsequent API calls are authenticated

- Any protected request through `apiClient` triggers the **request interceptor**.
- It reads `getAccessToken()` and sets `Authorization: Bearer <token>`.
- If no token exists, the request is cancelled before it is sent.

---

## Step-by-Step: Silent Refresh Flow (Client Perspective)

This runs automatically. Application code does not call refresh manually during normal API usage.

### 1. Access token expires

- The JWT has a short TTL (configured server-side, typically ~15 minutes).
- The in-memory token is still present but is no longer accepted by the API.

### 2. A protected API call returns 401

- Example: loading athletes, events, or any authenticated endpoint.
- Axios response interceptor in `api.ts` inspects the error.

### 3. Interceptor decides whether to refresh

Refresh is **skipped** when:

- The error is not a `401`
- The failed request was `/auth/login` or `/auth/register` (wrong credentials — not an expiry issue)
- The failed request was `/auth/refresh` itself (refresh is invalid — avoid infinite loops)
- The request was already retried once (`_retry` flag)

### 4. Concurrent requests are queued (race-condition guard)

If five API calls fail at the same time with `401`:

1. **Request A** sets `isRefreshing = true` and calls `POST /auth/refresh`.
2. **Requests B–E** see `isRefreshing === true` and are pushed into `failedQueue` as pending Promises.
3. Only **one** refresh HTTP call is made.

### 5. Refresh uses a separate Axios instance

- `refreshClient` is a bare Axios instance with `withCredentials: true` but **no interceptors**.
- It posts to `/auth/refresh`.
- The browser automatically attaches the HttpOnly `refresh_token` cookie.
- No `Authorization` header is needed or sent.

### 6. Refresh succeeds

- Server returns a new `accessToken` (and rotates the refresh cookie).
- `notifySessionRefreshed()` updates:
  - In-memory token in `auth-session.store.ts`
  - React state in `AuthProvider` (via registered lifecycle handler)
- `processQueue(null, newToken)` resolves all queued requests with the new token.
- Each queued request is **replayed** with an updated `Authorization` header.
- The original failed request is also replayed.
- `isRefreshing` is set back to `false`.

From the user’s perspective: a brief delay, then data loads normally. No redirect, no login modal.

### 7. Refresh fails (cookie missing, expired, or revoked)

- `processQueue(refreshError)` rejects all queued requests.
- `notifyAuthFailure()`:
  - Clears in-memory token
  - Clears React session state
  - Navigates to `/login` with `replace: true`
- The user must authenticate again.

---

## Signup Flow (Brief)

Signup follows the same security patterns as login, with stricter password rules on the client:

- `signup.schema.ts` enforces entropy: uppercase, lowercase, number, special character.
- `toRegisterRequest()` sends only `{ email, password, role }` to `POST /api/auth/register`.
- Extra profile fields (name, phone, categories, etc.) are validated in the UI but **not** sent to the auth API yet; they are reserved for a future profile endpoint via `toSignupProfileDraft()`.

---

## Public vs Protected Routes (Axios)

Defined in `src/config/api.ts`:

```ts
const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];
```

| Path | Bearer token attached? | Triggers silent refresh on 401? |
|------|------------------------|----------------------------------|
| `/auth/login` | No | No |
| `/auth/register` | No | No |
| `/auth/refresh` | No | No |
| All other `/api/*` routes | Yes (if token in memory) | Yes |

Both `apiClient` and `uploadApiClient` share the same interceptors.

---

## Developer Guidelines

### Do

- Use `useAuth()` in components for session-aware UI.
- Use `apiClient` (default export from `config/api.ts`) for all authenticated API calls.
- Call `setSession()` after a successful login.
- Call `clearSession()` on explicit logout (`Header` already does this).

### Do not

- Store tokens in `localStorage`, `sessionStorage`, or cookies from JavaScript.
- Read or log the refresh token — it is HttpOnly by design.
- Bypass `apiClient` with raw `fetch()` for protected resources unless you replicate `withCredentials` and interceptors.
- Attach tokens manually in every component — the request interceptor handles it.

### Adding a new protected endpoint

No auth boilerplate is required in the component. Import `apiClient`, call the endpoint, and the interceptors attach the token and handle expiry.

```ts
import apiClient from "../config/api";

const response = await apiClient.get("/some-protected-resource");
```

---

## Known Limitations & Follow-Ups

| Item | Status |
|------|--------|
| Bootstrap access token on page load via silent refresh | Not implemented — user may appear logged out after hard refresh until next API call or re-login |
| Server-side logout clearing HttpOnly cookie | Not implemented — `clearSession()` only clears client memory |
| `AuthService.refresh()` | Exists for explicit/testing use; production flow relies on the interceptor + `refreshClient` |

---

## Related Documentation

- `docs/auth-flow.md` — High-level architecture rationale and threat model
- Backend IAM docs — `fdff-backend/docs/README-IAM.md` (server-side token issuance, cookie flags, throttling)

---

## Questions?

If you are unsure whether a change touches the auth boundary, ask before merging:

1. Does this code persist a token anywhere in the browser?
2. Does this code bypass the Axios interceptors?
3. Does this code expose the refresh token to JavaScript?

If the answer to any of those is **yes**, it needs a security review before merge.
