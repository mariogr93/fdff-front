import { Link } from "react-router-dom";
import { useAuth } from "../context/use-auth";

export const Navbar = () => {
  const { role } = useAuth();
  const canUsePanel = role === "JUDGE" || role === "ADMIN";

  return (
    <nav className=" flex justify-between items-center hidden md:block  ">
      <ul className="flex gap-4 items-center justify-center text-ink">
        <li className="text-ink text-heading font-bold hover:text-brand-light cursor-pointer hover:underline">
          <Link to="/eventos">Eventos</Link>
        </li>
        <li className="text-ink text-heading font-bold hover:text-brand-light cursor-pointer hover:underline">
          <Link to="/atletas">Atletas</Link>
        </li>
        <li className="text-ink text-heading font-bold hover:text-brand-light cursor-pointer hover:underline">
          <Link to="/rankings">Rankings</Link>
        </li>
        <li className="text-ink text-heading font-bold hover:text-brand-light cursor-pointer hover:underline">
          <Link to="/jueces">Jueces</Link>
        </li>
        <li className="text-ink text-heading font-bold hover:text-brand-light cursor-pointer hover:underline">
          <Link to="/federacion">Federación</Link>
        </li>
        {canUsePanel && (
          <li className="text-ink text-heading font-bold hover:text-brand-light cursor-pointer hover:underline">
            <Link to="/panel">Panel</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};
