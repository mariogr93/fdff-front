# FDFF Design System

**Version:** 0.2. **Applies to:** the public site, athlete registration, and the admin/judge panel. **Language:** Spanish (es-DO) only in v1, always formal (*usted*).

This folder is the single source of truth for how the FDFF frontend looks, reads, and behaves. When a screen, component, or piece of copy is not covered here, extend these documents first and build second.

## Documents

| File | Covers |
| --- | --- |
| [brand.md](brand.md) | Logo assets and usage rules |
| [tokens.md](tokens.md) | Color, spacing, radius, elevation, motion tokens and their rules |
| [typography.md](typography.md) | Typefaces, type scale, typography rules |
| [layout.md](layout.md) | Breakpoints, grid, alignment |
| [iconography-and-imagery.md](iconography-and-imagery.md) | Icons, images, overlays |
| [components.md](components.md) | Specs for every reusable component |
| [pages.md](pages.md) | Routes, access by role, page layouts and flows |
| [content.md](content.md) | Language, i18n, voice, glossary, copy examples |
| [accessibility.md](accessibility.md) | WCAG 2.2 AA checklist |

Implementation lives in `src/styles/theme.css` — a Tailwind `@theme` block that is the source of truth for every visual value. See [tokens.md](tokens.md) for how it maps to utilities.

## Design principles

1. **The stage, not the gym.** The FDFF is an official federation, not a supplement brand. The visual world is the competition stage: deep blue stage darkness, a single strong light, gold for the people who win. Avoid gym clichés like grunge textures, neon, and torn edges.
2. **Red means act, blue means where you are, gold means who won.** Each brand color has exactly one job.
3. **Rules are visible.** Whenever the system limits an athlete (category eligibility, required data, registration deadline), the interface says which rule applies and why, in plain words.
4. **Judges work fast.** Admin screens favor density, keyboard use, and bulk actions over decoration.
5. **One memorable moment per page.** On the landing page it is the next competition's poster and countdown. Everything around it stays quiet.

## Decisions log

These decisions came from the federation and drive everything in this folder. Add new ones as D11, D12, … with the date.

> **This log is the only written record of several federation requirements** — the height-to-weight category tables, multi-category registration approved per category, bulk approval, coach-registers-many, and the cédula lookup. The domain model itself lives in `fdff-backend/docs/PROJECT_CONTEXT.md`, which defines the ubiquitous language and the bounded contexts; read it alongside this log.
>
> **Known contradiction:** D5 says there are no payments in v1, but PROJECT_CONTEXT's `EventRegistration` entity carries a `payment_status` field. The field is unused — resolve before building registration.

| # | Decision | Design impact |
| --- | --- | --- |
| D1 | The FDFF crest (blue bands, gold laurels, posing athletes, national coat of arms) is the official logo. | Palette is derived from the logo, not invented. |
| D2 | Spanish only for now; English may come later. Priority is WCAG 2.2 Level AA so Google Translate and assistive tools work properly. | No language toggle in v1. Strings still live in translation files so English can be added without touching components. Pages declare `lang="es-DO"` and use real text, never text inside images. |
| D3 | The Cédula is the Dominican national ID (`000-0000000-0`) and is stored for future registrations. | A dedicated Cédula input with mask and lookup to auto-fill returning athletes. |
| D4 | Athletes register themselves or through a coach. Registration includes team name, coach name, and the categories the athlete will compete in, filtered by the athlete's sex, age, height, and weight. | Registration has a "who is registering" choice; coaches can register several athletes in a row. Category selection only enables categories whose rules the athlete meets. |
| D5 | No payments for now. An athlete can enter multiple categories, each with its own restrictions. | Multi-select category picker that explains why unavailable categories are unavailable. |
| D6 | Mandatory: Cédula, first name, last name, and every attribute a chosen category depends on (e.g. a category limited by height makes height mandatory). | Required fields change with the selected categories; the form asks for missing values before submitting. |
| D7 | Any judge can approve. Judges can select several athletes and approve or reject them in one action. | Selectable tables with a bulk action bar. |
| D8 | Browser-based (Chrome is primary), responsive for smartphones, tablets, and laptops. | Mobile-first public pages; desktop-first admin pages that still work on tablets and phones. |
| D9 | Clicking a past competition opens its results: one points table per category held at that competition. | Results page with per-category tables and per-judge scores. |
| D10 | Only admins create judge accounts. Admins and judges create competitions, approve registrations, and edit competitor data. | Two roles share one panel; the "Jueces" section is visible to admins only. |
| D11 | All Spanish copy is formal: users are addressed as *usted*. | See `content.md`. |
