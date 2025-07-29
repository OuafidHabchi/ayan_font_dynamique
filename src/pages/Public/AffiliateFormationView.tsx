import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import AppURL from '../../components/AppUrl';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';

interface Chapitre {
    titre: string;
    content?: string;
    video?: string;
    videoPreview?: string;
    fileContent?: string;
    isOpen?: boolean;
    sousChapitres?: SousChapitre[];
}
interface SousChapitre {
    titre: string;
    content?: string;
    video?: string;
    images?: string[];
}


interface Auteur {
    _id: string;
    nom: string;
    prenom: string;
    avatar?: string;
    role?: string;
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
    langue?: string;
    rating?: number;
    auteur: Auteur;
    chapitres: Chapitre[];
    createdAt: string;
}

type Language = 'fr' | 'en' | 'ar';

const AffiliateFormationView: React.FC<{ language: Language }> = ({ language }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { formationId } = useParams();
    const [searchParams] = useSearchParams();
    const affiliateId = searchParams.get("ref");

    const [formation, setFormation] = useState<Formation | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'chapters' | 'author'>('chapters');
    const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [affiliateName, setAffiliateName] = useState('');
    const [selectedSousChapitreIndex, setSelectedSousChapitreIndex] = useState<number | null>(null);


    const translate = (fr: string, en: string, ar: string) => {
        return language === 'fr' ? fr : language === 'en' ? en : ar;
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${AppURL}/api/StudioFormationRoutes/${formationId}`);
                const data = await res.json();
                setFormation(data);

                if (affiliateId) {
                    const affRes = await axios.get(`${AppURL}/api/users/${affiliateId}`);
                    const { nom, prenom } = affRes.data.user;
                    setAffiliateName(`${prenom} ${nom}`);
                }
            } catch (err) {
                toast.error(translate("Erreur de chargement", "Loading error", "خطأ في التحميل"));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [formationId, affiliateId]);


    const handleBuyFormation = async () => {
        if (!user) {
            navigate('/signin');
            return;
        }

        try {
            await axios.post(`${AppURL}/api/myFormationRoutes/createAchat`, {
                userId: user.id,
                formationId,
                investmentType: 'affiliation',
                investorId: affiliateId,
            });
            setShowSuccessMessage(true);
            setTimeout(() => navigate('/MyFormations'), 2000);
        } catch (err) {
            toast.error(translate("Erreur lors de l'achat", "Purchase error", "حدث خطأ أثناء الشراء"));
        }
    };

    const toggleChapter = (index: number) => {
        setExpandedChapter(expandedChapter === index ? null : index);
    };



    if (loading || !formation) {
        return (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"></div>
                    <div className="h-4 bg-gray-300/80 rounded w-32"></div>
                </div>
            </div>
        );
    }

    if (showSuccessMessage) {
        return (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-blue-900 to-blue-950 p-8 rounded-xl shadow-2xl border border-blue-700 max-w-md mx-4 text-center"
                >
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 flex items-center justify-center">
                            <FaSpinner className="text-orange-400 text-xl" />
                        </div>
                    </div>
                    <h3 className="text-white mt-6 text-xl font-bold">
                        Traitement en cours...
                    </h3>
                    <p className="text-blue-200 mt-3">
                        Votre demande est en cours de traitement. Merci de patienter quelques instants.
                    </p>
                    <div className="mt-6 h-1 w-full bg-blue-800 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                    </div>
                </motion.div>
            </div>
        );
    }


    return (
        <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && navigate('/')}
        >
            {/* Affiliate Badge */}
            {affiliateName && (
                <div className="fixed top-20 right-6 z-50 bg-blue-100 border border-blue-400 text-blue-800 text-sm px-4 py-2 rounded shadow">
                    {translate(
                        `Affilié par ${affiliateName}`,
                        `Affiliated by ${affiliateName}`,
                        `تابع لـ ${affiliateName}`
                    )}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-2xl w-full  max-h-[95vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-[0.98] hover:scale-100">
                {/* Header with Cover */}
                <div className="relative group">
                    {formation.coverImage && (
                        <div className="h-56 w-full bg-gradient-to-r from-blue-50 to-purple-50 overflow-hidden">
                            <img
                                src={`${AppURL}${formation.coverImage}`}
                                alt="Cover"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        </div>
                    )}

                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50 bg-blue-50">
                    <div className="px-8 pt-6 pb-8">
                        <div className="flex flex-col lg:flex-row gap-8">

                            {/* Left Column */}
                            <div className="flex-1 space-y-6">
                                {/* Auteur */}
                                <div className="flex items-center gap-4">
                                    {formation.auteur.avatar && (
                                        <div className="relative">
                                            <img
                                                src={`${AppURL}${formation.auteur.avatar}`}
                                                alt="Author"
                                                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                                            />
                                            <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full shadow">
                                                {translate('Formateur', 'Instructor', 'مدرب')}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            {translate('Par', 'By', 'بواسطة')}{' '}
                                            <span className="font-semibold text-gray-900">
                                                {formation.auteur.prenom} {formation.auteur.nom}
                                            </span>
                                        </p>
                                        {formation.auteur.role && (
                                            <p className="text-xs text-gray-500 italic">{formation.auteur.role}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(formation.createdAt).toLocaleDateString(language, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Titre formation */}
                                <h1 className="text-3xl font-extrabold text-gray-900 leading-snug">
                                    {formation.type === 'scolaire' && formation.matiere && formation.niveau
                                        ? `${formation.matiere} - ${formation.niveau}`
                                        : formation.titreFormation}
                                </h1>

                                {/* Badges infos */}
                                <div className="flex flex-wrap gap-2">
                                    {formation.pays && (
                                        <span className="flex items-center bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                                            🌍 {formation.pays}
                                        </span>
                                    )}

                                    {formation.type === 'scolaire' && (
                                        <>
                                            <span className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                                                🎓 {formation.niveau}
                                            </span>
                                            {formation.sousNiveau && (
                                                <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                                                    {formation.sousNiveau}
                                                </span>
                                            )}
                                            <span className="bg-purple-200 text-purple-900 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                                                {formation.matiere}
                                            </span>
                                        </>
                                    )}

                                    {formation.type === 'autre' && (
                                        <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                                            {formation.categorie}
                                        </span>
                                    )}

                                    {formation.langue && (
                                        <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                                            🌐 {formation.langue}
                                        </span>
                                    )}
                                </div>
                            </div>


                            {/* Right Column - Action Card */}
                            <div className="lg:w-72 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm">
                                <div className="space-y-4">
                                    {formation.promotion && formation.newPrix !== undefined ? (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                {translate('Prix promotionnel', 'Promotional price', 'السعر الترويجي')}
                                            </p>
                                            <div className="flex items-end">
                                                <span className="text-3xl font-bold text-green-600">
                                                    {formation.newPrix.toFixed(2)} $
                                                </span>
                                                <span className="ml-2 text-sm text-red-500 line-through">
                                                    {formation.prix?.toFixed(2)} $
                                                </span>
                                            </div>
                                        </div>
                                    ) : formation.prix !== undefined && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                {translate('Prix', 'Price', 'السعر')}
                                            </p>
                                            <div className="flex items-end">
                                                <span className="text-3xl font-bold text-blue-600">
                                                    {formation.prix.toFixed(2)} $
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleBuyFormation}
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                                    >
                                        {translate('Acheter maintenant', 'Buy Now', 'اشتر الآن')}
                                    </button>

                                    <div className="space-y-3 pt-2">
                                        {formation.duree && (
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <div className="p-1.5 bg-white rounded-full shadow-inner">
                                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <span>{translate('Durée', 'Duration', 'المدة')}: {formation.duree}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <div className="p-1.5 bg-white rounded-full shadow-inner">
                                                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span>{translate('Accès illimité pendant 12 mois', 'Unlimited access for 12 months', 'وصول غير محدود لمدة 12 شهرًا')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="w-full mt-10 mb-8">
                            <div className="grid grid-cols-2 w-full rounded-xl overflow-hidden border border-gray-300 shadow-sm bg-white">
                                {/* Onglet Programme */}
                                <button
                                    onClick={() => setActiveTab('chapters')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-200
                                         ${activeTab === 'chapters'
                                            ? 'bg-orange-100 text-blue-950'
                                            : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    {translate('Programme', 'Curriculum', 'المنهج')} ({formation.chapitres.length})
                                </button>

                                {/* Onglet Formateur */}
                                <button
                                    onClick={() => setActiveTab('author')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-200 border-l border-gray-300
                                             ${activeTab === 'author'
                                            ? 'bg-orange-100 text-blue-950'
                                            : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {translate('Formateur', 'Instructor', 'المدرب')}
                                </button>
                            </div>
                        </div>

                        <div className="mb-8">

                            {activeTab === 'chapters' && (
                                <div className="space-y-4">
                                    {formation.chapitres.map((chap, index) => (
                                        <div
                                            key={index}
                                            className="border border-blue-200 rounded-xl bg-white shadow-sm transition-all"
                                        >
                                            {/* Header Chapitre */}
                                            <div
                                                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-orange-100"
                                                onClick={() => toggleChapter(index)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-950 text-white text-sm font-bold flex items-center justify-center shadow">
                                                        {index + 1}
                                                    </div>
                                                    <h3 className="text-base font-semibold text-blue-950">{chap.titre}</h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {chap.videoPreview && (
                                                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                                                            🎬 Vidéo
                                                        </span>
                                                    )}
                                                    <svg
                                                        className={`w-4 h-4 text-gray-400 transition-transform ${expandedChapter === index ? 'rotate-180' : ''
                                                            }`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Sous-chapitres */}
                                            {expandedChapter === index && (
                                                <div className="px-5 pb-5 space-y-4">
                                                    {chap.sousChapitres?.map((sub, subIndex) => {
                                                        const isSelected = selectedSousChapitreIndex === subIndex;

                                                        return (
                                                            <div
                                                                key={subIndex}
                                                                className={`border rounded-lg p-4 transition-all ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-blue-100 bg-blue-50'
                                                                    }`}
                                                            >
                                                                <div
                                                                    className="flex items-center justify-between cursor-pointer"
                                                                    onClick={() => setSelectedSousChapitreIndex(isSelected ? null : subIndex)}
                                                                >
                                                                    <h4 className="text-sm font-semibold text-blue-900">{sub.titre}</h4>
                                                                    {sub.video && (
                                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                                            🎥 Vidéo
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {isSelected && (
                                                                    <div className="flex flex-col md:flex-row gap-4 mt-4">
                                                                        {/* Vidéo */}
                                                                        {sub.video && (
                                                                            <video
                                                                                ref={(el) => {
                                                                                    if (el) {
                                                                                        el.onloadedmetadata = () => {
                                                                                            el.currentTime = 0;
                                                                                        };
                                                                                        el.ontimeupdate = () => {
                                                                                            if (el.currentTime >= 30) {
                                                                                                el.pause();
                                                                                                el.currentTime = 30;
                                                                                            }
                                                                                        };
                                                                                        el.addEventListener('seeking', function () {
                                                                                            if (el.currentTime > 30) {
                                                                                                el.currentTime = 30;
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                onContextMenu={(e) => e.preventDefault()} // 🚫 Désactive clic droit
                                                                                controls
                                                                                controlsList="nodownload noplaybackrate"
                                                                                disablePictureInPicture
                                                                                preload="metadata"
                                                                                className="w-full md:w-1/2 rounded-md border border-blue-200"
                                                                                src={`${AppURL}${sub.video}`}
                                                                            />



                                                                        )}

                                                                        {/* Texte */}
                                                                        {sub.content && (
                                                                            <div
                                                                                className="prose prose-sm w-full bg-white rounded-md p-3 border border-gray-100"
                                                                                dangerouslySetInnerHTML={{
                                                                                    __html: renderContentWithImages(
                                                                                        sub.content,
                                                                                        index,
                                                                                        subIndex,
                                                                                        formation
                                                                                    ),
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}



                            {activeTab === 'author' && (
                                <div className="bg-orange-100 rounded-xl p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {formation.auteur.avatar && (
                                            <img
                                                src={`${AppURL}${formation.auteur.avatar}`}
                                                alt="Author"
                                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                                            />
                                        )}
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                {formation.auteur.prenom} {formation.auteur.nom}
                                            </h3>
                                            {formation.auteur.role && (
                                                <p className="text-blue-600 font-medium mb-4">{formation.auteur.role}</p>
                                            )}
                                            <div className="prose max-w-none text-gray-700">
                                                <p>
                                                    {translate(
                                                        'Expert avec plusieurs années d\'expérience dans ce domaine. Passionné par le partage de connaissances et la formation des étudiants.',
                                                        'Expert with several years of experience in this field. Passionate about sharing knowledge and training students.',
                                                        'خبير مع سنوات من الخبرة في هذا المجال. شغوف بمشاركة المعرفة وتدريب الطلاب.'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
};

export default AffiliateFormationView;