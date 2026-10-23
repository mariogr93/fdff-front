import { z } from "zod";
import { loginPasswordSchema } from "./auth-fields.schema";
import { passwordSchema } from "./signup.schema";

/**
 * Mirrors `ChangePasswordDto`. The current password is checked for length only
 * (do not enforce entropy on an existing credential); the new one follows the
 * signup rule. Both mismatch rules are also enforced by the form, which keeps
 * the submit button disabled until they hold.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: loginPasswordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme su nueva contraseña"),
  })
  .superRefine((data, refContext) => {
    if (data.newPassword !== data.confirmPassword) {
      refContext.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Las contraseñas no coinciden",
      });
    }

    if (data.newPassword === data.currentPassword) {
      refContext.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "La nueva contraseña debe ser distinta a la actual",
      });
    }
  });

export type ChangePasswordFormValues = z.input<typeof changePasswordSchema>;
export type ChangePasswordFormOutput = z.output<typeof changePasswordSchema>;
