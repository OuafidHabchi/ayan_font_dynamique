import { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import axios from 'axios';
import AppURL from '../../components/AppUrl';
import BookLicenceModal from '../../components/BookInvestmentModal';
import FormationLicenceModal from '../../components/FormationInvestmentModal';
import { FaInfoCircle, FaDollarSign } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

type Language = 'fr' | 'en' | 'ar';

interface Book {
    _id: string;
    auteur: { avatar: any; nom: string; prenom: string };
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
        licenceMontant: Number
        sponsoringMontant: Number
    }
}

interface Auteur {
    _id: string;
    nom: string;
    prenom: string;
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
        sponsoringMontant: Number

    }
}

export default function ManagementSponsoring() {
    const language: Language = 'fr';
    const [selectedTab, setSelectedTab] = useState(0);
    const [ebooks, setEbooks] = useState<Book[]>([]);
    const [formations, setFormations] = useState<Formation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

    const [selectedItems, setSelectedItems] = useState<{ id: string; type: 'ebook' | 'formation' }[]>([]);
    const [sponsoringPrice, setSponsoringPrice] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ebooksRes, formationsRes] = await Promise.all([
                axios.get(`${AppURL}/api/Collectionebooks/investment/sponsoring`),
                axios.get(`${AppURL}/api/StudioFormationRoutes/investment/sponsoring`),
            ]);
            setEbooks(ebooksRes.data.ebooks || []);
            setFormations(formationsRes.data.formations || []);
            setError(null);
        } catch (err) {
            console.error('❌ Erreur chargement données sponsoring:', err);
            setError("Erreur lors du chargement des données. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const handleCheckboxChange = (id: string, type: 'ebook' | 'formation') => {
        setSelectedItems((prev) =>
            prev.some(item => item.id === id && item.type === type)
                ? prev.filter(item => !(item.id === id && item.type === type))
                : [...prev, { id, type }]
        );
    };



    const handleSubmitSponsoring = async () => {
        if (!sponsoringPrice || sponsoringPrice <= 0) {
            toast.error(language === 'fr'
                ? 'Veuillez entrer un montant valide'
                : 'Please enter a valid amount');
            return;
        }

        const ebooksToUpdate = selectedItems
            .filter(item => item.type === 'ebook')
            .map(item => ({
                id: item.id,
                sponsoringMontant: sponsoringPrice
            }));

        const formationsToUpdate = selectedItems
            .filter(item => item.type === 'formation')
            .map(item => ({
                id: item.id,
                sponsoringMontant: sponsoringPrice
            }));

        if (ebooksToUpdate.length === 0 && formationsToUpdate.length === 0) {
            toast.error(language === 'fr'
                ? 'Aucun élément valide sélectionné'
                : 'No valid item selected');
            return;
        }

        setIsSubmitting(true);
        try {
            if (ebooksToUpdate.length > 0) {
                await axios.post(`${AppURL}/api/Collectionebooks/Sposoring`, ebooksToUpdate);
            }

            if (formationsToUpdate.length > 0) {
                await axios.post(`${AppURL}/api/StudioFormationRoutes/Sposoring`, formationsToUpdate);
            }

            toast.success(language === 'fr'
                ? 'Sponsoring enregistré avec succès!'
                : 'Sponsoring saved successfully!');
            setSelectedItems([]);
            setSponsoringPrice(0);
        } catch (err) {
            console.error('Erreur:', err);
            toast.error(language === 'fr'
                ? 'Erreur lors de l\'enregistrement'
                : 'Error while saving');
        } finally {
            await fetchData();
            setIsSubmitting(false);
        }
    };




    return (
        <div className="pt-24 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 min-h-screen px-4 sm:px-6 w-full">
            <div className="mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-orange-400 mb-2">
                        {language === 'fr' ? 'Gestion du Sponsoring' : 'Sponsoring Management'}
                    </h1>
                    <p className="text-blue-200 max-w-2xl mx-auto">
                        {language === 'fr'
                            ? 'Sélectionnez les contenus à sponsoriser et définissez votre budget'
                            : 'Select content to sponsor and set your budget'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-900/50 border-l-4 border-red-500 text-red-200 p-4 rounded-lg">
                        <p>{error}</p>
                    </div>
                )}

                <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                    <Tab.List className="flex mb-6 border-b border-orange-400">
                        {['eBooks', 'Formations'].map(tab => (
                            <Tab
                                key={tab}
                                className={({ selected }) =>
                                    `flex-1 py-2 text-center text-lg font-bold transition border-b-4 ${selected
                                        ? 'text-orange-400 border-orange-400'
                                        : 'text-white border-transparent hover:text-orange-300'}`
                                }
                            >
                                {tab}
                            </Tab>
                        ))}
                    </Tab.List>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400"></div>
                        </div>
                    ) : (
                        <Tab.Panels className="mt-2">
                            <Tab.Panel>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {ebooks.length === 0 ? (
                                        <div className="col-span-full text-center py-16 text-blue-200 bg-blue-900/30 rounded-xl">
                                            <div className="text-5xl mb-4">📚</div>
                                            <h3 className="text-xl font-bold mb-2">
                                                {language === 'fr'
                                                    ? 'Aucun eBook disponible'
                                                    : 'No eBooks available'}
                                            </h3>
                                            <p>
                                                {language === 'fr'
                                                    ? 'Aucun eBook ne correspond à vos critères de sponsoring'
                                                    : 'No eBooks match your sponsoring criteria'}
                                            </p>
                                        </div>
                                    ) : (
                                        ebooks.map((book) => (
                                            <motion.div
                                                key={book._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                whileHover={{ scale: 1.02 }}
                                                className={`bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl overflow-hidden shadow-lg cursor-pointer relative border border-blue-700 ${selectedItems.some(item => item.id === book._id && item.type === 'ebook') ? 'ring-2 ring-orange-400' : ''}`}
                                                onClick={(e) => {
                                                    if (!(e.target as HTMLElement).closest('input')) {
                                                        setSelectedBook(book);
                                                    }
                                                }}
                                            >
                                                <div className="p-4">
                                                    <div className="flex items-start space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            className="mt-1 h-5 w-5 text-orange-500 rounded focus:ring-orange-400 bg-blue-900 border-blue-600"
                                                            checked={selectedItems.some(item => item.id === book._id && item.type === 'ebook')}
                                                            onChange={() => handleCheckboxChange(book._id, 'ebook')}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex justify-between items-start">
                                                                <h3 className="font-bold text-white line-clamp-2">{book.titre}</h3>
                                                                {book.promotion && (
                                                                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                                                                        {language === 'fr' ? 'PROMO' : 'SALE'}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center text-blue-200 text-sm">
                                                                <span>{book.auteur.prenom} {book.auteur.nom}</span>
                                                            </div>

                                                            <div className="flex items-center justify-between">


                                                                <div className="text-lg font-bold text-orange-400">
                                                                    <FaDollarSign className="inline mr-1" />
                                                                    {selectedItems.some(item => item.id === book._id && item.type === 'ebook')
                                                                        ? sponsoringPrice.toFixed(2)
                                                                        : (book.investmentOptions.sponsoringMontant?.toFixed(2) ?? "Non dispo")}

                                                                </div>


                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                                {selectedBook && (
                                    <BookLicenceModal
                                        book={selectedBook}
                                        language={language}
                                        InvestmentOption="ManagementSponsoring"
                                        onClose={() => setSelectedBook(null)}
                                    />
                                )}
                            </Tab.Panel>

                            <Tab.Panel>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {formations.length === 0 ? (
                                        <div className="col-span-full text-center py-16 text-blue-200 bg-blue-900/30 rounded-xl">
                                            <div className="text-5xl mb-4">🎓</div>
                                            <h3 className="text-xl font-bold mb-2">
                                                {language === 'fr'
                                                    ? 'Aucune formation disponible'
                                                    : 'No courses available'}
                                            </h3>
                                            <p>
                                                {language === 'fr'
                                                    ? 'Aucune formation ne correspond à vos critères de sponsoring'
                                                    : 'No courses match your sponsoring criteria'}
                                            </p>
                                        </div>
                                    ) : (
                                        formations.map((formation) => (
                                            <motion.div
                                                key={formation._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                whileHover={{ scale: 1.02 }}
                                                className={`bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl overflow-hidden shadow-lg cursor-pointer relative border border-blue-700 ${selectedItems.some(item => item.id === formation._id && item.type === 'formation') ? 'ring-2 ring-orange-400' : ''}`}
                                                onClick={(e) => {
                                                    if (!(e.target as HTMLElement).closest('input')) {
                                                        setSelectedFormation(formation);
                                                    }
                                                }}
                                            >
                                                <div className="p-4">
                                                    <div className="flex items-start space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            className="mt-1 h-5 w-5 text-orange-500 rounded focus:ring-orange-400 bg-blue-900 border-blue-600"
                                                            checked={selectedItems.some(item => item.id === formation._id && item.type === 'formation')}
                                                            onChange={() => handleCheckboxChange(formation._id, 'formation')}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex justify-between items-start">
                                                                <h3 className="font-bold text-white line-clamp-2">
                                                                    {formation.type === 'scolaire'
                                                                        ? `${formation.matiere} - ${formation.niveau}`
                                                                        : formation.titreFormation}
                                                                </h3>
                                                                {formation.promotion && (
                                                                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                                                                        {language === 'fr' ? 'PROMO' : 'SALE'}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center text-blue-200 text-sm">
                                                                <span>{formation.auteur.prenom} {formation.auteur.nom}</span>
                                                            </div>

                                                            <div className="flex items-center justify-between">


                                                                <div className="text-lg font-bold text-orange-400">
                                                                    <FaDollarSign className="inline mr-1" />
                                                                    {selectedItems.some(item => item.id === formation._id && item.type === 'formation')
                                                                        ? sponsoringPrice.toFixed(2)
                                                                        : (formation.investmentOptions.sponsoringMontant?.toFixed(2) ?? "Non dispo")}

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                                {selectedFormation && (
                                    <FormationLicenceModal
                                        formationId={selectedFormation._id}
                                        language={language}
                                        InvestmentOption="ManagementSponsoring"
                                        onClose={() => setSelectedFormation(null)}
                                    />
                                )}
                            </Tab.Panel>
                        </Tab.Panels>
                    )}

                    {selectedItems.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed bottom-0 left-0 w-full z-50 bg-gradient-to-r from-blue-900 to-blue-800 rounded-t-xl p-6 shadow-2xl border-t border-orange-500"
                        >

                            <h3 className="text-xl font-bold text-orange-400 mb-4">
                                {language === 'fr'
                                    ? 'Définir le budget de sponsoring'
                                    : 'Set Sponsoring Budget'}
                            </h3>

                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-medium text-blue-200 mb-2">
                                        {language === 'fr'
                                            ? 'Montant total ($)'
                                            : 'Total Amount ($)'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaDollarSign className="text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            className="block w-full pl-8 pr-12 py-3 bg-blue-950 border border-blue-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-blue-400"
                                            placeholder={language === 'fr' ? '500.00' : '500.00'}
                                            value={sponsoringPrice}
                                            onChange={(e) => setSponsoringPrice(Number(e.target.value))}
                                            min="0"
                                            step="0.01"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400">CA</span>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm text-blue-300">
                                        {language === 'fr'
                                            ? `${selectedItems.length} élément(s) sélectionné(s)`
                                            : `${selectedItems.length} item(s) selected`}
                                    </p>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSubmitSponsoring}
                                    disabled={isSubmitting || !sponsoringPrice || sponsoringPrice <= 0}
                                    className={`w-full md:w-auto px-8 py-3 rounded-lg font-bold shadow-md transition ${isSubmitting || !sponsoringPrice || sponsoringPrice <= 0
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            {language === 'fr' ? 'Envoi...' : 'Submitting...'}
                                        </div>
                                    ) : (
                                        language === 'fr' ? 'Confirmer le Sponsoring' : 'Confirm Sponsoring'
                                    )}
                                </motion.button>
                            </div>

                            <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
                                <h4 className="text-sm font-semibold text-orange-300 mb-2 flex items-center">
                                    <FaInfoCircle className="mr-2" />
                                    {language === 'fr' ? 'Information' : 'Information'}
                                </h4>
                                <p className="text-sm text-blue-200">
                                    {language === 'fr'
                                        ? 'Le montant sera réparti équitablement entre les contenus sélectionnés.'
                                        : 'The amount will be evenly distributed among selected content.'}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </Tab.Group>
            </div>
        </div>
    );
}