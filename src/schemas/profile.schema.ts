import { z } from "zod";
import { UTILS } from "../utils/utils";

/**
 * Personal data for the future account profile page. Not used by any form yet:
 * signup collects only email and password, and the profile is completed after the
 * account is activated. Spec: fdff-backend/docs/architecture/profiles-and-coaches.md.
 */
const profileRoleSchema = z.enum(["ATHLETE", "JUDGE"]);

export const profileSchema = z
  .object({
    role: profileRoleSchema,
    name: z
      .string()
      .trim()
      .min(1, "Nombre es requerido")
      .max(100, "Nombre demasiado largo"),
    lastname: z
      .string()
      .trim()
      .min(1, "Apellido es requerido")
      .max(100, "Apellido demasiado largo"),
    phone: z
      .string()
      .trim()
      .min(1, "Número de teléfono es requerido")
      .regex(UTILS.phoneRegex, "Número de teléfono inválido"),
    birthdate: z.string().min(1, "Fecha de nacimiento es requerida"),
    cedula: z.string().trim().optional(),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
    categories: z.array(z.string()).optional(),
  })
  .superRefine((data, refContext) => {
    if (data.role !== "ATHLETE") {
      return;
    }

    if (!data.cedula?.trim()) {
      refContext.addIssue({
        code: "custom",
        path: ["cedula"],
        message: "Cédula es requerida",
      });
    }

    if (!data.gender) {
      refContext.addIssue({
        code: "custom",
        path: ["gender"],
        message: "Género es requerido",
      });
    }

    if (!data.categories?.length) {
      refContext.addIssue({
        code: "custom",
        path: ["categories"],
        message: "Seleccione al menos una categoría",
      });
    }
  });

export type ProfileFormValues = z.input<typeof profileSchema>;
export type ProfileFormOutput = z.output<typeof profileSchema>;
