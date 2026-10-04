# FDFF Project Status

**Audience:** teammates and AI coding agents  
**Repos:** `fdff-front` + `fdff-backend`  
**Last updated:** September 2026

This document captures where the project stands after authentication hardening (bootstrap + logout) and what remains for the “logged in for real” auth plan.

---

## Big picture

FDFF is a React SPA (`fdff-front`) + NestJS API (`fdff-backend`). The main focus so far has been a **hardened auth system**:

| Token | Where it lives | Who can access it |
|-------|----------------|-------------------|
| **Access token** (short-lived) | Volatile in-memory store + React Context | App code only during the active tab session |
| **Refresh token** (long-lived) | HttpOnly cookie set by NestJS | Browser sends it automatically; JavaScript cannot read it |

Axios (`src/config/api.ts`) attaches the Bearer token and silently refreshes on `401`. On app load, `AuthProvider` bootstraps the session via `POST /auth/refresh` if the cookie is still valid.

Most product features (events, athletes, rankings, etc.) are **scaffolded but not built yet**. Backend is **IAM-only** — no athletes/events/competitions modules yet.

---

## Auth plan progress (“logged in for real”)

Agreed decisions: athletes stay **PENDING** until an admin activates them; admin work includes **backend APIs + a basic Admin Accounts page**.

| Step | Work | Status |
|------|------|--------|
| **1** | Bootstrap refresh on load (`isBootstrapping`) | **Done** (coded locally) |
| **2** | `POST /auth/logout` + frontend logout | **Done** (coded locally) |
| **3** | Register success UX (PENDING vs ACTIVE messaging) | **Not started** |
| **4** | Admin account ops + `/admin/cuentas` page | **Partial** (BE list + activate only) |
| **5** | Route / role guards (`RequireAuth` / `RequireRole`) | **Not started** |

---

## What’s already working

### Frontend (`fdff-front`)

- Login / register page with Zod validation
- `AuthProvider` + `useAuth` hook
- Session **bootstrap** on mount (`AuthService.refresh()` + `isBootstrapping`)
- `Auth.service` (login, register, refresh, **logout**)
- `api.ts` with request/response interceptors + refresh queue
- `/auth/logout` in `PUBLIC_AUTH_PATHS` (cookie-only logout works without Bearer)
- Header / navbar with auth-aware UI (skeleton while bootstrapping)
- Vite proxy, Tailwind, Docker dev setup
- Placeholder pages wired in `Routes.tsx`
- Auth docs (`auth-flow.md`, `react-auth-docs.md`, `ai-auth-context.md`, etc.)

### Backend (`fdff-backend`)

- Dual-token auth: RS256 JWT, refresh rotation, HttpOnly cookies
- Login hardening (lockout, strong password validation, throttling)
- `POST /auth/logout` — nulls `refresh_token_hash` + clears cookie
- DB schema with `refresh_token_hash`
- Account statuses: `PENDING` / `ACTIVE` / `INACTIVE`
- Admin (partial): `GET /accounts`, `POST /accounts/activate/:accountId` + `RolesGuard`
- Docker / keys setup for prod-style JWT signing

---

## What’s sitting uncommitted (work in progress)

**Much of the auth polish above may still be local-only.** Both repos have uncommitted / untracked changes — verify with `git status` before assuming anything is on remote.

### Frontend — local additions beyond the old baseline

| Area | Status |
|------|--------|
| Bootstrap + logout | Implemented (see Step 1–2 above) |
| New pages | `HomePage`, `EventsPage`, `AthletesPage`, `RankingsPage`, `JudgesPage`, `FederationPage` — mostly title stubs; Judges has a mock UI with dead links |
| Docs | `PROD-Security-gaps.md`, `react-auth-changelog.md`, this file |

### Backend — account admin (partial)

| Area | Reality |
|------|---------|
| **Logout** | Done — `LogoutAccountUseCase` + `POST /auth/logout` |
| **List accounts** | Done — `GET /accounts` (unfiltered `findAll`) |
| **Activate** | Done — `POST /accounts/activate/:accountId` |
| **Roles guard** | Done — admin-only on account routes |
| **Deactivate / get-by-id / get-by-email / get-by-cedula / update** | **Empty stub files** — not wired, not usable |
| **Filtered / paginated list** | DTO exists; repo `findMany` ignores filters; controller does not use it |
| **Docs** | `commit-plan-auth.md`, `nestjs-auth-changelog.md`, security audit (untracked) |

---

## HTTP client notes (`api.ts`)

- `apiClient` (default export) is the shared Axios client for authenticated API calls.
- Only `Auth.service.ts` uses it today.
- `uploadApiClient` is a longer-timeout twin (5 minutes) for future file uploads.
- There is **no** backend upload / multipart endpoint yet, and nothing on the frontend imports `uploadApiClient` yet.
- Public auth paths (no Bearer required): `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`.
- Rule of thumb for agents: use `apiClient` or `uploadApiClient` for protected routes — do not invent a new Axios instance or use raw `fetch` for auth’d APIs.

---

## Status checklist

```
✅ Auth core (login / register / refresh) — working
✅ Session bootstrap on reload — working (local)
✅ Logout (BE + FE) — working (local)
🔄 Backend account admin — list + activate only; deactivate / get-by-id / filters still stubs
📝 Placeholder pages exist but have no real domain content
❌ Register success UX (PENDING message) — not started
❌ Route / role guards — not started
❌ Frontend Admin Accounts page — not started
❌ Frontend does not call account admin APIs yet
❌ No federation domain APIs (athletes, events, competitions, rankings)
❌ No file upload feature yet (uploadApiClient is prep only)
⚠️ Latest local auth work may not be committed / pushed — check git status
```

---

## Suggested next steps

1. **Commit auth polish** (frontend bootstrap + logout, backend logout) if still uncommitted.
2. **Step 3 — Register success UX:** show PENDING activation message; add `status` to `RegisterResponse`; no auto-login for PENDING athletes.
3. **Step 4a — Finish admin APIs:** deactivate, get-by-id, wire filtered `findMany` (drop or defer empty cedula use case until Athletes exists).
4. **Step 5 — Route/role guards:** `RequireAuth` / `RequireRole` before protecting admin/judge routes.
5. **Step 4b — Admin UI:** `/admin/cuentas` calling list + activate/deactivate (after guards).
6. **Product domain next:** athlete profiles (signup already collects unused profile fields), then events/competitions.
7. **Review `PROD-Security-gaps.md`** — e.g. Docker `VITE_API_URL` vs `VITE_API_BASE_URL`, nginx `/api` proxy.

---

## Key files for AI agents

### Frontend

| Path | Role |
|------|------|
| `src/config/api.ts` | Axios clients, interceptors, refresh queue, public auth paths |
| `src/auth/auth-session.store.ts` | In-memory access token + lifecycle hooks |
| `src/context/AuthProvider.tsx` | React session, bootstrap, clear/set session |
| `src/services/Auth.service.ts` | login / register / logout / refresh |
| `src/components/Header.tsx` | Auth chrome + logout |
| `docs/ai-auth-context.md` | Rules for agents working on auth |
| `docs/PROD-Security-gaps.md` | Known frontend production security gaps |

### Backend

| Path | Role |
|------|------|
| `src/iam/presentation/auth.controller.ts` | login / register / refresh / logout |
| `src/iam/presentation/account.controller.ts` | admin account list / activate (partial) |
| `src/iam/application/use-cases/logout-account.use-case.ts` | Invalidate refresh hash |
| `src/iam/infrastructure/security/` | JWT, cookies, refresh utilities |
| `docs/commit-plan-auth.md` | Ordered commit plan for auth hardening |
| `docs/PROD-Security-gaps.md` | Known production security gaps |

**Do not commit:** `.env`, JWT PEM keys, credentials, or build artifacts.
