# Components

Specs for the reusable components in `src/design-system/components/`. All interactive components have visible hover, focus-visible, active, and disabled states. Focus is always a 2 px `--color-brand-text` outline with 2 px offset.

## Button

| Variant | Look | When |
| --- | --- | --- |
| primary | Red fill, white text | The main action of the screen: Inscribirme, Publicar competencia, Aprobar seleccionados |
| secondary | `--color-surface-raised` fill, 1 px border, white text | Supporting actions: Ver resultados, Guardar borrador |
| ghost | No fill, `--color-brand-text` text | Low-emphasis toolbar actions, Cancelar |
| danger | Transparent, 1 px danger border, danger text | Rechazar, Eliminar. Always followed by a confirmation |

| Size | Height | Padding | Text |
| --- | --- | --- | --- |
| sm | 36 px | 0 12 px | small, 600 |
| md (default) | 44 px | 0 20 px | body, 600 |
| lg | 52 px | 0 28 px | body, 700 |

- Labels are verbs that say what happens (Enviar inscripción, not Enviar). No trailing arrows.
- Loading state: a spinner replaces the leading icon, the label stays, the button keeps its width and is disabled.
- On mobile, a form's primary action is full-width and sticks to the bottom of the viewport.

## Text input

- Height 44 px, `--color-surface-raised` fill, 1 px border, `--radius-sm`, 16 px text.
- Label above the field, helper text below. Never use the placeholder as the label.
- Required fields (Cédula, nombre, apellido, and the measurements a chosen category depends on) show "(obligatorio)"; others show "(opcional)".
- Error state: border and helper text in `--color-danger`, with `alert-circle` icon and a message that says how to fix it.
- Validate on blur; re-validate on change after the first error.

## Cédula input

The Cédula is the key to every athlete record.

- **Mask:** formats as the user types: `00112345678` shows as `001-1234567-8`. Blocks letters and anything past 11 digits; paste with or without hyphens is accepted.
- **Stored value:** 11 digits only, no hyphens.
- **Attributes:** `inputmode="numeric"`, `autocomplete="off"`, tabular figures.
- **Lookup** once 11 valid digits are entered:
  - Found: an inline card shows "Encontramos su perfil" with name and photo, and the form is pre-filled. The user confirms before continuing.
  - Not found: "No tenemos registros con esta cédula. Complete sus datos para crear su perfil."
- **Errors:** "La cédula debe tener 11 dígitos." If the backend validates the check digit: "Revise la cédula: el número no es válido."
- **Privacy:** public views never show the Cédula. Admin views show it masked (`***-****567-8`) with a reveal button.

## Measurement input

- Height in cm (integer), weight in kg (one decimal). The unit is a fixed suffix inside the field.
- Optional helper converting to imperial for reference (≈ 5 ft 9 in, ≈ 176.4 lb).
- Weight at registration is labeled "Peso declarado"; the weigh-in confirms it later.

## Select, date, checkbox, radio, switch

- **Select:** same box as text input with `chevron-down`. Native select on mobile; searchable listbox on desktop when needed.
- **Date:** typed and shown as dd/mm/aaaa. Native date input on mobile.
- **Checkbox:** 20 px, `--radius-xs`, checked = brand blue fill. Supports indeterminate ("select all" in tables).
- **Radio cards:** for "¿Quién realiza la inscripción?" (Atleta / Entrenador). The whole card is clickable; selected gets a 2 px brand border.
- **Switch:** only for settings that apply instantly (e.g. "Inscripciones abiertas").

## Status badge

Small chip: `rounded-xs`, 4 × 8 px padding, small 600, icon + word.

**Two different lifecycles use badges — do not mix them up.**

An **EventRegistration** is a judge's decision about one athlete in one category:

| `EventRegistration.status` | Label | Color |
| --- | --- | --- |
| PENDING | Pendiente | warning |
| APPROVED | Aprobado | success |
| REJECTED | Rechazado | danger |
| CHECKED_IN | Pesaje confirmado | info |

An **Account** is a system identity, and only an admin changes it. Note the values are *not* APPROVED/REJECTED:

| `Account.status` | Label | Color |
| --- | --- | --- |
| PENDING | Pendiente de activación | warning |
| ACTIVE | Activa | success |
| INACTIVE | Inactiva | muted |

So decision D10's "approve/reject athletes" is really two separate flows: an **admin activates an account** so someone can sign in, and a **judge approves a registration** so an athlete can compete.
| Competition DRAFT | Borrador | muted |
| Competition OPEN | Inscripciones abiertas | success |
| Competition CLOSED | Inscripciones cerradas | warning |
| Competition FINISHED | Finalizada | muted |

## Competition card

Used in the landing carousel and the admin competitions list: cover image (3:2) with the title in display-m over the overlay, then date, venue, and number of categories in small muted text, then a secondary button.

- Width 280 px on mobile (the next card peeks), 360 px on desktop.
- The whole card is a link. Past competitions go to results; upcoming ones go to registration.

## Carousel

- Horizontal scroll with CSS scroll-snap; swipe on touch, prev/next buttons (44 px) from 1024 px up.
- The next card always peeks at the edge. No auto-play, no infinite loop, no dots.
- Ends with a "Ver todas las competencias" card linking to the full archive.

## Countdown

- Four units (días, horas, min, seg) in the score style with tabular figures.
- If registration closes before the event, it counts down to the deadline, labeled "Cierre de inscripciones en".
- On the event day it shows "Hoy" and the venue.
- Wrapped so screen readers get one readable sentence, not ticking numbers (update `aria-live` at most once a minute).

## Category card (eligibility-aware)

The core of registration: a selectable card with the category name and its rules in plain words, e.g. "Masculino · 18+ · 170–180 cm · Peso máx. según estatura: 85 kg".

| State | Look |
| --- | --- |
| Eligible, unselected | `--color-surface`, 1 px border |
| Eligible, selected | 2 px brand border, checkbox checked, `--color-surface-raised` |
| Ineligible | 50% opacity, not selectable, `lock` icon, reason using the athlete's data: "Requiere estatura máxima de 180 cm (su estatura: 184 cm)" |
| Missing data | Selectable, but the card asks inline for the missing value ("Ingrese su estatura para esta categoría"); the registration can't be sent without it |
| Full / closed | Disabled: "Esta categoría ya no acepta inscripciones" |

- Eligible categories are listed first. Ineligible ones collapse under "No disponibles para usted (3)" and expand to show the reasons.
- A counter above the list: "2 categorías seleccionadas."
- Sex rules are always enforced: an athlete never sees the other sex's categories as selectable.

## Data table (admin)

- Header row: small 600, muted, sentence case; sortable columns show `arrow-up-down` and set `aria-sort`.
- Row height 52 px (comfortable) or 40 px (compact toggle). Hover = `--color-surface-raised`. Numbers right-aligned.
- **Selection:** the first column is a checkbox; the header checkbox selects the current page, with a link "Seleccionar los 124 resultados" to extend to all filtered rows.
- **Filters** above the table: competition, category, status, search (name, cédula, team).
- **Mobile:** each row becomes a stacked card; bulk selection still works.
- **Empty state:** says why and how to fix it: "No hay inscripciones pendientes para esta competencia. Comparta el enlace de inscripción."

## Bulk action bar

Appears when at least one row is selected and sticks to the bottom of the viewport: "6 seleccionados · Deseleccionar · Rechazar · Aprobar 6".

- The primary button repeats the count: "Aprobar 6".
- **Reject** opens a dialog requiring a reason (one reason for all selected, editable per athlete afterwards).
- **Approve** of more than one asks for a short confirmation listing names; a single approval does not.
- After submit: toast "6 inscripciones aprobadas", rows update in place, selection clears. Failed rows stay selected and the toast names them.

## Results table (public)

One table per category of a past competition.

| Column | Alignment | Notes |
| --- | --- | --- |
| Lugar | Center, 64 px | 1–3 as gold, silver, bronze medal badges |
| Dorsal | Right | Competitor number |
| Atleta | Left | Name in body-strong, team below in small muted |
| J1 … Jn | Right | Each judge's score; discarded scores struck through in subtle text, explained in the legend |
| Total | Right | body-strong |

- Top 3 rows get a 3 px left border in their medal color.
- Below 768 px, judge columns collapse; each row shows Lugar, Atleta, Total, and expands to per-judge scores.
- A legend under each table explains how the total is computed (e.g. "Menor total gana. Se descartan la puntuación más alta y la más baja.").

## Stepper

- Horizontal with labels from 768 px up; on mobile, "Paso 2 de 4 · Categorías" with a progress bar.
- Completed steps show `check` and are clickable to go back; the current step is brand blue and has `aria-current="step"`.

## Tabs, dialog, toast, empty state

- **Tabs:** text tabs with a 2 px brand underline on the active one.
- **Dialog:** `--radius-lg`, max-width 520 px, primary action on the right. Bottom sheet on mobile. Esc closes; focus is trapped and returns to the trigger on close.
- **Toast:** bottom-center on mobile, bottom-right on desktop, 5 s (errors stay until dismissed). Uses the action's verb: "Publicar competencia" → "Competencia publicada".
- **Empty state:** 48 px icon, one sentence, one action.

## Navigation

- **Public header** (64 px): compact crest, Competencias, Resultados, Federación, and the Inscribirme button. On mobile: wordmark and a menu that opens full-screen; Inscribirme becomes a sticky bottom button on the landing page.
- **Admin sidebar** (240 px, collapsible to 72 px): Inicio, Competencias, Categorías, Inscripciones (pending count), Atletas, Jueces (admin only). User name, role, and Cerrar sesión at the bottom.
- **Admin on tablet portrait and phone:** top bar + bottom navigation (Competencias, Inscripciones, Atletas, Más).
- Items a role can't access are hidden, not disabled.
