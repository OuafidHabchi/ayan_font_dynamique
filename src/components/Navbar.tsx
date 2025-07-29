import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { FaHome, FaInfoCircle, FaSignInAlt, FaGlobe, FaBookOpen, FaRobot, FaGraduationCap, FaBriefcase } from 'react-icons/fa';

type Language = 'fr' | 'en' | 'ar';

interface NavbarProps {
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
}

const Navbar: React.FC<NavbarProps> = ({ language, setLanguage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHomePage = location.pathname === '/';

  const handleNavigate = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
    setMenuOpen(false);
  };

  const texts = {
    home: { fr: 'Accueil', en: 'Home', ar: 'الرئيسية' },
    about: { fr: 'À propos', en: 'About Us', ar: 'معلومات عنا' },
    login: { fr: 'Connexion', en: 'Login', ar: 'تسجيل الدخول' },
    signup: { fr: 'Créer un compte', en: 'Sign Up', ar: 'إنشاء حساب' },
  };

  // ✅ BASE MENU ITEMS
  const baseItems = [
    { path: '/', icon: <FaHome />, label: texts.home[language] },
    { path: '/aboutus', icon: <FaInfoCircle />, label: texts.about[language] },
    { path: '/signin', icon: <FaSignInAlt />, label: texts.login[language] },
  ];

  // ✅ EXTRA MENU ITEMS (only on non-home pages)
  const extraItems = [
    {
      path: '/ebook',
      icon: <FaBookOpen />,
      label: language === 'fr' ? 'Bibliothèque' : language === 'en' ? 'Library' : 'المكتبة',
    },
    {
      path: '/LearnHub',
      icon: <FaGraduationCap />,
      label: language === 'fr' ? 'Apprentissage' : language === 'en' ? 'Learning' : 'التعلُّم',
    },
    {
      path: '/AIStudio',
      icon: <FaRobot />,
      label: language === 'fr' ? 'Studio IA' : language === 'en' ? 'AI Studio' : 'استوديو الذكاء',
    },
    {
      path: '/Invest',
      icon: <FaBriefcase />,
      label: language === 'fr' ? 'Opportunités' : language === 'en' ? 'Opportunities' : 'فرص استثمارية',
    },

  ];


  // ✅ FINAL MENU: BASE + EXTRA if not home page
  const fullMenu = [
    ...baseItems.slice(0, 1), // Accueil
    ...extraItems,            // Ressources, Formations, AI, Invest
    ...baseItems.slice(1),    // À propos, Connexion
  ];


  return (
    <header className={`${isHomePage ? 'bg-transparent' : 'bg-blue-950'} text-white fixed top-0 w-full z-50 shadow-md`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

        {/* Left: Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('/')}>
          <img src="/ayan3.png" alt="Logo" className="h-12 w-20 rounded-full shadow-md border-2 border-orange-400" />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-orange-400">
          {fullMenu.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`text-sm font-bold flex items-center gap-1 border-b-2 ${location.pathname === item.path
                ? 'border-orange-400'
                : 'border-transparent hover:border-white'
                }`}
            >
              {item.icon} {item.label}
            </button>
          ))}

          {/* Language Selector */}
          <div className="relative">
            <FaGlobe className="absolute left-2 top-2.5 text-blue-950" />
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-orange-400 text-blue-950 text-sm pl-8 pr-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="fr">FR</option>
              <option value="en">EN</option>
              <option value="ar">AR</option>
            </select>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none text-orange-400">
            {menuOpen ? <HiX size={28} /> : <HiMenuAlt3 size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-950 px-6 py-4 space-y-4 animate-slideDown text-white">
          {fullMenu.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full text-left flex items-center gap-2 text-sm font-medium ${location.pathname === item.path
                ? 'bg-blue-900 rounded px-3 py-2'
                : 'hover:underline'
                }`}
            >
              {item.icon} {item.label}
            </button>
          ))}

          <div className="relative">
            <FaGlobe className="absolute left-3 top-3 text-blue-950" />
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-white text-blue-950 text-sm pl-10 pr-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="fr">FR</option>
              <option value="en">EN</option>
              <option value="ar">AR</option>
            </select>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
