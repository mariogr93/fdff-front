import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/use-auth";
import { Navbar } from "./Navbar";
import { XIcon, MenuIcon } from "lucide-react";
import { AuthService } from "../services/Auth.service";
import { broadcastLogout } from "../auth/auth-session.store";

export const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, clearSession, isBootstrapping } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {

    try {
      await AuthService.logout();
    } catch (error) {
      console.error("❌ Error in Header.handleLogout", error);
    } finally {
      clearSession();
      broadcastLogout();
      navigate("/");
    } 
  };

  return (
    <header className="bg-canvas flex justify-between items-center">
      <div className="h-15 w-30 text-on-brand text-heading font-bold bg-brand flex items-center justify-center">
        <Link to="/">FDFF</Link>
      </div>

      <Navbar />

      <div className="hidden md:block flex gap-4 items-center justify-center">
        {isBootstrapping ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 bg-surface-raised rounded-full animate-pulse"></div>
          </div>
        ) : (
          isAuthenticated ? (
          <div className="flex items-center justify-center gap-2">
            <button
              className="text-ink bg-surface border-1 mr-2 border-line w-25 h-10 px-4 py-2 rounded-sm hover:bg-surface-raised cursor-pointer"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
            <div className="text-on-brand bg-brand border-none rounded-md w-10 h-10 flex items-center justify-center text-caption font-bold">
              {role?.charAt(0) ?? "U"}
            </div>
          </div>
        ) : (
          <>
            <button
              className="text-ink bg-surface mr-2 border-1 border-line w-25 h-10 rounded-sm hover:bg-surface-raised cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Ingresar
            </button>
            <button
              className="text-on-action bg-action mr-2 border-none w-25 h-10 rounded-sm hover:bg-action-hover cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Registrarse
            </button>
          </>
        )
        )}
      </div>

      <div className="block md:hidden w-15 h-15 flex items-center justify-center">
        <button onClick={() => setIsMenuOpen((prev) => !prev)}>
          {isMenuOpen ? (
            <XIcon className="text-ink" />
          ) : (
            <MenuIcon className="text-ink" />
          )}
        </button>
      </div>
    </header>
  );
};
