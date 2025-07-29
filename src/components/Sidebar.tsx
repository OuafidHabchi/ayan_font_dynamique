import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaGraduationCap, FaDollarSign, FaMagic, FaUserCircle, FaSignOutAlt, FaChevronLeft, FaBookOpen, FaTachometerAlt, FaClipboardCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
type Language = 'fr' | 'en' | 'ar';

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const language: Language = ['fr', 'en', 'ar'].includes(user?.langue as string) ? (user?.langue as Language) : 'fr';

  const labels = {
    dashboard: { fr: 'Tableau de bord', en: 'Dashboard', ar: 'لوحة التحكم' },
    myEbooks: { fr: 'Mes Ebooks', en: 'My Ebooks', ar: 'كتبي الإلكترونية' },
    myFormations: { fr: 'Mes Formations', en: 'My Courses', ar: 'دوراتي' },
    myInvest: { fr: 'Mes Investissements', en: 'My Investments', ar: 'استثماراتي' },
    myCreations: { fr: 'Mes Produits', en: 'My Creations', ar: 'منتجاتي' },
    templates: { fr: 'Templates Ebooks', en: 'Ebook Templates', ar: 'قوالب الكتب' },
    moderation: { fr: 'Modération', en: 'Moderation', ar: 'الإشراف' },
    profile: { fr: 'Profil', en: 'Profile', ar: 'الملف الشخصي' },
    users: { fr: 'Utilisateurs', en: 'Users', ar: 'المستخدمون' },
    programme: { fr: 'Programme Études', en: 'Study Program', ar: 'البرنامج الدراسي' },
    managementSponsoring: { fr: 'Management Sponsoring', en: 'Management Sponsoring', ar: 'البرنامج الدراسي' },
    signout: { fr: 'Se déconnecter', en: 'Sign Out', ar: 'تسجيل الخروج' },
  };

  const menu = [
    { path: '/dashboard', icon: <FaTachometerAlt />, label: labels.dashboard[language] },
    { path: '/MyEbooks', icon: <FaBookOpen />, label: labels.myEbooks[language] },
    { path: '/MyFormations', icon: <FaGraduationCap />, label: labels.myFormations[language] },
    { path: '/MyInvestissements', icon: <FaDollarSign />, label: labels.myInvest[language] },
    { path: '/MyCreations', icon: <FaMagic />, label: labels.myCreations[language] },
    ...(user?.role === 'owner' ? [
      { path: '/EbooksTemplate', icon: <FaBookOpen />, label: labels.templates[language] },
      { path: '/ApprovalPanel', icon: <FaClipboardCheck />, label: labels.moderation[language] },
      { path: '/allUsers', icon: <FaUserCircle />, label: labels.users[language] },
      { path: '/programmeEtudes', icon: <FaUserCircle />, label: labels.programme[language] },
      { path: '/managementSponsoring', icon: <FaUserCircle />, label: labels.managementSponsoring[language] },
    ] : []),
    { path: '/profile', icon: <FaUserCircle />, label: labels.profile[language] },
    { path: '/signout', icon: <FaSignOutAlt />, label: labels.signout[language], danger: true },
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
      <nav className="flex flex-col gap-2 p-4 font-medium overflow-y-auto max-h-[calc(100vh-64px)]">
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
              const logoutLabel = labels.signout[language];
              if (label === logoutLabel) {
                const confirmMessage =
                  language === 'fr'
                    ? 'Êtes-vous sûr de vouloir vous déconnecter ?'
                    : language === 'en'
                      ? 'Are you sure you want to sign out?'
                      : 'هل أنت متأكد أنك تريد تسجيل الخروج؟';

                const confirmLogout = window.confirm(confirmMessage);

                if (confirmLogout) {
                  localStorage.clear();
                  window.location.href = '/';
                } else {
                  window.location.href = '/dashboard';
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
