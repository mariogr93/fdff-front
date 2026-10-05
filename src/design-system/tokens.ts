/**
 * The few design values JavaScript needs and cannot read from CSS.
 *
 * Colors, spacing, radius and type live ONLY in src/styles/theme.css. They are
 * deliberately not duplicated here — use Tailwind utilities, or
 * `var(--color-surface)` if you genuinely need the value in CSS.
 *
 * Docs: docs/design/tokens.md
 */

/** Min-width breakpoints in px. CSS custom properties can't be used in @media,
 *  and matchMedia needs real numbers. Mirrors --breakpoint-* in theme.css. */
export const breakpoints = { sm: 600, md: 768, lg: 1024, xl: 1280 } as const;

export const media = {
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  reducedMotion: '(prefers-reduced-motion: reduce)',
} as const;

/** Durations in ms, for JS-driven timing (setTimeout, animation callbacks). */
export const motionMs = { fast: 120, base: 200, slow: 320 } as const;

/** Placing 1-3 map to the medal colors; anything else has no medal. */
export const medalTokenByPlacing = {
  1: 'gold',
  2: 'silver',
  3: 'bronze',
} as const;

export type Placing = keyof typeof medalTokenByPlacing;
export type MedalToken = (typeof medalTokenByPlacing)[Placing];

export const isMedalPlacing = (placing: number): placing is Placing =>
  placing === 1 || placing === 2 || placing === 3;
