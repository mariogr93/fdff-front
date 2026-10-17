import { Check, EyeIcon, EyeOffIcon, X } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { UTILS } from "../utils/utils";
import { CATEGORIES_LIST } from "../utils/Categories";
import {
  signupSchema,
  type SignupFormOutput,
  type SignupFormValues,
} from "../schemas/signup.schema";
import {
  toCreateAccountRequest,
  toRegisterRequest,
  toSignupProfileDraft,
} from "../utils/signup.mapper";
import { useAuth } from "../context/use-auth";
import { parseApiError } from "../config/api-error";
import {
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
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues, unknown, SignupFormOutput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "ATHLETE",
      name: "",
      lastname: "",
      email: "",
      phone: "",
      birthdate: "",
      password: "",
      confirmPassword: "",
      cedula: "",
      gender: undefined,
      categories: [],
    },
    mode: "onBlur",
  });

  const role = useWatch({ control, name: "role" });
  const gender = useWatch({ control, name: "gender" });
  const selectedCategories = useWatch({ control, name: "categories" }) ?? [];
  const categoriesList =
    gender === "MALE" || gender === "FEMALE"
      ? CATEGORIES_LIST[gender]
      : [];

  const onSubmit = async (values: SignupFormOutput) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    const profileDraft = toSignupProfileDraft(values);

    if (profileDraft) {
      // Reserved for a future profile API — never mix with the auth payload.
      void profileDraft;
    }

    try {
      // Public signup always creates an ATHLETE; only an admin can create a judge.
      if (isAdminUser && values.role === "JUDGE") {
        await onCreateAccount(toCreateAccountRequest(values));
      } else {
        await onRegister(toRegisterRequest(values));
      }
      setSubmitSuccess(SIGNUP_SUCCESS_MESSAGE);
    } catch (error) {
      setSubmitError(signupErrorMessage(parseApiError(error)));
    }
  };

  const onGenderChange = (value: "MALE" | "FEMALE") => {
    setValue("gender", value, { shouldValidate: true });
    setValue("categories", [], { shouldValidate: true });
  };

  const onCategoryToggle = (category: string) => {
    const next = selectedCategories.includes(category)
      ? selectedCategories.filter((item) => item !== category)
      : [...selectedCategories, category];

    setValue("categories", next, { shouldValidate: true });
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
          htmlFor="name"
        >
          Nombre
        </label>
        <input
          className="w-full border-2 border-gray-300 rounded-md p-2 bg-white text-black"
          type="text"
          id="name"
          autoComplete="given-name"
          placeholder="Nombre"
          {...register("name")}
        />
        {fieldError("name") && (
          <p className="w-full text-sm text-red-600">{fieldError("name")}</p>
        )}
      </div>

      <div className="w-full flex flex-col items-center justify-center gap-2">
        <label
          className="w-full text-neutral-800 text-lg font-bold"
          htmlFor="lastname"
        >
          Apellido
        </label>
        <input
          className="w-full border-2 border-gray-300 rounded-md p-2 bg-white text-black"
          type="text"
          id="lastname"
          autoComplete="family-name"
          placeholder="Apellido"
          {...register("lastname")}
        />
        {fieldError("lastname") && (
          <p className="w-full text-sm text-red-600">{fieldError("lastname")}</p>
        )}
      </div>

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
          htmlFor="phone"
        >
          Numero de Telefono
        </label>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <input
              className="w-full border-2 border-gray-300 rounded-md p-2 bg-white text-black"
              type="tel"
              id="phone"
              autoComplete="tel"
              placeholder="### ### ####"
              value={field.value}
              onChange={(e) =>
                field.onChange(UTILS.formatPhoneNumber(e.target.value))
              }
              onBlur={field.onBlur}
            />
          )}
        />
        {fieldError("phone") && (
          <p className="w-full text-sm text-red-600">{fieldError("phone")}</p>
        )}
      </div>

      <div className="w-full flex flex-col items-center justify-center gap-2">
        <label
          className="w-full text-neutral-800 text-lg font-bold"
          htmlFor="birthdate"
        >
          Fecha de nacimiento
        </label>
        <input
          className="w-full border-2 border-gray-300 rounded-md p-2 bg-white text-black"
          type="date"
          id="birthdate"
          {...register("birthdate")}
        />
        {fieldError("birthdate") && (
          <p className="w-full text-sm text-red-600">{fieldError("birthdate")}</p>
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

      {role === "ATHLETE" && (
        <>
          <div className="w-full flex flex-col items-center justify-center gap-2">
            <label
              className="w-full text-neutral-800 text-lg font-bold"
              htmlFor="cedula"
            >
              Cédula
            </label>
            <input
              className="w-full border-2 border-gray-300 rounded-md p-2 bg-white text-black"
              type="text"
              id="cedula"
              inputMode="numeric"
              placeholder="Cédula"
              {...register("cedula")}
            />
            {fieldError("cedula") && (
              <p className="w-full text-sm text-red-600">{fieldError("cedula")}</p>
            )}
          </div>

          <div className="w-full flex flex-col items-center justify-center gap-2">
            <label
              className="w-full text-neutral-800 text-lg font-bold"
              htmlFor="gender"
            >
              Genero
            </label>
            <select
              className="w-full border-2 border-gray-300 rounded-md p-2 bg-white text-black"
              id="gender"
              value={gender ?? ""}
              onChange={(e) =>
                onGenderChange(e.target.value as "MALE" | "FEMALE")
              }
            >
              <option value="" disabled>
                Seleccione su genero
              </option>
              <option value="MALE">Masculino</option>
              <option value="FEMALE">Femenino</option>
            </select>
            {fieldError("gender") && (
              <p className="w-full text-sm text-red-600">{fieldError("gender")}</p>
            )}
          </div>

          <div className="w-full flex flex-col items-center justify-center gap-2">
            <label
              className="w-full text-neutral-800 text-lg font-bold"
              htmlFor="categories"
            >
              Seleccione sus categorias
            </label>

            {categoriesList.map((category) => (
              <button
                key={category}
                type="button"
                className={`w-[350px] h-auto border-2 border-gray-300 cursor-pointer rounded-md p-2 flex flex-row items-center justify-between gap-2 ${
                  selectedCategories.includes(category)
                    ? "bg-green-200 text-black border-green-500"
                    : "bg-white text-black border-gray-300"
                }`}
                onClick={() => onCategoryToggle(category)}
              >
                {category}{" "}
                {selectedCategories.includes(category) ? (
                  <X className="h-5 w-5 text-red-500" />
                ) : (
                  <Check className="h-5 w-5 text-green-500 " />
                )}
              </button>
            ))}
            {fieldError("categories") && (
              <p className="w-full text-sm text-red-600">
                {fieldError("categories")}
              </p>
            )}
          </div>
        </>
      )}

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
