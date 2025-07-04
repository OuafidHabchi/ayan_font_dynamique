import React, { useState, useEffect, useRef } from 'react';
import { Book } from './fakeBooks';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

type Language = 'fr' | 'en' | 'ar';

interface BookModalProps {
    book: Book;
    language: Language;
    onClose: () => void;
}

const BookModal: React.FC<BookModalProps> = ({ book, language, onClose }) => {
    const [isPurchased, setIsPurchased] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [showNav, setShowNav] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const navTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const pagesToShow = isPurchased ? book.images : book.images.slice(0, 3);

    const previewText = isPurchased
        ? language === 'fr'
            ? 'Cliquez sur la couverture pour lire ce livre en entier.'
            : language === 'en'
                ? 'Click the cover to read the full book.'
                : 'اضغط على الغلاف لقراءة الكتاب كاملاً'
        : language === 'fr'
            ? 'Cliquez sur la couverture pour voir un aperçu.'
            : language === 'en'
                ? 'Click the cover to preview the book.'
                : 'اضغط على الغلاف لمعاينة الكتاب';


    const changePage = (newPage: number) => {
        if (newPage >= 0 && newPage < pagesToShow.length) {
            setIsLoading(true);
            setCurrentPage(newPage);
        }
    };

    const goPrev = () => changePage(currentPage - 1);
    const goNext = () => changePage(currentPage + 1);

    const resetNavTimeout = () => {
        setShowNav(true);
        if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
        navTimeoutRef.current = setTimeout(() => setShowNav(false), 2000);
    };

    useEffect(() => {
        if (isLightboxOpen) {
            resetNavTimeout();
            window.addEventListener('mousemove', resetNavTimeout);
            window.addEventListener('touchstart', resetNavTimeout);
            return () => {
                window.removeEventListener('mousemove', resetNavTimeout);
                window.removeEventListener('touchstart', resetNavTimeout);
            };
        }
    }, [isLightboxOpen]);

    // Swipe gesture
    let touchStartX = 0;
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (diff > 50) goNext(); // swipe left
        else if (diff < -50) goPrev(); // swipe right
    };

    return (
        <div className="fixed inset-0 z-50 bg-blue-950 bg-opacity-80 flex items-center justify-center pt-8 ">
            <div className="bg-blue-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-gray-200">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-blue-800 p-4 bg-blue-950 rounded-t-2xl shadow-inner">
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-orange-400">
                        {language === 'fr'
                            ? 'Détails de l’eBook'
                            : language === 'en'
                                ? 'eBook Details'
                                : 'تفاصيل الكتاب الإلكتروني'}
                    </h2>

                    <button
                        onClick={onClose}
                        className="bg-orange-400 rounded-full p-2 hover:bg-blue-700 transition shadow"
                    >
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">


                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">

                        {/* Détails du livre */}
                        <div className="space-y-3 text-left flex-1">
                            <h3 className="text-2xl font-bold text-orange-400">{book.titre}</h3>
                            <p><span className="font-semibold text-blue-950">{language === 'fr' ? 'Auteur' : language === 'en' ? 'Author' : 'المؤلف'}:</span> {book.auteur}</p>
                            <p><span className="font-semibold text-blue-950">{language === 'fr' ? 'Catégorie' : language === 'en' ? 'Category' : 'الفئة'}:</span> {book.categorie}</p>
                            <p><span className="font-semibold text-blue-950">{language === 'fr' ? 'Pages' : language === 'en' ? 'Pages' : 'الصفحات'}:</span> {book.nombreDePages}</p>
                            <p className="text-3xl font-bold text-green-700">{book.prix.toFixed(2)} $</p>

                            {!isPurchased && (
                                <button
                                    onClick={() => setIsPurchased(true)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-10 rounded-full transition shadow-lg"
                                >
                                    {language === 'fr' && 'Acheter maintenant'}
                                    {language === 'en' && 'Buy now'}
                                    {language === 'ar' && 'اشتر الآن'}
                                </button>
                            )}
                        </div>

                        {/* Image */}
                        <div
                            className="cursor-pointer transform hover:scale-105 transition duration-300 shadow-xl rounded-lg overflow-hidden border border-blue-800"
                            onClick={() => {
                                setIsLightboxOpen(true);
                                setCurrentPage(0);
                                setIsLoading(true);
                            }}
                        >
                            <img
                                src={book.image}
                                alt="couverture"
                                className="w-48 h-64 object-cover rounded-lg"
                            />
                        </div>
                    </div>
                    <p className="text-sm text-blue-950 italic mb-6 text-center mt-4">{previewText}</p>
                </div>


            </div>

            {/* Lightbox */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 transition duration-300 ease-in-out animate-fadeIn"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Spinner */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <AiOutlineLoading3Quarters className="text-white text-4xl animate-spin" />
                        </div>
                    )}

                    {/* Bouton X */}
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-4 right-4 bg-gray-200 rounded-full p-2 hover:bg-gray-300 transition z-50"
                    >
                        <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Page affichée */}
                    <div className="max-w-3xl w-full px-4 relative">
                        <img
                            src={pagesToShow[currentPage]}
                            alt={`Page ${currentPage + 1}`}
                            className="w-full max-h-[80vh] object-contain rounded shadow"
                            onLoad={() => setIsLoading(false)}
                        />

                        {/* Flèches navigation */}
                        {showNav && (
                            <>
                                <FaChevronLeft
                                    onClick={goPrev}
                                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl cursor-pointer ${currentPage === 0 ? 'opacity-30 cursor-default' : 'hover:text-gray-300'}`}
                                />
                                <FaChevronRight
                                    onClick={goNext}
                                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl cursor-pointer ${currentPage === pagesToShow.length - 1 ? 'opacity-30 cursor-default' : 'hover:text-gray-300'}`}
                                />
                            </>
                        )}

                        {/* Message d'achat si preview terminé */}
                        {!isPurchased && currentPage === pagesToShow.length - 1 && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-6 py-4 rounded shadow text-center">
                                <p className="mb-4 text-gray-800">
                                    {language === 'fr'
                                        ? 'Achetez ce livre pour continuer la lecture.'
                                        : language === 'en'
                                            ? 'Purchase to continue reading.'
                                            : 'اشتر الكتاب لمتابعة القراءة.'}
                                </p>

                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default BookModal;
