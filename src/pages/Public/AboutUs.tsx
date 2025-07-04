import React from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaFacebook } from 'react-icons/fa';

type Language = 'fr' | 'en' | 'ar';

interface AboutUsProps {
  language: Language;
}

const AboutUs: React.FC<AboutUsProps> = ({ language }) => {
  // Content translations
  const content = {
    titles: {
      fr: "À propos de nous",
      en: "About Us",
      ar: "من نحن",
    },
    descriptions: {
      fr: "Ayan Bridge est une plateforme innovante qui connecte les créateurs, investisseurs et apprenants dans un écosystème collaboratif puissant.",
      en: "Ayan Bridge is an innovative platform connecting creators, investors, and learners in a powerful collaborative ecosystem.",
      ar: "أيــان بريــدج هي منصة مبتكرة تربط المبدعين والمستثمرين والمتعلمين ضمن نظام تعاوني قوي.",
    },
    mission: {
      fr: "Notre mission est de démocratiser l'accès à l'éducation, aux outils de création et aux opportunités d'investissement.",
      en: "Our mission is to democratize access to education, creation tools, and investment opportunities.",
      ar: "مهمتنا هي توفير الوصول إلى التعليم وأدوات الإبداع وفرص الاستثمار للجميع.",
    },
    vision: {
      fr: "Notre vision est de bâtir un pont entre les talents et les opportunités à l'échelle mondiale.",
      en: "Our vision is to build a bridge between talents and opportunities worldwide.",
      ar: "رؤيتنا هي بناء جسر بين المواهب والفرص على مستوى العالم.",
    },
    values: {
      fr: ["Innovation", "Intégrité", "Collaboration", "Excellence"],
      en: ["Innovation", "Integrity", "Collaboration", "Excellence"],
      ar: ["الابتكار", "النزاهة", "التعاون", "التميز"],
    },
    teamTitle: {
      fr: "Rencontrez notre équipe",
      en: "Meet Our Team",
      ar: "تعرف على فريقنا",
    },
    contactTitle: {
      fr: "Restons en contact",
      en: "Get In Touch",
      ar: "ابقى على تواصل",
    },
    contactInfo: {
      fr: {
        email: "contact@ayanbridge.com",
        phone: "+1 (514) 123-4567",
        address: "Montréal, Canada"
      },
      en: {
        email: "contact@ayanbridge.com",
        phone: "+1 (514) 123-4567",
        address: "Montreal, Canada"
      },
      ar: {
        email: "contact@ayanbridge.com",
        phone: "+1 (514) 123-4567",
        address: "مونتريال، كندا"
      }
    }
  };

  const teamMembers = [
    {
      name: 'Sarah',
      role: {
        fr: 'PDG & Fondatrice',
        en: 'CEO & Founder',
        ar: 'المديرة التنفيذية والمؤسسة'
      },
      bio: {
        fr: '15 ans d\'expérience dans l\'éducation et la technologie',
        en: '15 years experience in education and technology',
        ar: '15 سنة من الخبرة في التعليم والتكنولوجيا'
      },
      img: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      name: 'Karim',
      role: {
        fr: 'Directeur Technique',
        en: 'CTO',
        ar: 'المدير التقني'
      },
      bio: {
        fr: 'Expert en IA et développement de plateformes',
        en: 'AI and platform development expert',
        ar: 'خبير في الذكاء الاصطناعي وتطوير المنصات'
      },
      img: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      name: 'Amira',
      role: {
        fr: 'Designer Principal',
        en: 'Lead Designer',
        ar: 'المصممة الرئيسية'
      },
      bio: {
        fr: 'Spécialiste en expérience utilisateur et design d\'interface',
        en: 'UX/UI design specialist',
        ar: 'متخصصة في تجربة المستخدم وتصميم الواجهات'
      },
      img: 'https://randomuser.me/api/portraits/women/68.jpg'
    }
  ];

  return (
    <div className="font-sans bg-gray-50 text-gray-800">

      {/* Hero Section */}
      <section className="relative py-28 px-6 text-white bg-blue-950">
        <div className="absolute inset-0 opacity-20 bg-[url('/pattern.svg')]"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{content.titles[language]}</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            {content.descriptions[language]}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-xl border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              {language === 'fr' ? 'Notre mission' : language === 'en' ? 'Our Mission' : 'مهمتنا'}
            </h2>
            <p className="text-gray-700">{content.mission[language]}</p>
          </div>
          <div className="bg-gray-50 p-8 rounded-xl border-l-4 border-gray-600">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'fr' ? 'Notre vision' : language === 'en' ? 'Our Vision' : 'رؤيتنا'}
            </h2>
            <p className="text-gray-700">{content.vision[language]}</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              {content.teamTitle[language]}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === 'fr' ? 'L\'équipe passionnée derrière Ayan Bridge' : 
               language === 'en' ? 'The passionate team behind Ayan Bridge' : 
               'الفريق المتحمس وراء أيــان بريــدج'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-48 bg-blue-100 flex items-center justify-center">
                  <img 
                    src={member.img} 
                    alt={member.name} 
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role[language]}</p>
                  <p className="text-gray-600 text-sm">{member.bio[language]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-12">
            {language === 'fr' ? 'Nos valeurs fondamentales' : 
             language === 'en' ? 'Our Core Values' : 
             'قيمنا الأساسية'}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.values[language].map((value, index) => (
              <div key={index} className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="h-12 w-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">{index + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-blue-900">{value}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6  bg-blue-950 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{content.contactTitle[language]}</h2>
            <p className="text-blue-200 max-w-2xl mx-auto">
              {language === 'fr' ? 'Nous sommes toujours ravis d\'échanger avec vous' : 
               language === 'en' ? 'We\'re always happy to connect with you' : 
               'نحن سعداء دائمًا بالتواصل معك'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-800 p-4 rounded-full mb-4">
                <FaEnvelope className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="text-blue-200">{content.contactInfo[language].email}</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-800 p-4 rounded-full mb-4">
                <FaPhone className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {language === 'fr' ? 'Téléphone' : language === 'en' ? 'Phone' : 'هاتف'}
              </h3>
              <p className="text-blue-200">{content.contactInfo[language].phone}</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-800 p-4 rounded-full mb-4">
                <FaMapMarkerAlt className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {language === 'fr' ? 'Adresse' : language === 'en' ? 'Address' : 'عنوان'}
              </h3>
              <p className="text-blue-200">{content.contactInfo[language].address}</p>
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-12">
            <a href="#" className="text-white hover:text-blue-300 transition-colors">
              <FaLinkedin className="text-2xl" />
            </a>
            <a href="#" className="text-white hover:text-blue-300 transition-colors">
              <FaTwitter className="text-2xl" />
            </a>
            <a href="#" className="text-white hover:text-blue-300 transition-colors">
              <FaFacebook className="text-2xl" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 py-8 text-center text-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm">
            © {new Date().getFullYear()} Ayan Bridge. 
            {language === 'fr' ? ' Tous droits réservés.' : 
             language === 'en' ? ' All rights reserved.' : 
             ' جميع الحقوق محفوظة.'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;