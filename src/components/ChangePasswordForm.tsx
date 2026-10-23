import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  type ChangePasswordFormOutput,
  type ChangePasswordFormValues,
} from "../schemas/change-password.schema";
import { parseApiError } from "../config/api-error";
import { changePasswordErrorMessage } from "../utils/auth-error-messages";
import type { ChangePasswordRequest } from "../types/authentication.models";

interface ChangePasswordFormProps {
  onSubmit: (request: ChangePasswordRequest) => Promise<void> | void;
}

type PasswordField = keyof ChangePasswordFormValues;

const FIELDS: ReadonlyArray<{
  name: PasswordField;
  label: string;
  autoComplete: string;
}> = [
  { name: "currentPassword", label: "Contraseña actual", autoComplete: "current-password" },
  { name: "newPassword", label: "Nueva contraseña", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirmar nueva contraseña", autoComplete: "new-password" },
];

const INPUT_CLASS =
  "w-full bg-canvas text-ink border-1 border-line rounded-sm p-2 pr-10 focus:border-brand-light";

export const ChangePasswordForm = ({ onSubmit }: ChangePasswordFormProps) => {
  const [visible, setVisible] = useState<Partial<Record<PasswordField, boolean>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ChangePasswordFormValues, unknown, ChangePasswordFormOutput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    // Validate on every keystroke so the button state and warnings are live.
    mode: "onChange",
  });

  const newPassword = useWatch({ control, name: "newPassword" });
  const confirmPassword = useWatch({ control, name: "confirmPassword" });
  // Checked directly, not only through the schema: the warning and the disabled
  // button must hold as soon as the two fields differ.
  const mismatch = confirmPassword !== "" && newPassword !== confirmPassword;

  const submit = async (values: ChangePasswordFormOutput) => {
    setSubmitError(null);

    try {
      await onSubmit({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    } catch (error) {
      setSubmitError(changePasswordErrorMessage(parseApiError(error)));
    }
  };

  const fieldError = (name: PasswordField): string | undefined =>
    name === "confirmPassword" && mismatch
      ? "Las contraseñas no coinciden. Ambas deben ser iguales."
      : (errors[name]?.message as string | undefined);

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="flex flex-col gap-4 w-full"
    >
      {FIELDS.map(({ name, label, autoComplete }) => {
        const error = fieldError(name);
        const isVisible = visible[name] === true;

        return (
          <div key={name} className="flex flex-col gap-2 w-full">
            <label htmlFor={name} className="text-ink text-body font-bold">
              {label}
            </label>
            <div className="relative w-full">
              <input
                id={name}
                type={isVisible ? "text" : "password"}
                autoComplete={autoComplete}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${name}-error` : undefined}
                className={INPUT_CLASS}
                {...register(name)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted"
                onClick={() => setVisible((prev) => ({ ...prev, [name]: !isVisible }))}
                aria-label={isVisible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
              >
                {isVisible ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
              </button>
            </div>
            {error && (
              <p id={`${name}-error`} role="alert" className="text-small text-danger">
                {error}
              </p>
            )}
          </div>
        );
      })}

      {submitError && (
        <p role="alert" className="text-small text-danger text-center">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || mismatch || isSubmitting}
        className="w-full bg-action text-on-action p-2 rounded-sm hover:bg-action-hover cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Guardando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
};
