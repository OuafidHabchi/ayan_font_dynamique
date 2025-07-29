import React, { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import { FaArrowRight, FaBriefcase, FaGraduationCap, FaVideo, FaInfoCircle } from 'react-icons/fa';
import NouvellesFormationsSection from '../../components/NouvellesFormationsSection';
import axios from 'axios';
import AppURL from '../../components/AppUrl';
import FormationModal from '../../components/FormationModal';
import { motion } from 'framer-motion';

type FormationType = 'Scolaire' | 'Professionnel' | 'Live';
type Language = 'fr' | 'en' | 'ar';

interface LearnHubProps {
  language: Language;
}

interface Chapitre {
  titre: string;
  content?: string;
  video?: string;
  videoPreview?: string;
  isOpen?: boolean;
}

interface Auteur {
  _id: string;
  nom: string;
  prenom: string;
}

interface Formation {
  _id: string;
  type: "scolaire" | "autre";
  titreFormation: string;
  coverImage?: string;
  matiere?: string;
  niveau?: string;
  sousNiveau?: string;
  categorie?: string;
  pays?: string;
  prix?: number;
  promotion: Boolean;
  newPrix: number;
  auteur: Auteur;
  chapitres: Chapitre[];
  createdAt: string;
}

const LearnHub: React.FC<LearnHubProps> = ({ language }) => {
  const [selectedType, setSelectedType] = useState<FormationType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [selectedPays, setSelectedPays] = useState<string | null>(null);
  const [selectedSousNiveau, setSelectedSousNiveau] = useState<string | null>(null);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<null | string>(null);

  const options = [
    {
      key: 'Professionnel',
      icon: <FaBriefcase className="text-white" size={20} />,
      title: {
        fr: 'Professionnelles',
        en: 'Professional',
        ar: 'مهنية'
      },
      desc: {
        fr: 'Boostez votre carrière avec nos formations experts',
        en: 'Boost your career with expert courses',
        ar: 'طور حياتك المهنية مع دورات الخبراء'
      },
      fullDesc: {
        fr: "Accédez à des formations professionnelles de haute qualité pour développer vos compétences et faire progresser votre carrière. Nos experts ont conçu des programmes adaptés aux besoins du marché actuel.",
        en: "Access high-quality professional training to develop your skills and advance your career. Our experts have designed programs tailored to current market needs.",
        ar: "احصل على تدريب احترافي عالي الجودة لتطوير مهاراتك وتطوير مسيرتك المهنية. خبراؤنا صمموا برامج تلبي احتياجات السوق الحالية."
      },
      benefits: {
        fr: [
          'Formations adaptées aux besoins du marché',
          'Experts du secteur comme formateurs',
          'Certifications reconnues'
        ],
        en: [
          'Training tailored to market needs',
          'Industry experts as trainers',
          'Recognized certifications'
        ],
        ar: [
          'تدريب مصمم وفقًا لاحتياجات السوق',
          'خبراء الصناعة كمدرسين',
          'شهادات معترف بها'
        ]
      },
      color: '#f59e0b',
      darkColor: '#92400e'
    },
    {
      key: 'Scolaire',
      icon: <FaGraduationCap className="text-white" size={20} />,
      title: {
        fr: 'Scolaires',
        en: 'Academic',
        ar: 'مدرسية'
      },
      desc: {
        fr: 'Maîtrisez vos matières scolaires et universitaires',
        en: 'Master your school and university subjects',
        ar: 'أتقن موادك الدراسية والجامعية'
      },
      fullDesc: {
        fr: "Des ressources pédagogiques complètes pour tous les niveaux scolaires, du primaire à l'université. Nos formations sont conçues par des enseignants expérimentés pour vous aider à exceller dans vos études.",
        en: "Comprehensive educational resources for all academic levels, from primary to university. Our courses are designed by experienced teachers to help you excel in your studies.",
        ar: "موارد تعليمية شاملة لجميع المستويات الأكاديمية من الابتدائي إلى الجامعي. تم تصميم دوراتنا من قبل معلمين ذوي خبرة لمساعدتك على التفوق في دراستك."
      },
      benefits: {
        fr: [
          'Cours adaptés à chaque niveau',
          'Exercices et corrigés inclus',
          'Pédagogie éprouvée'
        ],
        en: [
          'Courses adapted to each level',
          'Exercises and solutions included',
          'Proven pedagogy'
        ],
        ar: [
          'دورات مكيفة لكل مستوى',
          'تمارين وحلول مدمجة',
          'طرق تعليمية مثبتة'
        ]
      },
      color: '#3b82f6',
      darkColor: '#1e40af'
    },
    {
      key: 'Live',
      icon: <FaVideo className="text-white" size={20} />,
      title: {
        fr: 'Formations Live',
        en: 'Live Sessions',
        ar: 'جلسات مباشرة'
      },
      desc: {
        fr: 'Apprentissage interactif en direct avec nos experts',
        en: 'Interactive live learning with our experts',
        ar: 'تعلم تفاعلي مباشر مع خبرائنا'
      },
      fullDesc: {
        fr: "Participez à des sessions de formation en direct avec nos experts. Posez vos questions en temps réel et bénéficiez d'un apprentissage interactif et personnalisé.",
        en: "Participate in live training sessions with our experts. Ask your questions in real time and benefit from interactive and personalized learning.",
        ar: "شارك في جلسات تدريبية مباشرة مع خبرائنا. اطرح أسئلتك في الوقت الفعلي واستفد من التعلم التفاعلي والشخصي."
      },
      benefits: {
        fr: [
          'Interaction en temps réel',
          'Réponses immédiates à vos questions',
          'Flexibilité horaire'
        ],
        en: [
          'Real-time interaction',
          'Immediate answers to your questions',
          'Schedule flexibility'
        ],
        ar: [
          'تفاعل في الوقت الحقيقي',
          'إجابات فورية على أسئلتك',
          'مرونة في الجدول الزمني'
        ]
      },
      color: '#8b5cf6',
      darkColor: '#5b21b6'
    }
  ];

  useEffect(() => {
    if (!selectedType) return;

    const fetchFormations = async () => {
      try {
        setLoading(true);
        const endpoint = selectedType === 'Scolaire' ? 'Allscolaire' : 'Allautre';
        const res = await axios.get(`${AppURL}/api/StudioFormationRoutes/${endpoint}`);
        setFormations(res.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des formations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, [selectedType]);

  const handleTypeSelect = (type: FormationType) => {
    setSelectedType(type);
    setSearchTerm('');
    setSelectedNiveau(null);
    setSelectedFilter(null);
    setSelectedPays(null);
    setSelectedSousNiveau(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredFormations = formations.filter(f => {
    const frontendType = f.type === 'scolaire' ? 'Scolaire' : 'Professionnel';
    const matchesType = selectedType ? frontendType === selectedType : true;
    const matchesPays = selectedPays ? f.pays === selectedPays : true;

    const keywords = searchTerm.toLowerCase().split(',').map(k => k.trim());
    const matchesKeywords = keywords.every(kw =>
      (f.titreFormation?.toLowerCase().includes(kw)) ||
      (f.niveau?.toLowerCase().includes(kw)) ||
      (f.type === 'scolaire' && f.matiere?.toLowerCase().includes(kw)) ||
      (f.type === 'autre' && f.categorie?.toLowerCase().includes(kw))
    );

    const matchesNiveau = selectedNiveau ? f.niveau === selectedNiveau : true;
    const matchesSousNiveau = selectedSousNiveau ? f.sousNiveau === selectedSousNiveau : true;
    const matchesFilter = selectedFilter
      ? (selectedType === 'Scolaire' ? f.matiere === selectedFilter : f.categorie === selectedFilter)
      : true;

    return matchesType && matchesPays && matchesKeywords && matchesNiveau && matchesSousNiveau && matchesFilter;
  });

  const uniquePays = [...new Set(formations.map(f => f.pays).filter(Boolean))] as string[];
  const uniqueNiveaux = [...new Set(formations.map(f => f.niveau).filter(Boolean))] as string[];
  const uniqueSousNiveaux = [...new Set(
    formations
      .filter(f => f.niveau === selectedNiveau && f.sousNiveau)
      .map(f => f.sousNiveau)
      .filter(Boolean)
  )] as string[];
  const uniqueFilters = [...new Set(
    formations
      .filter(f =>
        (!selectedPays || f.pays === selectedPays) &&
        (!selectedNiveau || f.niveau === selectedNiveau) &&
        (!selectedSousNiveau || f.sousNiveau === selectedSousNiveau)
      )
      .map(f => selectedType === 'Scolaire' ? f.matiere : f.categorie)
      .filter(Boolean)
  )] as string[];

  const handleFormationClick = (formation: Formation) => {
    setSelectedFormation(formation);
  };

  if (loading && selectedType) {
    return (
      <div className="pt-24 bg-blue-950 min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Chargement en cours...</div>
      </div>
    );
  }

  return (
    <div className="pt-24 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 min-h-screen px-4 sm:px-6 w-full">
      <div className="w-full mx-auto">
        {!selectedType ? (
          <div className="px-4 py-16">
            <div className="mx-auto">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">
                    {language === 'fr'
                      ? 'Bienvenue sur LearnHub'
                      : language === 'en'
                        ? 'Welcome to LearnHub'
                        : 'مرحبًا بك في LearnHub'}
                  </span>
                </h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  {language === 'fr'
                    ? 'Accédez à des milliers de formations professionnelles et scolaires pour booster vos compétences.'
                    : language === 'en'
                      ? 'Access thousands of professional and school courses to boost your skills.'
                      : 'احصل على آلاف الدورات المهنية والمدرسية لتعزيز مهاراتك.'}
                </p>
              </motion.div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto">
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
                    <div
                      className="relative bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 h-full overflow-hidden transition-all duration-300 group-hover:border-gray-600 cursor-pointer"
                      onClick={() => handleTypeSelect(opt.key as FormationType)}
                    >
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
                            className={`flex items-center justify-between w-full px-6 py-3 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border border-gray-600 group-hover:border-${opt.color} transition-all`}
                          >
                            <span className="font-medium text-white">
                              {language === 'fr' ? 'Explorer' : language === 'en' ? 'Explore' : 'استكشف'}
                            </span>
                            <FaArrowRight className="text-gray-400 group-hover:text-white transition-colors" />
                          </button>
                        </div>
                      </div>

                      {/* Info Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedType(opt.key as FormationType);
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
          </div>
        ) : (
          <div className="pb-16">
            <Tab.Group selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
              <div className="mb-6 text-center">
                <h3 className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">
                  {language === 'fr'
                    ? `Explorer nos formations ${selectedType === 'Scolaire' ? 'scolaires' : selectedType === 'Professionnel' ? 'professionnelles' : 'Live'}`
                    : language === 'en'
                      ? `Explore our ${selectedType === 'Scolaire' ? 'school' : selectedType === 'Professionnel' ? 'professional' : 'Live'} formations`
                      : `استكشف دوراتنا ${selectedType === 'Scolaire' ? 'المدرسية' : selectedType === 'Professionnel' ? 'المهنية' : 'المباشرة'}`
                  }
                </h3>
                <p className="text-white mt-2 font-bold">
                  {selectedTabIndex === 0
                    ? language === 'fr' ? 'Apprenez à votre rythme avec nos contenus soigneusement conçus pour vous.' : language === 'en' ? 'Learn at your own pace with our carefully designed content.' : 'تعلم وفقًا لسرعتك مع محتوى مصمم بعناية.'
                    : language === 'fr' ? 'Restez connectés pour nos sessions live interactives.' : language === 'en' ? 'Stay tuned for our interactive live sessions' : 'ترقبوا جلساتنا التفاعلية المباشرة.'
                  }
                </p>
              </div>

              <NouvellesFormationsSection
                language={language}
                type={selectedType === 'Scolaire' ? 'scolaire' : 'Professionnel'}
              />

              <Tab.Panels>
                <Tab.Panel>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder={
                        language === 'fr' ? 'Recherche (ex: primaire, math)' :
                          language === 'en' ? 'Search (ex: primary, math)' :
                            'بحث (مثال: ابتدائي، رياضيات)'
                      }
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="text-white w-full px-5 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                    />
                  </div>

                  {/* Filtres pays */}
                  {selectedType === 'Scolaire' && (
                    <div className="mb-4 w-full">
                      <span className="text-lg md:text-xl font-bold text-orange-400 mb-2 block">
                        {language === 'fr' ? 'Sélectionnez votre pays' : language === 'en' ? 'Select country' : 'اختر بلدك'}
                      </span>
                      <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        <div className="flex gap-2 w-max px-2 pb-3">
                          {uniquePays.map(p => (
                            <button
                              key={p}
                              onClick={() => setSelectedPays(selectedPays === p ? null : p)}
                              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedPays === p
                                ? 'bg-orange-400 text-white shadow-md'
                                : 'bg-white text-gray-800 border border-gray-300 shadow-sm hover:bg-gray-50'
                                }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Filtres niveau */}
                  {selectedType === 'Scolaire' && (
                    <div className="mb-4 w-full">
                      <span className="text-lg md:text-xl font-bold text-orange-400 mb-2 block">
                        {language === 'fr' ? 'Sélectionnez votre niveau' : language === 'en' ? 'Select level' : 'اختر المستوى'}
                      </span>
                      <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        <div className="flex gap-2 w-max px-2 pb-3">
                          {uniqueNiveaux.map(n => (
                            <button
                              key={n}
                              onClick={() => setSelectedNiveau(selectedNiveau === n ? null : n)}
                              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedNiveau === n
                                ? 'bg-orange-400 text-white shadow-md'
                                : 'bg-white text-gray-800 border border-gray-300 shadow-sm hover:bg-gray-50'
                                }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Filtres sous-niveau */}
                  {selectedType === 'Scolaire' && selectedNiveau && uniqueSousNiveaux.length > 0 && (
                    <div className="mb-4 w-full">
                      <span className="text-lg md:text-xl font-bold text-orange-400 mb-2 block">
                        {language === 'fr' ? 'Sélectionnez votre sous-niveau' : language === 'en' ? 'Select sub-level' : 'اختر المستوى الفرعي'}
                      </span>
                      <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        <div className="flex gap-2 w-max px-2 pb-3">
                          {uniqueSousNiveaux.map(s => (
                            <button
                              key={s}
                              onClick={() => setSelectedSousNiveau(selectedSousNiveau === s ? null : s)}
                              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedSousNiveau === s
                                ? 'bg-orange-400 text-white shadow-md'
                                : 'bg-white text-gray-800 border border-gray-300 shadow-sm hover:bg-gray-50'
                                }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Filtres matière/catégorie */}
                  <div className="mb-10 w-full">
                    <span className="text-lg md:text-xl font-bold text-orange-400 mb-2 block">
                      {selectedType === 'Scolaire'
                        ? (language === 'fr' ? 'Sélectionnez une matière' : language === 'en' ? 'Select subject' : 'اختر مادة')
                        : (language === 'fr' ? 'Sélectionnez une catégorie' : language === 'en' ? 'Select category' : 'اختر فئة')}
                    </span>
                    <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                      <div className="flex gap-2 w-max px-2 pb-3">
                        {uniqueFilters.map(f => (
                          <button
                            key={f}
                            onClick={() => {
                              setSelectedFilter(selectedFilter === f ? null : f);
                              setSearchTerm('');
                            }}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedFilter === f
                              ? 'bg-orange-400 text-white shadow-md'
                              : 'bg-white text-gray-800 border border-gray-300 shadow-sm hover:bg-gray-50'
                              }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Grid formations */}
                  {filteredFormations.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
                      {filteredFormations.map(f => (
                        <motion.div
                          key={f._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.03 }}
                          onClick={() => handleFormationClick(f)}
                          className=" mb-8 bg-blue-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-transform transform hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col"
                        >
                          {f.coverImage && (
                            <div className="h-48 w-full overflow-hidden">
                              <img
                                src={`${AppURL}${f.coverImage}`}
                                alt={f.titreFormation}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-5">
                            <h3 className="font-bold text-lg text-blue-950 mb-2 line-clamp-2">
                              {f.type === 'scolaire' && f.sousNiveau && f.niveau
                                ? `${f.niveau} - ${f.sousNiveau}`
                                : f.titreFormation}
                            </h3>

                            {f.type === 'scolaire' && f.matiere && (
                              <p className="text-sm text-gray-600 mb-1">
                                {language === 'fr' ? 'Matière' : language === 'en' ? 'Subject' : 'المادة'}: {f.matiere}
                              </p>
                            )}
                            {f.type === 'autre' && f.categorie && (
                              <p className="text-sm text-gray-600 mb-1">
                                {language === 'fr' ? 'Catégorie' : language === 'en' ? 'Category' : 'الفئة'}: {f.categorie}
                              </p>
                            )}
                            <p className="text-sm text-gray-600 mb-1">
                              {language === 'fr' ? 'Par' : language === 'en' ? 'By' : 'بواسطة'}: {f.auteur.prenom} {f.auteur.nom}
                            </p>

                            {f.prix !== undefined && (
                              <div className="mt-3">
                                {f.promotion ? (
                                  <>
                                    <p className="text-sm text-red-700 line-through">
                                      {f.prix.toFixed(2)} {language === 'fr' ? '$' : language === 'en' ? '$' : '$'}
                                    </p>
                                    <p className="text-green-800 font-bold">
                                      {f.newPrix.toFixed(2)} {language === 'fr' ? '$' : language === 'en' ? '$' : '$'}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-green-800 font-bold">
                                    {f.prix.toFixed(2)} {language === 'fr' ? '$' : language === 'en' ? '$' : '$'}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-white text-lg">
                        {language === 'fr'
                          ? 'Aucune formation trouvée avec ces critères.'
                          : language === 'en'
                            ? 'No formations found with these criteria.'
                            : 'لم يتم العثور على أي دورات بهذه المعايير.'}
                      </p>
                    </div>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>

            {selectedFormation && (
              <FormationModal
                formationId={selectedFormation._id}
                language={language}
                onClose={() => setSelectedFormation(null)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnHub;