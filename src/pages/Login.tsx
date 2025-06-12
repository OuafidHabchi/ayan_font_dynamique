import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }: { onLogin: () => void }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Vérifier si l'utilisateur est déjà connecté via le localStorage
    useEffect(() => {
        const savedUsername = localStorage.getItem('username');
        const savedPassword = localStorage.getItem('password');
        if (savedUsername && savedPassword) {
            // Si les identifiants sont dans le localStorage, redirige vers la page d'accueil
            navigate('/home');
        }
    }, [navigate]);

    // Fonction de gestion de la connexion
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'Ouafid23@' && password === 'Wafid12340') {
            // Sauvegarder les identifiants dans le localStorage
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);

            onLogin(); // Appelle le callback pour connecter l'utilisateur
            navigate('/home'); // Redirige vers la page d'accueil après la connexion
        } else {
            alert('Identifiants incorrects');
        }
    };

    return (
        <div className="bg-blue-950 min-h-screen flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-3xl font-semibold text-blue-950 mb-8 text-center">Opex Logistix</h2>
                
                <form onSubmit={handleLogin} className="flex flex-col gap-6">
                    <input
                        type="text"
                        placeholder="Nom d'utilisateur"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-950"
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-950"
                    />
                    <button
                        type="submit"
                        className="bg-blue-950 text-white py-3 rounded-lg hover:bg-blue-900 transition duration-300"
                    >
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
