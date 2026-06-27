import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email es requerido")
  .email("Email inválido")
  .max(100, "Email demasiado largo")
  .transform((value) => value.toLowerCase());

/** Login: length bounds only — do not enforce entropy on existing credentials. */
export const loginPasswordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(20, "La contraseña no puede exceder 20 caracteres");
