import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormOutput,
  type ForgotPasswordFormValues,
} from "../schemas/forgot-password.schema";
import { parseApiError } from "../config/api-error";
import {
  FORGOT_PASSWORD_SENT_MESSAGE,
  forgotPasswordErrorMessage,
} from "../utils/auth-error-messages";
import type { ForgotPasswordRequest } from "../types/authentication.models";

interface ForgotPasswordFormProps {
  onSubmit: (request: ForgotPasswordRequest) => Promise<void> | void;
}

/**
 * The success message is the same for every address: the backend never says
 * whether one is registered, and neither does this form.
 */
export const ForgotPasswordForm = ({ onSubmit }: ForgotPasswordFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ForgotPasswordFormValues, unknown, ForgotPasswordFormOutput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });

  const submit = async (values: ForgotPasswordFormOutput) => {
    setSubmitError(null);

    try {
      await onSubmit({ email: values.email });
      setSent(true);
    } catch (error) {
      setSubmitError(forgotPasswordErrorMessage(parseApiError(error)));
    }
  };

  if (sent) {
    return (
      <p role="status" className="text-body text-ink">
        {FORGOT_PASSWORD_SENT_MESSAGE}
      </p>
    );
  }

  const emailError = errors.email?.message as string | undefined;

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2 w-full">
        <label htmlFor="email" className="text-ink text-body font-bold">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? "email-error" : undefined}
          className="w-full bg-canvas text-ink border-1 border-line rounded-sm p-2 focus:border-brand-light"
          {...register("email")}
        />
        {emailError && (
          <p id="email-error" role="alert" className="text-small text-danger">
            {emailError}
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="text-small text-danger text-center">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full bg-action text-on-action p-2 rounded-sm hover:bg-action-hover cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Enviando..." : "Enviar contraseña temporal"}
      </button>
    </form>
  );
};
