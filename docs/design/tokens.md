# Design tokens

Values live in **`src/styles/theme.css`** — a Tailwind `@theme` block that is the single source of truth. This document explains what each token is for. Never use raw values in components.

## How to use tokens

Tailwind is the styling system. `@theme` does two things at once: it generates utilities (`bg-canvas`, `text-ink-muted`, `rounded-md`) **and** emits every token as a `:root` custom property, so `var(--color-gold)` also works where you need raw CSS.

- **Always reach for the utility first.** `className="bg-surface text-ink-muted rounded-md"`.
- `src/design-system/tokens.ts` holds only what JavaScript cannot read from CSS — breakpoints for `matchMedia`, durations, medal placings. Colors are deliberately *not* duplicated there.
- `npm run lint:tokens` fails the build on stock-palette classes (`bg-red-500`), `bg-white`/`text-black`, arbitrary colors (`bg-[#F5F5F5]`) and raw hex outside `theme.css`.
- The block is declared `@theme static` because Tailwind otherwise tree-shakes unused theme variables, which would silently break a `var(--token)` reference whose matching utility happened to be unused.

### Token names vs. utility names

Role-based names like `--color-bg` and `--color-text-muted` would generate the awkward `bg-bg` and `text-text-muted`. Since utilities are what you actually type, the implementation renames a few:

| This document | `theme.css` token | Utility |
| --- | --- | --- |
| `--color-bg` | `--color-canvas` | `bg-canvas` |
| `--color-border` | `--color-line` | `border-line` |
| `--color-text` | `--color-ink` | `text-ink` |
| `--color-text-muted` | `--color-ink-muted` | `text-ink-muted` |
| `--color-text-subtle` | `--color-ink-subtle` | `text-ink-subtle` |
| `--color-text-on-action` | `--color-on-action` | `text-on-action` |
| `--color-text-on-brand` | `--color-on-brand` | `text-on-brand` |
| `--color-text-on-gold` | `--color-on-gold` | `text-on-gold` |
| `--color-brand-text` | `--color-brand-light` | `text-brand-light` |

Everything else keeps its name: `bg-surface`, `bg-surface-raised`, `bg-brand`, `bg-action`, `hover:bg-action-hover`, `text-gold`, `text-silver`, `text-bronze`, `text-success`, `text-warning`, `text-danger`, `text-info`.

Display type uses four custom utilities — `display-xl`, `display-l`, `display-m`, `score` — because each carries family, weight and uppercase together. They support variants (`display-m md:display-l`). `numeric` applies tabular figures.

## Color

### Brand palette

All colors are sampled from or derived from the logo.

| Token | Name | Hex | Source | Single job |
| --- | --- | --- | --- | --- |
| `--color-bg` | Noche | `#0A1029` | Deep blue of the logo's stage-light background | Page background |
| `--color-surface` | Tarima | `#121A3A` | — | Cards, panels, table bodies |
| `--color-surface-raised` | Tarima alta | `#1A2450` | — | Menus, modals, hovered rows, inputs |
| `--color-border` | Línea | `#2A3566` | — | Dividers, input borders, table lines |
| `--color-brand` | Azul FDFF | `#1F2BC2` | Logo bands (`#0C0DB1`), lifted for screens | Navigation, selection, active tabs, brand fills |
| `--color-brand-text` | Azul claro | `#8B95FF` | — | Links, blue text on dark, focus ring |
| `--color-action` | Rojo Patria | `#C8102E` | Flag red | The one primary action on a screen |
| `--color-action-hover` | — | `#A50D26` | — | Hover/pressed primary action |
| `--color-gold` | Oro Laurel | `#CF9B1A` | Logo laurels | Champions and medals only |
| `--color-gold-bright` | Oro claro | `#E3B341` | Logo laurels (highlight) | Gold text on dark backgrounds |
| `--color-silver` | Plata | `#C0C7D6` | — | 2nd place only |
| `--color-bronze` | Bronce | `#C27C4E` | — | 3rd place only |

### Text

All pairs meet WCAG 2.2 AA for normal text.

| Token | Hex | Contrast | Use |
| --- | --- | --- | --- |
| `--color-text` | `#F4F6FB` | 17.4 : 1 on bg | Headings, body, table values |
| `--color-text-muted` | `#A9B2CC` | 8.9 : 1 on bg | Secondary text, helper text, table headers |
| `--color-text-subtle` | `#7C87A6` | 5.3 : 1 on bg | Placeholders, timestamps, disabled labels |
| `--color-text-on-action` | `#FFFFFF` | 5.9 : 1 on red | Text on red buttons |
| `--color-text-on-brand` | `#FFFFFF` | 9.6 : 1 on blue | Text on blue fills |
| `--color-text-on-gold` | `#0A1029` | 9.6 : 1 on gold | Text on gold medal badges |

### Status

Each status always pairs color with an icon and a word. Status backgrounds use the status color at 14% opacity over the surface.

| Token | Hex | Status | Icon (Lucide) |
| --- | --- | --- | --- |
| `--color-success` | `#3DD68C` | Aprobado | `check-circle-2` |
| `--color-warning` | `#F5B83D` | Pendiente | `clock` |
| `--color-danger` | `#E5484D` | Rechazado | `x-circle` |
| `--color-info` | `#8B95FF` | Información | `info` |

### Color rules

- **Red is scarce.** At most one red button per screen or modal. Destructive actions (reject, delete) use the outlined danger style, not the red fill.
- **Gold is earned.** Gold appears only next to results: champions, 1st place, medals. Never for buttons, links, or decoration.
- **Blue is navigation and selection.** Active nav item, selected category card, checked checkbox, focus ring, current step.
- **No decorative gradients.** The only gradient is the dark overlay on photographs (see `iconography-and-imagery.md`).
- **Dark only in v1.** Results pages also get a print stylesheet (white background, black text).

## Spacing (4 px base)

Use only these values. If something needs 20 px, pick 16 or 24.

This scale **is** Tailwind's default spacing scale, so it needs no configuration — `p-4` is already 16 px and `p-24` is 96 px. The rule is only about which steps are allowed: stay on 1, 2, 3, 4, 6, 8, 12, 16, 24. The named layout sizes are tokens too: `h-touch` (44 px), `h-header` (64 px), `w-sidebar` (240 px), `max-w-content` (1200 px).

| Token | Value | Typical use |
| --- | --- | --- |
| `--space-1` | 4 px | Icon-to-text gap |
| `--space-2` | 8 px | Inside badges, label to input |
| `--space-3` | 12 px | Compact table cells |
| `--space-4` | 16 px | Card padding (mobile), between form fields |
| `--space-6` | 24 px | Card padding (desktop), between form sections |
| `--space-8` | 32 px | Between page blocks (mobile) |
| `--space-12` | 48 px | Between page sections (mobile) |
| `--space-16` | 64 px | Between page sections (desktop) |
| `--space-24` | 96 px | Landing hero vertical padding (desktop) |

## Radius (by role)

Radius signals what kind of element it is, so it is not uniform.

| Token | Value | Applied to |
| --- | --- | --- |
| `--radius-xs` | 2 px | Badges, status chips, checkboxes |
| `--radius-sm` | 6 px | Buttons, inputs, selects |
| `--radius-md` | 10 px | Cards, panels, tables, category cards |
| `--radius-lg` | 16 px | Modals, bottom sheets |
| (none) | 0 | Full-bleed hero images and photo strips |

> These values **override** Tailwind's defaults, which are 2/4/6/8 px for `xs`/`sm`/`md`/`lg`. So `rounded-md` is 10 px here, not the 6 px you may expect from other Tailwind projects.

## Elevation

Depth comes from surface steps (canvas → surface → surface-raised), not shadows. A 1 px `border-line` separates elements at the same level. The only shadow is `shadow-float`, for modals, menus, and the bulk action bar.

## Motion

| Token | Duration | Easing | Use |
| --- | --- | --- | --- |
| `--motion-fast` | 120 ms | ease-out | Hover, press, checkbox, toggle |
| `--motion-base` | 200 ms | cubic-bezier(0.2, 0.8, 0.2, 1) | Menus, tabs, accordion, toasts |
| `--motion-slow` | 320 ms | cubic-bezier(0.2, 0.8, 0.2, 1) | Modals, bottom sheets, bulk action bar |

- **One orchestrated moment:** the landing hero lights up once on load (poster fades in from dark, countdown appears). No other section animates on scroll.
- **Motion answers user actions:** a row checked → bulk bar slides up; approval submitted → status badges update in place.
- **Reduced motion:** `prefers-reduced-motion: reduce` zeroes every duration and disables scroll smoothing (handled in `theme.css`).
- **Carousels never auto-advance.**
