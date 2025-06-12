import  { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DSPDetail from './pages/DSPDetail';
import Navbar from './components/Navbar';
import DSPMessages from './pages/DSPMessages';
import Login from './pages/Login';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Vérification de la connexion au démarrage de l'application
    useEffect(() => {
        const savedUsername = localStorage.getItem('username');
        const savedPassword = localStorage.getItem('password');
        if (savedUsername && savedPassword) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        setIsAuthenticated(false); // Mettre à jour l'état pour rediriger vers /login
    };

    return (
        <>
            {isAuthenticated && <Navbar onLogout={handleLogout} />} {/* Passer handleLogout à Navbar */}

            <Routes>
                {!isAuthenticated ? (
                    <Route path="*" element={<Login onLogin={handleLogin} />} />
                ) : (
                    <>
                        <Route path="/home" element={<Home />} />
                        <Route path="/dsp" element={<DSPDetail />} />
                        <Route path="/DSPMessages" element={<DSPMessages />} />
                    </>
                )}
            </Routes>
        </>
    );
};


export default App;
