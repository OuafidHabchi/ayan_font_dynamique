import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import StatsModal from '../components/StatsModal';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import AppURL from '../components/APPUrl';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface DSPDetailType {
    totalEmployees: number;
    managers: {
        name: string;
        email: string;
        familyName: string;
        tel: string;
    }[];
    Access: boolean;
}

interface DSPLogStats {
    totalRequests: number;
    avgResponseTime: number;
    topRoutes: { _id: string; count: number }[];
    httpMethods: { _id: string; count: number }[];
    peakTrafficTime: { _id: number; count: number } | null;
    successfulRequests: number;
    failedRequests: number;
    failedRequestsDetails: { url: string; status: number; timestamp: string }[];
}


const DSPDetail: React.FC = () => {
    const location = useLocation();
    const { dspCode, DataBase } = location.state || {};
    const [details, setDetails] = useState<DSPDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [accessStatus, setAccessStatus] = useState(false);
    const [logStats, setLogStats] = useState<DSPLogStats | null>(null);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [allRequests, setAllRequests] = useState<any[]>([]);
    const [isCreateEmployeeModalOpen, setIsCreateEmployeeModalOpen] = useState(false);
    const [name, setname] = useState('');
    const [familyName, setfamilyName] = useState('');
    const [tel, settel] = useState('');
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');




    const handleCreate = async () => {
        if (name && familyName && tel && email && password) {
            try {
                await axios.post(`${AppURL}/api/employee/registerManager/create?dsp_code=${dspCode}`, {
                    name: name,
                    familyName: familyName,
                    tel: tel,
                    email: email.toLowerCase(),
                    password: password,
                    role: 'manager',
                    scoreCard: 'New DA',
                    dsp_code :dspCode,
                    language:'English'
                    
                });
                await fetchDetails()
                setIsCreateEmployeeModalOpen(false)
            } catch (error) {
                console.error('Erreur lors de la création du DSP :', error);
            }
        } else {
            alert('Veuillez remplir tous les champs.');
        }
    };

    // Récupération du DataBase depuis l'URL
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const dbName = query.get('db');
        if (dbName) {
            DataBase(dbName);
        }
    }, [location.search]);

    // Récupération des détails via l'API
    const fetchDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${AppURL}/api/dspliste/get/${dspCode}`);
            setDetails(response.data);
            // Initialisation du switch selon l'état actuel de Access
            setAccessStatus(response.data.Access === true);
        } catch (error) {
            console.error('Erreur lors de la récupération des détails :', error);
        }
        setLoading(false);
    };

    // Récupération des statistiques de logs
    const fetchLogStats = async () => {
        try {
            const response = await axios.get(`${AppURL}/api/dspliste/logs/${dspCode}`);
            setLogStats(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques :', error);
        }
    };
    // Fonction pour récupérer toutes les demandes
    const fetchAllRequests = async () => {
        try {
            const response = await axios.get(`${AppURL}/api/RequestAccessRoutes/Allrequests?dsp_code=${dspCode}`);

            // Assurez-vous que response.data.data est un tableau
            if (response.data.success && Array.isArray(response.data.data)) {
                setAllRequests(response.data.data); // Utilisez response.data.data
            } else {
                setAllRequests([]); // Définir un tableau vide en cas d'erreur
            }
        } catch (error) {
            setAllRequests([]); // Définir un tableau vide en cas d'erreur
        }
    };

    // Fonction pour mettre à jour Access
    const updateAccess = async (newStatus: boolean) => {
        try {
            await axios.put(`${AppURL}/api/dspliste/${dspCode}`, {
                Access: newStatus
            });
            setAccessStatus(newStatus);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut Access :', error);
        }
    };

    // Changement du switch
    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newStatus = event.target.checked;
        updateAccess(newStatus);
    };

    useEffect(() => {
        fetchDetails();
        fetchLogStats();

        if (dspCode === 'request' && DataBase === 'requests') {
            fetchAllRequests(); // Récupérer toutes les demandes
        }
    }, [dspCode, DataBase]);

    return (
        <div className="bg-gray-100 min-h-screen text-gray-800">
            <main className="container mx-auto py-24 px-4">
                <h2 className="text-4xl font-bold mb-6 text-center">
                    Détails du DSP: {DataBase}
                </h2>

                {/* Bouton de statistiques */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => setIsStatsModalOpen(true)}
                        className="bg-blue-950 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Voir les statistiques
                    </button>
                    {dspCode !== 'request' && DataBase !== 'requests' && (
                        <button
                            onClick={() => setIsCreateEmployeeModalOpen(true)}
                            className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition"
                        >
                            +
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center min-h-[50vh]">
                        <div className="spinner-border animate-spin inline-block w-16 h-16 border-4 rounded-full text-blue-950"></div>
                    </div>
                ) : (
                    <>
                        {/* Afficher les détails de toutes les demandes si dspCode === 'request' et DataBase === 'requests' */}
                        {dspCode === 'request' && DataBase === 'requests' ? (
                            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-2xl transition transform hover:scale-105 mb-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                    Toutes les demandes :
                                </h3>
                                <div className="space-y-4">
                                    {allRequests.map((request, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-50 rounded-lg p-4 shadow-md"
                                        >
                                            <p><strong>Nom complet :</strong> {request.firstName} {request.lastName}</p>
                                            <p><strong>Email :</strong> {request.email}</p>
                                            <p><strong>Nom du DSP :</strong> {request.dspName}</p>
                                            {request.dspShortCode && <p><strong>Code court du DSP :</strong> {request.dspShortCode}</p>}
                                            <p><strong>Code de la station :</strong> {request.stationCode}</p>
                                            <p><strong>Adresse de la station :</strong> {request.stationAddress}</p>
                                            <p><strong>Comment avez-vous entendu parler de nous ? :</strong> {request.heardAboutUs}</p>
                                            {request.heardAboutUsDSP && <p><strong>DSP référent :</strong> {request.heardAboutUsDSP}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Afficher les détails normaux du DSP
                            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-2xl transition transform hover:scale-105 mb-8">
                                <h3 className="text-2xl font-bold text-gray-800">
                                    Nombre total d'employés :
                                </h3>
                                <p className="text-4xl font-bold text-blue-950">
                                    {details?.totalEmployees}
                                </p>
                                {/* Liste des Managers */}
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Managers :</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {details?.managers.map((manager, index) => (
                                        <div
                                            key={index}
                                            className="bg-white rounded-lg p-4 shadow-lg hover:shadow-2xl transition transform hover:scale-105 cursor-pointer"
                                        >
                                            <h4 className="text-xl font-bold text-gray-800">
                                                {manager.name} {manager.familyName}
                                            </h4>
                                            <p className="text-gray-600">Email : {manager.email}</p>
                                            <p className="text-gray-600">Phone : {manager.tel}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center mt-4">
                                    <label className="text-gray-800 font-bold mr-4">Accès :</label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={accessStatus}
                                            onChange={handleSwitchChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500"></div>
                                        <span className={`ml-2 font-bold ${accessStatus ? 'text-green-600' : 'text-red-600'}`}>
                                            {accessStatus ? 'Oui' : 'Non'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
            {isCreateEmployeeModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Créer un employé</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            // Logique pour créer l'employé
                        }}>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Nom"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    required
                                    value={name}
                                    onChange={(e) => setname(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Prénom"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    required
                                    value={familyName}
                                    onChange={(e) => setfamilyName(e.target.value)}
                                />
                                <input
                                    type="tel"
                                    placeholder="Téléphone"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    required
                                    value={tel}
                                    onChange={(e) => settel(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Email"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    required
                                    value={email}
                                    onChange={(e) => setemail(e.target.value)}
                                />
                                <input
                                     type="text"
                                    placeholder="Mot de passe"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    required
                                    value={password}
                                    onChange={(e) => setpassword(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateEmployeeModalOpen(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                    onClick={handleCreate}
                                >
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Affichage de la modale si activée */}
            {isStatsModalOpen && logStats && (
                <StatsModal
                    isOpen={isStatsModalOpen}
                    onClose={() => setIsStatsModalOpen(false)}
                    logStats={logStats}
                />
            )}
        </div>
    );
};

export default DSPDetail;
