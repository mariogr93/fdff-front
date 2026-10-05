# Iconography & imagery

## Icons

- **Library:** Lucide (`lucide-react`), outline style, stroke width 1.75.
- **Sizes:** 16 px inside small text and badges, 20 px in buttons and inputs, 24 px in navigation. Icons inherit the text color.
- **Labels:** icons accompany labels and never replace them for actions, except the mobile bottom navigation (which keeps a short text label) and universal controls (close, menu, search) with an `aria-label`. Decorative icons get `aria-hidden="true"`.

| Concept | Icon |
| --- | --- |
| Competition | `trophy` |
| Category | `layers` |
| Athlete | `user-round` |
| Team | `users-round` |
| Judge | `gavel` |
| Registration | `clipboard-list` |
| Weigh-in | `scale` |
| Height | `ruler` |
| Date | `calendar` |
| Venue | `map-pin` |

## Images

| Image type | Aspect ratio | Min. upload size | Treatment |
| --- | --- | --- | --- |
| Competition poster | 4 : 5 | 1080 × 1350 | Shown as-is, no overlay, `--radius-md` |
| Competition cover (carousel, hero background) | 3 : 2 | 1800 × 1200 | Bottom overlay for text |
| Athlete profile photo | 3 : 4 | 600 × 800 | Cropped to face/torso, `--radius-md` |
| Gallery photo | 3 : 2 or 2 : 3 | 1600 px long edge | Lightbox on click |

- **Text overlay:** `linear-gradient(to top, rgba(10,16,41,0.92) 0%, rgba(10,16,41,0) 60%)`. Text always sits on the darkened part.
- **Placeholder** when no image exists: `--color-surface-raised` with the monogram centered at 20% opacity. Never use stock photos of non-Dominican athletes.
- **Alt text** is required: competition name + year for posters and covers, the athlete's name for athlete photos.
- **Delivery:** images come from Supabase buckets; request resized variants (400, 800, 1600 px wide) and use `srcset`.
