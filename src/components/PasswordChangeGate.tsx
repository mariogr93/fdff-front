import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/use-auth";

export const CHANGE_PASSWORD_PATH = "/cuenta/contrasena";

/**
 * A session opened with a temporary password may only change the password.
 * Every other page, typed URLs included, redirects here. The backend enforces
 * the same rule independently (403 PasswordChangeRequiredException).
 */
export const PasswordChangeGate = ({ children }: { children: ReactNode }) => {
  const { mustChangePassword } = useAuth();
  const { pathname } = useLocation();

  if (mustChangePassword && pathname !== CHANGE_PASSWORD_PATH) {
    return <Navigate to={CHANGE_PASSWORD_PATH} replace />;
  }

  return children;
};
