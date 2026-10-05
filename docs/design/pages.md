# Pages

## Routes & access

| Route | Page | Public | Athlete/Coach | Judge | Admin |
| --- | --- | --- | --- | --- | --- |
| `/` | Landing | ✓ | ✓ | ✓ | ✓ |
| `/competencias/:slug/resultados` | Competition results | ✓ | ✓ | ✓ | ✓ |
| `/inscripcion` | Athlete registration | ✓ | ✓ | ✓ | ✓ |
| `/ingresar` | Login | ✓ |  |  |  |
| `/panel/competencias` | List & create competitions |  |  | ✓ | ✓ |
| `/panel/categorias` | List & create categories |  |  | ✓ | ✓ |
| `/panel/inscripciones` | Approve registrations |  |  | ✓ | ✓ |
| `/panel/atletas` | Search & edit athletes |  |  | ✓ | ✓ |
| `/panel/jueces` | Create judge accounts |  |  |  | ✓ |

Route guards hide and block pages by role; the backend enforces the same rules independently.

## Landing (public)

- **Hero:** the next competition's poster, title in display-xl, date, venue, countdown, and two buttons (Inscribirme, Ver categorías). Below the title, a short line of the categories offered ("8 categorías: Classic Physique, Bikini, …").
- **No upcoming competition:** the hero shows the latest champions with "Próximamente nuevas competencias."
- **Competencias anteriores:** the carousel of past competitions.
- **Campeones:** 1st-place athletes of the latest competition with photo, name, category, and gold medal badge. This is the main place gold appears.
- **Footer:** crest, federation info, social links.
- **Mobile:** poster on top, then title and countdown; Inscribirme sticks to the bottom.

## Competition results (public)

- **Header:** back link, competition title (display-l), date, city, number of categories and athletes.
- **Category navigation:** tabs on desktop, a select on mobile. Both jump to that category's table on the same page.
- **Body:** every category's results table on one page, in the order set for the competition, so it stays printable and searchable with Ctrl+F.
- **Gallery** at the end (optional).
- **Print stylesheet:** white background, one category per printed page, crest and competition name in each page header.

## Athlete registration (public)

Four steps. Cédula, nombre, and apellido are required, plus the measurements each chosen category depends on.

1. **Identificación:** "¿Quién realiza la inscripción?" (Soy el atleta / Soy entrenador o representante), then the athlete's Cédula with lookup.
2. **Datos del atleta:** nombre, apellido, sex, date of birth, height (cm), declared weight (kg), phone, email, photo, Nombre del equipo, Nombre del entrenador. If a coach is registering, the coach name is pre-filled.
3. **Competencia y categorías:** the competition (pre-selected when coming from the landing hero), then the eligibility-aware category list, multi-select. Categories are filtered by the athlete's sex, age, height, and weight.
4. **Revisión:** summary of athlete, team, coach, and categories with edit links, then Enviar inscripción.

After submission:

- Confirmation: "Inscripción enviada. Un juez revisará sus datos." with Pendiente status per category.
- For coaches, the primary action is **Inscribir otro atleta**, which restarts at step 1 keeping team, coach, and competition.
- Creating an account (email + password) to check status later is offered on the confirmation screen, optional in v1.

## Create competition (admin/judge)

One form in sections, with a live preview of the public card on wide screens:

1. **Información general:** title, date, venue, city, description.
2. **Inscripciones:** opening date, closing date, "Inscripciones abiertas" switch.
3. **Categorías:** pick from existing categories; drag to order (with keyboard alternative). This order drives the results page.
4. **Imágenes:** poster (4:5) and cover (3:2) uploads with crop preview.

Actions: Guardar borrador (secondary), Publicar competencia (primary).

## Create category (admin/judge)

- **Fields:** name, sex (Masculino / Femenino / Mixto), age range, height range (cm), weight limit (a fixed max kg, or a height-to-weight table for categories like Classic Physique), description.
- **Height-to-weight table:** editable rows of "Estatura hasta (cm)" → "Peso máximo (kg)".
- **Live preview:** the category card exactly as athletes will see it, plus a plain summary: "Para hombres de 18 años o más, entre 170 y 180 cm, con peso máximo según la tabla."

## Approve registrations (admin/judge)

- **Filters:** competition, category, status (default Pendiente), search.
- **Table:** one row per athlete × category, since one athlete may be approved in one category and rejected in another. Columns: checkbox, athlete (team and coach below), category, height, weight, age, status.
- **Rule violations:** values that break a category rule are highlighted in danger color with an explanation of the rule (visible text or tooltip that is also keyboard-accessible).
- **Bulk actions:** the bulk action bar.
- **Detail panel:** clicking a name opens a side panel (bottom sheet on mobile) with photo, full data, all their registrations in this competition, history, and Editar datos.

## Athletes (admin/judge)

Searchable table (name, cédula, team, coach). Editing opens the registration step 2 form plus an audit line: "Última modificación por Juez X el 03/10/2026".

## Judges (admin only)

- Table of judge accounts: name, email, active/inactive, created date.
- **Crear cuenta de juez:** name and email; a temporary password is generated and shown once with a copy button.
- Deactivating a judge requires confirmation.
