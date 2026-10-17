import { z } from "zod";
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

/** JUDGE is offered only to a signed-in admin; public signup always creates an ATHLETE. */
const signupRoleSchema = z.enum(["ATHLETE", "JUDGE"]);

/**
 * Signup collects only what an Account needs. Personal data is completed on the
 * profile page after the account is activated (see profile.schema.ts).
 */
export const signupSchema = z
  .object({
    role: signupRoleSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme su contraseña"),
  })
  .superRefine((data, refContext) => {
    if (data.password !== data.confirmPassword) {
      refContext.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Las contraseñas no coinciden",
      });
    }
  });

export type SignupFormValues = z.input<typeof signupSchema>;
export type SignupFormOutput = z.output<typeof signupSchema>;
