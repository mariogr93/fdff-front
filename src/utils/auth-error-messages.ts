import type { ApiError } from "../config/api-error";

/**
 * Login and signup copy. Deliberately general: a message never says which field
 * was wrong, whether an account exists, or whether it is locked or pending.
 */
const MESSAGES = {
  loginFailed:
    "No se pudo iniciar sesión. Revise sus datos o inténtelo más tarde. Las cuentas nuevas deben ser aprobadas antes de ingresar.",
  signupFailed: "No se pudo crear la cuenta. Revise sus datos e inténtelo de nuevo.",
  emailUnavailable: "No se puede usar este correo. Intente con otro.",
  tooManyAttempts: "Demasiados intentos. Espere unos minutos e inténtelo de nuevo.",
  serverUnavailable: "No se pudo conectar con el servidor. Inténtelo más tarde.",
} as const;

export const SIGNUP_SUCCESS_MESSAGE =
  "Solicitud enviada. Su cuenta debe ser aprobada antes de ingresar.";

/** Messages shared by login and signup, or null when the caller decides. */
const commonMessage = ({ statusCode, error, isNetworkError }: ApiError): string | null => {
  if (statusCode === 429) {
    return MESSAGES.tooManyAttempts;
  }

  if (error === "CrossOriginRequestException" && import.meta.env.DEV) {
    console.warn(
      "The API refused this page's origin. Add it to FRONTEND_URL in the backend .env."
    );
  }

  if (isNetworkError || statusCode === null || statusCode === 403 || statusCode >= 500) {
    return MESSAGES.serverUnavailable;
  }

  return null;
};

export const loginErrorMessage = (apiError: ApiError): string =>
  commonMessage(apiError) ?? MESSAGES.loginFailed;

export const signupErrorMessage = (apiError: ApiError): string =>
  commonMessage(apiError) ??
  (apiError.error === "AccountAlreadyExistsException"
    ? MESSAGES.emailUnavailable
    : MESSAGES.signupFailed);
