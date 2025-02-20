import { useState, useEffect } from "react";

const images = [
  "/image/images5.webp",
  "/image/images6.webp",
  "/image/images7.webp",
  "/image/images8.webp",
  "/image/images9.webp",
  "/image/images10.webp",
];

const Home = ({ language }: { language: string }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change d'image toutes les 4 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        ></div>
      ))}

      <div className="absolute inset-0 bg-black opacity-40 z-10"></div>

      <div className="relative z-20 flex flex-col items-center justify-center text-white text-center h-full px-4">
        <h1 className="mt-20 text-6xl font-extrabold mb-4 drop-shadow-lg">
          {language === "fr" ? "Bienvenue chez GMCL" : "Welcome to GMCL"}
        </h1>

        <h2 className="text-2xl md:text-3xl font-semibold mb-4 drop-shadow-lg">
          Garage Mécanique et Carrosserie Longueuil
        </h2>



        <p className="text-2xl mb-8 max-w-3xl drop-shadow-lg">
          {language === "fr"
            ? "Nous offrons des services de mécanique et de carrosserie pour tous types de véhicules. Notre expertise est à votre service pour un entretien fiable et de qualité."
            : "We offer mechanical and bodywork services for all types of vehicles. Our expertise is at your service for reliable and high-quality maintenance."}
        </p>


      </div>
    </div>
  );
};

export default Home;
