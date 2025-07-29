import React, { useRef, useEffect, useState } from 'react';
import FormationModal from './FormationModal';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AppURL from './AppUrl';

interface Props {
  language: 'fr' | 'en' | 'ar';
  type: 'scolaire' | 'Professionnel';
}

interface Formation {
  _id: string;
  type: 'scolaire' | 'autre';
  titreFormation: string;
  coverImage?: string;
  matiere?: string;
  niveau?: string;
  sousNiveau?: string;
  categorie?: string;
  pays?: string;
  prix?: number;
  promotion?: boolean;
  newPrix?: number;

  duree?: string;
  auteur: {
    _id: string;
    nom: string;
    prenom: string;
  };
  createdAt: string;
}

const NouvellesFormationsSection: React.FC<Props> = ({ language, type }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInteracting = useRef(false);

  // Récupérer les formations depuis l'API
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${AppURL}/api/StudioFormationRoutes/last/${type}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des formations');
        }
        const data = await response.json();

        // ✅ Fusionner nouveautés et promotions dans une seule liste
        const merged = [...data.nouveautes, ...data.promotions];
        setFormations(merged);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, [type]);


  // Tripler pour effet infini
  const displayFormations = [...formations, ...formations, ...formations];

  const smoothScroll = () => {
    if (isUserInteracting.current || formations.length === 0) return;

    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 0.5;

      const scrollWidth = scrollRef.current.scrollWidth / 3;
      const currentScroll = scrollRef.current.scrollLeft;

      if (currentScroll >= scrollWidth * 2) {
        scrollRef.current.scrollLeft = scrollWidth + (currentScroll - scrollWidth * 2);
      }
    }
    animationRef.current = requestAnimationFrame(smoothScroll);
  };

  const startAutoScroll = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(smoothScroll);
  };

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      isUserInteracting.current = false;
      startAutoScroll();
    }, 3000);
  };

  useEffect(() => {
    if (formations.length > 0 && scrollRef.current) {
      const scrollWidth = scrollRef.current.scrollWidth / 3;
      scrollRef.current.scrollLeft = scrollWidth;
    }
    startAutoScroll();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [formations]);

  const handleUserInteraction = () => {
    isUserInteracting.current = true;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    resetInactivityTimer();
  };

  const scrollLeft = () => {
    handleUserInteraction();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    handleUserInteraction();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  const handleFormationClick = (formation: Formation) => {
    handleUserInteraction();
    setSelectedFormation(formation);
  };



  if (loading) {
    return (
      <div className="mb-8 relative">
        <h2 className="text-2xl md:text-2xl font-bold text-orange-400 mb-4">
          {language === 'fr' ? 'Nouveautés & Promotions' : language === 'en' ? 'New & Promotions' : 'الجديد والعروض'}
        </h2>
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 relative">
        <h2 className="text-2xl md:text-2xl font-bold text-orange-400 mb-4">
          {language === 'fr' ? 'Nouveautés & Promotions' : language === 'en' ? 'New & Promotions' : 'الجديد والعروض'}
        </h2>
        <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (formations.length === 0) {
    return (
      <div className="mb-8 relative">
        <h2 className="text-2xl md:text-2xl font-bold text-orange-400 mb-4">
          {language === 'fr' ? 'Nouveautés & Promotions' : language === 'en' ? 'New & Promotions' : 'الجديد والعروض'}
        </h2>
        <div className="text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
          {language === 'fr' ? 'Aucune formation disponible' : language === 'en' ? 'No courses available' : 'لا توجد دورات متاحة'}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 relative">
      <h2 className="text-2xl md:text-2xl font-bold text-orange-400 mb-4">
        {language === 'fr' ? 'Nouveautés & Promotions' : language === 'en' ? 'New & Promotions' : 'الجديد والعروض'}
      </h2>

      {/* Flèches */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-blue-950 bg-opacity-70 p-2 rounded-full text-white z-10 hover:bg-orange-400"
      >
        <FaChevronLeft />
      </button>

      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-950 bg-opacity-70 p-2 rounded-full text-white z-10 hover:bg-orange-400"
      >
        <FaChevronRight />
      </button>

      <div
        className="overflow-x-auto no-scrollbar"
        ref={scrollRef}
        onMouseEnter={handleUserInteraction}
        onMouseMove={handleUserInteraction}
        onTouchStart={handleUserInteraction}
        onTouchMove={handleUserInteraction}
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="flex gap-4 w-max px-8 pb-2">
          {displayFormations.map((formation, index) => (
            <div
              key={`${formation._id}-${index}`}
              onClick={() => handleFormationClick(formation)}
              className="bg-blue-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-transform transform hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col w-36 flex-shrink-0"
            >
              <div className="relative" style={{ height: '150px' }}>
                {formation.coverImage ? (
                  <img
                    src={`${AppURL}${formation.coverImage}`}
                    alt={formation.titreFormation}
                    className="absolute h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute h-full w-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-blue-800 text-xs font-medium">
                      {language === 'fr' ? 'Aucune image' : language === 'en' ? 'No image' : 'لا صورة'}
                    </span>
                  </div>
                )}

                {/* BADGE réel selon les données */}
                {formation.promotion ? (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                    {language === 'fr' ? 'PROMO' : language === 'en' ? 'SALE' : 'خصم'}
                  </span>
                ) : (
                  <span className="absolute top-2 left-2 bg-orange-400 text-white text-xs px-2 py-0.5 rounded">
                    {language === 'fr' ? 'NOUVEAU' : language === 'en' ? 'NEW' : 'جديد'}
                  </span>
                )}


              </div>

              <div className="p-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-xs text-blue-950 mb-1 line-clamp-2">
                    {formation.type === 'scolaire' && formation.sousNiveau && formation.niveau
                      ? `${formation.niveau} - ${formation.sousNiveau}`
                      : formation.titreFormation}
                  </h3>

                  {formation.type === 'scolaire' && formation.matiere && (
                    <p className="text-[10px] text-gray-600 mb-1">
                      {language === 'fr' ? 'Matière' : language === 'en' ? 'Subject' : 'المادة'}: {formation.matiere}
                    </p>
                  )}

                  <p className="text-[10px] text-gray-600 mb-1">
                    {language === 'fr' ? 'Par' : language === 'en' ? 'By' : 'بواسطة'} {formation.auteur.prenom} {formation.auteur.nom}
                  </p>
                  <p className="text-[10px] text-gray-600 mb-1">
                    {type === 'scolaire'
                      ? `${language === 'fr' ? 'Matière' : language === 'en' ? 'Subject' : 'المادة'}: ${formation.matiere || '-'}`
                      : `${language === 'fr' ? 'Catégorie' : language === 'en' ? 'Category' : 'الفئة'}: ${formation.categorie || '-'}`}
                  </p>


                </div>

                <div className="flex justify-between items-center">
                  {formation.promotion && formation.newPrix !== undefined ? (
                    <div className="text-xs">
                      <p className="line-through text-red-500">{formation.prix?.toFixed(2)} $</p>
                      <p className="text-green-800 font-bold">{formation.newPrix.toFixed(2)} $</p>
                    </div>
                  ) : (
                    <p className="font-bold text-green-800 text-xs">
                      {formation.prix ? `${formation.prix.toFixed(2)} $` : '-'}
                    </p>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFormationClick(formation);
                    }}
                    className="text-[10px] bg-blue-950 text-white px-2 py-1 rounded-md hover:bg-orange-400 transition-colors duration-300"
                  >
                    {language === 'fr' ? 'Aperçu' : language === 'en' ? 'Overview' : 'نظرة'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedFormation && (
        <FormationModal
          formationId={selectedFormation._id}
          language={language}
          onClose={() => setSelectedFormation(null)}
        />
      )}
    </div>
  );
};

export default NouvellesFormationsSection;