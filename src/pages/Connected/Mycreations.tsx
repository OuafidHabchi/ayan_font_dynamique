import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import AppURL from "../../components/AppUrl";
import { FaBook, FaGlobe, FaTags, FaInfoCircle, FaArrowLeft, FaArrowRight, FaTimes, FaCheck, FaClock } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';


// Ajout des types supplémentaires dans Ebook
interface Ebook {
  _id: string;
  titre: string;
  langue: string;
  categorie: string;
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
  investmentOptions?: {
    affiliation?: boolean;
    codePromo?: boolean;
    commande?: boolean;
    licence?: boolean;
    sponsoring?: boolean;
  };
}

interface Formation {
  _id: string;
  type: "scolaire" | "autre";
  titreFormation?: string;
  coverImage?: string; // ✅ ajoute cette ligne si elle n'existe pas encore
  matiere?: string;
  niveau?: string;
  sousNiveau?: string;
  categorie?: string;
  pays?: string;
  prix?: number;
  approved?: string;
  rejectionNote: string;
  promotion?: boolean;
  newPrix?: number;
  auteur: {
    _id: string;
    nom: string;
    prenom: string;
  };
  chapitres: {
    titre: string;
    sousChapitres: {
      titre: string;
      content?: string;
      video?: string;
      images?: string[];
    }[];
  }[];
  investmentOptions?: {
    affiliation?: boolean;
    codePromo?: boolean;
    licence?: boolean;
    sponsoring?: boolean;
  };
  createdAt: string;
}
type Language = 'fr' | 'en' | 'ar';


export default function MyCreations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const language: Language = ['fr', 'en', 'ar'].includes(user?.langue as string) ? (user?.langue as Language) : 'fr';

  const [loading, setLoading] = useState(true);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showPages, setShowPages] = useState(false);
  const [selectedPercent, setSelectedPercent] = useState<number | null>(null);
  const [nouveauPrix, setNouveauPrix] = useState<number>(0);
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [activeTab, setActiveTab] = useState<'ebooks' | 'formations'>('ebooks');

  const [selectedFormationPercent, setSelectedFormationPercent] = useState<number | null>(null);
  const [nouveauFormationPrix, setNouveauFormationPrix] = useState<number>(0);
  const [showFormationPromotionForm, setShowFormationPromotionForm] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedSousChapitre, setSelectedSousChapitre] = useState<number | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});


  function renderContentWithImages(content: string, _chapIndex: number, _subChapIndex: number, selectedFormation: any) {
    return content.replace(/\[image:image-(\d+)-(\d+)-(\d+)\]/g, (_, chap, sousChap, imgIndex) => {
      const chapter = selectedFormation.chapitres?.[parseInt(chap)];
      const sousChapitres = chapter?.sousChapitres?.[parseInt(sousChap)];
      const img = sousChapitres?.images?.[parseInt(imgIndex)];

      if (!img) return '';

      const src = img instanceof File
        ? URL.createObjectURL(img)
        : `${AppURL}${img}`; // AppURL est ton URL de backend (ex: https://api.monsite.com/)

      return `<div class="my-4 flex justify-center">
              <img src="${src}" class="max-w-[80%] h-auto max-h-48 rounded-lg shadow-md border border-gray-500" />
            </div>`;
    });
  }





  const handleFormationClick = (formation: Formation) => {
    setSelectedFormation(formation);
  };
  const closeFormationModal = () => {
    setSelectedFormation(null);
  };


  const handleDeleteFormation = async () => {
    if (!selectedFormation) return;

    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette formation ?");
    if (!confirmed) return;

    try {
      const res = await axios.delete(`${AppURL}/api/StudioFormationRoutes/delete/${selectedFormation._id}`);

      if (res.status === 200 && res.data.message) {
        toast.success("✅ Formation supprimée avec succès !");
        setFormations(prev => prev.filter(f => f._id !== selectedFormation._id));
        closeFormationModal();
      } else {
        toast.error("❌ Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Erreur serveur lors de la suppression.");
    }
  };


  const handleFormationPromotionSubmit = async () => {
    if (!selectedFormation || !selectedFormationPercent) return;
    try {
      await axios.put(`${AppURL}/api/StudioFormationRoutes/promote/${selectedFormation._id}`, {
        promotion: true,
        newPrix: nouveauFormationPrix
      });
      setFormations(prev =>
        prev.map(f => f._id === selectedFormation._id
          ? { ...f, promotion: true, newPrix: nouveauFormationPrix }
          : f)
      );
      setSelectedFormation(f => f ? { ...f, promotion: true, newPrix: nouveauFormationPrix } : null);
      toast.success("Promotion appliquée avec succès !");
    } catch (error) {
      toast.error("Erreur lors de l'application de la promotion");
      console.error(error);
    }
  };




  useEffect(() => {
    const fetchEbooks = async () => {
      if (!user?.id) return;

      try {
        const [ebooksRes, formationsRes] = await Promise.all([
          axios.get(`${AppURL}/api/Collectionebooks/user/${user.id}`),
          axios.get(`${AppURL}/api/StudioFormationRoutes/user/${user.id}`) // 🔥 ici l’appel formations
        ]);
        setEbooks(ebooksRes.data.ebooks);
        setFormations(formationsRes.data.formations); // 💾 on les stocke
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEbooks();
  }, [user?.id]);


  const handleCoverClick = async (ebook: Ebook) => {
    setSelectedEbook(ebook);
    setPagesLoading(true);
    setCurrentPage(0);
    try {
      const res = await axios.get(
        `${AppURL}/api/Collectionebooks/pages/${ebook._id}`
      );
      setPages(res.data.pages.map((page: string) =>
        page.startsWith('/') ? `${AppURL}${page}` : `${AppURL}/${page}`
      ));
    } catch (error) {
      console.error("❌ Error fetching pages:", error);
    } finally {
      setPagesLoading(false);
    }
  };


  const handleDelete = async () => {
    if (!selectedEbook) return;

    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce livre ?");
    if (!confirmed) return;

    try {
      const res = await axios.delete(`${AppURL}/api/Collectionebooks/delete/${selectedEbook.ebookId}`);
      if (res.data.success) {
        toast.success("✅ Livre supprimé avec succès !");
        setEbooks(prev => prev.filter(e => e._id !== selectedEbook._id));
        closeModal();
      } else {
        toast.error("❌ Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Erreur serveur lors de la suppression.");
    }
  };

  const handlePromotionSubmit = async () => {
    if (!selectedEbook || !selectedPercent) return;
    await axios.patch(`${AppURL}/api/Collectionebooks/Promotion/${selectedEbook._id}`, {
      promotion: true,
      newPrix: nouveauPrix
    });
    setEbooks(prev =>
      prev.map(e => e._id === selectedEbook._id
        ? { ...e, promotion: true, newPrix: nouveauPrix }
        : e)
    );
    setSelectedEbook(e => e ? { ...e, promotion: true, newPrix: nouveauPrix } : null);
    alert("Promotion appliquée !");
  };


  const closeModal = () => {
    setSelectedEbook(null);
    setPages([]);
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  return (
    <div className="px-4 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 min-h-screen pt-24 pb-12">


      {/* Header Section */}
      <div className=" mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-orange-400 mb-4 text-center">
          {language === 'fr'
            ? 'Mes créations'
            : language === 'en'
              ? 'My Creations'
              : 'إبداعاتي'}
        </h2>
        <p className="text-center text-white font-bold max-w-2xl mx-auto mb-10 text-sm md:text-base">
          {user?.prenom
            ? language === 'fr'
              ? `Œuvres publiées de ${user.prenom}`
              : language === 'en'
                ? `${user.prenom}'s published works`
                : `الأعمال المنشورة لـ ${user.prenom}`
            : language === 'fr'
              ? 'Vos œuvres publiées'
              : language === 'en'
                ? 'Your published works'
                : 'أعمالك المنشورة'}
        </p>

        {/* Onglets pleine largeur */}
        <div className="w-full mb-10 border-b border-blue-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('ebooks')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 relative group flex items-center justify-center gap-2 ${activeTab === 'ebooks'
                ? 'text-orange-400'
                : 'text-blue-300 hover:text-white hover:bg-blue-800/50'
                }`}
            >
              <span className="text-lg">📘</span>
              <span>
                {language === 'fr'
                  ? 'eBooks'
                  : language === 'en'
                    ? 'eBooks'
                    : 'الكتب الإلكترونية'}
              </span>
              {activeTab === 'ebooks' && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('formations')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 relative group flex items-center justify-center gap-2 ${activeTab === 'formations'
                ? 'text-orange-400'
                : 'text-blue-300 hover:text-white hover:bg-blue-800/50'
                }`}
            >
              <span className="text-lg">🎓</span>
              <span>
                {language === 'fr'
                  ? 'Formations'
                  : language === 'en'
                    ? 'Courses'
                    : 'الدورات'}
              </span>
              {activeTab === 'formations' && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          </div>
        </div>



        {/* Ebooks Grid */}
        {activeTab === 'ebooks' && (
          <>
            {ebooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-blue-900 bg-opacity-30 rounded-xl">
                <FaBook className="text-6xl text-orange-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-3">
                  {language === 'fr'
                    ? 'Aucun eBook pour le moment'
                    : language === 'en'
                      ? 'No eBooks Yet'
                      : 'لا توجد كتب إلكترونية بعد'}
                </h3>
                <p className="text-gray-300 max-w-md">
                  {language === 'fr'
                    ? "Vous n'avez pas encore créé d’eBooks. Commencez à créer pour voir vos œuvres ici !"
                    : language === 'en'
                      ? "You haven't created any eBooks yet. Start creating to see your works here!"
                      : "لم تقم بإنشاء أي كتب إلكترونية بعد. ابدأ الآن لعرض أعمالك هنا!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {ebooks.map((ebook) => (
                  <motion.div
                    key={ebook._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.03 }}
                    className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl overflow-hidden shadow-lg cursor-pointer relative"
                    onClick={() => handleCoverClick(ebook)}
                  >



                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={`${AppURL}${ebook.folderPath}cover.png`}
                        alt="cover"
                        className="w-full h-full object-cover transition-opacity hover:opacity-90"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-cover.png';
                        }}
                      />
                      {ebook.NumPages && (
                        <div className="absolute bottom-2 right-2 bg-orange-400 text-blue-900 px-2 py-1 rounded-full text-xs font-bold">
                          {ebook.NumPages}{" "}
                          {language === 'fr'
                            ? 'pages'
                            : language === 'en'
                              ? 'pages'
                              : 'صفحات'}
                        </div>
                      )}
                    </div>
                    {ebook.promotion && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {language === 'fr'
                          ? 'PROMO'
                          : language === 'en'
                            ? 'PROMO'
                            : 'عرض'}

                      </div>
                    )}



                    {/* Approval Badge */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold flex items-center ${ebook.approved === 'approved'
                      ? 'bg-green-500 text-white'
                      : ebook.approved === 'rejected'
                        ? 'bg-red-500 text-white'
                        : 'bg-yellow-500 text-blue-900'
                      }`}>
                      {ebook.approved === 'approved' ? (
                        <>
                          <FaCheck className="mr-1" />
                          {language === 'fr'
                            ? 'Approuvé'
                            : language === 'en'
                              ? 'Approved'
                              : 'مقبول'}
                        </>
                      ) : ebook.approved === 'rejected' ? (
                        <>
                          <FaTimes className="mr-1" />
                          {language === 'fr'
                            ? 'Rejeté'
                            : language === 'en'
                              ? 'Rejected'
                              : 'مرفوض'}
                        </>
                      ) : (
                        <>
                          <FaClock className="mr-1" />
                          {language === 'fr'
                            ? 'En attente'
                            : language === 'en'
                              ? 'Pending'
                              : 'قيد الانتظار'}
                        </>
                      )}

                    </div>


                    <div className="p-5">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{ebook.titre}</h3>
                      <div className="flex items-center text-blue-200 mb-2">
                        <FaGlobe className="mr-2" />
                        <span>{ebook.langue}</span>
                      </div>
                      <div className="flex items-center text-blue-200 mb-3">
                        <FaTags className="mr-2" />
                        <span>{ebook.categorie}</span>
                      </div>
                      {ebook.prix && (
                        <div className="text-lg font-bold text-orange-400">
                          ${ebook.prix.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

      </div>

      {activeTab === 'formations' && (
        <div className="mt-8">


          {formations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-blue-900 bg-opacity-30 rounded-xl">
              <div className="bg-blue-800 p-4 rounded-full mb-4">
                <FaBook className="text-4xl text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {language === 'fr'
                  ? 'Aucune formation pour le moment'
                  : language === 'en'
                    ? 'No Trainings Yet'
                    : 'لا توجد تدريبات بعد'}
              </h3>
              <p className="text-gray-300 max-w-md">
                {language === 'fr'
                  ? "Vous n'avez pas encore créé de formations. Commencez à créer pour voir vos œuvres ici !"
                  : language === 'en'
                    ? "You haven't created any trainings yet. Start creating to see your works here!"
                    : "لم تقم بإنشاء أي تدريبات بعد. ابدأ الآن لعرض أعمالك هنا!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {formations.map((formation) => (
                <motion.div
                  key={formation._id}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)" }}
                  className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl overflow-hidden shadow-lg cursor-pointer border border-blue-700"
                  onClick={() => handleFormationClick(formation)}
                >

                  <div className="relative h-48 bg-blue-950 overflow-hidden">
                    {formation.coverImage ? (
                      <img
                        src={`${AppURL}${formation.coverImage}`}
                        alt="Cover"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center text-blue-300 italic bg-blue-950">
                        {language === 'fr'
                          ? 'Aucune image de couverture'
                          : language === 'en'
                            ? 'No Cover Image'
                            : 'لا توجد صورة غلاف'}
                      </div>
                    )}

                    {/* Badge d'approbation */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold flex items-center ${formation.approved === 'approved'
                      ? 'bg-green-500 text-white'
                      : formation.approved === 'rejected'
                        ? 'bg-red-500 text-white'
                        : 'bg-yellow-500 text-blue-900'
                      }`}>
                      {formation.approved === 'approved' ? (
                        <>
                          <FaCheck className="mr-1" />
                          {language === 'fr'
                            ? 'Approuvée'
                            : language === 'en'
                              ? 'Approved'
                              : 'مقبولة'}
                        </>
                      ) : formation.approved === 'rejected' ? (
                        <>
                          <FaTimes className="mr-1" />
                          {language === 'fr'
                            ? 'Rejetée'
                            : language === 'en'
                              ? 'Rejected'
                              : 'مرفوضة'}
                        </>
                      ) : (
                        <>
                          <FaClock className="mr-1" />
                          {language === 'fr'
                            ? 'En attente'
                            : language === 'en'
                              ? 'Pending'
                              : 'قيد الانتظار'}
                        </>
                      )}
                    </div>

                    <div className="relative z-20 text-center px-4">
                      <h4 className="text-xl font-bold text-white line-clamp-2">
                        {formation.titreFormation || `${formation.matiere} (${formation.niveau})`}
                      </h4>
                      <span className="inline-block mt-2 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                        {formation.type.toUpperCase()}
                      </span>
                    </div>
                  </div>


                  <div className="p-5">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center text-blue-200 text-sm">
                        <FaBook className="mr-2" />
                        <span>
                          {formation.chapitres.length}{' '}
                          {language === 'fr'
                            ? 'chapitres'
                            : language === 'en'
                              ? 'chapters'
                              : 'فصول'}
                        </span>
                      </div>
                      <div className="text-xs text-blue-300">
                        {new Date(formation.createdAt).toLocaleDateString()}
                      </div>

                    </div>


                    <div className="flex flex-wrap gap-2 mb-4">
                      {formation.matiere && (
                        <span className="px-2 py-1 bg-blue-700 text-blue-100 text-xs rounded-full">
                          {formation.matiere}
                        </span>
                      )}
                      {formation.niveau && (
                        <span className="px-2 py-1 bg-blue-700 text-blue-100 text-xs rounded-full">
                          {formation.niveau}
                        </span>
                      )}
                      {formation.pays && (
                        <span className="px-2 py-1 bg-blue-700 text-blue-100 text-xs rounded-full">
                          {formation.pays}
                        </span>
                      )}
                    </div>

                    {formation.prix && (
                      <div className="mt-3">
                        <div className="text-lg font-bold text-orange-400">
                          ${formation.prix.toFixed(2)}
                          {formation.promotion && formation.newPrix && (
                            <span className="ml-2 text-white line-through">${formation.newPrix.toFixed(2)}</span>
                          )}
                        </div>


                      </div>
                    )}

                    <div className="flex items-center text-orange-400 text-sm">
                      <FaInfoCircle className="mr-2" />
                      <span>
                        {language === 'fr'
                          ? 'Cliquez pour voir les détails'
                          : language === 'en'
                            ? 'Click to view details'
                            : 'انقر لعرض التفاصيل'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Formation Details Modal */}
      <AnimatePresence>
        {selectedFormation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
            onClick={closeFormationModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl w-full max-h-[90vh] overflow-y-auto flex flex-col border border-blue-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-blue-900/90 backdrop-blur-sm p-5 border-b border-blue-700 z-10 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-orange-400">
                    {selectedFormation.titreFormation || `${selectedFormation.matiere} (${selectedFormation.niveau})`}
                  </h3>

                  <div className="flex items-center mt-1 flex-wrap gap-3 text-sm text-blue-300">
                    <span>Type: {selectedFormation.type}</span>
                    <span>•</span>
                    <span>
                      {language === 'fr'
                        ? `Créée le : ${new Date(selectedFormation.createdAt).toLocaleDateString()}`
                        : language === 'en'
                          ? `Created: ${new Date(selectedFormation.createdAt).toLocaleDateString()}`
                          : `تم الإنشاء في: ${new Date(selectedFormation.createdAt).toLocaleDateString()}`}
                    </span>

                    {/* Badge d'approbation */}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${selectedFormation.approved === 'approved'
                        ? 'bg-green-500 text-white'
                        : selectedFormation.approved === 'rejected'
                          ? 'bg-red-500 text-white'
                          : 'bg-yellow-500 text-blue-900'
                        }`}
                    >
                      {selectedFormation.approved === 'approved'
                        ? 'Approved'
                        : selectedFormation.approved === 'rejected'
                          ? 'Rejected'
                          : 'Pending'}
                    </span>

                    {/* Bouton Note si rejetée + note présente */}
                    {selectedFormation.approved === 'rejected' && selectedFormation.rejectionNote && (
                      <button
                        onClick={() => alert(`📝 Note de rejet : ${selectedFormation.rejectionNote}`)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1 rounded-full"
                      >
                        {language === 'fr'
                          ? '📝 Voir la note'
                          : language === 'en'
                            ? '📝 View Note'
                            : '📝 عرض الملاحظة'}
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={closeFormationModal}
                  className="text-white hover:text-orange-400 p-1 rounded-full transition"
                >
                  <FaTimes size={24} />
                </button>
              </div>


              {/* Modal Content */}
              <div className="flex flex-col lg:flex-row p-6 text-white">
                {/* Left Column - Metadata */}
                <div className="w-full lg:w-1/3 pr-0 lg:pr-6 space-y-6">
                  {/* Metadata Section */}
                  <div className="bg-blue-800/50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-orange-300 mb-3">
                      {language === 'fr'
                        ? 'Détails'
                        : language === 'en'
                          ? 'Details'
                          : 'تفاصيل'}
                    </h4>
                    {selectedFormation.type === 'scolaire' ? (
                      <>
                        <div className="mb-3">
                          <h5 className="text-sm font-semibold text-blue-200 mb-1">
                            {language === 'fr'
                              ? 'Sujet'
                              : language === 'en'
                                ? 'Subject'
                                : 'الموضوع'}
                          </h5>
                          <p>{selectedFormation.matiere || "N/A"}</p>
                        </div>
                        <div className="mb-3">
                          <h5 className="text-sm font-semibold text-blue-200 mb-1">
                            {language === 'fr'
                              ? 'Niveau'
                              : language === 'en'
                                ? 'Level'
                                : 'المستوى'}
                          </h5>
                          <p>{selectedFormation.niveau || "N/A"}</p>
                        </div>
                        <div className="mb-3">
                          <h5 className="text-sm font-semibold text-blue-200 mb-1">
                            {language === 'fr'
                              ? 'Sous-niveau'
                              : language === 'en'
                                ? 'Sub-level'
                                : 'المستوى الفرعي'}
                          </h5>
                          <p>{selectedFormation.sousNiveau || "N/A"}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold text-blue-200 mb-1">
                            {language === 'fr'
                              ? 'Pays'
                              : language === 'en'
                                ? 'Country'
                                : 'البلد'}
                          </h5>
                          <p>{selectedFormation.pays || "N/A"}</p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <h5 className="text-sm font-semibold text-blue-200 mb-1">
                          {language === 'fr'
                            ? 'Catégorie'
                            : language === 'en'
                              ? 'Category'
                              : 'الفئة'}
                        </h5>
                        <p>{selectedFormation.categorie || "N/A"}</p>
                      </div>
                    )}

                    {/* Prix et options d'investissement */}
                    <div className="mt-4 pt-4 border-t border-blue-700">
                      {selectedFormation.prix && (
                        <div className="mb-3">
                          <h5 className="text-sm font-semibold text-blue-200 mb-1">
                            {language === 'fr'
                              ? 'Prix'
                              : language === 'en'
                                ? 'Price'
                                : 'السعر'}
                          </h5>
                          <div className="flex items-center">
                            <span className={`font-bold ${selectedFormation.promotion ? 'text-orange-400' : 'text-white'
                              }`}>
                              ${selectedFormation.prix.toFixed(2)}
                            </span>
                            {selectedFormation.promotion && selectedFormation.newPrix && (
                              <>
                                <span className="mx-2 text-blue-300">→</span>
                                <span className="font-bold text-orange-500">
                                  ${selectedFormation.newPrix.toFixed(2)}
                                </span>
                                <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                                  {language === 'fr'
                                    ? 'PROMO'
                                    : language === 'en'
                                      ? 'PROMO'
                                      : 'عرض'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedFormation.investmentOptions && (
                        <div className="mb-3">
                          <h5 className="text-sm font-semibold text-blue-200 mb-1">
                            {language === 'fr'
                              ? "Options d'investissement"
                              : language === 'en'
                                ? 'Investment Options'
                                : 'خيارات الاستثمار'}
                          </h5>

                          <div className="flex flex-wrap gap-2">
                            {selectedFormation.investmentOptions.affiliation && (
                              <span className="bg-blue-700 text-blue-100 text-xs px-2 py-1 rounded-full">
                                {language === 'fr' ? 'Affiliation' : language === 'en' ? 'Affiliation' : 'الانتماء'}
                              </span>
                            )}
                            {selectedFormation.investmentOptions.codePromo && (
                              <span className="bg-blue-700 text-blue-100 text-xs px-2 py-1 rounded-full">
                                {language === 'fr' ? 'Code Promo' : language === 'en' ? 'Promo Code' : 'رمز الترويج'}
                              </span>
                            )}
                            {selectedFormation.investmentOptions.licence && (
                              <span className="bg-blue-700 text-blue-100 text-xs px-2 py-1 rounded-full">
                                {language === 'fr' ? 'Licence' : language === 'en' ? 'Licence' : 'رخصة'}
                              </span>
                            )}
                            {selectedFormation.investmentOptions.sponsoring && (
                              <span className="bg-blue-700 text-blue-100 text-xs px-2 py-1 rounded-full">
                                {language === 'fr' ? 'Sponsoring' : language === 'en' ? 'Sponsoring' : 'رعاية'}
                              </span>
                            )}
                          </div>

                        </div>
                      )}



                      {/* Formulaire de promotion */}
                      {!selectedFormation.promotion && (
                        <>
                          <button
                            onClick={() => setShowFormationPromotionForm(!showFormationPromotionForm)}
                            className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${showFormationPromotionForm
                              ? 'bg-blue-700 text-white'
                              : 'bg-gradient-to-r from-purple-600 to-blue-700 text-white'
                              }`}
                          >
                            <FaTags />
                            {showFormationPromotionForm
                              ? language === 'fr'
                                ? 'Annuler la promotion'
                                : language === 'en'
                                  ? 'Cancel Promotion'
                                  : 'إلغاء العرض'
                              : language === 'fr'
                                ? 'Appliquer la promotion'
                                : language === 'en'
                                  ? 'Apply Promotion'
                                  : 'تطبيق العرض'}
                          </button>

                          {showFormationPromotionForm && (
                            <div className="mt-4 p-4 bg-blue-900/50 rounded-lg">
                              <label className="block text-sm font-semibold text-blue-200 mb-2">
                                {language === 'fr'
                                  ? 'Sélectionnez le pourcentage :'
                                  : language === 'en'
                                    ? 'Select percentage:'
                                    : 'اختر النسبة المئوية:'}
                              </label>
                              <select
                                value={selectedFormationPercent ?? ""}
                                onChange={(e) => {
                                  const percent = parseInt(e.target.value);
                                  setSelectedFormationPercent(percent);
                                  if (selectedFormation.prix) {
                                    const nouveau = selectedFormation.prix * (1 - percent / 100);
                                    setNouveauFormationPrix(parseFloat(nouveau.toFixed(2)));
                                  }
                                }}
                                className="w-full p-2 rounded-lg bg-blue-800 text-white border border-blue-600 mb-3"
                              >
                                <option value="">
                                  {language === 'fr'
                                    ? '-- Sélectionnez un pourcentage --'
                                    : language === 'en'
                                      ? '-- Select percentage --'
                                      : '-- اختر النسبة المئوية --'}
                                </option>
                                {[5, 10, 15, 20, 25, 30].map(p => (
                                  <option key={p} value={p}>{p}%</option>
                                ))}
                              </select>

                              {nouveauFormationPrix > 0 && (
                                <div className="text-sm text-blue-200 mb-3">
                                  <span>
                                    {language === 'fr'
                                      ? 'Nouveau prix : '
                                      : language === 'en'
                                        ? 'New price: '
                                        : 'السعر الجديد: '}
                                    <span className="text-orange-400 font-bold">${nouveauFormationPrix.toFixed(2)}</span>
                                  </span>
                                </div>
                              )}

                              <button
                                onClick={handleFormationPromotionSubmit}
                                disabled={!selectedFormationPercent}
                                className={`w-full py-2 rounded-lg font-bold ${selectedFormationPercent
                                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                  : 'bg-gray-600 cursor-not-allowed text-gray-300'
                                  }`}
                              >
                                {language === 'fr'
                                  ? 'Confirmer la promotion'
                                  : language === 'en'
                                    ? 'Confirm Promotion'
                                    : 'تأكيد العرض'}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Author Section */}
                  {selectedFormation.auteur && (
                    <div className="bg-blue-800/30 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-orange-300 mb-3">Author</h4>
                      <div className="flex items-center">
                        <div className="bg-blue-700 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                          <span className="font-bold">
                            {selectedFormation.auteur.prenom.charAt(0)}{selectedFormation.auteur.nom.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {selectedFormation.auteur.prenom} {selectedFormation.auteur.nom}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chapters List */}
                  <div>
                    <h4 className="text-lg font-semibold text-orange-300 mb-3">
                      {language === 'fr'
                        ? `Chapitres (${selectedFormation.chapitres.length})`
                        : language === 'en'
                          ? `Chapters (${selectedFormation.chapitres.length})`
                          : `الفصول (${selectedFormation.chapitres.length})`}
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                      {selectedFormation.chapitres.map((chap, chapIndex) => (
                        <div key={chapIndex} className="bg-blue-800/40 p-3 rounded-lg">
                          {/* Chapitre principal */}
                          <div
                            onClick={() => setExpandedChapters(prev => ({
                              ...prev,
                              [chapIndex]: !prev[chapIndex]
                            }))}
                            className="flex items-center cursor-pointer"
                          >
                            <div className="text-sm font-bold bg-blue-700 text-blue-200 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                              {chapIndex + 1}
                            </div>
                            <h5 className="font-medium">{chap.titre}</h5>
                          </div>

                          {/* Sous-chapitres */}
                          {expandedChapters[chapIndex] && chap.sousChapitres && (
                            <div className="mt-2 space-y-1 pl-8">
                              {chap.sousChapitres.map((sous, sousIndex) => (
                                <div
                                  key={sousIndex}
                                  onClick={() => {
                                    setSelectedChapter(chapIndex);
                                    setSelectedSousChapitre(sousIndex);
                                  }}
                                  className={`text-sm p-2 rounded cursor-pointer ${selectedChapter === chapIndex && selectedSousChapitre === sousIndex ? 'bg-orange-500/20 border border-orange-500/50' : 'hover:bg-blue-700/40'}`}
                                >
                                  {sous.titre}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Column - Chapter Content */}
                <div className="w-full lg:w-2/3 p-6 overflow-y-auto">
                  {(selectedChapter !== null && selectedSousChapitre !== null) ? (
                    <div className="bg-blue-800/30 rounded-lg p-6 h-full">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-bold text-orange-400">
                          {selectedFormation.chapitres[selectedChapter].sousChapitres[selectedSousChapitre].titre}
                        </h4>
                        <button
                          onClick={() => setSelectedSousChapitre(null)}
                          className="text-blue-300 hover:text-white"
                        >
                          <FaTimes />
                        </button>
                      </div>

                      {/* Vidéo en haut */}
                      {selectedFormation.chapitres[selectedChapter].sousChapitres[selectedSousChapitre].video && (
                        <div className="w-full mb-6">
                          <video
                            controls
                            src={`${AppURL}${selectedFormation.chapitres[selectedChapter].sousChapitres[selectedSousChapitre].video}`}
                            className="w-full rounded-lg border border-blue-700"
                            poster="/placeholder-video.png"
                          >
                            {language === 'fr'
                              ? "Votre navigateur ne supporte pas la balise vidéo."
                              : language === 'en'
                                ? "Your browser does not support the video tag."
                                : "متصفحك لا يدعم وسم الفيديو."}
                          </video>
                        </div>
                      )}

                      {/* Texte en dessous */}
                      {selectedFormation.chapitres[selectedChapter].sousChapitres[selectedSousChapitre].content && (
                        <div className="w-full">
                          <div
                            className="prose prose-invert max-w-none text-blue-200 mb-4"
                            dangerouslySetInnerHTML={{
                              __html: renderContentWithImages(
                                selectedFormation.chapitres[selectedChapter].sousChapitres[selectedSousChapitre].content,
                                selectedChapter,
                                selectedSousChapitre,
                                selectedFormation
                              ),
                            }}
                          />
                        </div>
                      )}

                      
                    </div>
                  ) : (
                    <div className="bg-blue-900/20 rounded-lg p-8 flex flex-col items-center justify-center h-full min-h-64 text-center">
                      <FaInfoCircle className="text-4xl text-blue-400 mb-4" />
                      <h4 className="text-xl font-semibold text-blue-200 mb-2">
                        {language === 'fr'
                          ? 'Sélectionnez un sous-chapitre'
                          : language === 'en'
                            ? 'Select a sub-chapter'
                            : 'اختر جزءًا فرعيًا'}
                      </h4>
                      <p className="text-blue-300 max-w-md">
                        {language === 'fr'
                          ? "Cliquez sur un sous-chapitre pour voir son contenu ici"
                          : language === 'en'
                            ? 'Click on a sub-chapter to view its content here'
                            : 'انقر على جزء فرعي لعرض محتواه هنا'}
                      </p>
                    </div>
                  )}
                </div>


              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-blue-900/90 backdrop-blur-sm p-4 border-t border-blue-700 flex flex-wrap md:flex-nowrap justify-between items-center gap-3">
                {/* Supprimer */}
                <button
                  onClick={handleDeleteFormation}
                  disabled={selectedFormation.approved === 'approved'}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2
    ${selectedFormation.approved === 'approved'
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'}
  `}
                >
                  <FaTimes />
                  {language === 'fr'
                    ? 'Supprimer'
                    : language === 'en'
                      ? 'Delete'
                      : 'حذف'}
                </button>


                {/* Mettre à jour (affiché uniquement si non approuvée) */}
                {selectedFormation.approved !== 'approved' && (
                  <button
                    onClick={() => {
                      closeFormationModal();
                      navigate('/StudioFormation', {
                        state: { isEditing: true, formationData: selectedFormation }
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {language === 'fr'
                      ? '🛠️ Modifier'
                      : language === 'en'
                        ? '🛠️ Edit'
                        : '🛠️ تعديل'}
                  </button>
                )}

                {/* Fermer */}
                <button
                  onClick={closeFormationModal}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium"
                >
                  {language === 'fr'
                    ? 'Fermer'
                    : language === 'en'
                      ? 'Close'
                      : 'إغلاق'}
                </button>
              </div>



            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>




      {/* Ebook Modal - Mobile Optimized */}
      <AnimatePresence>
        {selectedEbook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-start z-50 p-4 pt-10"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl w-full h-full overflow-y-auto flex flex-col border border-blue-700 shadow-2xl scrollbar-thin scrollbar-thumb-orange-400"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-5 border-b border-blue-700">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h3 className="text-2xl font-bold text-orange-400">
                    {selectedEbook.titre}
                  </h3>

                  {/* Badge de statut */}
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${selectedEbook.approved === 'approved'
                    ? 'bg-green-500 text-white'
                    : selectedEbook.approved === 'rejected'
                      ? 'bg-red-500 text-white'
                      : 'bg-yellow-400 text-blue-900'
                    }`}>
                    {selectedEbook.approved === 'approved'
                      ? language === 'fr'
                        ? 'Approuvé'
                        : language === 'en'
                          ? 'Approved'
                          : 'مقبول'
                      : selectedEbook.approved === 'rejected'
                        ? language === 'fr'
                          ? 'Rejeté'
                          : language === 'en'
                            ? 'Rejected'
                            : 'مرفوض'
                        : language === 'fr'
                          ? 'En attente'
                          : language === 'en'
                            ? 'Pending'
                            : 'قيد الانتظار'}

                  </span>

                  {/* Bouton Voir Note */}
                  {selectedEbook.approved === 'rejected' && selectedEbook.rejectionNote && (
                    <button
                      onClick={() => alert(`📝 Note de rejet : ${selectedEbook.rejectionNote}`)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1 rounded-full"
                    >
                      {language === 'fr'
                        ? '📝 Voir la note'
                        : language === 'en'
                          ? '📝 View Note'
                          : '📝 عرض الملاحظة'}
                    </button>
                  )}
                </div>

                <button
                  onClick={closeModal}
                  className="text-white hover:text-orange-400 p-1 rounded-full transition"
                >
                  <FaTimes size={24} />
                </button>
              </div>



              {!showPages && (
                <div className="flex flex-col md:flex-row w-full h-full">
                  <div className="w-full md:w-1/2 p-6 space-y-3 text-white overflow-y-auto">
                    <h3 className="text-2xl font-bold text-orange-400">{selectedEbook.titre}</h3>
                    <p>
                      <strong>{language === 'fr' ? 'Langue :' : language === 'en' ? 'Language:' : 'اللغة :'}</strong> {selectedEbook.langue}
                    </p>
                    <p>
                      <strong>{language === 'fr' ? 'Catégorie :' : language === 'en' ? 'Category:' : 'الفئة :'}</strong> {selectedEbook.categorie}
                    </p>
                    <p>
                      <strong>{language === 'fr' ? 'Pages :' : language === 'en' ? 'Pages:' : 'الصفحات :'}</strong> {selectedEbook.NumPages || 0}
                    </p>
                    <p>
                      <strong>{language === 'fr' ? 'Créé le :' : language === 'en' ? 'Created on:' : 'تم الإنشاء في :'}</strong> {new Date(selectedEbook.createdAt || '').toLocaleDateString()}
                    </p>
                    <p>
                      <strong>{language === 'fr' ? 'Statut :' : language === 'en' ? 'Status:' : 'الحالة :'}</strong>{' '}
                      {selectedEbook.approved === 'true'
                        ? language === 'fr'
                          ? 'Approuvé'
                          : language === 'en'
                            ? 'Approved'
                            : 'مقبول'
                        : selectedEbook.approved === 'false'
                          ? language === 'fr'
                            ? 'Rejeté'
                            : language === 'en'
                              ? 'Rejected'
                              : 'مرفوض'
                          : language === 'fr'
                            ? 'En attente'
                            : language === 'en'
                              ? 'Pending'
                              : 'قيد الانتظار'}
                    </p>
                    <p>
                      <strong>{language === 'fr' ? 'Description :' : language === 'en' ? 'Description:' : 'الوصف :'}</strong> {selectedEbook.description || (language === 'fr' ? 'Aucune' : language === 'en' ? 'None' : 'لا يوجد')}
                    </p>
                    <p>
                      <strong>{language === 'fr' ? 'Prix :' : language === 'en' ? 'Price:' : 'السعر :'}</strong>{' '}
                      ${selectedEbook.prix?.toFixed(2)}{' '}
                      {selectedEbook.promotion && selectedEbook.newPrix
                        ? language === 'fr'
                          ? ` → ${selectedEbook.newPrix.toFixed(2)} $`
                          : language === 'en'
                            ? ` → ${selectedEbook.newPrix.toFixed(2)} $`
                            : ` → ${selectedEbook.newPrix.toFixed(2)} $`
                        : ''}
                    </p>
                    <div>
                      <strong>{language === 'fr' ? "Options d'investissement :" : language === 'en' ? 'Investment Options:' : 'خيارات الاستثمار :'}</strong>
                      <ul className="list-disc list-inside">
                        {Object.entries(selectedEbook.investmentOptions || {}).map(([key, value]) => (
                          <li key={key}>{key} : {value ? '✔️' : '❌'}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 pt-6">


                      {/* Bouton Afficher promotion */}
                      <button
                        onClick={() => !selectedEbook?.promotion && setShowPromotionForm(!showPromotionForm)}
                        disabled={selectedEbook?.promotion}
                        className={`px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 transition transform ${selectedEbook?.promotion
                          ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-700 hover:to-blue-800 text-white hover:scale-105'
                          }`}
                      >
                        <FaTags />
                        {selectedEbook?.promotion
                          ? language === 'fr'
                            ? 'Déjà en promotion'
                            : language === 'en'
                              ? 'Already on promotion'
                              : 'مُفعّلة بالفعل'
                          : showPromotionForm
                            ? language === 'fr'
                              ? 'Fermer la promotion'
                              : language === 'en'
                                ? 'Close promotion'
                                : 'إغلاق العرض'
                            : language === 'fr'
                              ? 'Appliquer une promotion'
                              : language === 'en'
                                ? 'Apply promotion'
                                : 'تطبيق العرض'}
                      </button>
                    </div>

                    {/* Formulaire de promotion conditionnel */}
                    {showPromotionForm && (
                      <div className="w-full mt-4 p-5 bg-blue-900 border border-blue-700 rounded-xl shadow-md flex flex-col gap-3">
                        <label className="text-white font-medium">
                          {language === 'fr'
                            ? 'Choisir un pourcentage :'
                            : language === 'en'
                              ? 'Choose a percentage:'
                              : 'اختر النسبة المئوية :'}
                        </label>
                        <select
                          value={selectedPercent ?? ""}
                          onChange={(e) => {
                            const percent = parseInt(e.target.value);
                            setSelectedPercent(percent);
                            if (selectedEbook?.prix) {
                              const nouveau = selectedEbook.prix * (1 - percent / 100);
                              setNouveauPrix(parseFloat(nouveau.toFixed(2)));
                            }
                          }}
                          className="p-3 rounded-lg bg-blue-800 text-white border border-blue-600 focus:outline-none"
                        >
                          <option value="">
                            {language === 'fr'
                              ? '-- % de réduction --'
                              : language === 'en'
                                ? '-- Discount % --'
                                : '-- نسبة الخصم --'}
                          </option>
                          {[5, 10, 15, 20, 25, 30].map(p => (
                            <option key={p} value={p}>{p}%</option>
                          ))}
                        </select>

                        {nouveauPrix > 0 && (
                          <p className="text-green-300 text-sm">
                            <span>
                              {language === 'fr'
                                ? 'Nouveau prix estimé : '
                                : language === 'en'
                                  ? 'New estimated price: '
                                  : 'السعر التقديري الجديد: '}
                              <span className="text-orange-400 font-bold">${nouveauPrix}</span>
                            </span>
                          </p>
                        )}

                        <button
                          onClick={handlePromotionSubmit}
                          disabled={!selectedPercent}
                          className={`py-3 px-5 rounded-xl font-bold transition text-white ${selectedPercent
                            ? 'bg-orange-500 hover:bg-orange-600'
                            : 'bg-gray-600 cursor-not-allowed'
                            }`}
                        >
                          {language === 'fr'
                            ? 'Valider la promotion'
                            : language === 'en'
                              ? 'Validate Promotion'
                              : 'تأكيد العرض'}
                        </button>
                      </div>
                    )}


                  </div>

                  <div className="w-full md:w-1/2 bg-blue-800 flex justify-center items-center p-6">
                    <img
                      src={`${AppURL}${selectedEbook.folderPath}cover.png`}
                      alt="cover"
                      className="w-auto max-h-full rounded shadow-md cursor-pointer hover:opacity-80"
                      onClick={() => setShowPages(true)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-cover.png';
                      }}
                    />
                  </div>
                </div>
              )}




              {/* Modal Content */}
              {pagesLoading ? (
                <div className="flex-1 flex justify-center items-center p-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400"></div>
                </div>
              ) : pages.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center p-10 text-center bg-blue-900 bg-opacity-30">
                  <FaBook className="text-5xl text-orange-400 mb-6" />
                  <h4 className="text-xl font-bold text-white mb-2">
                    {language === 'fr'
                      ? 'Aucune page trouvée'
                      : language === 'en'
                        ? 'No Pages Found'
                        : 'لم يتم العثور على صفحات'}
                  </h4>
                  <p className="text-blue-200 max-w-md">
                    {language === 'fr'
                      ? "Cet eBook n'a pas encore de pages."
                      : language === 'en'
                        ? "This eBook doesn't have any pages yet."
                        : "هذا الكتاب الإلكتروني لا يحتوي على صفحات بعد."}
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-hidden relative">
                  {/* Mobile Touch Controls */}
                  <div
                    className="absolute inset-0 z-0"
                    onTouchStart={(e) => {
                      const touchX = e.touches[0].clientX;
                      const handleTouchEnd = (e: TouchEvent) => {
                        const endX = e.changedTouches[0].clientX;
                        if (touchX - endX > 50) nextPage(); // Swipe left
                        if (endX - touchX > 50) prevPage(); // Swipe right
                        document.removeEventListener('touchend', handleTouchEnd);
                      };
                      document.addEventListener('touchend', handleTouchEnd);
                    }}
                  />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPage}
                      initial={{ x: 0, opacity: 1 }}
                      exit={{ x: currentPage < pages.length - 1 ? -100 : 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full flex justify-center items-center"
                    >
                      <img
                        src={pages[currentPage]}
                        alt={`Page ${currentPage + 1}`}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-page.png';
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>

                  <button
                    onClick={() => setShowPages(false)}
                    className="absolute top-4 right-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow-md z-20"
                  >
                    {language === 'fr'
                      ? 'Retour aux détails'
                      : language === 'en'
                        ? 'Back to details'
                        : 'العودة إلى التفاصيل'}
                  </button>


                  {pages.length > 1 && (
                    <>
                      {currentPage > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); prevPage(); }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-blue-800 p-3 rounded-full shadow-md hover:bg-orange-400 transition text-white z-10"
                        >
                          <FaArrowLeft />
                        </button>
                      )}
                      {currentPage < pages.length - 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); nextPage(); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-800 p-3 rounded-full shadow-md hover:bg-orange-400 transition text-white z-10"
                        >
                          <FaArrowRight />
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Modal Footer */}
              <div className="sticky bottom-0 border-t border-blue-700 p-4 bg-blue-900 bg-opacity-50 flex flex-wrap md:flex-nowrap justify-between items-center gap-3 z-20">
                {/* Bouton Supprimer */}
                <button
                  onClick={handleDelete}
                  disabled={selectedEbook.approved === 'approved'}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2
      ${selectedEbook.approved === 'approved'
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'}
    `}
                >
                  <FaTimes />
                  {language === 'fr' ? 'Supprimer' : language === 'en' ? 'Delete' : 'حذف'}
                </button>

                {/* Bouton Fermer */}
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2"
                >
                  {language === 'fr' ? 'Fermer' : language === 'en' ? 'Close' : 'إغلاق'}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}