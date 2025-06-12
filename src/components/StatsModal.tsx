import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';

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

interface StatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    logStats: DSPLogStats;
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, logStats }) => {
    if (!isOpen) return null;

    // Données pour le graphique des méthodes HTTP (taille réduite)
    const httpMethodsData = {
        labels: logStats.httpMethods.map(method => method._id),
        datasets: [
            {
                data: logStats.httpMethods.map(method => method.count),
                backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#f44336'],
                hoverBackgroundColor: ['#66bb6a', '#42a5f5', '#ffb74d', '#e57373']
            }
        ]
    };

    // Données pour le graphique des routes les plus visitées
    const topRoutesData = {
        labels: logStats.topRoutes.map(route => route._id),
        datasets: [
            {
                label: 'Nombre de requêtes',
                data: logStats.topRoutes.map(route => route.count),
                backgroundColor: '#001933'
            }
        ]
    };
    // Options pour réduire la taille des barres
    const topRoutesOptions = {
        scales: {
            x: {
                ticks: { font: { size: 12 } }
            },
            y: {
                ticks: { font: { size: 12 } }
            }
        },
        plugins: {
            legend: { display: false }
        },
        // Réduire l'épaisseur des barres
        barThickness: 30, // Ajuste la valeur selon la taille que tu veux
        maxBarThickness: 40,
        responsive: true,
        maintainAspectRatio: false,

    };


    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-none relative max-h-screen overflow-y-auto shadow-lg">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-700 text-2xl font-bold"
                >
                    &times;
                </button>
                <h3 className="text-3xl font-bold mb-6 text-center">Statistiques des Requêtes</h3>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                        <p className="text-lg">
                            <strong>Total des requêtes :</strong> {logStats.totalRequests}
                        </p>
                        <p className="text-lg">
                            <strong>Requêtes réussies :</strong> {logStats.successfulRequests}
                        </p>
                        <p className="text-lg">
                            <strong>Requêtes échouées :</strong> {logStats.failedRequests}
                        </p>
                        <p className="text-lg">
                            <strong>Temps de réponse moyen :</strong> {logStats.avgResponseTime} ms
                        </p>
                        <p className="text-lg">
                            <strong>Heure de trafic maximum :</strong>{" "}
                            {logStats.peakTrafficTime
                                ? `${logStats.peakTrafficTime._id}h (avec ${logStats.peakTrafficTime.count} requêtes)`
                                : "Non défini"}
                        </p>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                        <h4 className="text-xl font-bold mb-2 text-center">Méthodes HTTP</h4>
                        <div className="flex justify-center">
                            <div className="w-40 h-40">
                                <Pie data={httpMethodsData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h4 className="text-2xl font-bold mb-4">Top Routes les Plus Visitées</h4>
                    <div className="w-full" style={{ maxHeight: '300px' }}>
                        <Bar data={topRoutesData} options={topRoutesOptions} />
                    </div>
                </div>


                <div className="mb-6">
                    <h4 className="text-2xl font-bold mb-4">Détails des Requêtes Échouées</h4>
                    <table className="min-w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 px-4 py-2">URL</th>
                                <th className="border border-gray-300 px-4 py-2">Statut</th>
                                <th className="border border-gray-300 px-4 py-2">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logStats.failedRequestsDetails.length > 0 ? (
                                logStats.failedRequestsDetails.map((req, index) => (
                                    <tr key={index} className="hover:bg-gray-100">
                                        <td className="border border-gray-300 px-4 py-2">{req.url}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-red-600">{req.status}</td>
                                        <td className="border border-gray-300 px-4 py-2">{new Date(req.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center p-4">Aucune requête échouée</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StatsModal;
