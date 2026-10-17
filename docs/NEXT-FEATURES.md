# Next features

Planned work that hardens or extends the SPA. Delete an entry in the change that ships it.
Backend counterpart: `../fdff-backend/docs/NEXT-FEATURES.md`. Contract: `../fdff-backend/docs/README-IAM.md` section 14.

### Session token kept out of React context
The access token stays in `src/auth/auth-session.store.ts` for the Axios interceptors; `useAuth()` exposes only identity and role.
**Improves:** far less code can read the token.

### Minimal, development-only error logging
Log only method, URL and status, and only in development.
**Improves:** form data never reaches the browser console.

### Role-based route guards
Guard `/jueces` (ADMIN, JUDGE) after the session bootstrap finishes; return URLs accept same-origin relative paths only.
**Improves:** panels are reachable only by the roles that use them.

### Dependency refresh
`npm audit fix` (no `--force`) until `npm audit` is clean: axios, react-router, vite, postcss and their transitive packages.
**Improves:** current, patched libraries in the bundle and the build tooling.

### Same-origin production proxy
nginx forwards `/api/` to the API, so the SPA and API share one origin.
**Improves:** the `SameSite=Strict` refresh cookie works in production.

### Consistent API configuration
One variable, `VITE_API_BASE_URL`, in the Dockerfile, compose and code; remove unused `VITE_` values.
**Improves:** builds point at the right API, and nothing secret is bundled.

### Security headers
Content-Security-Policy, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `server_tokens off`.
**Improves:** injected scripts, framing and content sniffing are blocked by the browser.

### Deployment modes documented
`.env.example` and README describe same-origin (preferred) and cross-origin deploys.
**Improves:** production setups follow the supported path.

### Single HTTP client enforced
An ESLint rule forbids `fetch(` and `axios.create(` outside `src/config/`.
**Improves:** every call keeps credentials and the refresh logic.

### Email verification screens
Pages for "check your email" and the confirmation link, once the backend ships it.
**Improves:** signup no longer distinguishes new from registered emails.
