import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/use-auth";
import type { AccountRole } from "../types/authentication.models";

interface RequireRoleProps {
  roles: readonly AccountRole[];
  /** Omit to guard nested routes through <Outlet />. */
  children?: ReactNode;
}

/**
 * Blocks a route by role. Waits for the page-load session refresh before deciding.
 * Signed out → /login; signed in without the role → /. No return URL and no hint
 * that the page exists. The backend enforces the same rules independently.
 */
export const RequireRole = ({ roles, children }: RequireRoleProps) => {
  const { isAuthenticated, isBootstrapping, role } = useAuth();

  if (isBootstrapping) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
};
