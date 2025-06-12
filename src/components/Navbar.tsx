import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?");
    
    if (confirmLogout) {
      localStorage.removeItem("username");
      localStorage.removeItem("password");
      onLogout();
      navigate("/login");
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-gray-800 text-white p-4 fixed w-full top-0 shadow-lg z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold tracking-widest text-cyan-400">
          Opex Logistix Manager
        </div>

        {/* Bouton Hamburger pour mobile */}
        <button 
          className="md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Menu de Navigation */}
        <ul className={`md:flex md:space-x-8 md:items-center absolute md:static left-0 md:left-auto top-16 right-0 bg-gray-800 md:bg-transparent w-full md:w-auto ${isOpen ? "block" : "hidden"} space-y-4 md:space-y-0 p-4 md:p-0`}>
          <li>
            <Link 
              to="/home" 
              className={`block md:inline hover:text-cyan-300 transition duration-300 ${location.pathname === "/" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-300"}`} 
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </li>

          <li>
            <Link 
              to="/DSPMessages" 
              className={`block md:inline hover:text-cyan-300 transition duration-300 ${location.pathname === "/DSPMessages" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-300"}`} 
              onClick={() => setIsOpen(false)}
            >
              DSP Messages
            </Link>
          </li>

          {/* Bouton Logout */}
          <li>
            <button 
              onClick={handleLogout} 
              className="block md:inline text-gray-300 hover:text-cyan-300 transition duration-300"
            >
              Log Out
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;