import { useEffect, useState } from 'react';
import axios from 'axios';
import AppURL from '../components/APPUrl';


interface Message {
    _id: string;
    userId: string;
    dsp_code: string;
    subject: string;
    message: string;
    email: string;
    tel: string;
    read: boolean;
    fixer: boolean;
    createdAt: string;
}

interface DSPGroup {
    dsp_code: string;
    DataBase: string;
    messages: Message[];
}

const DSPMessages = () => {
    const [dspGroups, setDspGroups] = useState<DSPGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedDSP, setSelectedDSP] = useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    // Récupération des DSPs et Messages depuis l'API
    const fetchDSPs = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${AppURL}/api/dspliste/allMessages`);
            setDspGroups(response.data.reverse());
        } catch (error) {
            console.error('Erreur lors de la récupération des DSPs :', error);
        }
        setLoading(false);
    };

    // Charger les DSPs au montage du composant
    useEffect(() => {
        fetchDSPs();
    }, []);

    // Marquer un message comme lu
    const markAsRead = async (id: string, dsp_code: string) => {
        try {
            await axios.put(`${AppURL}/api/dspliste/${dsp_code}/messages/${id}/read`);
            // Mettre à jour l'état local
            setDspGroups(prevGroups =>
                prevGroups.map(group => ({
                    ...group,
                    messages: group.messages.map(msg =>
                        msg._id === id ? { ...msg, read: true } : msg
                    )
                }))
            );
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut de lecture :', error);
        }
    };



    // Marquer un message comme fixé
    const markAsFixed = async (id: string, dsp_code: string) => {
        try {
            await axios.put(`${AppURL}/api/dspliste/${dsp_code}/messages/${id}/fix`);
            // Mettre à jour l'état local
            setSelectedMessage(prevMsg => prevMsg ? { ...prevMsg, fixer: true } : null);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut fixé :', error);
        }
    };



    return (
        <div className="bg-gray-100 min-h-screen text-gray-800">
            <main className="container mx-auto py-24 px-4">

                <h2 className="text-4xl font-bold mb-6 text-center text-blue-950">Messages DSP</h2>

                {loading ? (
                    <div className="flex justify-center items-center min-h-[50vh]">
                        <div className="animate-spin inline-block w-16 h-16 border-4 border-blue-950 rounded-full border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        {/* Liste des DSPs */}
                        {!selectedDSP && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {dspGroups.map((group) => (
                                    <div
                                        key={group.dsp_code}
                                        className="bg-white rounded-lg p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition transform duration-300 cursor-pointer"
                                        onClick={() => setSelectedDSP(group.dsp_code)}
                                    >
                                        <h3 className="text-3xl font-bold text-blue-950">{group.DataBase}</h3>
                                        <p className="text-gray-600 mt-2">DSP Code : <strong>{group.dsp_code}</strong></p>
                                        <p className="text-gray-500 text-sm mt-2">Messages : {group.messages.length}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Liste des Messages pour le DSP sélectionné */}
                        {selectedDSP && !selectedMessage && (
                            <>
                                <button
                                    className="mb-6 px-4 py-2 bg-blue-950 text-white rounded hover:bg-blue-900 transition"
                                    onClick={() => setSelectedDSP(null)}
                                >
                                    ⬅️ Retour aux DSPs
                                </button>

                                {dspGroups
                                    .filter((group) => group.dsp_code === selectedDSP)
                                    .map((group) => (
                                        <div key={group.dsp_code}>
                                            <h3 className="text-3xl font-bold mb-4 text-blue-950">{group.DataBase} ({group.dsp_code})</h3>
                                            <ul>
                                                {group.messages
                                                    .slice().reverse() // Inverser l'ordre des messages
                                                    .map((msg) => (
                                                        <li
                                                            key={msg._id}
                                                            className={`cursor-pointer px-4 py-2 my-2 rounded shadow ${msg.read ? 'bg-white' : 'bg-red-200'}`}
                                                            onClick={() => {
                                                                setSelectedMessage(msg);
                                                                if (!msg.read) {
                                                                    markAsRead(msg._id, selectedDSP as string);  // On passe aussi le dsp_code sélectionné
                                                                }
                                                            }}

                                                        >
                                                            {msg.subject}
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    ))}
                            </>
                        )}

                        {/* Détails du Message sélectionné */}
                        {selectedMessage && (
                            <>
                                <button
                                    className="mb-6 px-4 py-2 bg-blue-950 text-white rounded hover:bg-blue-900 transition"
                                    onClick={() => setSelectedMessage(null)}
                                >
                                    ⬅️ Retour aux Messages
                                </button>
                                <div className="bg-white rounded-lg p-6 shadow-lg">
                                    <h4 className="text-2xl font-bold text-blue-950">{selectedMessage.subject}</h4>
                                    <p className="text-gray-600 mt-4">{selectedMessage.message}</p>
                                    <p className="text-gray-500 text-sm mt-2">De: {selectedMessage.email}</p>
                                    <p className="text-gray-500 text-sm">Tel: {selectedMessage.tel}</p>
                                    <p className="text-gray-400 text-xs">Envoyé le : {new Date(selectedMessage.createdAt).toLocaleDateString()}</p>
                                    <div className="mt-4">
                                        {!selectedMessage.fixer ? (
                                            <button
                                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                                onClick={() => markAsFixed(selectedMessage._id, selectedDSP as string)}
                                            >
                                                Fixer
                                            </button>
                                        ) : (
                                            <p className="text-green-600 font-bold">✔️ Fixé</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default DSPMessages;
