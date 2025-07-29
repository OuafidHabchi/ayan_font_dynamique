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
import StudioEbook from './pages/Connected/StudioEbook';
import StudioFormation from './pages/Connected/StudioFormation';
import EbooksTemplate from './pages/Admin/EbooksTemplate';
import AdminApprovalPanel from './pages/Admin/AdminApprovalPanel';
import Affiliation from './pages/Connected/Affiliation';
import Sponsoring from './pages/Connected/Sponsoring';
import Licence from './pages/Connected/Licence';
import AffiliateBookView from './pages/Public/AffiliateBookView';
import AffiliateFormationView from './pages/Public/AffiliateFormationView';
import AllUsers from './pages/Admin/AllUsers';
import { ProgrammeEtudes } from './pages/Admin/ProgrammeEtudes';
import ManagementSponsoring from './pages/Admin/ManagementSponsoring';



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
            <Route path="/LearnHub" element={<LearnHub language={language} />} />
            <Route path="/AIStudio" element={<AIStudio language={language} />} />
            <Route path="/Invest" element={<Invest />} />
            <Route path="/affiliateBookView/:bookId" element={<AffiliateBookView language={language} />} />
            <Route path="/affiliateFormationView/:formationId" element={<AffiliateFormationView language={language} />} />


            {/* Si une route non trouvée ➔ redirect vers / */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            {/* Authenticated routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

             <Route
              path="/managementSponsoring"
              element={
                <AuthenticatedLayout>
                  <ManagementSponsoring />
                </AuthenticatedLayout>
              }
            />
            

            <Route
              path="/allUsers"
              element={
                <AuthenticatedLayout>
                  <AllUsers />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/programmeEtudes"
              element={
                <AuthenticatedLayout>
                  <ProgrammeEtudes />
                </AuthenticatedLayout>
              }
            />

            <Route
              path="/affiliateBookView/:bookId"
              element={
                <AuthenticatedLayout>
                  <AffiliateBookView language={language} />
                </AuthenticatedLayout>
              }
            />

            <Route
              path="/affiliateFormationView/:formationId"
              element={
                <AuthenticatedLayout>
                  <AffiliateFormationView language={language} />
                </AuthenticatedLayout>
              }
            />

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
                  <LearnHub language={language} />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/AIStudios"
              element={
                <AuthenticatedLayout>
                  <AIStudio language={language} />
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
              path="/EbooksTemplate"
              element={
                <AuthenticatedLayout>
                  <EbooksTemplate />
                </AuthenticatedLayout>
              }
            />

            <Route
              path="/ApprovalPanel"
              element={
                <AuthenticatedLayout>
                  <AdminApprovalPanel />
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

            <Route
              path="/affiliation"
              element={
                <AuthenticatedLayout>
                  <Affiliation />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/sponsoring"
              element={
                <AuthenticatedLayout>
                  <Sponsoring />
                </AuthenticatedLayout>
              }
            />
            
            <Route
              path="/licence"
              element={
                <AuthenticatedLayout>
                  <Licence />
                </AuthenticatedLayout>
              }
            />



            <Route
              path="/StudioFormation"
              element={
                <AuthenticatedLayout>
                  <StudioFormation />
                </AuthenticatedLayout>
              }
            />

            <Route
              path="/StudioEbook"
              element={
                <AuthenticatedLayout>
                  <StudioEbook />
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
