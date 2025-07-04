import React, { useState } from 'react';
import { fakeBooks, Book } from '../../components/fakeBooks';
import BookModal from '../../components/BookModal';
import NouveauxLivresSection from '../../components/NouveauxLivresSection';

type Language = 'fr' | 'en' | 'ar';

interface EbookProps {
  language: Language;
}

const Ebook: React.FC<EbookProps> = ({ language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Récupérer toutes les catégories uniques
  const categories = Array.from(new Set(fakeBooks.map(book => book.categorie)));

  const titles: Record<Language, string> = {
  fr: "Explorez nos eBooks",
  en: "Explore our eBooks",
  ar: "استكشف كتبنا الإلكترونية",
};

const description: Record<Language, string> = {
  fr: "Accédez à des eBooks inspirants pour progresser chaque jour et atteindre vos objectifs.",
  en: "Access inspiring eBooks to grow every day and reach your goals.",
  ar: "احصل على كتب إلكترونية ملهمة لتتطور كل يوم وتحقق أهدافك.",
};


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const filteredBooks = fakeBooks.filter((book) => {
    const matchesSearch = book.titre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? book.categorie === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-24 bg-blue-950 min-h-screen px-4 sm:px-6 w-full ">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">{titles[language]}</h1>
          <p className="text-md text-white max-w-2xl mx-auto font-bold">{description[language]}</p>
        </div>

        {/* 🚀 Nouvelle section ici */}
        <NouveauxLivresSection language={language} />

        {/* Search and Filter */}
        <div className="mb-8 w-full">
          {/* Search Bar */}
          <div className="relative w-full  mx-auto mb-4 text-white">
            <input
              type="text"
              placeholder={
                language === 'fr'
                  ? 'Rechercher par titre...'
                  : language === 'en'
                    ? 'Search by title...'
                    : 'ابحث حسب العنوان...'
              }
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-5 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Categories */}
          <div className="w-full">
            <span className="text-lg md:text-xl font-bold text-orange-400 mb-2 block">
              {language === 'fr'
                ? 'Choisir catégorie'
                : language === 'en'
                  ? 'Choose category'
                  : 'اختر فئة'}
            </span>



            <div className="overflow-x-auto" 
            style={{ scrollbarWidth: 'none' }}
            >
              <div className="flex gap-2 w-max px-2 pb-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedCategory === category
                      ? 'bg-orange-400 text-white shadow-md'
                      : 'bg-white text-gray-800 border border-gray-300 shadow-sm hover:bg-gray-50'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>


        {/* Books Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full ">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className=" mb-8  bg-blue-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-transform transform hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col"
            >
              <div
                className="relative aspect-[3/4] group"
                onClick={() => setSelectedBook(book)} // ouvre le modal de détails
                style={{ height: '180px' }} // ✅ hauteur réduite
              >
                <img
                  src={book.image}
                  alt={book.titre}
                  className="absolute h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2 flex-1 flex flex-col justify-between"> {/* ✅ padding réduit */}
                <div>
                  <h3 className="font-semibold text-xs text-blue-950 mb-1 line-clamp-2">{book.titre}</h3> {/* ✅ taille titre réduite */}
                  <p className="text-[10px] text-gray-600 mb-1">
                    {language === 'fr' ? 'Par' : language === 'en' ? 'By' : 'بواسطة'} {book.auteur}
                  </p>
                  <span className="inline-block text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded mt-1">
                    {book.categorie}
                  </span>
                </div>

                <div className="mt-2 flex justify-between items-center">
                  <p className="font-bold text-green-800 text-xs">{book.prix.toFixed(2)} $</p>
                  <button
                    onClick={() => setSelectedBook(book)} // ouvre le modal de détails
                    className="text-[10px] bg-blue-950 text-white px-2 py-1 rounded-md hover:bg-orange-400 transition-colors duration-300"
                  >
                    {language === 'fr' ? 'Aperçu' : language === 'en' ? 'Overview' : 'نظرة'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>





        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="mt-3 text-lg font-medium text-gray-700">
              {language === 'fr' && 'Aucun livre trouvé'}
              {language === 'en' && 'No books found'}
              {language === 'ar' && 'لم يتم العثور على كتب'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {language === 'fr' && 'Essayez de modifier vos critères de recherche.'}
              {language === 'en' && 'Try adjusting your search criteria.'}
              {language === 'ar' && 'حاول تعديل معايير البحث الخاصة بك.'}
            </p>
          </div>
        )}

        {/* Book Modal */}
        {selectedBook && (
          <BookModal
            book={selectedBook}
            language={language}
            onClose={() => setSelectedBook(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Ebook;