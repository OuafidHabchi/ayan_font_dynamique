import React, { useState } from 'react';
import AppURL from './AppUrl';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';


type Language = 'fr' | 'en' | 'ar';

interface Book {
    _id: string;
    auteur: {
        avatar: any;
        nom: string;
        prenom: string;
    };
    titre: string;
    categorie: string;
    prix: number;
    description: string;
    NumPages: number;
    langue: string;
    approved: string;
    ebookId: string;
    folderPath: string;
    coverImage?: string;
    promotion: boolean;
    newPrix?: number;
    createdAt: string;
    investmentOptions: {
        affiliation: Boolean,
        codePromo: Boolean,
        licence: Boolean,
        sponsoring: Boolean,
        licenceMontant: Number
    }

}

interface BookModalProps {
    book: Book;
    language: Language;
    onClose: () => void;
}

const BookModal: React.FC<BookModalProps> = ({ book, language, onClose }) => {
    const { user } = useAuth(); // récupère l'utilisateur
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'details'>('overview');
    const [currentPreviewPage, setCurrentPreviewPage] = useState(1);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
    const [promoError, setPromoError] = useState('');
    const [promoOwnerId, setPromoOwnerId] = useState('');



    const translate = (fr: string, en: string, ar: string) => {
        return language === 'fr' ? fr : language === 'en' ? en : ar;
    };


    const handleBuy = async () => {
        if (!user) {
            navigate('/signin');
            return;
        }

        try {
            const payload: any = {
                userId: user.id,
                bookId: book._id,
            };

            // Si un code promo est valide, on ajoute les champs
            if (discountedPrice !== null && promoCode && promoOwnerId) {
                payload.promoCode = promoCode;
                payload.investorId = promoOwnerId;
                payload.investmentType = 'codePromo';
            }

            await axios.post(`${AppURL}/api/myEbookRoutes/createAchat`, payload);

            setShowSuccessMessage(true);
            setTimeout(() => {
                navigate('/MyEbooks');
            }, 2000);
        } catch (error) {
            toast.error(
                translate(
                    'Une erreur est survenue.',
                    'An error occurred.',
                    'حدث خطأ ما.'
                )
            );
            console.error("Erreur lors de l'achat du livre:", error);
        }
    };


    const handleValidatePromo = async () => {
        try {
            const res = await axios.post(`${AppURL}/api/users/codePromoValidation`, {
                promoCode: promoCode,
                targetId: book._id,
                type: 'ebook'
            });

            if (res.data.success) {
                const basePrice = book.promotion && book.newPrix !== undefined ? book.newPrix : book.prix;
                const reduced = basePrice - basePrice * 0.1;
                setDiscountedPrice(reduced);
                setPromoOwnerId(res.data.promoOwnerId);
                setPromoError('');
            } else {
                setPromoError(res.data.message || translate('Code promo invalide', 'Invalid promo code', 'رمز ترويجي غير صالح'));
                setDiscountedPrice(null);
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || translate('Erreur lors de la vérification', 'Validation error', 'خطأ في التحقق');
            setPromoError(errorMsg);
            setDiscountedPrice(null);
        }
    };







    const renderPagePreview = () => {
        const pages = [];
        for (let i = 1; i <= 3; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPreviewPage(i)}
                    className={`group relative border rounded-xl overflow-hidden p-1 bg-orange-100 shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 
          ${currentPreviewPage === i ? 'ring-2 ring-blue-500' : 'hover:border-blue-300'}`}
                >
                    <img
                        src={`${AppURL}${book.folderPath}page-${i}.png`}
                        alt={`Page ${i} preview`}
                        className="w-full h-40 object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded shadow">
                        {translate('Page', 'Page', 'صفحة')} {i}
                    </span>
                </button>
            );
        }
        return pages;
    };



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
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-h-[95vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-[0.98] hover:scale-100">
                {/* Header with Cover */}
                <div className="relative group">
                    <div className="h-56 w-full bg-gradient-to-r from-blue-50 to-purple-50 overflow-hidden">
                        <img
                            src={`${AppURL}${book.coverImage || book.folderPath + 'cover.png'}`}
                            alt="Cover"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
                    >
                        <svg className="h-6 w-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50 bg-blue-100">
                    <div className="px-8 pt-6 pb-8">
                        <div className="flex flex-col lg:flex-row gap-8">

                            {/* Left Column */}
                            <div className="flex-1 space-y-6">
                                {/* Auteur */}
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        {book.auteur.avatar ? (
                                            <img
                                                src={`${AppURL}${book.auteur.avatar}`}
                                                alt="Author"
                                                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-white font-bold shadow text-xl">
                                                {book.auteur.prenom[0]}
                                            </div>
                                        )}
                                        <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full shadow">
                                            {translate('Auteur', 'Author', 'المؤلف')}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            {translate('Par', 'By', 'بواسطة')}{' '}
                                            <span className="font-semibold text-gray-900">
                                                {book.auteur.prenom} {book.auteur.nom}
                                            </span>
                                        </p>

                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(book.createdAt).toLocaleDateString(language, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Titre */}
                                <h1 className="text-3xl font-extrabold text-gray-900 leading-snug">
                                    {book.titre}
                                </h1>

                                {/* Badges infos */}
                                <div className="flex flex-wrap gap-2">
                                    {book.categorie && (
                                        <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                                            {book.categorie}
                                        </span>
                                    )}
                                    {book.langue && (
                                        <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                                            🌐 {book.langue}
                                        </span>
                                    )}
                                    {book.NumPages && (
                                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            {book.NumPages} {translate('pages', 'pages', 'صفحات')}
                                        </span>
                                    )}
                                </div>
                            </div>



                            {/* Right Column - Action Card */}
                            <div className="lg:w-72 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm">
                                <div className="space-y-4">

                                    {/* Prix */}
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            {translate('Prix', 'Price', 'السعر')}
                                        </p>
                                        <div className="flex items-end space-x-2">
                                            {discountedPrice !== null ? (
                                                <>
                                                    <span className="text-3xl font-bold text-green-600">
                                                        {discountedPrice.toFixed(2)} $
                                                    </span>
                                                    <span className="text-sm text-red-500 line-through">
                                                        {book.prix.toFixed(2)} $
                                                    </span>
                                                </>
                                            ) : book.promotion && book.newPrix !== undefined ? (
                                                <>
                                                    <span className="text-3xl font-bold text-green-600">
                                                        {book.newPrix.toFixed(2)} $
                                                    </span>
                                                    <span className="text-sm text-red-500 line-through">
                                                        {book.prix.toFixed(2)} $
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-3xl font-bold text-blue-600">
                                                    {book.prix.toFixed(2)} $
                                                </span>
                                            )}
                                        </div>
                                    </div>


                                    {/* Champ code promo */}
                                    {book.investmentOptions.codePromo && (
                                        <div className="mt-4 space-y-2">
                                            <input
                                                type="text"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value)}
                                                placeholder={translate('Code promo', 'Promo code', 'رمز ترويجي')}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                            />
                                            <button
                                                onClick={handleValidatePromo}
                                                className="w-full bg-blue-100 text-blue-700 font-medium py-2 rounded-lg hover:bg-blue-200 transition"
                                            >
                                                {translate('Valider le code', 'Validate Code', 'تحقق من الرمز')}
                                            </button>
                                            {promoError && <p className="text-sm text-red-500">{promoError}</p>}
                                        </div>


                                    )}


                                    {/* Bouton acheter */}
                                    <button
                                        onClick={handleBuy}
                                        className="w-full  bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                                    >
                                        {translate('Acheter maintenant', 'Buy Now', 'اشتر الآن')}
                                    </button>

                                    {/* Détails */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <div className="p-1.5 bg-white rounded-full shadow-inner">
                                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <span>{translate('Format numérique', 'Digital format', 'نسخة رقمية')}</span>
                                        </div>

                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <div className="p-1.5 bg-white rounded-full shadow-inner">
                                                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span>{translate('Accès illimité', 'Unlimited access', 'وصول غير محدود')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>

                        {/* Tabs */}

                        <div className="w-full mt-10 mb-8">
                            <div className="grid grid-cols-3 w-full rounded-xl overflow-hidden border border-gray-300 shadow-sm bg-white">
                                {/* Onglet Aperçu */}
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-200
                                    ${activeTab === 'overview' ? 'bg-orange-100 text-blue-950' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {translate('Aperçu', 'Overview', 'نظرة عامة')}
                                </button>

                                {/* Onglet Prévisualisation */}
                                <button
                                    onClick={() => setActiveTab('preview')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-200 border-l border-gray-300
                                    ${activeTab === 'preview' ? 'bg-orange-100 text-blue-950' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    {translate('Prévisualisation', 'Preview', 'معاينة')} (3)
                                </button>

                                {/* Onglet Détails */}
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-200 border-l border-gray-300
                                     ${activeTab === 'details' ? 'bg-orange-100 text-blue-950' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    {translate('Détails', 'Details', 'تفاصيل')}
                                </button>
                            </div>
                        </div>



                        {/* Tab Content */}
                        <div className="mb-8">
                            {activeTab === 'overview' && (
                                <div className="w-full bg-orange-100 border border-gray-200 rounded-xl shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-3">
                                        {translate('Description', 'Overview', 'نظرة عامة')}
                                    </h2>
                                    <div className="prose max-w-none text-gray-700">
                                        {book.description ? (
                                            <p>{book.description}</p>
                                        ) : (
                                            <p className="text-gray-500 italic">
                                                {translate('Aucune description disponible', 'No description available', 'لا يوجد وصف متاح')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'preview' && (
                                <div className="w-full bg-orange-100 border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
                                    {/* Titre section */}
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {translate('Aperçu des pages', 'Page Preview', 'معاينة الصفحات')}
                                    </h2>

                                    {/* Zone principale avec image + miniatures */}
                                    <div className="bg-blue-50 border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
                                        {/* Image principale */}
                                        <div className="flex justify-center">
                                            <img
                                                src={`${AppURL}${book.folderPath}page-${currentPreviewPage}.png`}
                                                alt={`Page ${currentPreviewPage} preview`}
                                                className="max-h-[480px] w-full object-contain rounded-md"
                                            />
                                        </div>

                                        {/* Miniatures */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {renderPagePreview()}
                                        </div>
                                    </div>

                                    {/* Note d'information */}
                                    <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
                                        {translate(
                                            'Prévisualisation des 3 premières pages seulement',
                                            'Preview of first 3 pages only',
                                            'معاينة أول 3 صفحات فقط'
                                        )}
                                    </div>
                                </div>
                            )}




                            {activeTab === 'details' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Informations techniques */}
                                    <div className="bg-orange-100 border border-gray-200 p-6 rounded-xl shadow-sm">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                            {translate('Informations techniques', 'Technical details', 'المعلومات التقنية')}
                                        </h4>
                                        <ul className="space-y-3 text-sm text-gray-700">
                                            <li className="flex justify-between border-b pb-2">
                                                <span className="text-gray-600">{translate('Format', 'Format', 'الصيغة')}</span>
                                                <span className="font-medium">PDF</span>
                                            </li>
                                            <li className="flex justify-between border-b pb-2">
                                                <span className="text-gray-600">{translate('Langue', 'Language', 'اللغة')}</span>
                                                <span className="font-medium">{book.langue}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span className="text-gray-600">{translate('Pages', 'Pages', 'الصفحات')}</span>
                                                <span className="font-medium">{book.NumPages}</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* À propos de l’auteur */}
                                    <div className="bg-orange-100 border border-gray-200 p-6 rounded-xl shadow-sm">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                            {translate('À propos de l\'auteur', 'About the author', 'حول المؤلف')}
                                        </h4>
                                        <div className="flex items-start gap-4">
                                            {/* Avatar ou initiale */}
                                            {book.auteur.avatar ? (
                                                <img
                                                    src={`${AppURL}${book.auteur.avatar}`}
                                                    alt="Auteur"
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow">
                                                    {book.auteur.prenom[0]}
                                                </div>
                                            )}

                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {book.auteur.prenom} {book.auteur.nom}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {translate(
                                                        'Expert dans son domaine avec plusieurs années d\'expérience.',
                                                        'Expert in their field with several years of experience.',
                                                        'خبير في مجاله مع سنوات من الخبرة.'
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

export default BookModal;