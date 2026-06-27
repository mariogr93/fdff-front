import type { LoginFormOutput } from "../schemas/login.schema";
import type { LoginRequest } from "../types/authentication.models";

export function toLoginRequest(values: LoginFormOutput): LoginRequest {
  return {
    email: values.email,
    password: values.password,
  };
}
