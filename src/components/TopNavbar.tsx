import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBookOpen, FaRobot, FaGraduationCap, FaDollarSign } from 'react-icons/fa';

const TopNavbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className=" text-white px-4 py-3 shadow-md overflow-x-auto">
      <div className="flex gap-4 text-sm font-medium w-full">
        <button
          onClick={() => navigate('/ebooks')}
          className="flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2 rounded bg-blue-950 hover:bg-orange-400 transition"
        >
          <FaBookOpen /> Ebooks
        </button>

        <button
          onClick={() => navigate('/LearnHubs')}
          className="flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2 rounded bg-blue-950 hover:bg-orange-400 transition"
        >
          <FaGraduationCap /> LearnHub
        </button>

        <button
          onClick={() => navigate('/AIStudios')}
          className="flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2 rounded bg-blue-950 hover:bg-orange-400 transition"
        >
          <FaRobot /> AI Studio
        </button>

        <button
          onClick={() => navigate('/Invests')}
          className="flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2 rounded bg-blue-950 hover:bg-orange-400 transition"
        >
          <FaDollarSign /> Invest
        </button>

        
      </div>
    </nav>
  );
};

export default TopNavbar;
