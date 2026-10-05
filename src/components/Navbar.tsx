import { Link } from "react-router-dom";

export const Navbar = () => {
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
      </ul>
    </nav>
  );
};
