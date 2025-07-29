import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import AppURL from "../../components/AppUrl";
import { motion, AnimatePresence, Variants, easeInOut } from "framer-motion";
import { useSwipeable } from 'react-swipeable';
import { FaArrowLeft, FaArrowRight, FaTimes, FaBookOpen, FaLanguage, FaTags, FaFileAlt, FaCalendarAlt, FaMoneyBillWave, FaPercentage } from "react-icons/fa";

interface Ebook {
  _id: string;
  titre: string;
  langue: string;
  categorie: string;
  coverImage?: string;
  folderPath: string;
  description?: string;
  ebookId: string;
  prix?: number;
  NumPages?: number;
  createdAt?: string;
  approved?: string;
  rejectionNote?: string;
  promotion?: boolean;
  newPrix?: number;
  lastReadPage?: number; // facultatif si pas encore lu
  investmentOptions?: {
    affiliation?: boolean;
    codePromo?: boolean;
    commande?: boolean;
    licence?: boolean;
    sponsoring?: boolean;
  };
}
type Language = 'fr' | 'en' | 'ar';


export default function MyEbook() {
  const { user } = useAuth();
  const language: Language = ['fr', 'en', 'ar'].includes(user?.langue as string) ? (user?.langue as Language) : 'fr';
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [viewMode, setViewMode] = useState<"details" | "reading">("details");
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const uiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedPageRef = useRef<number>(-1);


  useEffect(() => {
    if (!selectedEbook || !user?.id || viewMode !== "reading") return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    // Ne pas sauvegarder trop souvent (ex: que si différence ≥ 3 pages)
    if (Math.abs(currentPage - lastSavedPageRef.current) >= 3) {
      saveTimeoutRef.current = setTimeout(() => {
        axios
          .put(`${AppURL}/api/myEbookRoutes/saveProgress`, {
            userId: user.id,
            bookId: selectedEbook._id,
            lastReadPage: currentPage,
          })
          .then(() => {
            lastSavedPageRef.current = currentPage;
          })
          .catch((err) => {
            console.error("❌ Erreur de sauvegarde:", err);
          });
      }, 2000); // délai avant d’envoyer la requête
    }
  }, [currentPage, selectedEbook, user?.id, viewMode]);


  const resetUIHideTimer = () => {
    setShowUI(true);
    if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
    uiTimeoutRef.current = setTimeout(() => setShowUI(false), 3000);
  };

  useEffect(() => {
    if (fullscreenMode) resetUIHideTimer();
  }, [fullscreenMode, currentPage]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      resetUIHideTimer();
      if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
    },
    onSwipedRight: () => {
      resetUIHideTimer();
      if (currentPage > 0) setCurrentPage(currentPage - 1);
    },
    trackMouse: true,
  });


  useEffect(() => {
    if (!user?.id) return;
    const fetchEbooks = async () => {
      try {
        const res = await axios.get(`${AppURL}/api/myEbookRoutes/myebooks/${user.id}`);
        const ebookArray = Array.isArray(res.data) ? res.data : res.data.ebooks;
        if (!Array.isArray(ebookArray)) throw new Error("Format inattendu");

        const books = ebookArray.map((item: any) => {
          const total = item.bookId.NumPages || 1;
          const read = item.lastReadPage || 0;
          const progress = Math.min(100, Math.round((read / total) * 100));

          return {
            _id: item.bookId._id,
            titre: item.bookId.titre,
            langue: item.bookId.langue || "Non spécifié",
            categorie: item.bookId.categorie || "Non spécifié",
            folderPath: item.bookId.folderPath,
            coverImage: item.bookId.coverImage,
            description: item.bookId.description || "Aucune description disponible",
            ebookId: item.bookId._id,
            prix: item.bookId.prix || 0,
            NumPages: total,
            createdAt: item.bookId.createdAt ? new Date(item.bookId.createdAt).toLocaleDateString() : "Date inconnue",
            approved: item.bookId.approved || "Statut inconnu",
            promotion: item.bookId.promotion || false,
            newPrix: item.bookId.newPrix || 0,
            investmentOptions: item.bookId.investmentOptions || {},
            lastReadPage: read,
            progress, // ⬅️ ajoute ce champ
          };
        });


        setEbooks(books);
      } catch (error) {
        console.error("Erreur lors du chargement des ebooks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEbooks();
  }, [user]);


  const openFullscreen = () => setFullscreenMode(true);
  const closeFullscreen = () => setFullscreenMode(false);


  const openEbook = async (ebook: Ebook) => {
    setSelectedEbook(ebook);
    setPages([]);
    setPagesLoading(true);
    setCurrentPage(0); // sera mis à jour après récupération
    setViewMode("details");

    try {
      // 1. Charger les pages du livre
      const res = await axios.get(`${AppURL}/api/Collectionebooks/pages/${ebook._id}`);
      const loadedPages = res.data.pages.map((page: string) =>
        page.startsWith("/") ? `${AppURL}${page}` : `${AppURL}/${page}`
      );
      setPages(loadedPages);

      // 2. Charger la progression de lecture
      if (user?.id) {
        try {
          const progressRes = await axios.get(`${AppURL}/api/myEbookRoutes/getProgress/${user.id}/${ebook._id}`);
          const lastReadPage = progressRes.data?.lastReadPage || 0;
          setCurrentPage(lastReadPage);
          lastSavedPageRef.current = lastReadPage;
        } catch (err) {
          console.warn("⚠️ Impossible de récupérer la progression:", err);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des pages:", error);
    } finally {
      setPagesLoading(false);
    }
  };


  const closeModal = () => {
    setSelectedEbook(null);
    setPages([]);
    setViewMode("details");
  };

  const startReading = () => {
    setViewMode("reading");
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setDirection("right");
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setDirection("left");
      setCurrentPage(currentPage - 1);
    }
  };

  // Animation variants for page turning
  const pageVariants: Variants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "right" ? "100%" : "-100%",
      opacity: 0,
      zIndex: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      zIndex: 1,
      transition: {
        duration: 0.8,
        ease: easeInOut,
      }
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "right" ? "-100%" : "100%",
      opacity: 0,
      zIndex: 0,
      transition: {
        duration: 0.8,
        ease: easeInOut,
      }
    })
  };


  return (
    <div className="px-4 py-20 min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-white">
      <h1 className="text-3xl font-bold text-orange-400 mb-6 text-center">
        📚 {language === 'fr'
          ? 'Mes eBooks'
          : language === 'en'
            ? 'My eBooks'
            : '📚 كتبي الإلكترونية'}
      </h1>

      {loading ? (
        <div className="text-center">
          {language === 'fr'
            ? 'Chargement...'
            : language === 'en'
              ? 'Loading...'
              : 'جاري التحميل...'}
        </div>
      ) : ebooks.length === 0 ? (
        <div className="text-center text-blue-200">
          {language === 'fr'
            ? 'Aucun eBook trouvé.'
            : language === 'en'
              ? 'No eBook found.'
              : 'لم يتم العثور على أي كتاب إلكتروني.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ebooks.map((ebook) => (
            <motion.div
              key={ebook._id}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl shadow-lg cursor-pointer overflow-hidden border border-blue-700"
              onClick={() => openEbook(ebook)}
            >
              <div className="relative h-48">
                <img
                  src={`${AppURL}${ebook.coverImage || ebook.folderPath + "cover.png"}`}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                {ebook.NumPages && (
                  <div className="absolute bottom-2 right-2 bg-orange-400 text-blue-900 px-2 py-1 rounded-full text-xs font-bold">
                    {ebook.NumPages} {language === 'fr' ? 'pages' : language === 'en' ? 'pages' : 'صفحات'}
                  </div>
                )}
              </div>
              <div className="p-4">
                {/* Progression */}
                {(ebook.NumPages ?? 0) > 0 && (
                  <div className="mt-2 mx-4 mb-3">
                    <div className="relative w-full h-3 bg-blue-800 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-orange-400 rounded-full transition-all duration-500 ease-in-out"
                        style={{
                          width: `${Math.min(100, Math.round(((ebook.lastReadPage || 0) / (ebook.NumPages || 1)) * 100))}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-right text-xs text-blue-200 mt-1">
                      {Math.min(100, Math.round(((ebook.lastReadPage || 0) / (ebook.NumPages || 1)) * 100))}% lu
                    </p>
                  </div>
                )}


                <h2 className="text-lg font-semibold text-white">{ebook.titre}</h2>
                <p className="text-blue-200 text-sm mt-1">{ebook.categorie}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedEbook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex justify-center items-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`bg-blue-950 border border-blue-700 rounded-xl w-full h-full max-h-screen overflow-hidden flex flex-col relative ${viewMode === "reading" ? "max-w-full" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-blue-700">
                <h2 className="text-xl font-bold text-orange-400">{selectedEbook.titre}</h2>
                <button onClick={closeModal} className="text-white hover:text-orange-400">
                  <FaTimes size={22} />
                </button>
              </div>

              {/* Contenu */}
              {pagesLoading ? (
                <div className="flex-1 flex justify-center items-center">
                  <div className="animate-spin h-10 w-10 border-4 border-orange-400 border-t-transparent rounded-full"></div>
                </div>
              ) : viewMode === "details" ? (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Couverture + bouton lire */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={startReading}
                        className="cursor-pointer relative"
                      >
                        <img
                          src={`${AppURL}${selectedEbook.coverImage || selectedEbook.folderPath + "cover.png"}`}
                          alt="Couverture"
                          className="w-64 h-80 object-cover rounded-lg shadow-xl border-2 border-orange-400"
                        />
                        <div className="absolute inset-0  bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                          <div className="bg-orange-400 text-blue-900 px-4 py-2 rounded-full flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                            <FaBookOpen /> {language === 'fr' ? 'Lire maintenant' : language === 'en' ? 'Read now' : 'اقرأ الآن'}
                          </div>
                        </div>
                      </motion.div>
                      <button
                        onClick={startReading}
                        className="mt-4 bg-orange-400 hover:bg-orange-500 text-blue-900 font-bold py-2 px-6 rounded-full transition-all flex items-center gap-2"
                      >
                        <FaBookOpen /> {language === 'fr' ? 'Lire maintenant' : language === 'en' ? 'Read now' : 'اقرأ الآن'}
                      </button>
                    </div>

                    {/* Détails complets du livre */}
                    <div className="flex-1 text-white">
                      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <FaFileAlt /> {language === 'fr' ? 'Détails du livre' : language === 'en' ? 'Book details' : 'تفاصيل الكتاب'}
                      </h3>

                      <div className="space-y-4">
                        <div className="bg-blue-900/50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-300 mb-2">
                            {language === 'fr'
                              ? 'Informations de base'
                              : language === 'en'
                                ? 'Basic Information'
                                : 'معلومات أساسية'}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                              <FaLanguage className="mt-1 text-blue-200" />
                              <div>
                                <p className="text-blue-200">
                                  {language === 'fr'
                                    ? 'Langue :'
                                    : language === 'en'
                                      ? 'Language:'
                                      : 'اللغة:'}
                                </p>
                                <p className="font-semibold">{selectedEbook.langue}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <FaTags className="mt-1 text-blue-200" />
                              <div>
                                <p className="text-blue-200">
                                  {language === 'fr'
                                    ? 'Catégorie :'
                                    : language === 'en'
                                      ? 'Category:'
                                      : 'الفئة:'}
                                </p>
                                <p className="font-semibold">{selectedEbook.categorie}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <FaFileAlt className="mt-1 text-blue-200" />
                              <div>
                                <p className="text-blue-200">
                                  {language === 'fr'
                                    ? 'Nombre de pages :'
                                    : language === 'en'
                                      ? 'Number of pages:'
                                      : 'عدد الصفحات:'}
                                </p>
                                <p className="font-semibold">{selectedEbook.NumPages}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <FaCalendarAlt className="mt-1 text-blue-200" />
                              <div>
                                <p className="text-blue-200">
                                  {language === 'fr'
                                    ? 'Date de création :'
                                    : language === 'en'
                                      ? 'Creation date:'
                                      : 'تاريخ الإنشاء:'}
                                </p>
                                <p className="font-semibold">{selectedEbook.createdAt}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-900/50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-300 mb-2">
                            {language === 'fr'
                              ? 'Informations financières'
                              : language === 'en'
                                ? 'Financial Information'
                                : 'معلومات مالية'}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                              <FaMoneyBillWave className="mt-1 text-blue-200" />
                              <div>
                                <p className="text-blue-200">
                                  {language === 'fr'
                                    ? 'Prix :'
                                    : language === 'en'
                                      ? 'Price:'
                                      : 'السعر:'}
                                </p>
                                <p className="font-semibold">
                                  {selectedEbook.prix?.toFixed(2)} €
                                  {selectedEbook.promotion && selectedEbook.newPrix && (
                                    <span className="ml-2 line-through text-red-300">
                                      {selectedEbook.prix?.toFixed(2)} €
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            {selectedEbook.promotion && selectedEbook.newPrix && (
                              <div className="flex items-start gap-2">
                                <FaPercentage className="mt-1 text-blue-200" />
                                <div>
                                  <p className="text-blue-200">Prix promotionnel:</p>
                                  <p className="font-semibold text-green-300">
                                    {selectedEbook.newPrix.toFixed(2)} €
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-blue-900/50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-300 mb-2">
                            {language === 'fr'
                              ? "Options d'investissement"
                              : language === 'en'
                                ? 'Investment Options'
                                : 'خيارات الاستثمار'}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-blue-200">
                                {language === 'fr'
                                  ? 'Affiliation :'
                                  : language === 'en'
                                    ? 'Affiliation:'
                                    : 'الانضمام:'}
                              </p>
                              <p className="font-semibold">
                                {selectedEbook.investmentOptions?.affiliation
                                  ? language === 'fr'
                                    ? '✅ Disponible'
                                    : language === 'en'
                                      ? '✅ Available'
                                      : '✅ متاح'
                                  : language === 'fr'
                                    ? '❌ Non disponible'
                                    : language === 'en'
                                      ? '❌ Not available'
                                      : '❌ غير متاح'}
                              </p>
                            </div>

                            <div>
                              <p className="text-blue-200">
                                {language === 'fr'
                                  ? 'Code promo :'
                                  : language === 'en'
                                    ? 'Promo code:'
                                    : 'رمز ترويجي:'}
                              </p>
                              <p className="font-semibold">
                                {selectedEbook.investmentOptions?.codePromo
                                  ? language === 'fr'
                                    ? '✅ Disponible'
                                    : language === 'en'
                                      ? '✅ Available'
                                      : '✅ متاح'
                                  : language === 'fr'
                                    ? '❌ Non disponible'
                                    : language === 'en'
                                      ? '❌ Not available'
                                      : '❌ غير متاح'}
                              </p>
                            </div>


                            <div>
                              <p className="text-blue-200">
                                {language === 'fr'
                                  ? 'Commande :'
                                  : language === 'en'
                                    ? 'Order:'
                                    : 'طلب:'}
                              </p>
                              <p className="font-semibold">
                                {selectedEbook.investmentOptions?.commande
                                  ? language === 'fr'
                                    ? '✅ Disponible'
                                    : language === 'en'
                                      ? '✅ Available'
                                      : '✅ متاح'
                                  : language === 'fr'
                                    ? '❌ Non disponible'
                                    : language === 'en'
                                      ? '❌ Not available'
                                      : '❌ غير متاح'}
                              </p>
                            </div>


                            <div>
                              <p className="text-blue-200">
                                {language === 'fr'
                                  ? 'Licence :'
                                  : language === 'en'
                                    ? 'License:'
                                    : 'الترخيص:'}
                              </p>
                              <p className="font-semibold">
                                {selectedEbook.investmentOptions?.licence
                                  ? language === 'fr'
                                    ? '✅ Disponible'
                                    : language === 'en'
                                      ? '✅ Available'
                                      : '✅ متاح'
                                  : language === 'fr'
                                    ? '❌ Non disponible'
                                    : language === 'en'
                                      ? '❌ Not available'
                                      : '❌ غير متاح'}
                              </p>
                            </div>

                          </div>
                        </div>

                        <div className="bg-blue-900/50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-300 mb-2">
                            {language === 'fr'
                              ? 'Description'
                              : language === 'en'
                                ? 'Description'
                                : 'الوصف'}
                          </h4>
                          <p className="whitespace-pre-line">{selectedEbook.description}</p>
                        </div>


                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mode lecture */
                <div className="relative flex-1 overflow-hidden flex justify-center items-center bg-blue-900">
                  <AnimatePresence custom={direction} mode="wait">
                    {pages.length > 0 && (
                      <motion.div
                        key={currentPage}
                        custom={direction}
                        variants={pageVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute w-full h-full flex justify-center items-center"
                      >
                        <img
                          src={pages[currentPage]}
                          alt={`Page ${currentPage + 1}`}
                          className="w-full h-full object-contain shadow-2xl cursor-pointer"
                          onClick={openFullscreen}
                        />


                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {fullscreenMode && (
                      <motion.div
                        {...swipeHandlers}
                        className="fixed inset-0 z-[999] bg-black bg-opacity-95 flex justify-center items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                          resetUIHideTimer();
                          setShowUI((prev) => !prev); // toggle UI
                        }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={currentPage}
                            src={pages[currentPage]}
                            alt={`Page ${currentPage + 1}`}
                            className="absolute max-w-full max-h-full object-contain"
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -100, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </AnimatePresence>

                        {showUI && (
                          <>
                            {currentPage > 0 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); resetUIHideTimer(); prevPage(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-blue-800 hover:bg-orange-500 text-white rounded-full shadow-lg z-20"
                              >
                                <FaArrowLeft size={24} />
                              </button>
                            )}
                            {currentPage < pages.length - 1 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); resetUIHideTimer(); nextPage(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-blue-800 hover:bg-orange-500 text-white rounded-full shadow-lg z-20"
                              >
                                <FaArrowRight size={24} />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); closeFullscreen(); }}
                              className="absolute top-4 right-4 text-white hover:text-orange-400 z-20"
                            >
                              <FaTimes size={28} />
                            </button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>



                  {/* Navigation */}
                  <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
                    <div
                      className="h-full w-1/3 pointer-events-auto cursor-pointer"
                      onClick={prevPage}
                    />
                    <div
                      className="h-full w-1/3 pointer-events-auto cursor-pointer"
                      onClick={nextPage}
                    />
                  </div>

                  {currentPage > 0 && (
                    <button
                      onClick={prevPage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-blue-800 hover:bg-orange-500 text-white rounded-full shadow-lg z-10"
                    >
                      <FaArrowLeft size={24} />
                    </button>
                  )}
                  {currentPage < pages.length - 1 && (
                    <button
                      onClick={nextPage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-blue-800 hover:bg-orange-500 text-white rounded-full shadow-lg z-10"
                    >
                      <FaArrowRight size={24} />
                    </button>
                  )}

                  {/* Numérotation et bouton retour */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <button
                      onClick={() => setViewMode("details")}
                      className="bg-blue-800 hover:bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
                    >
                      <FaArrowLeft />{' '}
                      {language === 'fr'
                        ? 'Retour aux détails'
                        : language === 'en'
                          ? 'Back to details'
                          : 'العودة إلى التفاصيل'}
                    </button>

                    {pages.length > 0 && (
                      <div className="bg-black/70 text-white text-sm px-4 py-2 rounded-full">
                        {language === 'fr'
                          ? `Page ${currentPage + 1} / ${pages.length}`
                          : language === 'en'
                            ? `Page ${currentPage + 1} of ${pages.length}`
                            : `الصفحة ${currentPage + 1} من ${pages.length}`}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}