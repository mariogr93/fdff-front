# fdff-front

Frontend of the FDFF WebApp (Federación Dominicana de Fisicoculturismo y Fitness): the public site (next competition, past results) and the admin/judge panel (competitions, categories, registration approvals). The API lives in the separate **fdff-backend** repository (NestJS).

**Current reality:** only authentication works end to end — login, register, session bootstrap from the refresh cookie, and logout. Every other page is a placeholder, and the backend is IAM-only (no competitions, categories, registrations or results endpoints exist yet). Treat `docs/design/` as the specification for screens that are not built.

## Commands

```bash
npm run dev          # Vite dev server
npm run build
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint (autofixes)
npm run lint:tokens  # fails on styling that bypasses the design tokens
npm run check        # typecheck + lint + lint:tokens — run before saying a task is done
```

There is **no test suite yet** (no Vitest, no Playwright). Don't claim tests pass; `npm run check` is the bar. If a change affects the UI, run `npm run dev` and look at it.

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 8, TypeScript |
| Routing | React Router 7 |
| Forms | React Hook Form + Zod |
| HTTP | Axios, with interceptors in `src/config/api.ts` |
| Styling | Tailwind CSS 4 with the design tokens in `src/styles/theme.css` |
| Icons | lucide-react |

**Not installed. Do not import these** — propose adding one when a feature actually needs it: TanStack Query, TanStack Table, Radix UI, react-i18next, react-imask, Vitest, React Testing Library, Playwright.

## Non-negotiable rules

1. **Design tokens only.** Tailwind is the styling system and `src/styles/theme.css` is the only place visual values live. Use the generated utilities (`bg-canvas`, `text-ink-muted`, `border-line`, `rounded-md`, `display-l`). Never use Tailwind's stock palette (`bg-red-500`, `text-gray-400`), `bg-white`/`text-black`, arbitrary colors (`bg-[#F5F5F5]`), or raw hex. `npm run lint:tokens` enforces this. See `docs/design/tokens.md`.
2. **Ubiquitous language.** Use the domain terms exactly: Account, Athlete, Category, Competition, EventRegistration, Weigh-In, Cédula. Never `user` for physical or competition data; never `type` or `division` for Category. The domain model is defined in `fdff-backend/docs/PROJECT_CONTEXT.md`. UI translations: `docs/design/content.md`.
3. **Spanish only, always formal.** All visible text is Spanish (es-DO) addressing the user as *usted*. `index.html` declares `lang="es-DO"`.
4. **WCAG 2.2 Level AA** is a release requirement. Run `docs/design/accessibility.md` before calling a page done.
5. **Cédula:** 11 digits stored without hyphens, shown as `000-0000000-0`, never shown in public views, masked in admin views.
6. **Named exports only.** No default exports anywhere. If a route is lazy-loaded, use `lazy(() => import('./P').then((m) => ({ default: m.P })))`.
7. **Never commit secrets.** Config comes from `VITE_*` environment variables; add new ones to `.env.example`. `.env` is gitignored.

## Key business rules

From the decisions log in `docs/design/README.md`, which is the only written record of most of these:

- An athlete can register in several categories of one competition; each EventRegistration is one athlete × one category, approved or rejected independently.
- Categories restrict by sex, age, height, and weight. Registration only offers categories the athlete is eligible for and explains why others are unavailable.
- Mandatory athlete data: Cédula, first name, last name, plus every attribute the chosen categories depend on.
- Athletes register themselves or through a coach; each registration records team name and coach name.
- Roles: ADMIN creates judge accounts. ADMIN and JUDGE create competitions and categories, approve registrations, and edit athlete data. Hide what a role can't use; the backend enforces access independently.
- **Two distinct lifecycles.** An admin *activates an Account* (`PENDING` → `ACTIVE`) so a person can sign in. A judge *approves an EventRegistration* (`PENDING` → `APPROVED`) so an athlete can compete. Don't conflate them.

## Structure

```
src/
├── main.jsx          # entry: BrowserRouter + AuthProvider
├── Routes.tsx        # route table
├── App.jsx           # app shell (Header + Outlet)
├── styles/           # theme.css — the Tailwind @theme token block
├── design-system/    # tokens.ts: only values JS can't read from CSS
├── components/       # shared components
├── pages/            # route-level components
├── context/          # AuthProvider, auth context, useAuth
├── auth/             # in-memory access-token store
├── services/         # API services (Auth.service.ts)
├── config/           # api.ts — Axios clients, interceptors, refresh queue
├── schemas/          # Zod schemas
├── utils/            # mappers and helpers
└── types/            # hand-written API request/response types
```

**Target state, not yet adopted:** the design docs describe a `features/<feature>/` layout with per-feature `api/`, `components/`, `schemas/` and `pages/`. Don't restructure toward it as a side effect of another task.

## API notes

- `apiClient` in `src/config/api.ts` is the shared Axios client: it attaches the Bearer token and silently refreshes once on a 401. `uploadApiClient` is a longer-timeout twin for future file uploads and currently has no importers.
- Use those clients for authenticated calls. Don't create a new Axios instance or use raw `fetch`.
- Public auth paths (no Bearer attached): `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`.
- The access token lives in memory only (`src/auth/auth-session.store.ts`); the refresh token is an HttpOnly cookie the browser sends automatically. Never put either in `localStorage`.
- **The 401 contract matters.** The interceptor treats exactly 401 as "try refreshing". If an endpoint starts returning 403 for an expired session, the refresh flow silently stops working.
- API types are hand-written in `src/types/`. The backend has no OpenAPI spec, so there is nothing to generate from; adding `@nestjs/swagger` there is a separate task.

## Code conventions

- Function components and hooks only. One component per file in `PascalCase.tsx`; hooks in `useSomething.ts`.
- Type props explicitly. No `any`: use `unknown` and narrow.
- Name props and variables with domain terms (`athlete`, `category`, `competition`, `registration`).
- Split a component when it passes ~150 lines or takes on more than one job.
- Derive state instead of syncing it with `useEffect`; use effects only for real side effects.
- Public pages and registration are mobile-first (360 px). Admin pages are designed at 1280 px and must still work at 360 px.

## Not built yet

Planned hardening lives in `docs/NEXT-FEATURES.md`; delete an entry when it ships.

- **`LoginForm`, `SigninForm` and `AuthPage` are still light-themed** and listed in `PENDING_REDESIGN` in `scripts/lint-tokens.mjs`, so the token check skips them. Converting them is a visual redesign. Remove each entry as it is done; never add to the list.
- **No i18n.** Spanish strings are inline in components. The rule in `docs/design/content.md` (every string through `react-i18next`) is the target, not the current state.
- **No route guards.** `Routes.tsx` has no role protection, so `/jueces` is publicly reachable. `JudgesPage` also links to `/create-competition` and `/create-category`, which are not registered routes.
- **Routes don't match the spec.** `docs/design/pages.md` specifies `/inscripcion`, `/ingresar` and `/panel/*`; the app currently uses `/login`, `/register`, `/eventos`, `/atletas`, `/rankings`, `/jueces`, `/federacion`.

## Documentation map

| Need | Read |
| --- | --- |
| Domain model, bounded contexts, ubiquitous language | `fdff-backend/docs/PROJECT_CONTEXT.md` |
| Design principles, decisions log | `docs/design/README.md` |
| Colors, spacing, radius, motion, token-to-utility mapping | `docs/design/tokens.md` |
| Fonts and type scale | `docs/design/typography.md` |
| Breakpoints and alignment | `docs/design/layout.md` |
| Component specs | `docs/design/components.md` |
| Routes, access by role, page flows | `docs/design/pages.md` |
| Spanish copy, tone, glossary | `docs/design/content.md` |
| Accessibility checklist | `docs/design/accessibility.md` |
| Auth flow across both repos | `docs/auth-flow.md`, `docs/ai-auth-context.md` |
| Where the project stands | `docs/project-status.md` |

Read only what the task needs; don't load the whole `docs/` folder.

## How to work

- **Plan first** for anything touching more than one file: list the files you'll change and why, then implement.
- **Small, vertical changes.** One feature per change; don't refactor unrelated code.
- **Follow the specs** in `docs/design/` before inventing a pattern. If something is missing, propose an addition to the docs.
- **Ask, don't guess,** when a business rule is ambiguous. Record the answer in the decisions log in `docs/design/README.md`.
- **Don't invent endpoints.** If the API doesn't have what you need, say so.
- **Update docs in the same change** when behavior or a design rule changes.
