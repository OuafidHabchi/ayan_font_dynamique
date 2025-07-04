import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Mapping des routes vers titres lisibles
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/dashboard':
        return 'Tableau de bord';
      case '/ebooks':
        return 'Mes Ebooks';
      case '/LearnHubs':
        return 'LearnHub';
      case '/AIStudios':
        return 'AI Studio';
      case '/Invests':
        return 'Investissements';
      case '/MyEbooks':
        return 'Mes Ebooks';
      case '/MyFormations':
        return 'Mes Formations';
      case '/MyInvestissements':
        return 'Mes Investissements';
      case '/MyCreations':
        return 'Mes Créations';
      case '/profile':
        return 'Profil';
      default:
        return '';
    }
  };


  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top header with burger and page title */}
      <header className="bg-blue-950 text-white px-4 py-2 flex items-center gap-4 shadow-md">
        <button onClick={() => setSidebarOpen(true)} className="text-2xl">
          ☰
        </button>
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </header>

      {/* TopNavbar below header */}
      <TopNavbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar overlay */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
