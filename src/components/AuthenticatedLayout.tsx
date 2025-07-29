import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { useAuth } from '../context/AuthContext';

type Language = 'fr' | 'en' | 'ar';

const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const language: Language = ['fr', 'en', 'ar'].includes(user?.langue as string) ? (user?.langue as Language) : 'fr';

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/dashboard':
        return language === 'fr' ? 'Tableau de bord' : language === 'en' ? 'Dashboard' : 'لوحة التحكم';
      case '/ebooks':
        return language === 'fr' ? 'Mes Ebooks' : language === 'en' ? 'My Ebooks' : 'كتبي الإلكترونية';
      case '/LearnHubs':
        return language === 'fr' ? 'LearnHub': language === 'en' ? 'LearnHub' : 'منصة التعليم';
      case '/AIStudios':
        return language === 'fr' ? 'IA Studio' : language === 'en' ? 'AI Studio' : 'استوديو الذكاء';
      case '/Invests':
        return language === 'fr' ? 'Investissements' : language === 'en' ? 'Investments' : 'الاستثمارات';
      case '/MyEbooks':
        return language === 'fr' ? 'Mes Ebooks' : language === 'en' ? 'My Ebooks' : 'كتبي الإلكترونية';
      case '/MyFormations':
        return language === 'fr' ? 'Mes Formations' : language === 'en' ? 'My Courses' : 'دوراتي';
      case '/MyInvestissements':
        return language === 'fr' ? 'Mes Investissements' : language === 'en' ? 'My Investments' : 'استثماراتي';
      case '/MyCreations':
        return language === 'fr' ? 'Mes Créations' : language === 'en' ? 'My Creations' : 'إبداعاتي';
      case '/profile':
        return language === 'fr' ? 'Profil' : language === 'en' ? 'Profile' : 'الملف الشخصي';
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
        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-transparent"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto -mt-20">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
