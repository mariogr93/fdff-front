# Authentication in fdff-front

How the SPA signs people in and keeps the session. The API contract (transport rules, response and error shapes, status meanings, field rules) is `../fdff-backend/docs/README-IAM.md` section 14; this file covers only the client side.

## Files

| Path | Role |
| --- | --- |
| `src/auth/auth-session.store.ts` | The only place the access token lives (memory). Lifecycle hooks and the cross-tab channel `fdff-auth` |
| `src/config/api.ts` | `apiClient` / `uploadApiClient`, Bearer header, `401` → one refresh and one retry, `refreshSession()` |
| `src/config/api-error.ts` | `parseApiError()` → `{ statusCode, error, isNetworkError }`; dev-only `logApiError()` |
| `src/context/AuthProvider.tsx` | Page-load bootstrap, `login()`, `logout()`, identity state |
| `src/components/RequireRole.tsx` | Route guard |
| `src/utils/auth-error-messages.ts` | Spanish login and signup copy |
| `src/types/authentication.models.ts` | API types mapped by hand from `/api/docs-json` |

## Flows

1. **Login:** `useAuth().login(request)` → `POST /auth/login` → the token goes to the store; React keeps only `accountId` and `role`. The refresh cookie is set by the server.
2. **Page load:** `AuthProvider` calls `refreshSession()` once. `200` restores the session; `401` means signed out (no redirect, no error).
3. **Expired token:** a protected call gets `401`; the interceptor runs `refreshSession()` and retries once. A refresh `401` ends the session: clear, go to `/login`, tell other tabs. A network error or lock timeout leaves the session alone.
4. **Logout:** `useAuth().logout()` → `POST /auth/logout` (no body), clear, broadcast `logout`. Other tabs that had a session go to `/login`.

## Rules

- The token never enters React state, context, props, `localStorage` or `sessionStorage`. Nothing outside `src/config` and `src/auth` reads it. Components use `useAuth()` for identity and `apiClient` for data.
- **One refresh per browser.** The refresh cookie is single-use. `refreshSession()` shares one in-flight promise per tab and takes the Web Lock `fdff-refresh` across tabs (15 s wait cap; without Web Locks it falls back to the per-tab promise). Never call `/auth/refresh` any other way.
- Branch on `parseApiError(error).statusCode` and `.error`, never on `message`. User-facing copy stays general: it never says which field was wrong or whether an account exists.
- Log failures only with `logApiError()`: development only, no bodies, headers, tokens or query strings.
- Never create another Axios instance or use `fetch` for the API.
- Guard role-restricted routes with `RequireRole`. It waits for `isBootstrapping`; signed out → `/login`, wrong role → `/`, no return URL. The backend enforces the same roles.
- **The 401 contract matters.** Only `401` triggers a refresh; if an endpoint answered `403` for an expired session, refresh would silently stop working.
