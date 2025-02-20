const ContactUs = ({ language }: { language: string }) => {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white min-h-screen p-8">
      <div className="container mx-auto space-y-12">
        <h1 className="text-5xl font-extrabold text-yellow-500 text-center mb-12 animate-fade-in">
          
        </h1>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Google Maps */}
          <div className="shadow-xl rounded-2xl overflow-hidden transform hover:scale-105 transition duration-300">
            <iframe
              title="Google Maps Location"
              className="w-full h-96"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2794.356507048785!2d-73.48936548444454!3d45.54049157910152!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cc922fb0571c18d%3A0x71e8c3fbb7e39f2c!2s2516%20Chem.%20du%20Lac%2C%20Longueuil%2C%20QC%20J4N%201G7%2C%20Canada!5e0!3m2!1sen!2sus!4v1614298023781!5m2!1sen!2sus"
              allowFullScreen={true}
              loading="lazy"
            ></iframe>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-800 p-8 rounded-2xl shadow-xl transform hover:scale-105 transition duration-300">
          <h2 className="text-3xl font-bold mb-4 text-yellow-500">
            {language === "fr" ? "Nos Infos" : "Our Infos"}
            </h2>

            <p className="text-lg mb-2">2516 Chem. du Lac, Longueuil, QC J4N 1G7</p>
            <p className="text-lg mb-2">Longueuil, Quebec</p>
            <p className="text-lg mb-2">
              {language === "fr" ? "Téléphone" : "Phone"}:{" "}
              <a href="tel:+15147570004" className="text-yellow-500 hover:text-yellow-400 transition duration-300">
                +1 514-757-0004
              </a>
            </p>

            <h2 className="text-3xl font-bold mt-6 mb-4 text-yellow-500">
              {language === "fr" ? "Heures d'ouverture" : "Opening Hours"}
            </h2>
            <ul className="space-y-2 text-lg">
              <li>{language === "fr" ? "Lundi" : "Monday"}: 9 a.m. – 7 p.m.</li>
              <li>{language === "fr" ? "Mardi" : "Tuesday"}: 9 a.m. – 7 p.m.</li>
              <li>{language === "fr" ? "Mercredi" : "Wednesday"}: 9 a.m. – 7 p.m.</li>
              <li>{language === "fr" ? "Jeudi" : "Thursday"}: 9 a.m. – 7 p.m.</li>
              <li>{language === "fr" ? "Vendredi" : "Friday"}: 9 a.m. – 7 p.m.</li>
              <li>{language === "fr" ? "Samedi" : "Saturday"}: 9 a.m. – 7 p.m.</li>
              <li className="text-red-500">{language === "fr" ? "Dimanche" : "Sunday"}: {language === "fr" ? "Fermé" : "Closed"}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
