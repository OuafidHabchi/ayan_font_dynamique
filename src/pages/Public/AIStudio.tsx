import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBookOpen, FaChalkboardTeacher, FaArrowRight, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

type Language = 'fr' | 'en' | 'ar';

interface AIStudioProps {
  language: Language;
}

const AIStudio: React.FC<AIStudioProps> = ({ language }) => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const [selectedOption, setSelectedOption] = useState<null | string>(null);
  const [hoveredCard, setHoveredCard] = useState<null | string>(null);

  const options = [
    {
      key: 'ebook',
      icon: <FaBookOpen className="text-white" size={20} />,
      title: {
        fr: 'Créer un Ebook',
        en: 'Create an Ebook',
        ar: 'إنشاء كتاب إلكتروني'
      },
      desc: {
        fr: 'Générez votre ebook AI en quelques minutes',
        en: 'Generate your AI ebook in minutes',
        ar: 'أنشئ كتابك الإلكتروني باستخدام الذكاء الاصطناعي في دقائق'
      },
      fullDesc: {
        fr: "Créez des ebooks professionnels en quelques clics grâce à notre IA. Choisissez votre sujet, personnalisez le contenu et obtenez un produit prêt à être vendu en quelques minutes seulement.",
        en: "Create professional ebooks in just a few clicks with our AI. Choose your topic, customize the content and get a product ready to sell in just minutes.",
        ar: "أنشئ كتبًا إلكترونية احترافية بنقرة واحدة باستخدام الذكاء الاصطناعي. اختر موضوعك، خصص المحتوى واحصل على منتج جاهز للبيع في دقائق."
      },
      benefits: {
        fr: [
          'Génération automatique de contenu',
          'Personnalisation complète',
          'Mise en page professionnelle'
        ],
        en: [
          'Automatic content generation',
          'Full customization',
          'Professional layout'
        ],
        ar: [
          'إنشاء المحتوى تلقائيًا',
          'تخصيص كامل',
          'تنسيق احترافي'
        ]
      },
      color: '#4ade80',
      darkColor: '#166534'
    },
    {
      key: 'formation',
      icon: <FaChalkboardTeacher className="text-white" size={20} />,
      title: {
        fr: 'Créer une Formation',
        en: 'Create a Course',
        ar: 'إنشاء دورة'
      },
      desc: {
        fr: 'Concevez votre formation AI complète',
        en: 'Design your complete AI course',
        ar: 'صمم دورتك الكاملة باستخدام الذكاء الاصطناعي'
      },
      fullDesc: {
        fr: "Développez des formations en ligne complètes avec l'aide de notre IA. Structurez vos modules, générez du contenu pédagogique et obtenez une formation prête à être diffusée.",
        en: "Develop complete online courses with the help of our AI. Structure your modules, generate educational content and get a course ready to be delivered.",
        ar: "طور دورات تدريبية كاملة بمساعدة الذكاء الاصطناعي. نظم وحداتك، أنشئ محتوى تعليميًا واحصل على دورة جاهزة للنشر."
      },
      benefits: {
        fr: [
          'Structure automatique des modules',
          'Génération de supports pédagogiques',
          'Export pour plateformes e-learning'
        ],
        en: [
          'Automatic module structure',
          'Educational materials generation',
          'Export for e-learning platforms'
        ],
        ar: [
          'هيكلة تلقائية للوحدات',
          'إنشاء مواد تعليمية',
          'تصدير لمنصات التعلم الإلكتروني'
        ]
      },
      color: '#a855f7',
      darkColor: '#6b21a8'
    }
  ];

  const texts = {
    title: {
      fr: 'Bienvenue sur AI Studio',
      en: 'Welcome to AI Studio',
      ar: 'مرحبًا بك في استوديو الذكاء الاصطناعي'
    },
    description: {
      fr: 'Créez vos ebooks et formations AI en quelques clics pour partager votre expertise avec le monde.',
      en: 'Create your AI ebooks and courses in just a few clicks to share your expertise with the world.',
      ar: 'أنشئ كتبك الإلكترونية ودوراتك التدريبية بالذكاء الاصطناعي بسهولة لمشاركة خبراتك مع العالم.'
    },
    start: {
      fr: 'Commencer',
      en: 'Get Started',
      ar: 'ابدأ الآن'
    }
  };

  const handleClick = (key: string) => {
    if (isAuthenticated) {
      navigate(`/Studio${key.charAt(0).toUpperCase() + key.slice(1)}`);
    } else {
      localStorage.setItem('redirectAfterLogin', `/Studio${key.charAt(0).toUpperCase() + key.slice(1)}`);
      navigate('/signin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">
              {texts.title[language]}
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {texts.description[language]}
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {options.map((opt) => (
            <motion.div
              key={opt.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -10 }}
              onMouseEnter={() => setHoveredCard(opt.key)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative group"
            >
              {/* Card Background */}
              <div
                className={`absolute inset-0 rounded-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-300`}
                style={{
                  background: `radial-gradient(circle at 75% 30%, ${opt.color}20, transparent 60%)`,
                  boxShadow: `0 8px 32px ${opt.color}30`
                }}
              />

              {/* Card Content */}
              <div className="relative bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 h-full overflow-hidden transition-all duration-300 group-hover:border-gray-600">
                {/* Floating Icon */}
                <div
                  className="absolute -top-6 -right-6 w-24 h-24 opacity-10"
                  style={{ color: opt.color }}
                >
                  {React.cloneElement(opt.icon, { size: 96 })}
                </div>

                {/* Main Content */}
                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 rounded-lg mb-6 flex items-center justify-center`}
                    style={{ backgroundColor: opt.color }}
                  >
                    {opt.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{opt.title[language]}</h3>
                  <p className="text-gray-300 mb-6">{opt.desc[language]}</p>

                  <div className="mt-auto">
                    <button
                      onClick={() => handleClick(opt.key)}
                      className={`flex items-center justify-between w-full px-6 py-3 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border border-gray-600 group-hover:border-${opt.color} transition-all`}
                    >
                      <span className="font-medium text-white">{texts.start[language]}</span>
                      <FaArrowRight className="text-gray-400 group-hover:text-white transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Info Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOption(opt.key);
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <FaInfoCircle size={18} />
                </button>
              </div>

              {/* Hover Effect */}
              {hoveredCard === opt.key && (
                <motion.div
                  className={`absolute inset-0 rounded-2xl pointer-events-none`}
                  style={{
                    background: `radial-gradient(circle at 70% 20%, ${opt.color}15, transparent 70%)`,
                    boxShadow: `0 0 120px ${opt.color}20`
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className={`relative bg-gray-800 rounded-2xl max-w-md w-full overflow-hidden border border-gray-700`}
              style={{ boxShadow: `0 20px 60px ${options.find(o => o.key === selectedOption)?.color}30` }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: `linear-gradient(to right, ${options.find(o => o.key === selectedOption)?.color}, ${options.find(o => o.key === selectedOption)?.darkColor})` }}
              />

              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center`} style={{ backgroundColor: options.find(o => o.key === selectedOption)?.color }}>
                      {options.find(o => o.key === selectedOption)?.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{options.find(o => o.key === selectedOption)?.title[language]}</h3>
                    <p className="text-gray-300">{options.find(o => o.key === selectedOption)?.desc[language]}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOption(null)}
                    className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700/50 transition-colors"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    {language === 'fr' ? 'Fonctionnalités clés :' : language === 'en' ? 'Key Features:' : 'الميزات الرئيسية:'}
                  </h4>
                  <ul className="space-y-2">
                    {options.find(o => o.key === selectedOption)?.benefits[language].map((benefit: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0`} style={{ backgroundColor: options.find(o => o.key === selectedOption)?.color }} />
                        <span className="text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-gray-300 mb-8 leading-relaxed">
                  {options.find(o => o.key === selectedOption)?.fullDesc[language]}
                </p>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedOption(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    {language === 'fr' ? 'Fermer' : language === 'en' ? 'Close' : 'إغلاق'}
                  </button>
                  <button
                    onClick={() => {
                      handleClick(selectedOption);
                      setSelectedOption(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-lg transition-all"
                  >
                    {texts.start[language]}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIStudio;