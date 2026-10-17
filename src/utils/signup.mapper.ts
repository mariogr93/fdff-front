import type {
  CreateAccountRequest,
  RegisterRequest,
} from "../types/authentication.models";
import type { SignupFormOutput } from "../schemas/signup.schema";
import type { ProfileFormOutput } from "../schemas/profile.schema";

/**
 * Maps validated + sanitized form values to the NestJS RegisterAccountDto shape.
 * `role` is not sent: public signup always creates an ATHLETE. Judges are created by an
 * admin through `POST /accounts`.
 */
export function toRegisterRequest(values: SignupFormOutput): RegisterRequest {
  return {
    email: values.email,
    password: values.password,
  };
}

/** Maps the form to `POST /accounts`, which an admin uses to create a judge account. */
export function toCreateAccountRequest(
  values: SignupFormOutput
): CreateAccountRequest {
  return {
    email: values.email,
    password: values.password,
    role: values.role,
  };
}

/**
 * Athlete profile data for the future profile page; not sent anywhere yet.
 * Kept apart from the auth payloads so it can go to a profile endpoint later.
 */
export function toSignupProfileDraft(values: ProfileFormOutput) {
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
