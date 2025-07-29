import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppURL from '../../components/AppUrl';
import { Dialog } from '@headlessui/react';
import { FaTimes, FaSearch, FaFilter, FaPlus, FaEdit, FaTrash, FaBook, FaGlobe, FaLayerGroup, FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

type Programme = {
    id: string;
    pays: string;
    niveau: string;
    sousNiveau: string;
    matiere: string;
    chapitres: string[];
    createdAt?: string;
    updatedAt?: string;
};

const initialForm = {
    pays: '',
    niveau: '',
    sousNiveau: '',
    matiere: '',
    chapitres: ['']
};
type Language = 'fr' | 'en' | 'ar';

export const ProgrammeEtudes: React.FC = () => {
    const { user } = useAuth();
    const language: Language = ['fr', 'en', 'ar'].includes(user?.langue as string) ? (user?.langue as Language) : 'fr'
    const [programmes, setProgrammes] = useState<Programme[]>([]);
    const [filteredProgrammes, setFilteredProgrammes] = useState<Programme[]>([]);
    const [form, setForm] = useState(initialForm);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null);
    const [loading, setLoading] = useState(true);

    // Filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        pays: '',
        niveau: '',
        sousNiveau: '',
        matiere: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // Options pour les filtres
    const [paysOptions, setPaysOptions] = useState<string[]>([]);
    const [niveauOptions, setNiveauOptions] = useState<string[]>([]);
    const [sousNiveauOptions, setSousNiveauOptions] = useState<string[]>([]);
    const [matiereOptions, setMatiereOptions] = useState<string[]>([]);

    useEffect(() => {
        fetchProgrammes();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [programmes, searchTerm, filters]);

    useEffect(() => {
        // Mettre à jour les options de niveau quand le pays change
        if (filters.pays) {
            const niveaux = Array.from(new Set(
                programmes
                    .filter(p => p.pays === filters.pays)
                    .map(p => p.niveau)
            ));
            setNiveauOptions(niveaux);
            setFilters(prev => ({ ...prev, niveau: '', sousNiveau: '', matiere: '' }));
        }
    }, [filters.pays, programmes]);

    useEffect(() => {
        // Mettre à jour les sous-niveaux quand le niveau change
        if (filters.pays && filters.niveau) {
            const sousNiveaux = Array.from(new Set(
                programmes
                    .filter(p => p.pays === filters.pays && p.niveau === filters.niveau)
                    .map(p => p.sousNiveau)
            ));
            setSousNiveauOptions(sousNiveaux);
            setFilters(prev => ({ ...prev, sousNiveau: '', matiere: '' }));
        }
    }, [filters.niveau, filters.pays, programmes]);

    useEffect(() => {
        // Mettre à jour les matières quand le sous-niveau change
        if (filters.pays && filters.niveau && filters.sousNiveau) {
            const matieres = Array.from(new Set(
                programmes
                    .filter(p =>
                        p.pays === filters.pays &&
                        p.niveau === filters.niveau &&
                        p.sousNiveau === filters.sousNiveau
                    )
                    .map(p => p.matiere)
            ));
            setMatiereOptions(matieres);
            setFilters(prev => ({ ...prev, matiere: '' }));
        }
    }, [filters.sousNiveau, filters.niveau, filters.pays, programmes]);

    const fetchProgrammes = () => {
        setLoading(true);
        axios.get(`${AppURL}/api/programmes/getAll`)
            .then(res => {
                let data = res.data;
                if (!Array.isArray(data)) data = Array.isArray(data.programmes) ? data.programmes : [];

                const normalized = data.map((item: any) => ({
                    ...item,
                    id: item.id ?? item._id
                }));

                setProgrammes(normalized);
                extractFilterOptions(normalized);
            })
            .catch(err => {
                console.error('Erreur récupération programmes :', err);
                setProgrammes([]);
            })
            .finally(() => setLoading(false));
    };

    const extractFilterOptions = (programmes: Programme[]) => {
        const pays = Array.from(new Set(programmes.map(p => p.pays)));
        setPaysOptions(pays);
    };

    const applyFilters = () => {
        let result = [...programmes];

        // Filtre par recherche textuelle
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.pays.toLowerCase().includes(term) ||
                p.niveau.toLowerCase().includes(term) ||
                p.sousNiveau.toLowerCase().includes(term) ||
                p.matiere.toLowerCase().includes(term) ||
                p.chapitres.some(ch => ch.toLowerCase().includes(term))
            );
        }

        // Filtres avancés
        if (filters.pays) {
            result = result.filter(p => p.pays === filters.pays);
        }
        if (filters.niveau) {
            result = result.filter(p => p.niveau === filters.niveau);
        }
        if (filters.sousNiveau) {
            result = result.filter(p => p.sousNiveau === filters.sousNiveau);
        }
        if (filters.matiere) {
            result = result.filter(p => p.matiere === filters.matiere);
        }

        setFilteredProgrammes(result);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setFilters({
            pays: '',
            niveau: '',
            sousNiveau: '',
            matiere: ''
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, idx?: number) => {
        const { name, value } = e.target;
        if (name === 'chapitre' && typeof idx === 'number') {
            const newCh = [...form.chapitres];
            newCh[idx] = value;
            setForm({ ...form, chapitres: newCh });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const addChapitre = () => setForm({ ...form, chapitres: [...form.chapitres, ''] });
    const removeChapitre = (i: number) => {
        const newCh = [...form.chapitres];
        newCh.splice(i, 1);
        setForm({ ...form, chapitres: newCh });
    };

    const openCreateModal = () => {
        setForm(initialForm);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (p: Programme) => {
        setForm(p);
        setSelectedProgramme(p);
        setIsEditModalOpen(true);
    };

    const createProgramme = () => {
        axios.post(`${AppURL}/api/programmes/create`, form)
            .then(() => {
                setIsCreateModalOpen(false);
                setForm(initialForm);
                fetchProgrammes();
            })
            .catch(err => console.error('Erreur création programme :', err));
    };

    const updateProgramme = () => {
        if (!selectedProgramme?.id) return;
        axios.put(`${AppURL}/api/programmes/update/${selectedProgramme.id}`, form)
            .then(() => {
                setIsEditModalOpen(false);
                setForm(initialForm);
                setSelectedProgramme(null);
                fetchProgrammes();
            })
            .catch(err => console.error('Erreur mise à jour programme :', err));
    };

    const deleteProgramme = () => {
        if (!selectedProgramme?.id) return;
        axios.delete(`${AppURL}/api/programmes/delete/${selectedProgramme.id}`)
            .then(() => {
                setIsDeleteModalOpen(false);
                setSelectedProgramme(null);
                fetchProgrammes();
            })
            .catch(err => console.error('Erreur suppression programme :', err));
    };

    return (
        <div className="px-4 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 min-h-screen pt-20 pb-12">
            <div className="mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-orange-400 mb-4">
                        {language === 'fr'
                            ? "Programmes d'Études"
                            : language === 'en'
                                ? 'Study Programs'
                                : 'البرامج الدراسية'}
                    </h2>

                    <p className="text-blue-200 max-w-2xl mx-auto">
                        {language === 'fr'
                            ? 'Gestion complète des programmes éducatifs par pays, niveau et matière'
                            : language === 'en'
                                ? 'Full management of educational programs by country, level, and subject'
                                : 'إدارة كاملة للبرامج التعليمية حسب الدولة والمستوى والمادة'}
                    </p>

                </motion.div>

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl shadow-lg border border-blue-700 p-6 mb-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                        <div className="relative flex-grow">
                            <FaSearch className="absolute left-3 top-3 text-blue-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un programme..."
                                className="w-full pl-10 pr-4 py-2 bg-blue-950/50 border border-blue-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${showFilters ? 'bg-blue-800' : 'bg-blue-800/50 hover:bg-blue-800'}`}
                        >
                            <FaFilter className="text-blue-300" />
                            <span className="text-white">
                                {language === 'fr'
                                    ? 'Filtres'
                                    : language === 'en'
                                        ? 'Filters'
                                        : 'الفلاتر'}
                            </span>
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
                        >
                            <FaPlus />
                            {language === 'fr'
                                ? 'Nouveau'
                                : language === 'en'
                                    ? 'New'
                                    : 'جديد'}

                        </button>
                    </div>

                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                            className="pt-4 border-t border-blue-700"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-blue-300 mb-1">
                                        {language === 'fr'
                                            ? 'Pays'
                                            : language === 'en'
                                                ? 'Country'
                                                : 'البلد'}
                                    </label>
                                    <select
                                        className="w-full bg-blue-950/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        value={filters.pays}
                                        onChange={(e) => setFilters({ ...filters, pays: e.target.value })}
                                    >
                                        <option value="">
                                            {language === 'fr'
                                                ? 'Tous les pays'
                                                : language === 'en'
                                                    ? 'All countries'
                                                    : 'جميع الدول'}
                                        </option>
                                        {paysOptions.map((pays, index) => (
                                            <option key={index} value={pays}>{pays}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-blue-300 mb-1">
                                        {language === 'fr'
                                            ? 'Niveau'
                                            : language === 'en'
                                                ? 'Level'
                                                : 'المستوى'}
                                    </label>
                                    <select
                                        className="w-full bg-blue-950/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        value={filters.niveau}
                                        onChange={(e) => setFilters({ ...filters, niveau: e.target.value })}
                                        disabled={!filters.pays}
                                    >
                                        <option value="">
                                            {language === 'fr'
                                                ? 'Tous les niveaux'
                                                : language === 'en'
                                                    ? 'All levels'
                                                    : 'جميع المستويات'}
                                        </option>
                                        {niveauOptions.map((niveau, index) => (
                                            <option key={index} value={niveau}>{niveau}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-blue-300 mb-1">
                                        {language === 'fr'
                                            ? 'Sous-niveau'
                                            : language === 'en'
                                                ? 'Sub-level'
                                                : 'المستوى الفرعي'}
                                    </label>
                                    <select
                                        className="w-full bg-blue-950/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        value={filters.sousNiveau}
                                        onChange={(e) => setFilters({ ...filters, sousNiveau: e.target.value })}
                                        disabled={!filters.niveau}
                                    >
                                        <option value="">
                                            {language === 'fr'
                                                ? 'Tous les sous-niveaux'
                                                : language === 'en'
                                                    ? 'All sub-levels'
                                                    : 'جميع المستويات الفرعية'}
                                        </option>
                                        {sousNiveauOptions.map((sousNiveau, index) => (
                                            <option key={index} value={sousNiveau}>{sousNiveau}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-blue-300 mb-1">
                                        {language === 'fr'
                                            ? 'Matière'
                                            : language === 'en'
                                                ? 'Subject'
                                                : 'المادة'}
                                    </label>
                                    <select
                                        className="w-full bg-blue-950/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        value={filters.matiere}
                                        onChange={(e) => setFilters({ ...filters, matiere: e.target.value })}
                                        disabled={!filters.sousNiveau}
                                    >
                                        <option value="">
                                            {language === 'fr'
                                                ? 'Toutes les matières'
                                                : language === 'en'
                                                    ? 'All subjects'
                                                    : 'جميع المواد'}
                                        </option>
                                        {matiereOptions.map((matiere, index) => (
                                            <option key={index} value={matiere}>{matiere}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={resetFilters}
                                    className="text-orange-400 hover:text-orange-300 flex items-center gap-1"
                                >
                                    <FaTimes />
                                    {language === 'fr'
                                        ? 'Réinitialiser les filtres'
                                        : language === 'en'
                                            ? 'Reset filters'
                                            : 'إعادة تعيين الفلاتر'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                >
                    <div className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl shadow-lg border border-blue-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-800/50 p-3 rounded-full">
                                <FaBook className="text-blue-300 text-xl" />
                            </div>
                            <div>
                                <p className="text-blue-300 text-sm">
                                    {language === 'fr'
                                        ? 'Total Programmes'
                                        : language === 'en'
                                            ? 'Total Programs'
                                            : 'إجمالي البرامج'}
                                </p>
                                <p className="text-white text-2xl font-bold">{programmes.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl shadow-lg border border-blue-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-800/50 p-3 rounded-full">
                                <FaGlobe className="text-blue-300 text-xl" />
                            </div>
                            <div>
                                <p className="text-blue-300 text-sm">
                                    {language === 'fr'
                                        ? 'Pays'
                                        : language === 'en'
                                            ? 'Country'
                                            : 'البلد'}
                                </p>
                                <p className="text-white text-2xl font-bold">{paysOptions.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl shadow-lg border border-blue-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-800/50 p-3 rounded-full">
                                <FaLayerGroup className="text-blue-300 text-xl" />
                            </div>
                            <div>
                                <p className="text-blue-300 text-sm">
                                    {language === 'fr'
                                        ? 'Résultats'
                                        : language === 'en'
                                            ? 'Results'
                                            : 'النتائج'}
                                </p>
                                <p className="text-white text-2xl font-bold">{filteredProgrammes.length}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400"></div>
                    </div>
                ) : (
                    <>
                        {/* Programmes List */}
                        {filteredProgrammes.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filteredProgrammes.map(programme => (
                                    <motion.div
                                        key={programme.id}
                                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)" }}
                                        className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl shadow-lg border border-blue-700 overflow-hidden cursor-pointer"
                                        onClick={() => openEditModal(programme)}
                                    >
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{programme.matiere}</h3>
                                                    <p className="text-blue-300">{programme.pays}</p>
                                                </div>
                                                <div className="bg-blue-800/50 p-3 rounded-full">
                                                    <FaBook className="text-blue-300" />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-3">
                                                <FaGraduationCap className="text-blue-400" />
                                                <span className="text-white">{programme.niveau}</span>
                                                {programme.sousNiveau && (
                                                    <>
                                                        <span className="text-blue-400">/</span>
                                                        <span className="text-white">{programme.sousNiveau}</span>
                                                    </>
                                                )}
                                            </div>

                                            <div className="mt-4">
                                                <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
                                                    <FaChalkboardTeacher />
                                                    {language === 'fr'
                                                        ? 'Chapitres'
                                                        : language === 'en'
                                                            ? 'Chapters'
                                                            : 'الفصول'}

                                                </h4>
                                                <ul className="space-y-1">
                                                    {programme.chapitres.slice(0, 3).map((chapitre, index) => (
                                                        <li key={index} className="text-white text-sm truncate">
                                                            • {chapitre}
                                                        </li>
                                                    ))}
                                                    {programme.chapitres.length > 3 && (
                                                        <li className="text-blue-400 text-sm">
                                                            {language === 'fr'
                                                                ? `+ ${programme.chapitres.length - 3} autres...`
                                                                : language === 'en'
                                                                    ? `+ ${programme.chapitres.length - 3} more...`
                                                                    : `+ ${programme.chapitres.length - 3} أخرى...`}
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl shadow-lg border border-blue-700 p-12 text-center"
                            >
                                <FaBook className="mx-auto text-4xl text-blue-400 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {language === 'fr'
                                        ? 'Aucun programme trouvé'
                                        : language === 'en'
                                            ? 'No program found'
                                            : 'لم يتم العثور على أي برنامج'}
                                </h3>
                                <p className="text-blue-300">
                                    {searchTerm || Object.values(filters).some(f => f)
                                        ? "Essayez de modifier vos critères de recherche"
                                        : "Commencez par créer un nouveau programme"}
                                </p>
                            </motion.div>
                        )}
                    </>
                )}

                {/* Create Modal */}
                <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} className="relative z-50">
                    <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl shadow-2xl border border-blue-700 w-full max-h-[90vh] overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative"
                            >
                                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <Dialog.Title className="text-2xl font-bold text-white">
                                            {language === 'fr'
                                                ? 'Créer un nouveau programme'
                                                : language === 'en'
                                                    ? 'Create a new program'
                                                    : 'إنشاء برنامج جديد'}
                                        </Dialog.Title>
                                        <button
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="text-blue-300 hover:text-white p-1 rounded-full hover:bg-blue-800/50"
                                        >
                                            <FaTimes className="text-xl" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-blue-300 mb-1">
                                                {language === 'fr'
                                                    ? 'Pays'
                                                    : language === 'en'
                                                        ? 'Country'
                                                        : 'البلد'}
                                            </label>
                                            <input
                                                className="w-full bg-blue-950/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                name="pays"
                                                value={form.pays}
                                                onChange={handleInputChange}
                                                placeholder="France"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-blue-300 mb-1">
                                                {language === 'fr'
                                                    ? 'Niveau'
                                                    : language === 'en'
                                                        ? 'Level'
                                                        : 'المستوى'}
                                            </label>
                                            <input
                                                className="w-full bg-blue-950/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                name="niveau"
                                                value={form.niveau}
                                                onChange={handleInputChange}
                                                placeholder="Secondaire"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-blue-300 mb-1">
                                                {language === 'fr'
                                                    ? 'Sous-niveau'
                                                    : language === 'en'
                                                        ? 'Sub-level'
                                                        : 'المستوى الفرعي'}
                                            </label>
                                            <input
                                                className="w-full bg-blue-950/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                name="sousNiveau"
                                                value={form.sousNiveau}
                                                onChange={handleInputChange}
                                                placeholder="Terminale"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-blue-300 mb-1">
                                                {language === 'fr'
                                                    ? 'Matière'
                                                    : language === 'en'
                                                        ? 'Subject'
                                                        : 'المادة'}
                                            </label>
                                            <input
                                                className="w-full bg-blue-950/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                name="matiere"
                                                value={form.matiere}
                                                onChange={handleInputChange}
                                                placeholder="Mathématiques"
                                            />
                                        </div>
                                    </div>

                                    <label className="block text-sm font-medium text-blue-300 mb-2">
                                        {language === 'fr'
                                            ? 'Chapitres'
                                            : language === 'en'
                                                ? 'Chapters'
                                                : 'الفصول'}
                                    </label>
                                    <div className="space-y-3 mb-4">
                                        {form.chapitres.map((ch, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input
                                                    className="flex-grow bg-blue-950/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    name="chapitre"
                                                    value={ch}
                                                    onChange={(e) => handleInputChange(e, i)}
                                                    placeholder={`Chapitre ${i + 1}`}
                                                />
                                                <button
                                                    onClick={() => removeChapitre(i)}
                                                    className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-blue-800/50"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={addChapitre}
                                        className="flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-6"
                                    >
                                        <FaPlus />
                                        {language === 'fr'
                                            ? 'Ajouter un chapitre'
                                            : language === 'en'
                                                ? 'Add a chapter'
                                                : 'إضافة فصل'}

                                    </button>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-blue-700">
                                        <button
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="px-4 py-2 border border-blue-700 text-white rounded-lg hover:bg-blue-800/50"
                                        >
                                            {language === 'fr'
                                                ? 'Annuler'
                                                : language === 'en'
                                                    ? 'Cancel'
                                                    : 'إلغاء'}

                                        </button>
                                        <button
                                            onClick={createProgramme}
                                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2"
                                        >
                                            <FaPlus />
                                            {language === 'fr'
                                                ? 'Créer le programme'
                                                : language === 'en'
                                                    ? 'Create the program'
                                                    : 'إنشاء البرنامج'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </Dialog.Panel>
                    </div>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="relative z-50">
                    <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl shadow-2xl border border-blue-700 w-full max-h-[90vh] overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative"
                            >
                                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <Dialog.Title className="text-2xl font-bold text-white">
                                            {language === 'fr'
                                                ? 'Modifier le programme'
                                                : language === 'en'
                                                    ? 'Edit the program'
                                                    : 'تعديل البرنامج'}
                                        </Dialog.Title>
                                        <button
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="text-blue-300 hover:text-white p-1 rounded-full hover:bg-blue-800/50"
                                        >
                                            <FaTimes className="text-xl" />
                                        </button>
                                    </div>

                                    {selectedProgramme && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-blue-300 mb-1">
                                                        {language === 'fr'
                                                            ? 'Pays'
                                                            : language === 'en'
                                                                ? 'Country'
                                                                : 'البلد'}
                                                    </label>
                                                    <input
                                                        className="w-full bg-blue-950/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                        name="pays"
                                                        value={form.pays}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-blue-300 mb-1">
                                                        {language === 'fr'
                                                            ? 'Niveau'
                                                            : language === 'en'
                                                                ? 'Level'
                                                                : 'المستوى'}
                                                    </label>
                                                    <input
                                                        className="w-full bg-blue-950/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                        name="niveau"
                                                        value={form.niveau}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-blue-300 mb-1">
                                                        {language === 'fr'
                                                            ? 'Sous-niveau'
                                                            : language === 'en'
                                                                ? 'Sub-level'
                                                                : 'المستوى الفرعي'}
                                                    </label>
                                                    <input
                                                        className="w-full bg-blue-950/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                        name="sousNiveau"
                                                        value={form.sousNiveau}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-blue-300 mb-1">
                                                        {language === 'fr'
                                                            ? 'Matière'
                                                            : language === 'en'
                                                                ? 'Subject'
                                                                : 'المادة'}
                                                    </label>
                                                    <input
                                                        className="w-full bg-blue-950/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                        name="matiere"
                                                        value={form.matiere}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>

                                            <label className="block text-sm font-medium text-blue-300 mb-2">
                                                {language === 'fr'
                                                    ? 'Chapitres'
                                                    : language === 'en'
                                                        ? 'Chapters'
                                                        : 'الفصول'}
                                            </label>
                                            <div className="space-y-3 mb-4">
                                                {form.chapitres.map((ch, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <input
                                                            className="flex-grow bg-blue-950/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                            name="chapitre"
                                                            value={ch}
                                                            onChange={(e) => handleInputChange(e, i)}
                                                        />
                                                        <button
                                                            onClick={() => removeChapitre(i)}
                                                            className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-blue-800/50"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={addChapitre}
                                                className="flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-6"
                                            >
                                                <FaPlus />
                                                {language === 'fr'
                                                    ? 'Ajouter un chapitre'
                                                    : language === 'en'
                                                        ? 'Add a chapter'
                                                        : 'إضافة فصل'}

                                            </button>

                                            <div className="flex justify-between items-center pt-4 border-t border-blue-700">
                                                <button
                                                    onClick={() => {
                                                        setIsEditModalOpen(false);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="text-red-500 hover:text-red-400 flex items-center gap-2"
                                                >
                                                    <FaTrash />
                                                    {language === 'fr'
                                                        ? 'Supprimer'
                                                        : language === 'en'
                                                            ? 'Delete'
                                                            : 'حذف'}

                                                </button>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => setIsEditModalOpen(false)}
                                                        className="px-4 py-2 border border-blue-700 text-white rounded-lg hover:bg-blue-800/50"
                                                    >
                                                        {language === 'fr'
                                                            ? 'Annuler'
                                                            : language === 'en'
                                                                ? 'Cancel'
                                                                : 'إلغاء'}

                                                    </button>
                                                    <button
                                                        onClick={updateProgramme}
                                                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2"
                                                    >
                                                        <FaEdit />
                                                        {language === 'fr'
                                                            ? 'Enregistrer'
                                                            : language === 'en'
                                                                ? 'Save'
                                                                : 'حفظ'}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </Dialog.Panel>
                    </div>
                </Dialog>

                {/* Delete Modal */}
                <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="relative z-50">
                    <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl shadow-2xl border border-blue-700 w-full max-w-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative"
                            >
                                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <Dialog.Title className="text-2xl font-bold text-white">
                                            {language === 'fr'
                                                ? 'Confirmer la suppression'
                                                : language === 'en'
                                                    ? 'Confirm deletion'
                                                    : 'تأكيد الحذف'}
                                        </Dialog.Title>
                                        <button
                                            onClick={() => setIsDeleteModalOpen(false)}
                                            className="text-blue-300 hover:text-white p-1 rounded-full hover:bg-blue-800/50"
                                        >
                                            <FaTimes className="text-xl" />
                                        </button>
                                    </div>

                                    {selectedProgramme && (
                                        <>
                                            <p className="text-blue-300 mb-6">
                                                {language === 'fr'
                                                    ? (
                                                        <>Êtes-vous sûr de vouloir supprimer définitivement le programme de <strong className="text-white">{selectedProgramme.matiere}</strong> ({selectedProgramme.pays} - {selectedProgramme.niveau}) ?</>
                                                    )
                                                    : language === 'en'
                                                        ? (
                                                            <>Are you sure you want to permanently delete the <strong className="text-white">{selectedProgramme.matiere}</strong> program ({selectedProgramme.pays} - {selectedProgramme.niveau})?</>
                                                        )
                                                        : (
                                                            <>هل أنت متأكد أنك تريد حذف برنامج <strong className="text-white">{selectedProgramme.matiere}</strong> نهائياً ({selectedProgramme.pays} - {selectedProgramme.niveau})؟</>
                                                        )
                                                }
                                            </p>

                                            <div className="flex justify-end gap-3 pt-4 border-t border-blue-700">
                                                <button
                                                    onClick={() => setIsDeleteModalOpen(false)}
                                                    className="px-4 py-2 border border-blue-700 text-white rounded-lg hover:bg-blue-800/50"
                                                >
                                                    {language === 'fr'
                                                        ? 'Annuler'
                                                        : language === 'en'
                                                            ? 'Cancel'
                                                            : 'إلغاء'}

                                                </button>
                                                <button
                                                    onClick={deleteProgramme}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                                                >
                                                    <FaTrash />
                                                    {language === 'fr'
                                                        ? 'Supprimer'
                                                        : language === 'en'
                                                            ? 'Delete'
                                                            : 'حذف'}

                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};