# Accessibility checklist (WCAG 2.2 Level AA)

Accessibility is a release requirement, not a polish step. Run this checklist before a page is considered done.

## Perceivable

- [ ] Text and UI controls meet AA contrast (the tokens in `tokens.md` already comply; check any new combination).
- [ ] Status is never color-only: icon + word.
- [ ] Every meaningful image has alt text; decorative images and icons have `alt=""` / `aria-hidden="true"`.
- [ ] No text inside images, so Google Translate and screen readers can read everything.
- [ ] Page works at 200% browser zoom and at 360 px width without horizontal scrolling (except data tables, which scroll inside their own container).

## Operable

- [ ] Everything works with the keyboard alone, in a logical tab order.
- [ ] Visible focus on every interactive element (2 px `--color-brand-text` outline).
- [ ] Skip link "Saltar al contenido" at the top of every page.
- [ ] Touch targets at least 44 × 44 px.
- [ ] Drag-and-drop (category order) has a keyboard and button alternative.
- [ ] `prefers-reduced-motion` respected; nothing auto-plays.

## Understandable

- [ ] `<html lang="es-DO">` on every page.
- [ ] Every input has a visible `<label>`; required fields say "(obligatorio)".
- [ ] Errors are linked with `aria-describedby`, say how to fix the problem, and an error summary appears at the top on submit.
- [ ] Consistent navigation and labels across pages; the same action keeps the same name.

## Robust

- [ ] Semantic HTML first: `button` for actions, `a` for navigation, real `table` with `<th scope>`.
- [ ] Sortable headers set `aria-sort`; row checkboxes have labels ("Seleccionar a Ricardo Núñez").
- [ ] Dialogs trap focus, close with Esc, and return focus to their trigger.
- [ ] Bulk action bar, toasts, and async results are announced with `aria-live="polite"`.
- [ ] Automated check (axe, e.g. via Playwright) passes with no violations; then a manual keyboard pass.
