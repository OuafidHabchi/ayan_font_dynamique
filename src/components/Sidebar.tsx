import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaGraduationCap, FaDollarSign, FaMagic, FaUserCircle, FaSignOutAlt, FaChevronLeft, FaBookOpen, FaTachometerAlt } from 'react-icons/fa';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const menu = [
    { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/MyEbooks', icon: <FaBookOpen />, label: 'Mes Ebooks' },
    { path: '/MyFormations', icon: <FaGraduationCap />, label: 'Mes Formations' },
    { path: '/MyInvestissements', icon: <FaDollarSign />, label: 'Mes Investissements' },
    { path: '/MyCreations', icon: <FaMagic />, label: 'Mes Produits' },
    { path: '/profile', icon: <FaUserCircle />, label: 'Profile' },
    { path: '/signout', icon: <FaSignOutAlt />, label: 'Sign Out', danger: true },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-blue-950 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 shadow-lg`}
    >
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-orange-400">
        <h2 className="text-xl font-semibold text-white">Menu</h2>
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-white text-xl hover:text-orange-400 transition"
        >
          <FaChevronLeft />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 p-4 font-medium">
        {menu.map(({ path, icon, label, danger }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg transition ${isActive
                ? 'bg-orange-400'
                : danger
                  ? 'hover:bg-red-600'
                  : 'hover:bg-orange-400'
              } ${danger ? 'text-red-300' : 'text-white'}`
            }
            onClick={() => {
              if (label === 'Sign Out') {
                const confirmLogout = window.confirm('Are you sure you want to sign out?');
                if (confirmLogout) {
                  localStorage.clear(); // supprimer toutes les données sauvegardées
                  window.location.href = '/'; // rediriger vers la home page
                } else {
                  window.location.href = '/dashboard'; // rediriger vers dashboard si annulation
                }
              }
              setSidebarOpen(false);
            }}


          >
            <span className="text-lg">{icon}</span>
            <span className="text-base">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
