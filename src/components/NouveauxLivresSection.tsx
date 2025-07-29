import React, { useRef, useEffect, useState } from 'react';
import BookModal from './BookModal';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AppURL from './AppUrl';
import axios from 'axios';

interface Book {
  newPrix: number;
  promotion: any;
  tag: string;
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
  folderPath: string;
  ebookId: string;
  approved: string;
  createdAt: string;
  investmentOptions: {
        affiliation: Boolean,
        codePromo: Boolean,
        licence: Boolean,
        sponsoring: Boolean,
        licenceMontant: Number,
        sponsoringMontant: Number
    }
}

interface Props {
  language: 'fr' | 'en' | 'ar';
}

const NouveauxLivresSection: React.FC<Props> = ({ language }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const animationRef = useRef<number | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInteracting = useRef(false);


  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`${AppURL}/api/Collectionebooks/overview`);

        // Ajoute un tag à chaque livre selon sa catégorie
        const latestTagged = res.data.latest.map((book: Book) => ({
          ...book,
          tag: 'new',
        }));
        const promotedTagged = res.data.promoted.map((book: Book) => ({
          ...book,
          tag: 'promo',
        }));

        // Fusionner les deux en conservant les doublons éventuels
        const combined = [...latestTagged, ...promotedTagged];

        // Optionnel : dédupliquer par ebookId
        const uniqueBooks = Array.from(
          new Map(combined.map(book => [book.ebookId, book])).values()
        );

        setBooks(uniqueBooks);
      } catch (error) {
        console.error('Erreur lors du chargement des ebooks', error);
      }
    };

    fetchBooks();
  }, [language]);


  const displayBooks = [...books, ...books, ...books]; // triple pour effet infini

  const smoothScroll = () => {
    if (isUserInteracting.current) return;
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
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      isUserInteracting.current = false;
      startAutoScroll();
    }, 3000);
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
  }, [books]);

  const handleUserInteraction = () => {
    isUserInteracting.current = true;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    resetInactivityTimer();
  };

  const scrollLeft = () => {
    handleUserInteraction();
    scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    handleUserInteraction();
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  return (
    <div className="mb-8 relative">
      <h2 className="text-2xl md:text-2xl font-bold text-orange-400 mb-4">
        {language === 'fr' ? 'Nouveautés & Promotions' : language === 'en' ? 'New & Promotions' : 'الجديد والعروض'}
      </h2>

      {/* Arrows */}
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
              onClick={() => setSelectedBook(book)}
              className="bg-blue-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-transform transform hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col w-36 flex-shrink-0"
            >
              <div className="relative" style={{ height: '150px' }}>
                <img
                  src={`${AppURL}${book.folderPath}cover.png`}
                  alt={book.titre}
                  className="absolute h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {book.tag === 'new' && (
                  <span className="absolute top-2 left-2 bg-orange-400 text-white text-xs px-2 py-0.5 rounded">
                    NEW
                  </span>
                )}
                {book.tag === 'promo' && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                    PROMOTION
                  </span>
                )}

              </div>

              <div className="p-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-xs text-blue-950 mb-1 line-clamp-2">{book.titre}</h3>
                  <p className="text-[10px] text-gray-600 mb-1">
                    {language === 'fr' ? 'Par' : language === 'en' ? 'By' : 'بواسطة'} {book.auteur?.prenom} {book.auteur?.nom}
                  </p>
                  <span className="inline-block text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded mt-1">
                    {book.categorie}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  {book.promotion ? (
                    <div className="flex flex-col">
                      <span className="line-through text-red-700 text-[10px]">
                        {book.prix.toFixed(2)} $
                      </span>
                      <span className="text-green-800 font-bold text-xs">
                        {(book.newPrix ?? 0).toFixed(2)} $
                      </span>
                    </div>
                  ) : (
                    <p className="font-bold text-green-800 text-xs">
                      {book.prix.toFixed(2)} $
                    </p>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBook(book);
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
