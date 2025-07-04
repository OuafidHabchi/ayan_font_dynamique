import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import HomePage from './pages/Public/HomePage';
import SignUp from './pages/Public/SignUp';
import SignIn from './pages/Public/SignIn';
import AboutUs from './pages/Public/AboutUs';
import Ebook from './pages/Public/Ebook';
import Dashboard from './pages/Connected/Dashboard';
import LearnHub from './pages/Public/LearnHub';
import AIStudio from './pages/Public/AIStudio';
import Invest from './pages/Public/Invest';
import MyEbook from './pages/Connected/MyEbook';
import MyLearnHub from './pages/Connected/MyLearnHub';
import MyInvest from './pages/Connected/MyInvest';
import Mycreations from './pages/Connected/Mycreations';
import Profil from './pages/Connected/Profil';

type Language = 'fr' | 'en' | 'ar';

export default function App() {
  const [language, setLanguage] = useState<Language>('fr');
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <>
      {/* Navbar affichée seulement si non authentifié */}
      {!isAuthenticated && <Navbar language={language} setLanguage={setLanguage} />}

      <Routes>
        {!isAuthenticated ? (
          <>
            {/* Public routes */}
            <Route path="/" element={<HomePage language={language} />} />
            <Route path="/signup" element={<SignUp language={language} />} />
            <Route path="/signin" element={<SignIn language={language} />} />
            <Route path="/aboutus" element={<AboutUs language={language} />} />
            <Route path="/ebook" element={<Ebook language={language} />} />
            <Route path="/LearnHub" element={<LearnHub />} />
            <Route path="/AIStudio" element={<AIStudio />} />
            <Route path="/Invest" element={<Invest />} />

            {/* Si une route non trouvée ➔ redirect vers / */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            {/* Authenticated routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              }
            />

            <Route
              path="/ebooks"
              element={
                <AuthenticatedLayout>
                  <Ebook language={language} />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/LearnHubs"
              element={
                <AuthenticatedLayout>
                  <LearnHub />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/AIStudios"
              element={
                <AuthenticatedLayout>
                  <AIStudio />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/Invests"
              element={
                <AuthenticatedLayout>
                  <Invest />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/MyEbooks"
              element={
                <AuthenticatedLayout>
                  <MyEbook />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/MyFormations"
              element={
                <AuthenticatedLayout>
                  <MyLearnHub />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/MyInvestissements"
              element={
                <AuthenticatedLayout>
                  <MyInvest />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/MyCreations"
              element={
                <AuthenticatedLayout>
                  <Mycreations />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthenticatedLayout>
                  <Profil />
                </AuthenticatedLayout>
              }
            />

            {/* Si une route non trouvée ➔ redirect vers /dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </>
  );
}
