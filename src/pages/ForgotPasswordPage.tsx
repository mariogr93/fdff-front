import { Link } from "react-router-dom";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";
import { AuthService } from "../services/Auth.service";

/** Public page: requests a temporary password by email. */
export const ForgotPasswordPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen py-10">
    <div className="w-full md:w-1/2 max-w-lg bg-surface border-1 border-line rounded-md p-6 flex flex-col gap-4">
      <h1 className="text-heading font-bold text-ink">Recuperar contraseña</h1>
      <p className="text-small text-ink-muted">
        Escriba el correo de su cuenta. Si está registrado y activo, le enviaremos una{" "}
        <strong className="text-ink">
          contraseña temporal válida por una hora y para un solo ingreso, 
        </strong> luego de hacer login debe de cambiarla por una nueva contraseña válida y distinta a
        la anterior (su contraseña actual sigue funcionando).
      </p>
      <ForgotPasswordForm onSubmit={AuthService.forgotPassword} />
      <Link to="/login" className="text-small text-brand-light underline">
        Volver a iniciar sesión
      </Link>
    </div>
  </div>
);
