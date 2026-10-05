import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/use-auth";
import { Navbar } from "./Navbar";
import { XIcon, MenuIcon } from "lucide-react";
import { AuthService } from "../services/Auth.service";

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
      navigate("/");
    } 
  };

  return (
    <header className="bg-black flex justify-between items-center">
      <div className="h-15 w-30 text-white text-2xl font-bold bg-red-500 flex items-center justify-center">
        <Link to="/">FDFF</Link>
      </div>

      <Navbar />

      <div className="hidden md:block flex gap-4 items-center justify-center">
        {isBootstrapping ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        ) : (
          isAuthenticated ? (
          <div className="flex items-center justify-center gap-2">
            <button
              className="text-white bg-black border-1 mr-2 border-white w-25 h-10 px-4 py-2 rounded-md hover:bg-gray-800 cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </button>
            <div className="text-white bg-red-500 border-none rounded-xl w-10 h-10 flex items-center justify-center text-xs font-bold">
              {role?.charAt(0) ?? "U"}
            </div>
          </div>
        ) : (
          <>
            <button
              className="text-white bg-black mr-2 border-1 border-white w-25 h-10 rounded-md hover:bg-gray-800 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="text-white bg-red-500 mr-2 border-none w-25 h-10 rounded-md hover:bg-red-600 cursor-pointer"
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
            <XIcon className="text-white" />
          ) : (
            <MenuIcon className="text-white" />
          )}
        </button>
      </div>
    </header>
  );
};
