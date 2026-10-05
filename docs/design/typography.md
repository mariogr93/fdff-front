# Typography

## Typefaces

Both are free on Google Fonts, loaded via `<link>` in `index.html` with `display=swap`. Families are the `--font-display` and `--font-body` tokens in `src/styles/theme.css`.

| Role | Family | Weights | Why |
| --- | --- | --- | --- |
| Display | Big Shoulders Display | 800, 900 | Tall, condensed, poster-like: the language of competition banners. Fits long Spanish words like "FISICOCULTURISMO" in narrow columns. |
| UI & body | Public Sans | 400, 500, 600, 700 | Neutral, official, very legible at small sizes. Full Spanish accent support. |

Tokens: `--font-display`, `--font-body`. Numbers in tables, scores, measurements, the Cédula, and countdowns use tabular figures (`font-variant-numeric: tabular-nums`) so columns align.

## Type scale

Desktop sizes apply from 1024 px up. Fluid sizes use `clamp()` between mobile and desktop.

| Token | Family | Mobile | Desktop | Line height | Weight | Case | Use |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `--text-display-xl` | Display | 48 px | 96 px | 0.95 | 900 | UPPER | Next competition title on the landing hero only |
| `--text-display-l` | Display | 36 px | 64 px | 1.0 | 900 | UPPER | Page titles (Resultados, Inscripción) |
| `--text-display-m` | Display | 28 px | 40 px | 1.05 | 800 | UPPER | Section titles, category names in results |
| `--text-heading` | Body | 20 px | 24 px | 1.3 | 700 | Sentence | Card, modal, and form section titles |
| `--text-subheading` | Body | 18 px | 18 px | 1.4 | 600 | Sentence | Sub-sections, competition card meta |
| `--text-body` | Body | 16 px | 16 px | 1.55 | 400 | Sentence | Paragraphs, form values |
| body-strong | Body | 16 px | 16 px | 1.55 | 600 | Sentence | Emphasis, athlete names in tables |
| `--text-small` | Body | 14 px | 14 px | 1.45 | 400 | Sentence | Helper text, table cells, labels |
| `--text-caption` | Body | 13 px | 13 px | 1.4 | 500 | Sentence | Timestamps, legal footer only |
| `--text-score` | Display | 28 px | 36 px | 1.0 | 800 | — | Countdown digits, totals in results |

## Rules

- **Uppercase is only for display type.** Labels, buttons, badges, table headers, and navigation use sentence case. No tracked-out uppercase labels above headings.
- **No single-word highlights in headlines.** Don't color one word red or gold inside a title; size and weight are the emphasis.
- **Line length:** 45–75 characters for paragraphs (`max-width: 68ch`).
- **Minimum sizes:** nothing below 13 px, and 13 px only for captions. Form inputs are 16 px on mobile so Chrome doesn't zoom on focus.
- **Spanish punctuation:** use ¿, ¡ and accents correctly in all copy, including uppercase titles (INSCRIPCIÓN, not INSCRIPCION).
