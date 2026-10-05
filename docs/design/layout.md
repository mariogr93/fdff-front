# Layout

## Breakpoints

| Name | Min width | Target devices | Grid |
| --- | --- | --- | --- |
| base | 0 | Phones (design at 360 px) | 4 columns, 16 px margins, 16 px gutters |
| sm | 600 px | Large phones, small tablets portrait | 8 columns, 24 px margins |
| md | 768 px | Tablets portrait | 8 columns, 32 px margins, 24 px gutters |
| lg | 1024 px | Tablets landscape, small laptops | 12 columns, 32 px margins, 24 px gutters |
| xl | 1280 px | Laptops and desktops | 12 columns, max content width 1200 px, centered |

Use Tailwind's responsive variants (`sm:`, `md:`, `lg:`, `xl:`) rather than hand-written `@media` rules. For JavaScript (`matchMedia`), the same values are exported from `src/design-system/tokens.ts` as `breakpoints` and `media`.

`md`, `lg` and `xl` already match Tailwind's defaults. Only **`sm` is overridden**, to 600 px instead of Tailwind's 640 px.

- **Public pages and registration:** designed mobile-first (360 px), then expanded.
- **Admin/judge panel:** designed for 1280 px first, then adapted to 768 px and 360 px. Every admin action must be possible on a phone, even if slower.

## Fixed dimensions

| Token | Value |
| --- | --- |
| `--content-max` | 1200 px |
| `--header-height` | 64 px |
| `--sidebar-width` | 240 px (72 px collapsed) |

## Alignment

- Text is left-aligned everywhere, including hero copy on desktop. Center alignment only for the mobile hero, empty states, and the login card.
- Numbers in tables are right-aligned; placings (1, 2, 3…) are centered in a fixed-width column.
