import { z } from "zod";
import { UTILS } from "../utils/utils";
import { emailSchema } from "./auth-fields.schema";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 20;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, "La contraseña debe tener al menos 8 caracteres")
  .max(PASSWORD_MAX_LENGTH, "La contraseña no puede exceder 20 caracteres")
  .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
  .regex(/[a-z]/, "Debe incluir al menos una letra minúscula")
  .regex(/[0-9]/, "Debe incluir al menos un número")
  .regex(
    /[^A-Za-z0-9]/,
    "Debe incluir al menos un carácter especial"
  );

const signupRoleSchema = z.enum(["ATHLETE", "JUDGE"]);

export const signupSchema = z
  .object({
    role: signupRoleSchema,
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
    email: emailSchema,
    phone: z
      .string()
      .trim()
      .min(1, "Número de teléfono es requerido")
      .regex(UTILS.phoneRegex, "Número de teléfono inválido"),
    birthdate: z.string().min(1, "Fecha de nacimiento es requerida"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme su contraseña"),
    cedula: z.string().trim().optional(),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
    categories: z.array(z.string()).optional(),
  })
  .superRefine((data, refContext /* "refContext" stands for "refinement context"; it is a RefinementCtx object provided by Zod for adding custom validation errors/issues */) => {
    if (data.password !== data.confirmPassword) {
      refContext.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Las contraseñas no coinciden",
      });
    }

    if (data.role === "ATHLETE") {
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
    }
  });

export type SignupFormValues = z.input<typeof signupSchema>;
export type SignupFormOutput = z.output<typeof signupSchema>;
