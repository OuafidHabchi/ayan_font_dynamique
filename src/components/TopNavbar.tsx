import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBookOpen, FaRobot, FaGraduationCap, FaDollarSign } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

type Language = 'fr' | 'en' | 'ar';
const TopNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const language: Language = ['fr', 'en', 'ar'].includes(user?.langue as string) ? (user?.langue as Language) : 'fr';

  const labels = {
    ebooks: { fr: 'Ebooks', en: 'Ebooks', ar: 'الكتب' },
    learnhub: { fr: 'LearnHub', en: 'LearnHub', ar: 'منصة التعليم' },
    ai: { fr: 'IA Studio', en: 'AI Studio', ar: 'استوديو الذكاء' },
    invest: { fr: 'Investir', en: 'Invest', ar: 'استثمار' },
  };


  return (
    <nav className="text-white px-4 py-3 shadow-md overflow-x-auto bg-blue-950">
      <div className="flex gap-4 text-sm font-medium w-full">
        <button
          onClick={() => navigate('/ebooks')}
          className="flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2 rounded border border-white bg-blue-950 hover:bg-orange-400 transition"
        >
          <FaBookOpen /> {labels.ebooks[language]}
        </button>

        <button
          onClick={() => navigate('/LearnHubs')}
          className="flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2 rounded border border-white bg-blue-950 hover:bg-orange-400 transition"
        >
          <FaGraduationCap /> {labels.learnhub[language]}
        </button>

        <button
          onClick={() => navigate('/AIStudios')}
          className="flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2 rounded border border-white bg-blue-950 hover:bg-orange-400 transition"
        >
          <FaRobot /> {labels.ai[language]}
        </button>

        <button
          onClick={() => navigate('/Invests')}
          className="flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2 rounded border border-white bg-blue-950 hover:bg-orange-400 transition"
        >
          <FaDollarSign /> {labels.invest[language]}
        </button>
      </div>
    </nav>
  );
};

export default TopNavbar;
