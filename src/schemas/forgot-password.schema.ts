import { z } from "zod";
import { emailSchema } from "./auth-fields.schema";

/** Mirrors `ForgotPasswordDto`. */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormValues = z.input<typeof forgotPasswordSchema>;
export type ForgotPasswordFormOutput = z.output<typeof forgotPasswordSchema>;
