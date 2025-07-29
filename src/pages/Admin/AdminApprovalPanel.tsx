// AdminApprovalPanel.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import AppURL from "../../components/AppUrl";
import {
    FaCheck,
    FaTimes,
    FaTags,
    FaInfoCircle,
    FaUser,
    FaFileAlt,
    FaLanguage,
    FaMoneyBillWave,
    FaCalendarAlt,
    FaBook,
    FaArrowLeft,
    FaArrowRight,
    FaGlobe,
    FaClock
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

interface Auteur {
    nom: string;
    prenom: string;
}

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


interface Ebook {
    _id: string;
    titre: string;
    langue: string;
    categorie: string;
    folderPath: string;
    createdAt: string;
    approved?: string;
    ebookId: string;
    description?: string;
    prix?: number;
    NumPages?: number;
    coverImage?: string;
    promotion?: boolean;
    newPrix?: number;
    auteur?: Auteur;
}

interface Formation {
    _id: string;
    titreFormation: string;
    type: string;
    matiere?: string;
    pays?: string;
    niveau?: string;
    sousNiveau?: string;
    categorie?: string;
    createdAt: string;
    approved?: string;
    coverImage?: string;
    prix?: number;
    newPrix?: number;
    promotion?: boolean;
    auteur?: Auteur;
    chapitres: Chapitre[];
}

type Language = 'fr' | 'en' | 'ar';
export default function AdminApprovalPanel() {
    const { user } = useAuth();
    const language: Language = ['fr', 'en', 'ar'].includes(user?.langue as string) ? (user?.langue as Language) : 'fr';
    const [ebooks, setEbooks] = useState<Ebook[]>([]);
    const [formations, setFormations] = useState<Formation[]>([]);
    const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
    const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
    const [rejectionNote, setRejectionNote] = useState<Record<string, string>>({});
    const [pages, setPages] = useState<string[]>([]);
    const [, setCurrentPage] = useState(0);
    const [activeTab, setActiveTab] = useState<'ebooks' | 'formations'>('ebooks');
    const [isLoading, setIsLoading] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState<{ index: number, url: string } | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [selectedSousChapitre, setSelectedSousChapitre] = useState<number | null>(null);


    useEffect(() => {
        const fetchAll = async () => {
            setIsLoading(true);
            try {
                const [ebookRes, formationRes] = await Promise.all([
                    axios.get(`${AppURL}/api/Collectionebooks/getnonAppovedEbooks`),
                    axios.get(`${AppURL}/api/StudioFormationRoutes/getnonAppovedFormations`)
                ]);
                setEbooks(ebookRes.data);
                setFormations(formationRes.data);
            } catch (err) {
                toast.error("Erreur lors du chargement des données.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, []);

    const handleApproval = async (id: string, type: 'ebook' | 'formation', status: 'approved' | 'rejected') => {
        try {
            const payload: any = { approved: status };
            if (status === 'rejected') payload.rejectionNote = rejectionNote[id] || '';
            await axios.put(`${AppURL}/api/${type === 'ebook' ? 'Collectionebooks' : 'StudioFormationRoutes'}/approve/${id}`, payload);
            toast.success(`Élément ${status === 'approved' ? 'approuvé' : 'refusé'} avec succès`);
            if (type === 'ebook') setEbooks(prev => prev.filter(e => e._id !== id));
            else setFormations(prev => prev.filter(f => f._id !== id));
            setSelectedEbook(null);
            setSelectedFormation(null);
        } catch {
            toast.error("Erreur lors du traitement");
        }
    };

    const fetchEbookPages = async (ebook: Ebook) => {
        setSelectedEbook(ebook);
        try {
            const res = await axios.get(`${AppURL}/api/Collectionebooks/pages/${ebook._id}`);
            setPages(res.data.pages.map((p: string) => {
                return p.startsWith('http') ? p : `${AppURL}/${p.replace(/^\//, '')}`;
            }));
            setCurrentPage(0);
        } catch (err) {
            console.error('Error fetching pages:', err);
            toast.error("Impossible de charger les pages du livre.");
        }
    };

    const handleImageClick = (index: number) => {
        setFullscreenImage({ index, url: pages[index] });
    };

    function renderContentWithImages(content: string, _chapIndex: number, _subChapIndex: number, formation: Formation) {
        return content.replace(/\[image:image-(\d+)-(\d+)-(\d+)\]/g, (_, chap, sousChap, imgIndex) => {
            const chapter = formation.chapitres?.[parseInt(chap)];
            const sousChapitres = chapter?.sousChapitres?.[parseInt(sousChap)];
            const img = sousChapitres?.images?.[parseInt(imgIndex)];

            if (!img) return '';

            const src = img.startsWith('http') ? img : `${AppURL}${img}`;

            return `<div class="my-4 flex justify-center">
              <img src="${src}" class="max-w-[80%] h-auto max-h-48 rounded-lg shadow-md border border-gray-500" />
            </div>`;
        });
    }


    const renderApprovalActions = (id: string, type: 'ebook' | 'formation') => (
        <div className="mt-6 p-4 bg-blue-800/30 rounded-lg">
            <h4 className="text-lg font-semibold mb-3 text-orange-300 mt">
                {language === 'fr'
                    ? 'Actions de modération'
                    : language === 'en'
                        ? 'Moderation Actions'
                        : 'إجراءات الإشراف'}
            </h4>
            <textarea
                placeholder="Raison du refus (optionnel)"
                className="w-full p-3 rounded-lg bg-blue-900/50 text-white border border-blue-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                value={rejectionNote[id] || ''}
                onChange={(e) => setRejectionNote(prev => ({ ...prev, [id]: e.target.value }))}
                rows={3}
            />
            <div className="flex gap-4 mt-4 justify-end">
                <button
                    onClick={() => handleApproval(id, type, 'rejected')}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-medium transition-colors"
                >
                    <FaTimes />
                    {language === 'fr'
                        ? 'Refuser'
                        : language === 'en'
                            ? 'Reject'
                            : 'رفض'}

                </button>
                <button
                    onClick={() => handleApproval(id, type, 'approved')}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg font-medium transition-colors"
                >
                    <FaCheck />
                    {language === 'fr'
                        ? 'Approuver'
                        : language === 'en'
                            ? 'Approve'
                            : 'قبول'}

                </button>
            </div>
        </div>
    );

    const renderEbookCard = (e: Ebook) => (
        <motion.div
            key={e._id}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl overflow-hidden shadow-lg cursor-pointer relative"
            onClick={() => fetchEbookPages(e)}
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={`${AppURL}${e.folderPath}/cover.png`}
                    className="w-full h-full object-cover transition-opacity hover:opacity-90"
                    alt="cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-cover.png';
                    }}
                />
                {e.NumPages && (
                    <div className="absolute bottom-2 right-2 bg-orange-400 text-blue-900 px-2 py-1 rounded-full text-xs font-bold">
                        {e.NumPages}{' '}
                        {language === 'fr'
                            ? 'pages'
                            : language === 'en'
                                ? 'pages'
                                : 'صفحات'}
                    </div>
                )}
            </div>

            <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold flex items-center ${e.approved === 'approved'
                ? 'bg-green-500 text-white'
                : e.approved === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-yellow-500 text-blue-900'
                }`}>
                {e.approved === 'approved' ? (
                    <>
                        <FaCheck className="mr-1" />
                        {language === 'fr' ? 'Approuvé' : language === 'en' ? 'Approved' : 'مقبول'}
                    </>
                ) : e.approved === 'rejected' ? (
                    <>
                        <FaTimes className="mr-1" />
                        {language === 'fr' ? 'Rejeté' : language === 'en' ? 'Rejected' : 'مرفوض'}
                    </>
                ) : (
                    <>
                        <FaClock className="mr-1" />
                        {language === 'fr' ? 'En attente' : language === 'en' ? 'Pending' : 'قيد الانتظار'}
                    </>
                )}

            </div>

            <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{e.titre}</h3>
                <div className="flex items-center text-blue-200 mb-2">
                    <FaGlobe className="mr-2" />
                    <span>{e.langue}</span>
                </div>
                <div className="flex items-center text-blue-200 mb-3">
                    <FaTags className="mr-2" />
                    <span>{e.categorie}</span>
                </div>
                {e.prix && (
                    <div className="text-lg font-bold text-orange-400">
                        ${e.prix.toFixed(2)}
                    </div>
                )}
            </div>
        </motion.div>
    );

    const renderFormationCard = (f: Formation) => (
        <motion.div
            key={f._id}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl overflow-hidden shadow-lg cursor-pointer relative"
            onClick={() => setSelectedFormation(f)}
        >
            <div className="relative h-48 bg-blue-950 overflow-hidden">
                {f.coverImage ? (
                    <img
                        src={`${AppURL}${f.coverImage}`}
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

                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold flex items-center ${f.approved === 'approved'
                    ? 'bg-green-500 text-white'
                    : f.approved === 'rejected'
                        ? 'bg-red-500 text-white'
                        : 'bg-yellow-500 text-blue-900'
                    }`}>
                    {f.approved === 'approved' ? (
                        <>
                            <FaCheck className="mr-1" />
                            {language === 'fr' ? 'Approuvée' : language === 'en' ? 'Approved' : 'مقبولة'}
                        </>
                    ) : f.approved === 'rejected' ? (
                        <>
                            <FaTimes className="mr-1" />
                            {language === 'fr' ? 'Rejetée' : language === 'en' ? 'Rejected' : 'مرفوضة'}
                        </>
                    ) : (
                        <>
                            <FaClock className="mr-1" />
                            {language === 'fr' ? 'En attente' : language === 'en' ? 'Pending' : 'قيد الانتظار'}
                        </>
                    )}

                </div>


                <div className="relative z-20 text-center px-4">
                    <h4 className="text-xl font-bold text-white line-clamp-2">
                        {f.titreFormation || `${f.matiere} (${f.niveau})`}
                    </h4>
                    <span className="inline-block mt-2 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                        {f.type.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center text-blue-200 text-sm">
                        <FaBook className="mr-2" />
                        <span>
                            {f.chapitres.length}{' '}
                            {language === 'fr'
                                ? 'chapitres'
                                : language === 'en'
                                    ? 'chapters'
                                    : 'فصول'}
                        </span>
                    </div>
                    <div className="text-xs text-blue-300">
                        {new Date(f.createdAt).toLocaleDateString()}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {f.matiere && (
                        <span className="px-2 py-1 bg-blue-700 text-blue-100 text-xs rounded-full">
                            {f.matiere}
                        </span>
                    )}
                    {f.niveau && (
                        <span className="px-2 py-1 bg-blue-700 text-blue-100 text-xs rounded-full">
                            {f.niveau}
                        </span>
                    )}
                    {f.pays && (
                        <span className="px-2 py-1 bg-blue-700 text-blue-100 text-xs rounded-full">
                            {f.pays}
                        </span>
                    )}
                </div>

                {f.prix && (
                    <div className="text-lg font-bold text-orange-400">
                        ${f.prix.toFixed(2)}
                    </div>
                )}
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-white p-4 md:p-6 pt-24">
            <div className="mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
                    <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                        {language === 'fr'
                            ? 'Modération des Contenus'
                            : language === 'en'
                                ? 'Content Moderation'
                                : 'الإشراف على المحتوى'}
                    </span>
                </h1>

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
                            <span>eBooks ({ebooks.length})</span>
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
                            <span>Formations ({formations.length})</span>
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

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Affichage des eBooks */}
                        {activeTab === 'ebooks' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {ebooks.length > 0 ? (
                                    ebooks.map(renderEbookCard)
                                ) : (
                                    <div className="col-span-full text-center py-10 text-blue-300">
                                        <FaInfoCircle className="mx-auto text-4xl mb-4" />
                                        <p className="text-xl">
                                            {language === 'fr'
                                                ? 'Aucun eBook en attente de validation'
                                                : language === 'en'
                                                    ? 'No eBooks pending approval'
                                                    : 'لا توجد كتب إلكترونية في انتظار الموافقة'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Modal eBook */}
                        <AnimatePresence>
                            {selectedEbook && (
                                <motion.div
                                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSelectedEbook(null)}
                                >
                                    <motion.div
                                        className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-700/50 relative"
                                        onClick={(e) => e.stopPropagation()}
                                        initial={{ scale: 0.95, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                    >
                                        <button
                                            className="absolute top-4 right-4 text-white hover:text-orange-400 transition-colors z-10 bg-blue-900/80 p-2 rounded-full"
                                            onClick={() => setSelectedEbook(null)}
                                        >
                                            <FaTimes size={20} />
                                        </button>

                                        <div className="p-6">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="md:w-1/3">
                                                    <img
                                                        src={`${AppURL}${selectedEbook.folderPath}cover.png`}
                                                        className="w-full rounded-lg shadow-lg border border-blue-700/50"
                                                        alt="Couverture"
                                                    />
                                                </div>

                                                <div className="md:w-2/3">
                                                    <h3 className="text-2xl font-bold text-orange-400 mb-2">{selectedEbook.titre}</h3>
                                                    <p className="text-blue-200 mb-4">{selectedEbook.description}</p>

                                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                                        <div className="bg-blue-800/30 p-3 rounded-lg">
                                                            <div className="flex items-center gap-2 text-blue-300 mb-1">
                                                                <FaLanguage />
                                                                {language === 'fr'
                                                                    ? 'Langue'
                                                                    : language === 'en'
                                                                        ? 'Language'
                                                                        : 'اللغة'}
                                                            </div>
                                                            <div className="font-medium">{selectedEbook.langue}</div>
                                                        </div>

                                                        <div className="bg-blue-800/30 p-3 rounded-lg">
                                                            <div className="flex items-center gap-2 text-blue-300 mb-1">
                                                                <FaTags />
                                                                {language === 'fr'
                                                                    ? 'Catégorie'
                                                                    : language === 'en'
                                                                        ? 'Category'
                                                                        : 'الفئة'}

                                                            </div>
                                                            <div className="font-medium">{selectedEbook.categorie}</div>
                                                        </div>

                                                        <div className="bg-blue-800/30 p-3 rounded-lg">
                                                            <div className="flex items-center gap-2 text-blue-300 mb-1">
                                                                <FaUser />
                                                                {language === 'fr'
                                                                    ? 'Auteur'
                                                                    : language === 'en'
                                                                        ? 'Author'
                                                                        : 'المؤلف'}

                                                            </div>
                                                            <div className="font-medium">{selectedEbook.auteur?.prenom} {selectedEbook.auteur?.nom}</div>
                                                        </div>

                                                        <div className="bg-blue-800/30 p-3 rounded-lg">
                                                            <div className="flex items-center gap-2 text-blue-300 mb-1">
                                                                <FaFileAlt />
                                                                {language === 'fr'
                                                                    ? 'Pages'
                                                                    : language === 'en'
                                                                        ? 'Pages'
                                                                        : 'الصفحات'}

                                                            </div>
                                                            <div className="font-medium">{selectedEbook.NumPages}</div>
                                                        </div>

                                                        <div className="bg-blue-800/30 p-3 rounded-lg">
                                                            <div className="flex items-center gap-2 text-blue-300 mb-1">
                                                                <FaCalendarAlt />
                                                                {language === 'fr'
                                                                    ? 'Date'
                                                                    : language === 'en'
                                                                        ? 'Date'
                                                                        : 'التاريخ'}

                                                            </div>
                                                            <div className="font-medium">{new Date(selectedEbook.createdAt).toLocaleDateString()}</div>
                                                        </div>

                                                        <div className="bg-blue-800/30 p-3 rounded-lg">
                                                            <div className="flex items-center gap-2 text-blue-300 mb-1">
                                                                <FaMoneyBillWave />
                                                                {language === 'fr'
                                                                    ? 'Prix'
                                                                    : language === 'en'
                                                                        ? 'Price'
                                                                        : 'السعر'}

                                                            </div>
                                                            <div className="font-medium">${selectedEbook.prix?.toFixed(2)}</div>
                                                        </div>
                                                    </div>

                                                    {renderApprovalActions(selectedEbook._id, 'ebook')}
                                                </div>
                                            </div>

                                            <div className="mt-8">
                                                <h4 className="text-xl font-semibold mb-4 text-orange-300">
                                                    {language === 'fr'
                                                        ? 'Aperçu des pages'
                                                        : language === 'en'
                                                            ? 'Pages Overview'
                                                            : 'معاينة الصفحات'}
                                                </h4>
                                                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-blue-900">
                                                    {pages.map((page, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex-none w-64 cursor-pointer"
                                                            onClick={() => handleImageClick(i)}
                                                        >
                                                            <img
                                                                src={page}
                                                                alt={`Page ${i + 1}`}
                                                                className="rounded-lg border border-blue-700 shadow-md h-80 object-contain bg-white hover:shadow-lg transition-shadow"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = '/placeholder-page.png';
                                                                    (e.target as HTMLImageElement).className = 'rounded-lg border border-blue-700 shadow-md h-80 object-contain bg-gray-200';
                                                                }}
                                                            />
                                                            <p className="text-center text-sm mt-1 text-blue-300">
                                                                {language === 'fr'
                                                                    ? `Page ${i + 1}`
                                                                    : language === 'en'
                                                                        ? `Page ${i + 1}`
                                                                        : `الصفحة ${i + 1}`}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Affichage des formations */}
                        {activeTab === 'formations' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {formations.length > 0 ? (
                                    formations.map(renderFormationCard)
                                ) : (
                                    <div className="col-span-full text-center py-10 text-blue-300">
                                        <FaInfoCircle className="mx-auto text-4xl mb-4" />
                                        <p className="text-xl">
                                            {language === 'fr'
                                                ? 'Aucune formation en attente de validation'
                                                : language === 'en'
                                                    ? 'No trainings pending approval'
                                                    : 'لا توجد تدريبات في انتظار الموافقة'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Modal Formation */}
                        <AnimatePresence>
                            {selectedFormation && (
                                <motion.div
                                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSelectedFormation(null)}
                                >
                                    <motion.div
                                        className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl w-full  max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-700/50 relative"
                                        onClick={(e) => e.stopPropagation()}
                                        initial={{ scale: 0.95, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                    >
                                        <button
                                            className="absolute top-4 right-4 text-white hover:text-orange-400 transition-colors z-10 bg-blue-900/80 p-2 rounded-full"
                                            onClick={() => setSelectedFormation(null)}
                                        >
                                            <FaTimes size={20} />
                                        </button>

                                        <div className="p-6">
                                            <div className="flex flex-col md:flex-row gap-6 mb-6">
                                                <div className="md:w-1/3">
                                                    <img
                                                        src={`${AppURL}${selectedFormation.coverImage}`}
                                                        className="w-full rounded-lg shadow-lg border border-blue-700/50"
                                                        alt="Couverture"
                                                    />

                                                    <div className="mt-4 space-y-3">
                                                        <div>
                                                            <div className="text-blue-300 text-sm flex items-center gap-2">
                                                                <FaTags />
                                                                {language === 'fr'
                                                                    ? 'Type'
                                                                    : language === 'en'
                                                                        ? 'Type'
                                                                        : 'النوع'}

                                                            </div>
                                                            <div className="font-medium">{selectedFormation.type}</div>
                                                        </div>

                                                        <div>
                                                            <div className="text-blue-300 text-sm flex items-center gap-2">
                                                                <FaUser />
                                                                {language === 'fr'
                                                                    ? 'Auteur'
                                                                    : language === 'en'
                                                                        ? 'Author'
                                                                        : 'المؤلف'}

                                                            </div>
                                                            <div className="font-medium">{selectedFormation.auteur?.prenom} {selectedFormation.auteur?.nom}</div>
                                                        </div>

                                                        <div>
                                                            <div className="text-blue-300 text-sm flex items-center gap-2">
                                                                <FaCalendarAlt />
                                                                {language === 'fr'
                                                                    ? 'Date'
                                                                    : language === 'en'
                                                                        ? 'Date'
                                                                        : 'التاريخ'}
                                                            </div>
                                                            <div className="font-medium">{new Date(selectedFormation.createdAt).toLocaleDateString()}</div>
                                                        </div>

                                                        <div>
                                                            <div className="text-blue-300 text-sm flex items-center gap-2">
                                                                <FaMoneyBillWave />
                                                                {language === 'fr'
                                                                    ? 'Prix'
                                                                    : language === 'en'
                                                                        ? 'Price'
                                                                        : 'السعر'}

                                                            </div>
                                                            <div className="font-medium">${selectedFormation.prix?.toFixed(2)}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="md:w-2/3">
                                                    <h3 className="text-2xl font-bold text-orange-400 mb-2">{selectedFormation.titreFormation}</h3>
                                                    <p className="text-blue-200 mb-6">{selectedFormation.categorie || selectedFormation.matiere}</p>

                                                    <div className="space-y-4">
                                                        <h4 className="text-xl font-semibold text-orange-300">
                                                            {language === 'fr' ? 'Chapitres' : language === 'en' ? 'Chapters' : 'الفصول'}
                                                        </h4>
                                                        {selectedFormation.chapitres.map((chap, chapIndex) => (
                                                            <div key={chapIndex} className="bg-blue-800/30 rounded-lg border border-blue-700/50 overflow-hidden">
                                                                {/* Chapitre principal */}
                                                                <div
                                                                    className="p-4 cursor-pointer flex justify-between items-center"
                                                                    onClick={() => setSelectedChapter(selectedChapter === chapIndex ? null : chapIndex)}
                                                                >
                                                                    <div className="flex items-center">
                                                                        <div className={`text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 ${selectedChapter === chapIndex ? 'bg-orange-500 text-white' : 'bg-blue-700 text-blue-200'}`}>
                                                                            {chapIndex + 1}
                                                                        </div>
                                                                        <h5 className="font-medium">{chap.titre}</h5>
                                                                    </div>
                                                                </div>

                                                                {/* Sous-chapitres */}
                                                                {selectedChapter === chapIndex && (
                                                                    <div className="px-4 pb-4 space-y-2">
                                                                        {chap.sousChapitres.map((sous, sousIndex) => (
                                                                            <div
                                                                                key={sousIndex}
                                                                                className={`text-sm p-2 rounded cursor-pointer ${selectedSousChapitre === sousIndex ? 'bg-orange-500/20 border border-orange-500/50' : 'hover:bg-blue-700/40'}`}
                                                                                onClick={() => setSelectedSousChapitre(sousIndex)}
                                                                            >
                                                                                {sous.titre}
                                                                            </div>
                                                                        ))}

                                                                        {/* Contenu du sous-chapitre sélectionné */}
                                                                        {selectedSousChapitre !== null && chap.sousChapitres[selectedSousChapitre] && (
                                                                            <div className="mt-4 bg-blue-900/40 p-4 rounded-lg">
                                                                                {chap.sousChapitres[selectedSousChapitre].video && (
                                                                                    <video
                                                                                        controls
                                                                                        src={`${AppURL}${chap.sousChapitres[selectedSousChapitre].video}`}
                                                                                        className="w-full rounded-lg border border-blue-700 mb-4"
                                                                                    />
                                                                                )}
                                                                                {chap.sousChapitres[selectedSousChapitre].content && (
                                                                                    <div
                                                                                        className="prose prose-invert max-w-none text-blue-200"
                                                                                        dangerouslySetInnerHTML={{
                                                                                            __html: renderContentWithImages(
                                                                                                chap.sousChapitres[selectedSousChapitre].content || '',
                                                                                                chapIndex,
                                                                                                selectedSousChapitre,
                                                                                                selectedFormation
                                                                                            )
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>



                                                    {renderApprovalActions(selectedFormation._id, 'formation')}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Visionneuse plein écran pour les pages ebook */}
                        <AnimatePresence>
                            {fullscreenImage && (
                                <motion.div
                                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setFullscreenImage(null)}
                                >
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <img
                                            src={fullscreenImage.url}
                                            alt={`Page ${fullscreenImage.index + 1}`}
                                            className="max-w-full max-h-full object-contain"
                                        />

                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                            <div className="bg-black/50 text-white px-4 py-2 rounded-full">
                                                {language === 'fr'
                                                    ? `Page ${fullscreenImage.index + 1} / ${pages.length}`
                                                    : language === 'en'
                                                        ? `Page ${fullscreenImage.index + 1} / ${pages.length}`
                                                        : `الصفحة ${fullscreenImage.index + 1} / ${pages.length}`}
                                            </div>
                                        </div>

                                        {fullscreenImage.index > 0 && (
                                            <button
                                                className="absolute left-4 bg-black/50 text-white p-4 rounded-full hover:bg-black/70 transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFullscreenImage(prev => prev ? {
                                                        index: prev.index - 1,
                                                        url: pages[prev.index - 1]
                                                    } : null);
                                                }}
                                            >
                                                <FaArrowLeft />
                                            </button>
                                        )}

                                        {fullscreenImage.index < pages.length - 1 && (
                                            <button
                                                className="absolute right-4 bg-black/50 text-white p-4 rounded-full hover:bg-black/70 transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFullscreenImage(prev => prev ? {
                                                        index: prev.index + 1,
                                                        url: pages[prev.index + 1]
                                                    } : null);
                                                }}
                                            >
                                                <FaArrowRight />
                                            </button>
                                        )}

                                        <button
                                            className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFullscreenImage(null);
                                            }}
                                        >
                                            <FaTimes size={24} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
}