import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import AppURL from '../../components/AppUrl';



type Language = 'fr' | 'en' | 'ar';

interface HomePageProps {
  language: Language;
}

const HomePage: React.FC<HomePageProps> = ({ language }) => {
  const navigate = useNavigate();
  const [topProducts, setTopProducts] = useState<any[]>([]);

  const images = ['/ayan5.png', '/ayan6.png', '/ayan4.png', '/ayan7.png'];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);


  useEffect(() => {
    // Précharger toutes les images
    images.forEach((imgSrc) => {
      const img = new Image();
      img.src = imgSrc;
    });

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);


  useEffect(() => {
    axios.get(`${AppURL}/api/ventes/topProducts`)
      .then(res => {
        if (Array.isArray(res.data.produits)) {
          setTopProducts(res.data.produits);
        } else {
          console.error("Format inattendu :", res.data);
          setTopProducts([]); // fallback sécurité
        }
      })
      .catch(err => {
        console.error('Erreur chargement produits populaires', err);
        setTopProducts([]); // fallback sécurité
      });
  }, []);


  const scrollToFeatures = () => {
    const section = document.getElementById('features-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };


  const titles: Record<Language, string> = {
    fr: "Ayan Bridge, votre passerelle vers la réussite.",
    en: "Ayan Bridge, your gateway to success.",
    ar: "أيــان بريــدج، جسرُك نحو النجاح.",
  };

  const subtitles: Record<Language, string> = {
    fr: "Plateforme tout-en-un pour apprendre, créer, investir et grandir en toute confiance.",
    en: "All-in-one platform to learn, create, invest, and grow with confidence.",
    ar: "منصة متكاملة للتعلم، الإنشاء، الاستثمار والنمو بثقة.",
  };

  const description: Record<Language, string> = {
    fr: "Ayan Bridge connecte les créateurs, investisseurs et apprenants dans un écosystème puissant et collaboratif.",
    en: "Ayan Bridge connects creators, investors, and learners in a powerful collaborative ecosystem.",
    ar: "أيــان بريــدج تربط المبدعين والمستثمرين والمتعلمين ضمن نظام تعاوني قوي.",
  };

  return (
    <div className="font-sans bg-white text-gray-800 antialiased ">
      {/* Hero Section */}
      <section className="relative px-6 text-white py-25 md:py-36 lg:py-48 overflow-hidden">
        {/* Images avec transition d'opacité */}
        {images.map((img, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              backgroundImage: `url('${img}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: index === currentImageIndex ? 1 : 0,
              zIndex: 0,
            }}
          />
        ))}

        {/* Overlay sombre pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-black opacity-40 z-1"></div>

        {/* Effet de lumière subtil */}
        <div
          className="absolute inset-0 opacity-60 z-1"
          style={{
            backgroundImage: "radial-gradient(circle at 10% 20%, rgba(255,255,255,0.2) 0%, transparent 30%)",
          }}
        ></div>

        <div className="relative max-w-6xl mx-auto text-center z-10 ">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight drop-shadow-xl text-orange-400">
            {titles[language]}
          </h1>

          <p className="text-xl md:text-2xl mb-8 font-bold leading-relaxed max-w-3xl mx-auto text-white drop-shadow-xl">
            {subtitles[language]}
          </p>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed text-gray-100 drop-shadow-lg">
            {description[language]}
          </p>
        </div>

        {/* Down Arrow */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-6">
          <button
            onClick={() => navigate('/signin')}
            className="bg-orange-400 hover:bg-orange-300 text-blue-950 font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 min-w-[220px] text-center transform hover:scale-105"
          >
            {language === 'fr' ? 'Commencer' : language === 'en' ? 'Get Started' : 'ابدأ الآن'}
          </button>

          <button
            onClick={scrollToFeatures}
            className="animate-bounce text-orange-300 hover:text-white text-2xl focus:outline-none transition-colors duration-300"
            aria-label="Scroll to features"
          >
            <FaChevronDown />
          </button>
        </div>
      </section>


      {/* Features Section - Modern Design */}
      <section id="features-section" className="py-24 px-6" style={{ backgroundColor: '#081229' }}>
        <div className="max-w-7xl mx-auto">
          {/* Titre */}
          <div className="text-center mb-16">
            <span className="text-orange-400 font-semibold mb-2 block tracking-widest uppercase text-sm">
              {language === 'fr' ? 'FONCTIONNALITÉS' : language === 'en' ? 'FEATURES' : 'ميزات'}
            </span>
            <h2 className="text-4xl font-bold text-white mb-4">
              {language === 'fr'
                ? 'Pourquoi choisir Ayan Bridge ?'
                : language === 'en'
                  ? 'Why Choose Ayan Bridge?'
                  : 'لماذا أيــان بريــدج؟'}
            </h2>
            <div className="w-24 h-1 bg-orange-400 mx-auto mb-6"></div>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              {language === 'fr'
                ? 'Découvrez une expérience unique conçue pour votre succès'
                : language === 'en'
                  ? 'Discover a unique experience designed for your success'
                  : 'اكتشف تجربة فريدة مصممة لنجاحك'}
            </p>
          </div>

          {/* Cartes de fonctionnalités modernes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {([
              ['📚',
                language === 'fr' ? 'Bibliothèque numérique' : language === 'en' ? 'Digital Library' : 'المكتبة الرقمية',
                language === 'fr'
                  ? 'Explorez une vaste collection de ressources éducatives et créatives.'
                  : language === 'en'
                    ? 'Explore a vast collection of educational and creative resources.'
                    : 'استكشف مجموعة واسعة من الموارد التعليمية والإبداعية.',
                '/ebook',
                'bg-gradient-to-br from-blue-400 to-blue-600'],
              ['🎓',
                language === 'fr' ? 'Parcours d\'apprentissage' : language === 'en' ? 'Learning Paths' : 'مسارات التعلم',
                language === 'fr'
                  ? 'Développez vos compétences à travers des formations certifiées.'
                  : language === 'en'
                    ? 'Grow your skills with structured, certified courses.'
                    : 'طوّر مهاراتك من خلال دورات منظمة ومعتمدة.',
                '/LearnHub',
                'bg-gradient-to-br from-purple-400 to-purple-600'],
              ['🤖',
                language === 'fr' ? 'Studio IA' : language === 'en' ? 'AI Studio' : 'استوديو الذكاء الاصطناعي',
                language === 'fr'
                  ? 'Créez, publiez et innovez grâce à nos outils intelligents.'
                  : language === 'en'
                    ? 'Create, publish, and innovate with our smart tools.'
                    : 'أنشئ، وانشر، وابتكر باستخدام أدواتنا الذكية.',
                '/AIStudio',
                'bg-gradient-to-br from-orange-400 to-orange-600'],
              ['💼',
                language === 'fr' ? 'Opportunités d\'investissement' : language === 'en' ? 'Investment Opportunities' : 'فرص استثمارية',
                language === 'fr'
                  ? 'Investissez dans des projets innovants et rentables.'
                  : language === 'en'
                    ? 'Invest in innovative and profitable projects.'
                    : 'استثمر في مشاريع مبتكرة ومربحة.',
                '/Invest',
                'bg-gradient-to-br from-green-400 to-green-600'],
            ] as [string, string, string, string, string][]).map(([emoji, title, desc, link, gradient], i) => (
              <div
                key={i}
                onClick={() => navigate(link)}
                className="relative overflow-hidden group cursor-pointer rounded-xl shadow-2xl transition-all duration-500 hover:-translate-y-3"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 ${gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>

                {/* Card Content */}
                <div className="relative bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 bg-opacity-50 backdrop-blur-sm p-8 h-full border border-gray-700 rounded-xl hover:border-orange-400 transition-all duration-300">
                  {/* Animated Border Effect */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                  </div>

                  {/* Icon Container with Gradient */}
                  <div className={`relative z-10 flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-xl ${gradient} text-white text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {emoji}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-center text-white mb-4 group-hover:text-orange-300 transition-colors duration-300">
                    {title}
                  </h3>
                  <p className="text-gray-300 text-center mb-6 group-hover:text-white transition-colors duration-300">
                    {desc}
                  </p>

                  {/* Explore Button with Hover Effect */}
                  <div className="flex justify-center">
                    <button className="flex items-center justify-center px-6 py-2 rounded-full bg-transparent border border-orange-400 text-orange-400 font-medium group-hover:bg-orange-400 group-hover:text-white transition-all duration-300">
                      <span className="mr-2">
                        {language === 'fr' ? 'Explorer' : language === 'en' ? 'Explore' : 'استكشف'}
                      </span>
                      <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Products Section */}
      <section className="py-20 px-6 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-950 font-semibold mb-2 block">
              {language === 'fr' ? 'PRODUITS' : language === 'en' ? 'PRODUCTS' : 'منتجات'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              {language === 'fr' ? 'Produits populaires' :
                language === 'en' ? 'Popular Products' :
                  'المنتجات الشائعة'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {language === 'fr' ? 'Découvrez nos meilleures créations' :
                language === 'en' ? 'Discover our top creations' :
                  'اكتشف أفضل إبداعاتنا'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative overflow-hidden h-48">
                  <img
                    src={
                      product.coverImage?.startsWith('/')
                        ? `${AppURL}${product.coverImage}${product.type === 'ebook' ? 'cover.png' : ''}`
                        : product.coverImage || '/default.jpg'
                    }
                    alt={product.titre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-2">{product.titre}</h3>
                    <p className="text-sm text-orange-500">
                      {product.ventes || 0} {language === 'fr' ? 'ventes' : language === 'en' ? 'sales' : 'عملية بيع'}
                    </p>

                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {language === 'fr' ? 'Par' : language === 'en' ? 'By' : 'بواسطة'} {product.auteur || 'Ayan Creator'}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-green-800">
                      {product.prix ? `$${product.prix.toFixed(2)}` : 'Gratuit'}
                    </p>

                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/ebook')}
              className="inline-flex items-center px-6 py-3 border border-blue-950 text-blue-950 rounded-full font-medium hover:bg-blue-950 hover:text-white transition-colors"
            >
              {language === 'fr' ? 'Voir tous les produits' :
                language === 'en' ? 'View all products' :
                  'عرض جميع المنتجات'}
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </section>


      

      {/* CTA Section */}
      <section className="py-20 px-6  text-white" style={{ backgroundColor: '#081229' }}>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {language === 'fr' ? 'Prêt à commencer votre voyage ?' :
              language === 'en' ? 'Ready to start your journey?' :
                'هل أنت مستعد لبدء رحلتك؟'}
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            {language === 'fr' ? 'Rejoignez des milliers de créateurs et apprenants dès aujourd\'hui.' :
              language === 'en' ? 'Join thousands of creators and learners today.' :
                'انضم إلى آلاف المبدعين والمتعلمين اليوم.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center justify-center gap-2 bg-white text-blue-950 font-semibold py-4 px-8 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300"
            >
              {language === 'fr' ? 'S\'inscrire gratuitement' :
                language === 'en' ? 'Sign up for free' :
                  'اشترك مجانًا'}
              <FaArrowRight />
            </button>
            <button
              onClick={() => navigate('/aboutus')}
              className="flex items-center justify-center bg-transparent border-2 border-white text-white font-semibold py-4 px-8 rounded-full hover:bg-white hover:text-blue-950 transition-all duration-300"
            >
              {language === 'fr' ? 'Nous contacter' :
                language === 'en' ? 'Contact us' :
                  'اتصل بنا'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-white">Ayan Bridge</h3>
            <p className="text-gray-400 mb-6">
              {language === 'fr' ? 'Votre passerelle vers la réussite.' :
                language === 'en' ? 'Your gateway to success.' :
                  'جسرك نحو النجاح.'}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 text-white">
              {language === 'fr' ? 'Liens rapides' : language === 'en' ? 'Quick Links' : 'روابط سريعة'}
            </h4>
            <ul className="space-y-3">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors">{language === 'fr' ? 'Accueil' : language === 'en' ? 'Home' : 'الرئيسية'}</a></li>
              <li><a href="/aboutus" className="text-gray-400 hover:text-white transition-colors">{language === 'fr' ? 'À propos' : language === 'en' ? 'About' : 'من نحن'}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 text-white">
              {language === 'fr' ? 'Produits' : language === 'en' ? 'Products' : 'منتجاتنا'}
            </h4>
            <ul className="space-y-3">
              <li><a href="/LearnHub" className="text-gray-400 hover:text-white transition-colors">Learn Hub</a></li>
              <li><a href="AIStudio" className="text-gray-400 hover:text-white transition-colors">AI Studio</a></li>
              <li><a href="/ebook" className="text-gray-400 hover:text-white transition-colors">Marketplace</a></li>
              <li><a href="Invest" className="text-gray-400 hover:text-white transition-colors">Invest</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 text-white">
              {language === 'fr' ? 'Contactez-nous' : language === 'en' ? 'Contact Us' : 'اتصل بنا'}
            </h4>
            <address className="not-italic text-gray-400 space-y-3">
              <p className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contact@ayanbridge.com
              </p>
              <p className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +1 (234) 567-890
              </p>
              <p className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {language === 'fr' ? 'Montréal, Canada' :
                  language === 'en' ? 'Montreal, Canada' :
                    'مونتريال، كندا'}

              </p>
            </address>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>
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

export default HomePage;