import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({ language, setLanguage }: { language: string; setLanguage: (lang: string) => void }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 fixed w-full top-0 shadow-lg z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/login" className="text-3xl font-extrabold text-yellow-500 cursor-pointer hover:text-yellow-600 transition duration-300">
          GMCL
        </Link>

        {/* Bouton FR/EN toujours visible */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={() => setLanguage("fr")}
            className={`${language === "fr" ? "text-yellow-500 font-bold" : "text-white"} hover:text-yellow-400 transition duration-300`}
          >
            FR
          </button>
          <span>|</span>
          <button
            onClick={() => setLanguage("en")}
            className={`${language === "en" ? "text-yellow-500 font-bold" : "text-white"} hover:text-yellow-400 transition duration-300`}
          >
            EN
          </button>
        </div>

        {/* Bouton Burger */}
        <button
          className="text-yellow-500 md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
          </svg>
        </button>

        {/* Menu de Navigation */}
        <ul className={`md:flex md:space-x-8 md:items-center absolute md:static top-16 right-0 bg-gray-900 md:bg-transparent w-full md:w-auto ${isOpen ? "block" : "hidden"} space-y-4 md:space-y-0 p-4 md:p-0`}>
          <li>
            <Link
              to="/"
              className={`block md:inline hover:text-yellow-400 transition duration-300 ${location.pathname === "/" ? "text-yellow-500 border-b-2 border-yellow-500" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              {language === "fr" ? "Accueil" : "Home"}
            </Link>
          </li>
          <li>
            <Link
              to="/services-mecanique"
              className={`block md:inline hover:text-yellow-400 transition duration-300 ${location.pathname === "/services-mecanique" ? "text-yellow-500 border-b-2 border-yellow-500" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              {language === "fr" ? "Services Mécanique" : "Mechanical Services"}
            </Link>
          </li>
          <li>
            <Link
              to="/services-carrosserie"
              className={`block md:inline hover:text-yellow-400 transition duration-300 ${location.pathname === "/services-carrosserie" ? "text-yellow-500 border-b-2 border-yellow-500" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              {language === "fr" ? "Services Carrosserie" : "Bodywork Services"}
            </Link>
          </li>
          <li>
            <Link
              to="/contact-us"
              className={`block md:inline hover:text-yellow-400 transition duration-300 ${location.pathname === "/contact-us" ? "text-yellow-500 border-b-2 border-yellow-500" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              {language === "fr" ? "À Propos de Nous" : "About Us"}
            </Link>

          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
