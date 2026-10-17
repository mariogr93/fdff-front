import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  signupSchema,
  type SignupFormOutput,
  type SignupFormValues,
} from "../schemas/signup.schema";
import {
  toCreateAccountRequest,
  toRegisterRequest,
} from "../utils/signup.mapper";
import { useAuth } from "../context/use-auth";
import { parseApiError } from "../config/api-error";
import {
  ADMIN_CREATED_ACCOUNT_MESSAGE,
  SIGNUP_SUCCESS_MESSAGE,
  signupErrorMessage,
} from "../utils/auth-error-messages";
import type {
  CreateAccountRequest,
  RegisterRequest,
} from "../types/authentication.models";

interface SigninFormProps {
  onRegister: (request: RegisterRequest) => Promise<void> | void;
  /** Admin only: creates a judge account through `POST /accounts`. */
  onCreateAccount: (request: CreateAccountRequest) => Promise<void> | void;
}

export const SigninForm = ({ onRegister, onCreateAccount }: SigninFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const navigate = useNavigate();
  const { role: sessionRole } = useAuth();
  const isAdminUser = sessionRole === "ADMIN";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues, unknown, SignupFormOutput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "ATHLETE",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: SignupFormOutput) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      // Public signup always creates an ATHLETE; only an admin can create a judge.
      if (isAdminUser && values.role === "JUDGE") {
        await onCreateAccount(toCreateAccountRequest(values));
        setSubmitSuccess(ADMIN_CREATED_ACCOUNT_MESSAGE);
      } else {
        await onRegister(toRegisterRequest(values));
        setSubmitSuccess(SIGNUP_SUCCESS_MESSAGE);
      }
    } catch (error) {
      setSubmitError(signupErrorMessage(parseApiError(error)));
    }
  };

  const fieldError = (name: keyof SignupFormValues) =>
    errors[name]?.message as string | undefined;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col items-center justify-center gap-2 w-full"
    >
      {isAdminUser && (
        <div className="w-full flex flex-col items-center justify-center gap-2">
          <label
            className="w-full text-neutral-800 text-lg font-bold"
            htmlFor="role"
          >
            Rol
          </label>
          <select
            className="w-full border-2 border-gray-300 rounded-md p-2 bg-white text-black"
            id="role"
            {...register("role")}
          >
            <option value="ATHLETE">Atleta/Competidor/Coach</option>
            <option value="JUDGE">Juez</option>
          </select>
          {fieldError("role") && (
            <p className="w-full text-sm text-red-600">{fieldError("role")}</p>
          )}
        </div>
      )}

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
            autoComplete="new-password"
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

      <div className="w-full flex flex-col items-center justify-center gap-2">
        <label
          className="w-full text-neutral-800 text-lg font-bold"
          htmlFor="confirmPassword"
        >
          Confirmar Contraseña
        </label>
        <div className="relative w-full">
          <input
            className="w-full border-2 border-gray-300 rounded-md p-2 bg-white pr-10 text-black"
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirmar Contraseña"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            tabIndex={-1}
            aria-label={
              showConfirmPassword
                ? "Ocultar confirmación"
                : "Mostrar confirmación"
            }
          >
            {showConfirmPassword ? (
              <EyeIcon className="h-5 w-5" />
            ) : (
              <EyeOffIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {fieldError("confirmPassword") && (
          <p className="w-full text-sm text-red-600">
            {fieldError("confirmPassword")}
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="w-full text-sm text-red-600 text-center">
          {submitError}
        </p>
      )}

      {submitSuccess && (
        <p role="status" className="w-full text-sm text-green-700 text-center">
          {submitSuccess}
        </p>
      )}

      <div className="w-full flex flex-row items-center justify-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-1/4 bg-blue-500 text-white p-2 rounded-md disabled:opacity-60"
        >
          {isSubmitting ? "Creando..." : "Crear cuenta"}
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
