// MyLearnHub.tsx
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import AppURL from "../../components/AppUrl";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaBook,
  FaTimes,
  FaPlay,
  FaInfoCircle,
  FaArrowRight,
  FaArrowLeft,
  FaPaperPlane,
} from "react-icons/fa";
import { toast } from "react-toastify";

interface SousChapitre {
  titre: string;
  content?: string;
  video?: string;
  images?: string[];
}

interface Chapitre {
  titre: string;
  sousChapitres: SousChapitre[];
}

type Language = 'fr' | 'en' | 'ar';

interface FormationAchetee {
  _id: string;
  formationId: {
    _id: string;
    titreFormation?: string;
    type: "scolaire" | "autre";
    coverImage?: string;
    matiere?: string;
    niveau?: string;
    sousNiveau?: string;
    categorie?: string;
    pays?: string;
    prix?: number;
    promotion?: boolean;
    newPrix?: number;
    auteur: {
      _id: string;
      nom: string;
      prenom: string;
    };
    chapitres: Chapitre[];
    investmentOptions?: {
      affiliation?: boolean;
      codePromo?: boolean;
      licence?: boolean;
      sponsoring?: boolean;
    };
    createdAt: string;
  };
  lastWatchedChapter: number;
  date: string;
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function MyLearnHub() {
  const { user } = useAuth();
  const language: Language = ['fr', 'en', 'ar'].includes(user?.langue as string) ? (user?.langue as Language) : 'fr';
  const [formations, setFormations] = useState<FormationAchetee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormation, setSelectedFormation] = useState<FormationAchetee | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedSousChapitre, setSelectedSousChapitre] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);


  function renderContentWithImages(content: string, _chapIndex: number, _subChapIndex: number, formation: FormationAchetee) {
    return content.replace(/\[image:image-(\d+)-(\d+)-(\d+)\]/g, (_, chap, sousChap, imgIndex) => {
      const chapter = formation.formationId.chapitres?.[parseInt(chap)];
      const sousChapitres = chapter?.sousChapitres?.[parseInt(sousChap)];
      const img = sousChapitres?.images?.[parseInt(imgIndex)];

      if (!img) return '';
      const src = img.startsWith('http') ? img : `${AppURL}${img}`;

      return `
      <div class="my-4 flex justify-center">
        <img src="${src}" 
             class="max-w-[80%] h-auto max-h-48 rounded-lg shadow-md border border-gray-500 cursor-pointer"
             onclick="window.dispatchEvent(new CustomEvent('enlarge-image', { detail: '${src}' }))"
        />
      </div>`;
    });
  }

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail) setEnlargedImage(e.detail);
    };

    window.addEventListener('enlarge-image', handler);
    return () => window.removeEventListener('enlarge-image', handler);
  }, []);


  const handleInputFocus = () => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const fetchFormations = async () => {
      try {
        const res = await axios.get(`${AppURL}/api/myFormationRoutes/myformations/${user.id}`);
        setFormations(res.data.formations);

        if (selectedFormation) {
          const updatedFormation = res.data.formations.find(
            (f: FormationAchetee) => f._id === selectedFormation._id
          );
          if (updatedFormation) setSelectedFormation(updatedFormation);
        }
      } catch (error) {
        console.error("Error fetching formations:", error);
        toast.error("Erreur lors du chargement des formations");
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, [user?.id]);

  const handleChapterSelect = (index: number) => {
    setSelectedChapter(index);
    setSelectedSousChapitre(0);
    updateLastWatchedChapter(index);
  };

  const handleFormationClick = (formation: FormationAchetee) => {
    setSelectedFormation(formation);
    setSelectedChapter(null);
    setSelectedSousChapitre(null);
    setMessages([]);
  };

  const updateLastWatchedChapter = async (chapterIndex: number) => {
    if (!selectedFormation) return;

    try {
      await axios.put(`${AppURL}/api/myFormationRoutes/saveProgress`, {
        MYformationId: selectedFormation._id,
        lastWatchedChapter: chapterIndex + 1
      });

      setFormations(prev =>
        prev.map(f =>
          f._id === selectedFormation._id
            ? { ...f, lastWatchedChapter: chapterIndex }
            : f
        )
      );
    } catch (error) {
      console.error("Error updating last watched chapter:", error);
    }
  };

  const navigateSubChapter = (direction: 'prev' | 'next') => {
    if (!selectedFormation || selectedChapter === null || selectedSousChapitre === null) return;

    const subChapters = selectedFormation.formationId.chapitres[selectedChapter].sousChapitres;
    const newIndex = direction === 'prev' ? selectedSousChapitre - 1 : selectedSousChapitre + 1;

    if (newIndex >= 0 && newIndex < subChapters.length) {
      setSelectedSousChapitre(newIndex);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    setTimeout(() => {
      const botResponse: Message = {
        text: `Voici une réponse concernant "${newMessage}". Je suis une réponse simulée. Dans une vraie implémentation, vous devriez connecter ceci à un service d'IA comme OpenAI.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="px-4 pt-24 pb-10 min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-white">
      <div className="mx-auto">
        <h1 className="text-3xl font-bold text-orange-400 mb-2 text-center">
          {language === 'fr'
            ? '🎓 Mes Formations Achetées'
            : language === 'en'
              ? '🎓 My Purchased Courses'
              : '🎓 دوراتي المشتراة'}
        </h1>
        <p className="text-center text-blue-200 mb-8">
          {language === 'fr'
            ? 'Retrouvez ici toutes les formations que vous avez acquises'
            : language === 'en'
              ? 'Find here all the courses you have purchased'
              : 'اعثر هنا على جميع الدورات التي اشتريتها'}
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400"></div>
          </div>
        ) : formations.length === 0 ? (
          <div className="text-center py-16 bg-blue-900/30 rounded-xl">
            <FaBook className="text-5xl text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'fr'
                ? 'Aucune formation achetée'
                : language === 'en'
                  ? 'No course purchased'
                  : 'لم يتم شراء أي دورة'}
            </h3>
            <p className="text-blue-200 max-w-md mx-auto">
              {language === 'fr'
                ? "Vous n'avez pas encore acheté de formation. Parcourez notre catalogue pour en découvrir."
                : language === 'en'
                  ? "You haven't purchased any course yet. Browse our catalog to discover some."
                  : "لم تقم بشراء أي دورة بعد. تصفح الكتالوج الخاص بنا لاكتشاف الدورات."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {formations.map((formation) => {
              const totalChapitres = formation.formationId.chapitres.length || 1;
              const progress = Math.min(100, Math.round(((formation.lastWatchedChapter) / totalChapitres) * 100));


              return (
                <motion.div
                  key={formation._id}
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl shadow-lg cursor-pointer border border-blue-700 overflow-hidden"
                  onClick={() => handleFormationClick(formation)}
                >
                  <div className="relative h-48">
                    <img
                      src={`${AppURL}${formation.formationId.coverImage}`}
                      alt="cover"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-cover.png';
                      }}
                    />
                    <div className="absolute bottom-2 right-2 bg-blue-900/80 text-white px-2 py-1 rounded-full text-xs">
                      {language === 'fr'
                        ? `${formation.formationId.chapitres.length} chapitres`
                        : language === 'en'
                          ? `${formation.formationId.chapitres.length} chapters`
                          : `${formation.formationId.chapitres.length} فصول`}
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-white line-clamp-2 h-14">
                      {formation.formationId.titreFormation ||
                        `${formation.formationId.matiere} (${formation.formationId.niveau})`}
                    </h2>

                    <div className="mt-2 mx-1 mb-3">
                      <div className="relative w-full h-2 bg-blue-800 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-orange-400 rounded-full transition-all duration-500 ease-in-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-right text-xs text-blue-200 mt-1">
                        {language === 'fr'
                          ? `${progress}% complété`
                          : language === 'en'
                            ? `${progress}% completed`
                            : `${progress}% مكتمل`}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-orange-400 font-bold">
                        {formation.formationId.promotion && formation.formationId.newPrix
                          ? `$${formation.formationId.newPrix.toFixed(2)}`
                          : `$${formation.formationId.prix?.toFixed(2)}`}
                      </span>
                      <span className="text-xs text-blue-300">
                        {language === 'fr'
                          ? `Acheté le ${new Date(formation.date).toLocaleDateString()}`
                          : language === 'en'
                            ? `Purchased on ${new Date(formation.date).toLocaleDateString()}`
                            : `تم الشراء في ${new Date(formation.date).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {selectedFormation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black bg-opacity-90 flex justify-center items-center p-4"
              onClick={() => setSelectedFormation(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl w-full  max-h-[95vh] overflow-hidden flex flex-col border border-blue-700 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 z-10 bg-blue-900/80 backdrop-blur-md border-b border-blue-700 px-6 py-4 flex justify-between items-center shadow-md">
                  {/* Infos de la formation */}
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-orange-400 leading-snug">
                      {selectedFormation.formationId.titreFormation ||
                        `${selectedFormation.formationId.matiere} (${selectedFormation.formationId.niveau})`}
                    </h2>
                    <p className="text-sm text-blue-300">
                      {language === 'fr'
                        ? `Acheté le ${new Date(selectedFormation.date).toLocaleDateString()} • Dernier chapitre vu : ${selectedFormation.lastWatchedChapter + 1}/${selectedFormation.formationId.chapitres.length}`
                        : language === 'en'
                          ? `Purchased on ${new Date(selectedFormation.date).toLocaleDateString()} • Last chapter watched: ${selectedFormation.lastWatchedChapter + 1}/${selectedFormation.formationId.chapitres.length}`
                          : `تم الشراء في ${new Date(selectedFormation.date).toLocaleDateString()} • آخر فصل تم مشاهدته: ${selectedFormation.lastWatchedChapter + 1}/${selectedFormation.formationId.chapitres.length}`}
                    </p>
                  </div>

                  {/* Boutons à droite */}
                  <div className="flex items-center gap-3">
                    {selectedChapter !== null && (
                      <button
                        onClick={() => setSelectedChapter(null)}
                        className="text-sm font-medium bg-blue-800 hover:bg-blue-700 border border-blue-600 text-white px-4 py-2 rounded-lg transition"
                      >
                        {language === 'fr'
                          ? '⬅ Retour au sommaire'
                          : language === 'en'
                            ? '⬅ Back to summary'
                            : '⬅ الرجوع إلى الملخص'}
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedFormation(null)}
                      className="text-white hover:text-red-400 transition p-2"
                      title={language === 'fr' ? 'Fermer' : language === 'en' ? 'Close' : 'إغلاق'}
                    >
                      <FaTimes size={22} />
                    </button>
                  </div>
                </div>


                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                  {selectedChapter === null ? (
                    <div className="w-full p-6 overflow-y-auto">
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-orange-400 mb-6">
                          {language === 'fr'
                            ? 'Sommaire de '
                            : language === 'en'
                              ? 'Outline of '
                              : 'ملخص '}
                          {selectedFormation.formationId.type === 'autre'
                            ? selectedFormation.formationId.titreFormation
                            : `${selectedFormation.formationId.matiere} - ${selectedFormation.formationId.niveau}`}
                        </h2>


                        <div className="grid grid-cols-1 gap-4">
                          {selectedFormation.formationId.chapitres.map((chap, index) => (
                            <motion.div
                              key={index}
                              whileHover={{ scale: 1.01 }}
                              className={`p-4 rounded-lg cursor-pointer transition-all ${selectedFormation.lastWatchedChapter === index
                                ? 'bg-orange-500/20 border-2 border-orange-500'
                                : 'bg-blue-800/40 hover:bg-blue-800/60 border border-blue-700'
                                }`}
                              onClick={() => handleChapterSelect(index)}
                            >
                              <div className="flex items-center">
                                <div className={`text-lg font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 ${selectedFormation.lastWatchedChapter === index
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-blue-700 text-blue-200'
                                  }`}>
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg">{chap.titre}</h3>
                                  <p className="text-sm text-blue-300 mt-1">
                                    {language === 'fr'
                                      ? `${chap.sousChapitres.length} sous-chapitres`
                                      : language === 'en'
                                        ? `${chap.sousChapitres.length} subchapters`
                                        : `${chap.sousChapitres.length} فصول فرعية`}
                                  </p>
                                </div>
                                {chap.sousChapitres.some(sc => sc.video) && (
                                  <FaPlay className="text-orange-400 ml-2" />
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-full md:w-2/3 p-6 overflow-y-auto">
                        {selectedSousChapitre !== null && (
                          <div className="flex flex-col h-full">
                            {/* Section Vidéo */}
                            <div className="flex-1 bg-black rounded-lg overflow-hidden mb-4">
                              {selectedFormation.formationId.chapitres[selectedChapter].sousChapitres[selectedSousChapitre]?.video && (
                                <video
                                  ref={videoRef}
                                  controls
                                  controlsList="nodownload"
                                  onContextMenu={(e) => e.preventDefault()}
                                  className="w-full h-full max-h-[400px] object-contain"
                                  src={`${AppURL}${selectedFormation.formationId.chapitres[selectedChapter].sousChapitres[selectedSousChapitre].video}`}
                                />

                              )}
                            </div>

                            {/* Section Texte */}
                            <div className="flex-1 overflow-y-auto bg-blue-900/20 p-6 rounded-lg mb-4">
                              {selectedFormation.formationId.chapitres[selectedChapter].sousChapitres[selectedSousChapitre]?.content && (
                                <div
                                  className="prose prose-invert max-w-none"
                                  dangerouslySetInnerHTML={{
                                    __html: renderContentWithImages(
                                      selectedFormation.formationId.chapitres[selectedChapter].sousChapitres[selectedSousChapitre].content || '',
                                      selectedChapter,
                                      selectedSousChapitre,
                                      selectedFormation
                                    ),
                                  }}
                                />
                              )}
                            </div>

                            {/* Navigation sous-chapitres */}
                            <div className="flex justify-between items-center bg-blue-900/50 p-4 rounded-lg">
                              <button
                                onClick={() => navigateSubChapter('prev')}
                                disabled={selectedSousChapitre === 0}
                                className={`flex items-center px-4 py-2 rounded-lg ${selectedSousChapitre === 0
                                  ? 'bg-blue-800/30 text-blue-500 cursor-not-allowed'
                                  : 'bg-orange-500 hover:bg-blue-600'
                                  }`}
                              >
                                <FaArrowLeft className="mr-2" />
                                {language === 'fr'
                                  ? 'Précédent'
                                  : language === 'en'
                                    ? 'Previous'
                                    : 'السابق'}
                              </button>
                              <span className="text-sm text-blue-300">
                                {selectedSousChapitre + 1} / {selectedFormation.formationId.chapitres[selectedChapter].sousChapitres.length}
                              </span>
                              <button
                                onClick={() => navigateSubChapter('next')}
                                disabled={selectedSousChapitre === selectedFormation.formationId.chapitres[selectedChapter].sousChapitres.length - 1}
                                className={`flex items-center px-4 py-2 rounded-lg ${selectedSousChapitre === selectedFormation.formationId.chapitres[selectedChapter].sousChapitres.length - 1
                                  ? 'bg-blue-800/30 text-blue-500 cursor-not-allowed'
                                  : 'bg-orange-500 hover:bg-blue-600'
                                  }`}
                              >
                                {language === 'fr'
                                  ? 'Suivant'
                                  : language === 'en'
                                    ? 'Next'
                                    : 'التالي'}
                                <FaArrowRight className="ml-2" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="w-full md:w-1/3 bg-blue-900/50 border-l border-blue-700 flex flex-col">
                        {/* Section Sommaire */}
                        <div className="p-4 border-b border-blue-700">
                          <h3 className="text-lg font-semibold text-orange-300 mb-4">
                            {language === 'fr'
                              ? `Sommaire du chapitre : ${selectedFormation.formationId.chapitres[selectedChapter].titre}`
                              : language === 'en'
                                ? `Chapter outline: ${selectedFormation.formationId.chapitres[selectedChapter].titre}`
                                : `ملخص الفصل: ${selectedFormation.formationId.chapitres[selectedChapter].titre}`}
                          </h3>

                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {selectedFormation.formationId.chapitres[selectedChapter].sousChapitres.map((sub, index) => (
                              <motion.div
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                className={`p-3 rounded-lg cursor-pointer transition ${selectedSousChapitre === index
                                  ? 'bg-orange-500/20 border border-orange-500/50'
                                  : 'bg-blue-800/40 hover:bg-blue-800/60'
                                  }`}
                                onClick={() => setSelectedSousChapitre(index)}
                              >
                                <div className="flex items-center">
                                  <div className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-3 ${selectedSousChapitre === index
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-blue-700 text-blue-200'
                                    }`}>
                                    {index + 1}
                                  </div>
                                  <h5 className="text-sm font-medium">{sub.titre}</h5>
                                  {sub.video && (
                                    <span className="ml-auto text-xs bg-blue-900/50 px-2 py-1 rounded-full flex items-center">
                                      <FaPlay className="mr-1" size={10} />
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Zone de messagerie */}
                        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                          <h3 className="text-lg font-semibold text-orange-300 mb-4">
                            {language === 'fr'
                              ? 'Questions sur ce chapitre'
                              : language === 'en'
                                ? 'Questions about this chapter'
                                : 'أسئلة حول هذا الفصل'}
                          </h3>

                          <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                            {messages.length === 0 ? (
                              <div className="text-center text-blue-300 py-8 ">
                                <FaInfoCircle className="mx-auto mb-2" />
                                <p>
                                  {language === 'fr'
                                    ? 'Posez vos questions sur ce chapitre ici'
                                    : language === 'en'
                                      ? 'Ask your questions about this chapter here'
                                      : 'اكتب أسئلتك حول هذا الفصل هنا'}
                                </p>
                              </div>
                            ) : (
                              messages.map((message, index) => (
                                <div
                                  key={index}
                                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-xs md:max-w-md rounded-lg p-3 ${message.sender === 'user'
                                      ? 'bg-orange-500/20 rounded-tr-none'
                                      : 'bg-blue-800/50 rounded-tl-none'
                                      }`}
                                  >
                                    <p className="text-sm">{message.text}</p>
                                    <p className="text-xs opacity-50 mt-1 text-right">
                                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onFocus={handleInputFocus}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              placeholder={
                                language === 'fr'
                                  ? 'Posez votre question...'
                                  : language === 'en'
                                    ? 'Ask your question...'
                                    : 'اكتب سؤالك...'
                              }
                              className="flex-1 bg-blue-800/50 border border-blue-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <button
                              onClick={handleSendMessage}
                              className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2 flex items-center justify-center"
                            >
                              <FaPaperPlane />
                            </button>
                          </div>
                        </div>



                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {enlargedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999] bg-black bg-opacity-90 flex justify-center items-center"
              onClick={() => setEnlargedImage(null)}
            >
              <img
                src={enlargedImage}
                alt="Zoomed"
                className="max-w-full max-h-full object-contain cursor-zoom-out"
                onClick={(e) => {
                  e.stopPropagation();
                  setEnlargedImage(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}