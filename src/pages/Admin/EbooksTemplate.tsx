import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaTrash, FaEdit, FaTimes, FaBook } from "react-icons/fa";
import AppURL from "../../components/AppUrl";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

interface Template {
    _id: string;
    titre: string;
    imageUrl: string;
    createdAt?: string;
    updatedAt?: string;
}

type Language = 'fr' | 'en' | 'ar';

const EbooksTemplate: React.FC = () => {
    const { user } = useAuth();
    const language: Language = ['fr', 'en', 'ar'].includes(user?.langue as string) ? (user?.langue as Language) : 'fr';

    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    const [form, setForm] = useState({
        titre: "",
        image: null as File | null,
        imagePreview: null as string | null
    });

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${AppURL}/api/templates`);
            setTemplates(res.data.templates || []);
        } catch (err) {
            console.error("Erreur lors de la récupération des templates :", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const openCreateModal = () => {
        setForm({
            titre: "",
            image: null,
            imagePreview: null
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (template: Template) => {
        setSelectedTemplate(template);
        setForm({
            titre: template.titre,
            image: null,
            imagePreview: template.imageUrl
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (template: Template) => {
        setSelectedTemplate(template);
        setIsDeleteModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm({
                ...form,
                image: file,
                imagePreview: URL.createObjectURL(file)
            });
        }
    };

    const createTemplate = async () => {
        try {
            const formData = new FormData();
            formData.append("titre", form.titre);
            if (form.image) formData.append("image", form.image);

            await axios.post(`${AppURL}/api/templates`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setIsCreateModalOpen(false);
            fetchTemplates();
        } catch (err) {
            console.error("Erreur lors de la création du template :", err);
        }
    };

    const updateTemplate = async () => {
        if (!selectedTemplate) return;

        try {
            const formData = new FormData();
            formData.append("titre", form.titre);
            if (form.image) formData.append("image", form.image);

            await axios.put(`${AppURL}/api/templates/${selectedTemplate._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setIsEditModalOpen(false);
            fetchTemplates();
        } catch (err) {
            console.error("Erreur lors de la mise à jour du template :", err);
        }
    };

    const deleteTemplate = async () => {
        if (!selectedTemplate) return;

        try {
            await axios.delete(`${AppURL}/api/templates/${selectedTemplate._id}`);
            setIsDeleteModalOpen(false);
            setSelectedTemplate(null);
            fetchTemplates();
        } catch (err) {
            console.error("Erreur lors de la suppression du template :", err);
        }
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
                            ? "Modèles d'eBooks"
                            : language === 'en'
                                ? 'eBook Templates'
                                : 'نماذج الكتب الإلكترونية'}
                    </h2>
                    <p className="text-blue-200 max-w-2xl mx-auto">
                        {language === 'fr'
                            ? 'Gestion des modèles de couvertures pour vos ebooks éducatifs'
                            : language === 'en'
                                ? 'Manage cover templates for your educational ebooks'
                                : 'إدارة نماذج الأغلفة لكتبك الإلكترونية التعليمية'}
                    </p>
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
                                        ? 'Total Modèles'
                                        : language === 'en'
                                            ? 'Total Templates'
                                            : 'إجمالي النماذج'}
                                </p>
                                <p className="text-white text-2xl font-bold">{templates.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl shadow-lg border border-blue-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-800/50 p-3 rounded-full">
                                <FaBook className="text-blue-300 text-xl" />
                            </div>
                            <div>
                                <p className="text-blue-300 text-sm">
                                    {language === 'fr'
                                        ? 'Dernier ajout'
                                        : language === 'en'
                                            ? 'Last added'
                                            : 'آخر إضافة'}
                                </p>
                                <p className="text-white text-2xl font-bold">
                                    {templates.length > 0
                                        ? new Date(templates[templates.length - 1].createdAt || '').toLocaleDateString()
                                        : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl shadow-lg border border-blue-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-800/50 p-3 rounded-full">
                                <FaBook className="text-blue-300 text-xl" />
                            </div>
                            <div>
                                <p className="text-blue-300 text-sm">
                                    {language === 'fr'
                                        ? 'Modifié récemment'
                                        : language === 'en'
                                            ? 'Recently modified'
                                            : 'تم التعديل مؤخرًا'}
                                </p>
                                <p className="text-white text-2xl font-bold">
                                    {templates.length > 0
                                        ? new Date(
                                            templates.reduce((latest, tpl) => {
                                                const updated = tpl.updatedAt || tpl.createdAt || '';
                                                return updated > latest ? updated : latest;
                                            }, '')
                                        ).toLocaleDateString()
                                        : '-'}
                                </p>
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
                        {/* Templates List */}
                        {templates.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {templates.map(template => (
                                    <motion.div
                                        key={template._id}
                                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)" }}
                                        className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl shadow-lg border border-blue-700 overflow-hidden"
                                    >
                                        <div className="relative">
                                            <img
                                                src={`${AppURL}${template.imageUrl}`}
                                                alt={template.titre}
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="absolute top-3 right-3 flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(template)}
                                                    className="bg-blue-800/70 hover:bg-blue-700 text-white p-2 rounded-full shadow backdrop-blur-sm"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(template)}
                                                    className="bg-red-600/70 hover:bg-red-700 text-white p-2 rounded-full shadow backdrop-blur-sm"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-white mb-2">{template.titre}</h3>
                                            <div className="flex justify-between text-sm text-blue-300">
                                                <span>
                                                    {language === 'fr'
                                                        ? `Créé le : ${new Date(template.createdAt || '').toLocaleDateString()}`
                                                        : language === 'en'
                                                            ? `Created on: ${new Date(template.createdAt || '').toLocaleDateString()}`
                                                            : `تم الإنشاء في: ${new Date(template.createdAt || '').toLocaleDateString()}`}
                                                </span>
                                                {template.updatedAt && (
                                                    <span>
                                                        {language === 'fr'
                                                            ? `Modifié le : ${new Date(template.updatedAt).toLocaleDateString()}`
                                                            : language === 'en'
                                                                ? `Modified on: ${new Date(template.updatedAt).toLocaleDateString()}`
                                                                : `تم التعديل في: ${new Date(template.updatedAt).toLocaleDateString()}`}
                                                    </span>
                                                )}
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
                                        ? 'Aucun modèle trouvé'
                                        : language === 'en'
                                            ? 'No templates found'
                                            : 'لم يتم العثور على نماذج'}
                                </h3>
                                <p className="text-blue-300">
                                    {language === 'fr'
                                        ? 'Commencez par créer un nouveau modèle de couverture'
                                        : language === 'en'
                                            ? 'Start by creating a new cover template'
                                            : 'ابدأ بإنشاء نموذج غلاف جديد'}
                                </p>
                            </motion.div>
                        )}
                    </>
                )}

                {/* Floating action button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openCreateModal}
                    className="fixed bottom-8 right-8 bg-orange-600 hover:bg-orange-700 text-white p-5 rounded-full shadow-xl z-10"
                >
                    <FaPlus size={24} />
                </motion.button>

                {/* Create Modal */}
                <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} className="relative z-50">
                    <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl shadow-2xl border border-blue-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                                                ? 'Créer un nouveau modèle'
                                                : language === 'en'
                                                    ? 'Create a new template'
                                                    : 'إنشاء نموذج جديد'}
                                        </Dialog.Title>
                                        <button
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="text-blue-300 hover:text-white p-1 rounded-full hover:bg-blue-800/50"
                                        >
                                            <FaTimes className="text-xl" />
                                        </button>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-blue-300 mb-1">
                                            {language === 'fr'
                                                ? 'Titre du modèle'
                                                : language === 'en'
                                                    ? 'Template Title'
                                                    : 'عنوان النموذج'}
                                        </label>
                                        <input
                                            className="w-full bg-blue-950/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            value={form.titre}
                                            onChange={(e) => setForm({ ...form, titre: e.target.value })}
                                            placeholder="Ex: Couverture Mathématiques Terminale"
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-blue-300 mb-1">
                                            {language === 'fr'
                                                ? 'Image de couverture'
                                                : language === 'en'
                                                    ? 'Cover Image'
                                                    : 'صورة الغلاف'}
                                        </label>
                                        <input
                                            type="file"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="mb-4 w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-800 file:text-white hover:file:bg-blue-700"
                                        />

                                        {form.imagePreview && (
                                            <div className="mt-4 border border-blue-700 rounded-lg overflow-hidden">
                                                <img
                                                    src={form.imagePreview}
                                                    alt="Aperçu de la couverture"
                                                    className="w-full h-48 object-contain bg-black"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-blue-700">
                                        <button
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="px-4 py-2 border border-blue-700 text-white rounded-lg hover:bg-blue-800/50"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={createTemplate}
                                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2"
                                        >
                                            <>
                                                <FaPlus />{' '}
                                                {language === 'fr'
                                                    ? 'Créer le modèle'
                                                    : language === 'en'
                                                        ? 'Create Template'
                                                        : 'إنشاء النموذج'}
                                            </>
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
                        <Dialog.Panel className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl shadow-2xl border border-blue-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                                                ? 'Modifier le modèle'
                                                : language === 'en'
                                                    ? 'Edit Template'
                                                    : 'تعديل النموذج'}
                                        </Dialog.Title>
                                        <button
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="text-blue-300 hover:text-white p-1 rounded-full hover:bg-blue-800/50"
                                        >
                                            <FaTimes className="text-xl" />
                                        </button>
                                    </div>

                                    {selectedTemplate && (
                                        <>
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-blue-300 mb-1">
                                                    {language === 'fr'
                                                        ? 'Titre du modèle'
                                                        : language === 'en'
                                                            ? 'Template Title'
                                                            : 'عنوان النموذج'}
                                                </label>
                                                <input
                                                    className="w-full bg-blue-950/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    value={form.titre}
                                                    onChange={(e) => setForm({ ...form, titre: e.target.value })}
                                                />
                                            </div>

                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-blue-300 mb-1">
                                                    {language === 'fr'
                                                        ? 'Image de couverture'
                                                        : language === 'en'
                                                            ? 'Cover Image'
                                                            : 'صورة الغلاف'}
                                                </label>
                                                <input
                                                    type="file"
                                                    onChange={handleImageChange}
                                                    accept="image/*"
                                                    className="mb-4 w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-800 file:text-white hover:file:bg-blue-700"
                                                />

                                                {form.imagePreview && (
                                                    <div className="mt-4 border border-blue-700 rounded-lg overflow-hidden">
                                                        <img
                                                            src={
                                                                form.imagePreview.startsWith("blob:")
                                                                    ? form.imagePreview
                                                                    : `${AppURL}${form.imagePreview}`
                                                            }
                                                            alt="Aperçu de la couverture"
                                                            className="w-full h-48 object-contain bg-black"
                                                        />
                                                    </div>
                                                )}
                                            </div>

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
                                                        onClick={updateTemplate}
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

                                    {selectedTemplate && (
                                        <>
                                            <p className="text-blue-300 mb-6">
                                                {language === 'fr'
                                                    ? (
                                                        <>
                                                            Êtes-vous sûr de vouloir supprimer définitivement le modèle <strong className="text-white">"{selectedTemplate.titre}"</strong> ?
                                                        </>
                                                    )
                                                    : language === 'en'
                                                        ? (
                                                            <>
                                                                Are you sure you want to permanently delete the template <strong className="text-white">"{selectedTemplate.titre}"</strong>?
                                                            </>
                                                        )
                                                        : (
                                                            <>
                                                                هل أنت متأكد من رغبتك في حذف النموذج <strong className="text-white">"{selectedTemplate.titre}"</strong> بشكل نهائي؟
                                                            </>
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
                                                    onClick={deleteTemplate}
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

export default EbooksTemplate;