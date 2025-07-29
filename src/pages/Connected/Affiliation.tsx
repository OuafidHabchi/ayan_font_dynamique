import { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import axios from 'axios';
import AppURL from '../../components/AppUrl'; // Adapte selon ton arborescence
import BookLicenceModal from '../../components/BookInvestmentModal';
import FormationLicenceModal from '../../components/FormationInvestmentModal';

type Language = 'fr' | 'en' | 'ar';

interface Auteur {
  _id: string;
  nom: string;
  prenom: string;
  avatar: any;
}

interface Book {
  _id: string;
  auteur: Auteur;
  titre: string;
  categorie: string;
  description: string;
  NumPages: number;
  langue: string;
  approved: string;
  ebookId: string;
  folderPath: string;
  prix: number;
  promotion: boolean;
  newPrix: number;
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

interface Chapitre {
  titre: string;
  content?: string;
  video?: string;
}

interface Formation {
  _id: string;
  type: "scolaire" | "autre";
  titreFormation: string;
  coverImage?: string;
  matiere?: string;
  niveau?: string;
  sousNiveau?: string;
  categorie?: string;
  pays?: string;
  prix: number;
  promotion: Boolean;
  newPrix: number;
  auteur: Auteur;
  chapitres: Chapitre[];
  createdAt: string;
  investmentOptions: {
    affiliation: Boolean,
    codePromo: Boolean,
    licence: Boolean,
    sponsoring: Boolean,
    licenceMontant: Number
  }
}

export default function Affiliation() {
  const language: Language = 'fr';
  const [selectedTab, setSelectedTab] = useState(0);

  // eBooks
  const [ebooks, setEbooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Formations
  const [formations, setFormations] = useState<Formation[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

  useEffect(() => {
    const fetchEbooks = async () => {
      try {
        const res = await axios.get(`${AppURL}/api/Collectionebooks/investment/affiliation`);
        setEbooks(res.data.ebooks || []);
      } catch (err) {
        console.error('❌ Erreur eBooks licence:', err);
      }
    };

    const fetchFormations = async () => {
      try {
        const res = await axios.get(`${AppURL}/api/StudioFormationRoutes/investment/affiliation`);
        setFormations(res.data.formations || []);
      } catch (err) {
        console.error('❌ Erreur formations licence:', err);
      }
    };

    fetchEbooks();
    fetchFormations();
  }, []);



  return (
    <div className="pt-24 bg-blue-950 min-h-screen px-4 sm:px-6 w-full">
      <div className="mx-auto">

        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex mb-6 border-b border-orange-400">
            <Tab
              className={({ selected }) =>
                `flex-1 py-2 text-center text-lg font-bold transition border-b-4 ${selected ? 'text-orange-400 border-orange-400' : 'text-white border-transparent hover:text-orange-300'
                }`
              }
            >
              eBooks
            </Tab>
            <Tab
              className={({ selected }) =>
                `flex-1 py-2 text-center text-lg font-bold transition border-b-4 ${selected ? 'text-orange-400 border-orange-400' : 'text-white border-transparent hover:text-orange-300'
                }`
              }
            >
              Formations
            </Tab>
          </Tab.List>

          <p className="text-center text-white font-semibold text-sm md:text-base mb-6">
            {language === 'fr'
              ? 'Sélectionnez un eBook ou une formation à promouvoir pour générer des commissions.'
              : language === 'en'
                ? 'Select an eBook or a training to promote and earn commissions.'
                : 'اختر كتابًا إلكترونيًا أو دورة للترويج وكسب العمولات.'}
          </p>


          <Tab.Panels>
            {/* ✅ Panel eBooks */}
            <Tab.Panel>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {ebooks.map((book) => (
                  <div
                    key={book._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
                    onClick={() => setSelectedBook(book)}
                  >
                    <img
                      src={`${AppURL}${book.folderPath}cover.png`}
                      alt={book.titre}
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-3">
                      <h3 className="font-bold text-sm">{book.titre}</h3>
                      <p className="text-xs text-gray-600">
                        {language === 'fr' ? 'Par' : 'By'} {book.auteur.prenom} {book.auteur.nom}
                      </p>
                      <p className="text-xs mt-1 text-green-600 font-bold">
                        {book.promotion && book.newPrix !== undefined
                          ? `${book.newPrix.toFixed(2)} $`
                          : `${book.prix.toFixed(2)} $`}
                      </p>

                    </div>
                  </div>
                ))}
              </div>
              {selectedBook && (
                <BookLicenceModal book={selectedBook} language={language} onClose={() => setSelectedBook(null)} InvestmentOption='affiliation' />
              )}
            </Tab.Panel>

            {/* ✅ Panel Formations */}
            <Tab.Panel>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {formations.map((f) => (
                  <div
                    key={f._id}
                    onClick={() => setSelectedFormation(f)}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
                  >
                    {f.coverImage && (
                      <img
                        src={`${AppURL}${f.coverImage}`}
                        alt={f.titreFormation}
                        className="h-48 w-full object-cover"
                      />
                    )}
                    <div className="p-3">
                      <h3 className="font-bold text-sm">
                        {f.type === "scolaire"
                          ? `${f.matiere ?? ''} - ${f.niveau ?? ''}`
                          : f.titreFormation}
                      </h3>

                      <p className="text-xs text-gray-600">
                        {language === 'fr' ? 'Par' : 'By'} {f.auteur.prenom} {f.auteur.nom}
                      </p>
                      <p className="text-xs mt-1 text-green-600 font-bold">
                        {f.promotion ? `${f.newPrix.toFixed(2)} $` : `${f.prix?.toFixed(2)} $`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {selectedFormation && (
                <FormationLicenceModal
                  formationId={selectedFormation._id}
                  InvestmentOption='affiliation'
                  language={language}
                  onClose={() => setSelectedFormation(null)}
                />
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
