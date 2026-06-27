import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className=" flex justify-between items-center hidden md:block  ">
      <ul className="flex gap-4 items-center justify-center text-gray-100">
        <li className="text-gray-100 text-2xl font-bold hover:text-red-500 cursor-pointer hover:underline">
          <Link to="/eventos">Eventos</Link>
        </li>
        <li className="text-gray-100 text-2xl font-bold hover:text-red-500 cursor-pointer hover:underline">
          <Link to="/atletas">Atletas</Link>
        </li>
        <li className="text-gray-100 text-2xl font-bold hover:text-red-500 cursor-pointer hover:underline">
          <Link to="/rankings">Rankings</Link>
        </li>
        <li className="text-gray-100 text-2xl font-bold hover:text-red-500 cursor-pointer hover:underline">
          <Link to="/jueces">Jueces</Link>
        </li>
        <li className="text-gray-100 text-2xl font-bold hover:text-red-500 cursor-pointer hover:underline">
          <Link to="/federacion">Federación</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
