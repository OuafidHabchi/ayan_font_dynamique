import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ServicesMecanique from "./pages/ServicesMecanique";
import ServicesCarrosserie from "./pages/ServicesCarrosserie";
import Login from "./pages/Login";
import Home from "./pages/Home"; // <- Import de la page d'accueil
import ContactUs from "./pages/ContactUs";

export default function App() {
  const [language, setLanguage] = useState("fr");
  const location = useLocation();

  return (
    <>
      {/* Afficher la Navbar sauf sur la page de Login */}
      {location.pathname !== "/login" && (
        <Navbar language={language} setLanguage={setLanguage} />
      )}

      <Routes>
        <Route
          path="/"
          element={<Home language={language}/>} // <- Page d'accueil avec le slider
        />
        <Route
          path="/services-mecanique"
          element={<ServicesMecanique language={language} />}
        />
        <Route
          path="/services-carrosserie"
          element={<ServicesCarrosserie language={language} />}
        />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route path="/contact-us" element={<ContactUs language={language} />} />

      </Routes>
    </>
  );
}
