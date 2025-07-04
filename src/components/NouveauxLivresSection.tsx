import React, { useRef, useEffect, useState } from 'react';
import { fakeBooks, Book } from './fakeBooks';
import BookModal from './BookModal';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Props {
  language: 'fr' | 'en' | 'ar';
}

const NouveauxLivresSection: React.FC<Props> = ({ language }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const animationRef = useRef<number | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInteracting = useRef(false);

  // Tripler les livres pour l'effet infini
  const displayBooks = [...fakeBooks, ...fakeBooks, ...fakeBooks];

  const smoothScroll = () => {
    if (isUserInteracting.current) return;

    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 0.5;

      const scrollWidth = scrollRef.current.scrollWidth / 3;
      const currentScroll = scrollRef.current.scrollLeft;

      // Réinitialiser la position pour l'effet infini
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
    }, 3000); // 5 secondes d'inactivité
  };

  useEffect(() => {
    if (scrollRef.current) {
      const scrollWidth = scrollRef.current.scrollWidth / 3;
      scrollRef.current.scrollLeft = scrollWidth;
    }
    startAutoScroll();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, []);

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

  const handleBookClick = (book: Book) => {
    handleUserInteraction();
    setSelectedBook(book);
  };

  const getBadge = () => {
    // retourne aléatoirement new ou promotion
    return Math.random() > 0.5
      ? { text: 'NEW', color: 'bg-orange-400' }
      : { text: 'PROMOTION', color: 'bg-red-500' };
  };


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
          {displayBooks.map((book, index) => (
            <div
              key={index}
              onClick={() => handleBookClick(book)}
              className="bg-blue-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-transform transform hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col w-36 flex-shrink-0"
            >
              <div className="relative" style={{ height: '150px' }}>
                <img
                  src={book.image}
                  alt={book.titre}
                  className="absolute h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* BADGE */}
                {(() => {
                  const badge = getBadge();
                  return (
                    <span className={`absolute top-2 left-2 ${badge.color} text-white text-xs px-2 py-0.5 rounded`}>
                      {badge.text}
                    </span>
                  );
                })()}
              </div>

              <div className="p-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-xs text-blue-950 mb-1 line-clamp-2">{book.titre}</h3>
                  <p className="text-[10px] text-gray-600 mb-1">
                    {language === 'fr' ? 'Par' : language === 'en' ? 'By' : 'بواسطة'} {book.auteur}
                  </p>
                  <span className="inline-block text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded mt-1">
                    {book.categorie}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <p className="font-bold text-green-800 text-xs">{book.prix.toFixed(2)} $</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookClick(book);
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

      {selectedBook && (
        <BookModal
          book={selectedBook}
          language={language}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
};

export default NouveauxLivresSection;