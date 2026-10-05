# Content: language, voice & glossary

## Language (v1)

- **Spanish only (es-DO).** English may be added later; there is no language toggle in v1.
- **Still use i18n:** every string goes through `react-i18next` and `src/locales/es/*.json`, so adding English later doesn't touch components.
- **No hard-coded strings** in components, including `aria-label`, alt text, toasts, and validation messages.
- **Keys describe meaning, not text:** `registration.cedula.label`, not `registration.ingreseSuCedula`.
- **Google Translate:** pages declare `<html lang="es-DO">` and all text is real text (never inside images), so browser translation works for non-Spanish visitors.
- **Dates:** "14 nov 2026" in display; forms use dd/mm/aaaa.
- **Numbers:** the Dominican Republic uses a dot as the decimal separator (82.5 kg). Format with `Intl.NumberFormat('es-DO')`.
- **Category names** keep their international names where the sport uses them (Men's Physique, Bikini Fitness, Classic Physique).

### When English is added later

A segmented control "ES | EN" goes in the header (public and admin). Spanish stays the default for every new visitor; the choice is remembered and reflected in the URL (`/en/...`); switching keeps the user on the same page and preserves form input; `<html lang>` updates with it.

## Voice

- **Tone:** official, direct, respectful.
- **Always formal:** every user is addressed as *usted* (su, sus; imperatives like "Ingrese", "Complete", "Revise"). Never *tú*.
- **Admin buttons** use infinitives (Aprobar, Crear, Publicar).
- **Sentence case** for everything except display titles.
- **Buttons say the action;** the toast repeats it in the past tense ("Publicar competencia" → "Competencia publicada").
- **Errors** say what happened and how to fix it. They never apologize or blame.

| Situation | Copy |
| --- | --- |
| Primary CTA on landing | Inscribirme |
| Submit registration | Enviar inscripción |
| Registration sent | Inscripción enviada. Un juez revisará sus datos. |
| Ineligible category | Requiere sexo femenino. |
| Missing cédula | Ingrese la cédula del atleta para continuar. |
| Missing category data | Ingrese su estatura para esta categoría. |
| Registration closed | Las inscripciones cerraron el 10 de noviembre. |
| Bulk approve done | 6 inscripciones aprobadas. |
| Empty queue | No hay inscripciones pendientes. |
| Server error | No pudimos guardar los cambios. Revise su conexión e inténtelo de nuevo. |

## Glossary

Code uses the ubiquitous language (left column). This is how those terms appear to users.

| Domain term (code) | UI (Spanish) |
| --- | --- |
| Account | Cuenta |
| Athlete | Atleta |
| Coach | Entrenador / Entrenadora |
| Team | Equipo |
| Judge | Juez / Jueza |
| Category | Categoría |
| Competition (Sanctioned Event) | Competencia |
| EventRegistration | Inscripción |
| Check-In / Weigh-In | Pesaje |
| Cédula | Cédula |
| Placing | Lugar |
| Competitor number | Dorsal |
| Results | Resultados |
