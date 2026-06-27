import type { RegisterRequest } from "../types/authentication.models";
import type { SignupFormOutput } from "../schemas/signup.schema";

/**
 * Maps validated + sanitized form values to the NestJS RegisterAccountDto shape.
 * Profile fields (name, phone, etc.) are intentionally excluded until the API supports them.
 */
export function toRegisterRequest(values: SignupFormOutput): RegisterRequest {
  return {
    email: values.email,
    password: values.password,
    role: values.role,
  };
}

/**
 * Athlete profile data collected in Phase 1 UI but not yet persisted by the API.
 * Keep separate so it can be sent to a future profile endpoint without touching auth logic.
 */
export function toSignupProfileDraft(values: SignupFormOutput) {
  if (values.role !== "ATHLETE") {
    return null;
  }

  return {
    name: values.name,
    lastname: values.lastname,
    phone: values.phone,
    birthdate: values.birthdate,
    cedula: values.cedula ?? "",
    gender: values.gender ?? null,
    categories: values.categories ?? [],
  };
}
