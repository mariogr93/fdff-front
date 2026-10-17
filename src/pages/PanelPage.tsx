import { Link } from "react-router-dom";
import { useAuth } from "../context/use-auth";

const CARD_CLASS =
  "flex flex-col items-center justify-between bg-surface rounded-md p-4 w-[300px] h-[300px] cursor-pointer transition-transform duration-300 ease-base hover:scale-105";

/** Panel home for judges and admins (guarded in Routes.tsx). */
export const PanelPage = () => {
  const { role } = useAuth();

  return (
    <div className="flex flex-row flex-wrap items-center justify-center min-h-screen gap-4">
      <Link to="/panel/competencias" className={CARD_CLASS}>
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-heading font-bold">Crear competencia</h2>
          <p className="text-small text-ink-muted">Crea una nueva competencia.</p>
        </div>
        <img
          src="/trophy.jpg"
          alt=""
          className="w-[100px] h-[100px] object-cover"
        />
      </Link>

      <Link to="/panel/categorias" className={CARD_CLASS}>
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-heading font-bold">Crear categoría</h2>
          <p className="text-small text-ink-muted">
            Crea una nueva categoría para sus competencias.
          </p>
        </div>
        <img src="/categories.jpg" alt="" className="w-full" />
      </Link>

      {role === "ADMIN" && (
        <Link to="/panel/jueces" className={CARD_CLASS}>
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-heading font-bold">Jueces</h2>
            <p className="text-small text-ink-muted">Administre las cuentas de jueces.</p>
          </div>
        </Link>
      )}
    </div>
  );
};
