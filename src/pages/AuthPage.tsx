import { useLocation, useNavigate } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";
import { SigninForm } from "../components/SigninForm";
import { useAuth } from "../context/use-auth";
import { AccountService } from "../services/Account.service";
import { AuthService } from "../services/Auth.service";
import type {
  CreateAccountRequest,
  LoginRequest,
  RegisterRequest,
} from "../types/authentication.models";

export const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const showLoginForm = location.pathname !== "/register";


  const onLogin = async (request: LoginRequest) => {
    const response = await AuthService.login(request);

    setSession({
      accessToken: response.accessToken,
      accountId: response.accountId,
      role: response.role,
    });

    navigate("/");
  };

  const onRegister = async (request: RegisterRequest) => {
    await AuthService.register(request);
  };

  const onCreateAccount = async (request: CreateAccountRequest) => {
    await AccountService.create(request);
  };

  return (
    <div className="w-full h-auto min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5] py-10">
      <div className="p-4 w-full md:w-1/2 h-auto flex flex-col items-center justify-center border-2 border-gray-200 rounded-md shadow-lg">
        <div className="w-full flex flex-row items-center justify-center rounded-md mb-4">
          <button
            className={`w-full md:w-1/2 cursor-pointer p-2 hover:bg-blue-500 hover:text-white hover:border-2 hover:border-blue-400 hover:font-bold ${
              showLoginForm
                ? "bg-blue-400 text-white border-2 border-blue-500 font-bold"
                : "bg-white text-black border-2 border-gray-200"
            }`}
            type="button"
            onClick={() => navigate("/login")}
          >
            Acceder
          </button>

          <button
            className={`w-full md:w-1/2 cursor-pointer p-2 hover:bg-blue-500 hover:text-white hover:border-2 hover:border-blue-400 hover:font-bold ${
              !showLoginForm
                ? "bg-blue-400 text-white border-2 border-blue-500 font-bold"
                : "bg-white text-black border-2 border-gray-200"
            }`}
            type="button"
            onClick={() => navigate("/register")}
          >
            Registrarse
          </button>
        </div>

        <div className="w-full flex flex-col items-center justify-center">
          {showLoginForm ? (
            <LoginForm onSubmit={onLogin} />
          ) : (
            <SigninForm
              onRegister={onRegister}
              onCreateAccount={onCreateAccount}
            />
          )}
        </div>
      </div>
    </div>
  );
};
