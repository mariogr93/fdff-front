import { z } from "zod";
import { emailSchema, loginPasswordSchema } from "./auth-fields.schema";

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export type LoginFormValues = z.input<typeof loginSchema>;
export type LoginFormOutput = z.output<typeof loginSchema>;
