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
  currentPasswordIncorrect: "La contraseña actual no es correcta.",
  newPasswordUnchanged: "La nueva contraseña debe ser distinta a la actual.",
  changePasswordFailed: "No se pudo cambiar la contraseña. Revise sus datos e inténtelo de nuevo.",
} as const;

export const CHANGE_PASSWORD_SUCCESS_MESSAGE =
  "Contraseña actualizada. Inicie sesión con su nueva contraseña.";

export const SIGNUP_SUCCESS_MESSAGE =
  "Solicitud enviada. Cuando su cuenta sea aprobada, podrá ingresar y completar su perfil.";

/** An admin-created account starts ACTIVE. */
export const ADMIN_CREATED_ACCOUNT_MESSAGE = "Cuenta creada. El juez ya puede ingresar.";

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

/** A wrong current password is a 400, not a 401: the session is still valid. */
export const changePasswordErrorMessage = (apiError: ApiError): string => {
  if (apiError.error === "CurrentPasswordIncorrectException") {
    return MESSAGES.currentPasswordIncorrect;
  }

  if (apiError.error === "NewPasswordUnchangedException") {
    return MESSAGES.newPasswordUnchanged;
  }

  return commonMessage(apiError) ?? MESSAGES.changePasswordFailed;
};

export const signupErrorMessage = (apiError: ApiError): string =>
  commonMessage(apiError) ??
  (apiError.error === "AccountAlreadyExistsException"
    ? MESSAGES.emailUnavailable
    : MESSAGES.signupFailed);
