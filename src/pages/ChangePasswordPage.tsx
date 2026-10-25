import { useNavigate } from "react-router-dom";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import { useAuth } from "../context/use-auth";
import { AuthService } from "../services/Auth.service";
import type { ChangePasswordRequest } from "../types/authentication.models";

/**
 * Signed-in password change (guarded in Routes.tsx). After a sign-in with a
 * temporary password this is the only page available (PasswordChangeGate).
 */
export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { logout, mustChangePassword } = useAuth();

  const onSubmit = async (request: ChangePasswordRequest) => {
    await AuthService.changePassword(request);
    // The backend already ended every session; this clears the in-memory token
    // and tells the other tabs. Then the person signs in with the new password.
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10">
      <div className="w-full md:w-1/2 max-w-lg bg-surface border-1 border-line rounded-md p-6 flex flex-col gap-4">
        <h1 className="text-heading font-bold text-ink">
          {mustChangePassword ? "Cambie su contraseña temporal" : "Cambiar contraseña"}
        </h1>
        {mustChangePassword && (
          <p role="alert" className="text-small text-warning">
            Ingresó con una contraseña temporal. Debe elegir una nueva para continuar. Si cierra
            sesión sin cambiarla, la contraseña temporal dejará de funcionar y su cuenta se
            desactivará.
          </p>
        )}
        <p className="text-small text-ink-muted">
          Al guardar, se cerrará su sesión en todos los dispositivos y deberá ingresar con su
          nueva contraseña.
        </p>
        <ChangePasswordForm
          onSubmit={onSubmit}
          currentPasswordLabel={
            mustChangePassword ? "Contraseña temporal" : "Contraseña actual"
          }
        />
      </div>
    </div>
  );
};
