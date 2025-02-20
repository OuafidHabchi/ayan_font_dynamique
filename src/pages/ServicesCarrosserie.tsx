import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaMinus } from "react-icons/fa";
import EstimationModal from "../components/EstimationModal";


const images = [
  "/image/images5.webp",
  "/image/images6.webp",
  "/image/images7.webp",
  "/image/images8.webp",
  "/image/images9.webp",
  "/image/images10.webp",
];

const ServicesCarrosserie = ({ language }: { language: string }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const services = [
    {
      title: language === "fr" ? "Peinture Automobile" : "Car Painting",
      description:
        language === "fr"
          ? "Peinture complète, retouches, réparation d'éraflures."
          : "Full paint jobs, touch-ups, scratch repair.",
    },
    {
      title: language === "fr" ? "Réparation Carrosserie" : "Body Repair",
      description:
        language === "fr"
          ? "Réparation de bosses, redressement de châssis."
          : "Dent repair, frame straightening.",
    },
    {
      title: language === "fr" ? "Protection & Traitement" : "Protection & Coating",
      description:
        language === "fr"
          ? "Traitement antirouille, protection céramique."
          : "Rustproofing, ceramic coating.",
    },
  ];

  const toggleDescription = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* Carrousel d'images en fond */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
      ))}

      <div className="absolute inset-0 bg-black opacity-60 z-10"></div>

      <div className="relative z-20 flex flex-col text-center h-full px-4">
        {/* Boutons d'appel à l'action avec margin-top pour éviter le Navbar */}
        <div className="mt-20 mb-6 flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6 flex-wrap">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto px-4 py-2 bg-yellow-500 text-black font-semibold rounded shadow hover:bg-yellow-600 transition duration-300"
          >
            {language === "fr" ? "Estimation Gratuite" : "Free Estimate"}
          </button>

          <EstimationModal
            language={language}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}

          />

          <Link to="/rendez-vous">
            <button className="w-full md:w-auto px-4 py-2 bg-yellow-500 text-black font-semibold rounded shadow hover:bg-yellow-600 transition duration-300">
              {language === "fr" ? "Prendre Rendez-vous" : "Book an Appointment"}
            </button>
          </Link>
        </div>


        <h2 className="text-3xl font-extrabold text-yellow-500 mb-4 text-left md:pl-10">
          {language === "fr" ? "Nos Services" : "Our Services"}
        </h2>

        {/* Liste des services alignée à gauche */}
        <ul className="w-full max-w-3xl space-y-4 mt-4 text-left md:text-left md:pl-10">
          {services.map((service, index) => (
            <li
              key={index}
              className="cursor-pointer bg-gray-800 p-4 rounded shadow transition duration-300 hover:bg-gray-700"
              onClick={() => toggleDescription(index)}
            >
              <div className="flex justify-start items-center">
                <span className="mr-2">
                  {activeIndex === index ? (
                    <FaMinus className="text-yellow-500" />
                  ) : (
                    <FaPlus className="text-yellow-500" />
                  )}
                </span>
                <h2 className="text-xl font-medium text-yellow-500">
                  {service.title}
                </h2>
              </div>
              <div
                className={`mt-2 text-sm text-gray-300 ${activeIndex === index ? "block" : "hidden"
                  }`}
              >
                {service.description}
              </div>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default ServicesCarrosserie;
