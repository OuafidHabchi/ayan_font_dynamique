import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AppURL from '../components/APPUrl';


interface DSPCode {
    dsp_code: string;
    DataBase: string;
    Access: boolean;
}

const Home = () => {
    const [dspList, setDspList] = useState<DSPCode[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [open, setOpen] = useState(false);
    const [newDSPCode, setNewDSPCode] = useState('');
    const [newDSPName, setNewDSPName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Fonction pour récupérer la liste depuis l'API
    const fetchDSPList = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${AppURL}/api/dspliste`);
            const data = Array.isArray(response.data) ? response.data : Object.values(response.data);
            const dspArray: DSPCode[] = data.map((item: any) => ({
                dsp_code: item.dsp_code,
                DataBase: item.DataBase,
                Access: item.Access ?? false  // Défaut à false si non défini
            }));
            setDspList(dspArray);
        } catch (error) {
            console.error('Erreur lors de la récupération des DSP Codes :', error);
        }
        setLoading(false);
    };


    useEffect(() => {
        fetchDSPList();
    }, []);

    const handleCardClick = (dspCode: string, DataBase: string) => {
        navigate('/dsp', {
            state: {
                dspCode,
                DataBase
            }
        });
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setNewDSPCode('');
        setNewDSPName('');
    };

    const handleCreate = async () => {
        if (newDSPCode && newDSPName) {
            try {
                await axios.post(`${AppURL}/api/dspliste/create`, {
                    dsp_code: newDSPCode,
                    DataBase: newDSPName,
                    Access: true  // Par défaut à true lors de la création
                });
                handleClose();
                fetchDSPList();
            } catch (error) {
                console.error('Erreur lors de la création du DSP :', error);
            }
        } else {
            alert('Veuillez remplir tous les champs.');
        }
    };

    return (
        <div className=" bg-gray-100 min-h-screen text-gray-800">

            <main className="container mx-auto py-24 px-4">
                {/* Barre de Recherche */}
                <div className="w-full sm:w-1/2 mx-auto mb-6">
                    <input
                        type="text"
                        placeholder="Rechercher un DSP..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-full px-4 py-2 border border-gray-300 text-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-950 transition"
                    />
                </div>

                <h2 className="text-4xl font-bold mb-6 text-center text-blue-950">Liste des DSP</h2>

                {loading ? (
                    <div className="flex justify-center items-center min-h-[50vh]">
                        <div className="animate-spin inline-block w-16 h-16 border-4 border-blue-950 rounded-full border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {dspList
                            .filter((item) =>
                                item.dsp_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                item.DataBase.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition transform duration-300 cursor-pointer"
                                    onClick={() => handleCardClick(item.dsp_code, item.DataBase)}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="text-blue-950 text-5xl mb-4">
                                            <i className="fas fa-database"></i>
                                        </div>
                                        <h3 className="text-2xl font-bold">{item.DataBase}</h3>
                                        <p className="text-gray-600">DSP Code : <strong>{item.dsp_code}</strong></p>
                                        <p className={item.Access ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                            {item.Access ? "Access: Oui" : "Access: Non"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </main>

            {/* Floating Action Button */}
            <button
                className="fixed bottom-8 right-8 bg-blue-950 text-white rounded-full p-4 shadow-lg hover:bg-blue-950 transition"
                onClick={handleOpen}
            >
                +
            </button>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 flex items-center justify-center   bg-blue-950 bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-4">Créer un nouveau DSP</h3>
                        <input
                            type="text"
                            placeholder="DSP Code"
                            value={newDSPCode}
                            onChange={(e) => setNewDSPCode(e.target.value)}
                            className="w-full mb-4 p-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Base de données"
                            value={newDSPName}
                            onChange={(e) => setNewDSPName(e.target.value)}
                            className="w-full mb-4 p-2 border rounded"
                        />
                        <div className="flex justify-end space-x-4">
                            <button onClick={handleClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Annuler</button>
                            <button onClick={handleCreate} className="px-4 py-2 bg-blue-950 text-white rounded hover:bg-blue-950">Créer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
