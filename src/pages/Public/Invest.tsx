import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHandshake, FaKey, FaTag, FaBullhorn, FaInfoCircle, FaTimes, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Invest: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const [selectedOption, setSelectedOption] = useState<null | string>(null);
  const [showPromoInfo, setShowPromoInfo] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<null | string>(null);

  const options = [
    {
      key: 'affiliation',
      icon: <FaHandshake className="text-white" size={20} />,
      title: 'Affiliation',
      desc: 'Gagnez des commissions en partageant nos produits',
      fullDesc: "Rejoignez notre programme d’affiliation et commencez à générer des revenus simplement en partageant un lien. Vous touchez 20 % de commission sur chaque vente, sans création de produit ni gestion.",
      color: '#4ade80',
      darkColor: '#166534',
      benefits: [
        '20 % de commission par vente',
        'Aucun effort de création ou de gestion',
        'Suivi des ventes en temps réel'
      ]
    },
    {
      key: 'licence',
      icon: <FaKey className="text-white" size={20} />,
      title: 'Licence',
      desc: 'Possédez un produit et gagnez à vie',
      fullDesc: "Achetez une licence exclusive et percevez des revenus sur chaque vente comme un créateur. Vous touchez 70 % sur chaque vente, sauf si un sponsor est déjà associé au produit — dans ce cas, votre part sera de 50 %.",
      color: '#facc15',
      darkColor: '#854d0e',
      benefits: [
        '70 % sur chaque vente directe',
        '50 % si un sponsor est actif sur le produit',
        'Produit prêt à vendre, support inclus'
      ]
    }
    ,
    {
      key: 'codePromo',
      icon: <FaTag className="text-white" size={20} />,
      title: 'Code Promo',
      desc: 'Offrez une réduction et touchez une commission',
      fullDesc: "Obtenez un code promo personnalisé à partager avec votre audience. Vous gagnez 10 % de commission et vos contacts bénéficient de 10 % de réduction.",
      color: '#ec4899',
      darkColor: '#9d174d',
      benefits: [
        '10 % de réduction pour vos contacts',
        '10 % de commission pour vous',
        'Facile à partager, idéal pour les réseaux'
      ]
    },
    {
      key: 'sponsoring',
      icon: <FaBullhorn className="text-white" size={20} />,
      title: 'Sponsoring',
      desc: 'Associez votre nom à un produit rentable',
      fullDesc: "Financez le marketing d’un produit digital prêt à vendre et touchez 20 % de commission sur chaque vente générée grâce à votre campagne.",
      color: '#a855f7',
      darkColor: '#6b21a8',
      benefits: [
        '20 % de commission par vente',
        'Aucun contenu à produire',
        'Accès à des produits validés'
      ]
    },
  ];


  const handleClick = (key: string) => {
    if (isAuthenticated) {
      if (key === 'codePromo') {
        setShowPromoInfo(true);
      } else {
        navigate(`/${key}`);
      }
    } else {
      // ✅ Si non connecté → rediriger vers login puis profil si c'est codePromo
      if (key === 'codePromo') {
        localStorage.setItem('redirectAfterLogin', '/profile');
      } else {
        localStorage.setItem('redirectAfterLogin', `/${key}`);
      }
      navigate('/signin');
    }
  };

  return (
    <div className="min-h-screen  bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 py-24 px-4 sm:px-6 lg:px-8">
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
              Opportunités
            </span> d'investissement
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Maximisez votre potentiel avec nos programmes partenaires sur mesure
          </p>
        </motion.div>

        {/* Investment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

                  <h3 className="text-2xl font-bold text-white mb-2">{opt.title}</h3>
                  <p className="text-gray-300 mb-6">{opt.desc}</p>

                  <div className="mt-auto">
                    <button
                      onClick={() => handleClick(opt.key)}
                      className={`flex items-center justify-between w-full px-6 py-3 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border border-gray-600 group-hover:border-${opt.color} transition-all`}
                    >
                      <span className="font-medium text-white">Découvrir</span>
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
                    <h3 className="text-2xl font-bold text-white mb-2">{options.find(o => o.key === selectedOption)?.title}</h3>
                    <p className="text-gray-300">{options.find(o => o.key === selectedOption)?.desc}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOption(null)}
                    className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700/50 transition-colors"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-white mb-3">Avantages clés :</h4>
                  <ul className="space-y-2">
                    {options.find(o => o.key === selectedOption)?.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start">
                        <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0`} style={{ backgroundColor: options.find(o => o.key === selectedOption)?.color }} />
                        <span className="text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-gray-300 mb-8 leading-relaxed">
                  {options.find(o => o.key === selectedOption)?.fullDesc}
                </p>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedOption(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      handleClick(selectedOption);
                      setSelectedOption(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-lg transition-all"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promo Info Modal */}
      <AnimatePresence>
        {showPromoInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative bg-gray-800 rounded-2xl max-w-md w-full overflow-hidden border border-gray-700"
              style={{ boxShadow: '0 20px 60px rgba(236, 72, 153, 0.2)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-pink-700" />

              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <FaTag className="text-pink-400" size={24} />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">Programme de parrainage</h3>
                <p className="text-gray-300 mb-8">
                  Partagez votre code personnel pour offrir <span className="text-white font-semibold">10% de réduction</span> à vos contacts et recevez <span className="text-white font-semibold">10% de commission</span> sur chaque achat réalisé avec votre code.
                </p>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => setShowPromoInfo(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Plus tard
                  </button>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowPromoInfo(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all"
                  >
                    Accéder à mon code
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

export default Invest;