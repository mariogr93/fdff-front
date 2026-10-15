import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  loginSchema,
  type LoginFormOutput,
  type LoginFormValues,
} from "../schemas/login.schema";
import { toLoginRequest } from "../utils/login.mapper";
import type { LoginRequest } from "../types/authentication.models";

interface LoginFormProps {
  onSubmit: (request: LoginRequest) => Promise<void> | void;
}

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues, unknown, LoginFormOutput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onFormSubmit = async (values: LoginFormOutput) => {
    setSubmitError(null);

    try {
      await onSubmit(toLoginRequest(values));
    } catch {
      setSubmitError(
        "No se pudo iniciar sesión. Verifique sus credenciales e intente de nuevo."
      );
    }
  };

  const fieldError = (name: keyof LoginFormValues) =>
    errors[name]?.message as string | undefined;

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      noValidate
      className="flex flex-col items-center justify-center gap-2 w-full"
    >
      <div className="w-full flex flex-col items-center justify-center gap-2">
        <label
          className="w-full text-neutral-800 text-lg font-bold"
          htmlFor="email"
        >
          Email
        </label>
        <input
          className="w-full border-2 border-gray-300 rounded-md p-2 bg-white text-black"
          type="email"
          id="email"
          autoComplete="email"
          placeholder="Email"
          {...register("email")}
        />
        {fieldError("email") && (
          <p className="w-full text-sm text-red-600">{fieldError("email")}</p>
        )}
      </div>

      <div className="w-full flex flex-col items-center justify-center gap-2">
        <label
          className="w-full text-neutral-800 text-lg font-bold"
          htmlFor="password"
        >
          Contraseña
        </label>
        <div className="relative w-full">
          <input
            className="w-full border-2 border-gray-300 rounded-md p-2 bg-white pr-10 text-black"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            placeholder="Contraseña"
            {...register("password")}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <EyeIcon className="h-5 w-5" />
            ) : (
              <EyeOffIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {fieldError("password") && (
          <p className="w-full text-sm text-red-600">{fieldError("password")}</p>
        )}
      </div>

      {submitError && (
        <p className="w-full text-sm text-red-600 text-center">{submitError}</p>
      )}

      <div className="w-full flex flex-row items-center justify-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-1/4 bg-blue-500 text-white p-2 rounded-md disabled:opacity-60"
        >
          {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
        </button>
        <button
          type="button"
          className="w-1/4 bg-red-500 text-white p-2 rounded-md"
          onClick={() => navigate("/")}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
