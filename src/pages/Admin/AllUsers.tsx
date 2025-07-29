import { useEffect, useState } from 'react';
import axios from 'axios';
import AppURL from '../../components/AppUrl';
import { Dialog } from '@headlessui/react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaLanguage, FaGift, FaCrown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface User {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    phone?: string;
    langue?: string;
    promoCode?: string;
}
type Language = 'fr' | 'en' | 'ar';


export default function AllUsers() {
    const { user } = useAuth();
    const language: Language = ['fr', 'en', 'ar'].includes(user?.langue as string) ? (user?.langue as Language) : 'fr'
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${AppURL}/api/users/AllUsers`);
                setUsers(res.data);
            } catch (err) {
                console.error('❌ Erreur récupération utilisateurs :', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleUserClick = (user: User) => {
        setSelectedUser(user);
        setIsOpen(true);
    };

    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'bg-red-500/20 text-red-400 border-red-500';
            case 'premium':
                return 'bg-purple-500/20 text-purple-400 border-purple-500';
            default:
                return 'bg-blue-500/20 text-blue-400 border-blue-500';
        }
    };

    return (
        <div className="px-4 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 min-h-screen pt-24 pb-12">
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
                            ? 'Gestion des Utilisateurs'
                            : language === 'en'
                                ? 'User Management'
                                : 'إدارة المستخدمين'}
                    </h2>

                    <p className="text-blue-200 max-w-2xl mx-auto">
                        {language === 'fr'
                            ? 'Visualisez et gérez tous les utilisateurs de la plateforme'
                            : language === 'en'
                                ? 'View and manage all users on the platform'
                                : 'عرض وإدارة جميع مستخدمي المنصة'}
                    </p>

                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400"></div>
                    </div>
                ) : (
                    <>
                        {/* Users Grid */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {users.map((user) => (
                                <motion.div
                                    key={user.id || (user as any)._id}
                                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)" }}
                                    className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl overflow-hidden border border-blue-700 cursor-pointer"
                                    onClick={() => handleUserClick(user)}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-white">
                                                    {user.prenom} {user.nom}
                                                </h3>
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getRoleColor(user.role)} border`}>
                                                    {user.role === 'admin' && <FaCrown className="mr-1" />}
                                                    {user.role}
                                                </div>
                                            </div>
                                            <div className="bg-blue-800/50 p-3 rounded-full">
                                                <FaUser className="text-blue-300" />
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center text-blue-300">
                                                <FaEnvelope className="mr-2" />
                                                <span className="truncate">{user.email}</span>
                                            </div>
                                            {user.phone && (
                                                <div className="flex items-center text-blue-300">
                                                    <FaPhone className="mr-2" />
                                                    <span>{user.phone}</span>
                                                </div>
                                            )}
                                            {user.langue && (
                                                <div className="flex items-center text-blue-300">
                                                    <FaLanguage className="mr-2" />
                                                    <span>{user.langue.toUpperCase()}</span>
                                                </div>
                                            )}
                                            {user.promoCode && (
                                                <div className="flex items-center text-orange-400">
                                                    <FaGift className="mr-2" />
                                                    <span className="font-mono">{user.promoCode}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* User Detail Modal */}
                        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                            <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
                            <div className="fixed inset-0 flex items-center justify-center p-4">
                                <Dialog.Panel className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl shadow-2xl border border-blue-700 w-full overflow-hidden">
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="relative"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <Dialog.Title className="text-2xl font-bold text-white">
                                                    <div className="flex items-center">
                                                        <div className={`mr-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(selectedUser?.role || '')}`}>
                                                            {selectedUser?.role === 'admin' && <FaCrown className="mr-1" />}
                                                            {selectedUser?.role}
                                                        </div>
                                                    </div>
                                                </Dialog.Title>
                                                <button
                                                    onClick={() => setIsOpen(false)}
                                                    className="text-blue-300 hover:text-white p-1 rounded-full hover:bg-blue-800/50"
                                                >
                                                    <FaTimes className="text-xl" />
                                                </button>
                                            </div>

                                            {selectedUser && (
                                                <div className="space-y-4">
                                                    <div className="bg-blue-950/50 rounded-lg p-4 border border-blue-700">
                                                        <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                                                            <FaUser className="text-orange-400 mr-2" />
                                                            {language === 'fr'
                                                                ? 'Informations Personnelles'
                                                                : language === 'en'
                                                                    ? 'Personal Information'
                                                                    : 'المعلومات الشخصية'}
                                                        </h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-blue-300 text-sm">
                                                                    {language === 'fr'
                                                                        ? 'Nom'
                                                                        : language === 'en'
                                                                            ? 'Name'
                                                                            : 'الاسم'}
                                                                </p>
                                                                <p className="text-white font-medium">{selectedUser.nom}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-blue-300 text-sm">
                                                                    {language === 'fr'
                                                                        ? 'Prénom'
                                                                        : language === 'en'
                                                                            ? 'First Name'
                                                                            : 'الاسم الأول'}
                                                                </p>
                                                                <p className="text-white font-medium">{selectedUser.prenom}</p>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <p className="text-blue-300 text-sm">
                                                                    {language === 'fr'
                                                                        ? 'Email'
                                                                        : language === 'en'
                                                                            ? 'Email'
                                                                            : 'البريد الإلكتروني'}
                                                                </p>
                                                                <p className="text-white font-medium">{selectedUser.email}</p>
                                                            </div>
                                                            {selectedUser.phone && (
                                                                <div className="col-span-2">
                                                                    <p className="text-blue-300 text-sm">
                                                                        {language === 'fr'
                                                                            ? 'Téléphone'
                                                                            : language === 'en'
                                                                                ? 'Phone'
                                                                                : 'رقم الهاتف'}
                                                                    </p>
                                                                    <p className="text-white font-medium">{selectedUser.phone}</p>
                                                                </div>
                                                            )}
                                                            {selectedUser.langue && (
                                                                <div>
                                                                    <p className="text-blue-300 text-sm">
                                                                        {language === 'fr'
                                                                            ? 'Langue'
                                                                            : language === 'en'
                                                                                ? 'Language'
                                                                                : 'اللغة'}
                                                                    </p>
                                                                    <p className="text-white font-medium">{selectedUser.langue.toUpperCase()}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {selectedUser.promoCode && (
                                                        <div className="bg-blue-950/50 rounded-lg p-4 border border-blue-700">
                                                            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                                                                <FaGift className="text-orange-400 mr-2" />
                                                                {language === 'fr'
                                                                    ? 'Code Promo'
                                                                    : language === 'en'
                                                                        ? 'Promo Code'
                                                                        : 'رمز العرض'}
                                                            </h4>
                                                            <div className="flex justify-between items-center bg-blue-900/30 p-3 rounded border border-blue-700">
                                                                <div>
                                                                    <p className="text-blue-300 text-xs">
                                                                        {language === 'fr'
                                                                            ? 'CODE PERSONNEL'
                                                                            : language === 'en'
                                                                                ? 'PERSONAL CODE'
                                                                                : 'رمز شخصي'}
                                                                    </p>
                                                                    <p className="text-orange-400 font-mono font-bold">{selectedUser.promoCode}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </Dialog.Panel>
                            </div>
                        </Dialog>
                    </>
                )}
            </div>
        </div>
    );
}