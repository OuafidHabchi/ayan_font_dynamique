import { useEffect, useState } from "react";
import axios from "axios";
import AppURL from "../../components/AppUrl";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";

type Language = 'fr' | 'en' | 'ar';


const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const language: Language = ['fr', 'en', 'ar'].includes(user?.langue as string) ? (user?.langue as Language) : 'fr';

  const [lastEbook, setLastEbook] = useState<any>(null);
  const [totalEbooks, setTotalEbooks] = useState(0);
  const [unreadBooks, setUnreadBooks] = useState<any[]>([]);
  const [lastFormation, setLastFormation] = useState<any>(null);
  const [totalFormations, setTotalFormations] = useState(0);
  const [unwatchedFormations, setUnwatchedFormations] = useState<any[]>([]);
  const [rejectedOrPending, setRejectedOrPending] = useState<{ type: 'ebook' | 'formation', cover: string, status: 'pending' | 'rejected', _id: string }[]>([]);
  const [totalInvest, setTotalInvest] = useState(0);
  const [pendingInvest, setPendingInvest] = useState(0);
  const [variation, setVariation] = useState("+0%");
  const [lastOperation, setLastOperation] = useState("N/A");
  const [monthlyData, setMonthlyData] = useState<{ name: string, value: number }[]>([]);
  const [loadingEbooks, setLoadingEbooks] = useState(true);
  const [loadingFormations, setLoadingFormations] = useState(true);
  const [loadingCreations, setLoadingCreations] = useState(true);
  const [loadingInvestments, setLoadingInvestments] = useState(true);



  useEffect(() => {
    if (!user?.id) return;

    const fetchInvestments = async () => {
      try {
        const { data } = await axios.get(`${AppURL}/api/ventes/revenus/${user.id}`);
        const revenus = data.revenus || [];

        const total = revenus.reduce((acc: any, item: { revenu: { amount: any; }; }) => acc + item.revenu.amount, 0);
        const pending = revenus
          .filter((item: { revenu: { payed: any; }; }) => !item.revenu.payed)
          .reduce((acc: any, item: { revenu: { amount: any; }; }) => acc + item.revenu.amount, 0);

        const sorted = [...revenus].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const last = sorted[0];

        setTotalInvest(total);
        setPendingInvest(pending);
        setLastOperation(last ? `${last.produit.titre}` : "N/A");

        // Regrouper par mois
        const monthlyMap: Record<string, number> = {};
        revenus.forEach((item: any) => {
          const month = format(new Date(item.date), 'MMM yyyy');
          monthlyMap[month] = (monthlyMap[month] || 0) + item.revenu.amount;
        });
        const sortedMonths = Object.entries(monthlyMap)
          .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
          .slice(-6) // derniers 6 mois

        setMonthlyData(sortedMonths.map(([name, value]) => ({ name, value })));



        // (optionnel) calcul variation sur 7j
        const now = new Date();
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        const total7j = revenus
          .filter((item: { date: string | number | Date; }) => new Date(item.date) >= weekAgo)
          .reduce((acc: any, item: { revenu: { amount: any; }; }) => acc + item.revenu.amount, 0);
        setVariation(`+${((total7j / (total || 1)) * 100).toFixed(1)}%`);
        setLoadingInvestments(false); // ✅ ajoute ceci à la fin
      } catch (err) {
        console.error("❌ Erreur chargement investissement:", err);
        setLoadingInvestments(false); // ✅ ajoute ceci à la fin
      }
    };

    fetchInvestments();
  }, [user]);



  useEffect(() => {
    if (!user?.id) return;

    const fetchDashboardCreation = async () => {
      try {
        const res = await axios.get(`${AppURL}/api/users/contenus-rejetes-ou-attente/${user.id}`);
        const stats = res.data;

        const ebooks = (stats.ebooks || []).map((e: any) => ({
          type: 'ebook',
          cover: `${AppURL}${e.folderPath}cover.png`,
          status: e.approved,
          _id: e._id
        }));

        const formations = (stats.formations || []).map((f: any) => ({
          type: 'formation',
          cover: `${AppURL}${f.coverImage}`,
          status: f.approved,
          _id: f._id
        }));

        setRejectedOrPending([...ebooks, ...formations]);
        setLoadingCreations(false); // ✅

      } catch (error) {
        console.error("❌ Erreur Dashboard créations rejetées/en attente:", error);
        setLoadingCreations(false); // ✅

      }
    };


    fetchDashboardCreation();
  }, [user]);



  useEffect(() => {
    if (!user?.id) return;

    const fetchDashboardEbooks = async () => {
      try {
        const res = await axios.get(`${AppURL}/api/myEbookRoutes/stats/${user.id}`);
        const stats = res.data;
        setTotalEbooks(stats.totalBooks || 0);
        setUnreadBooks(stats.unreadBooks || []);

        if (stats.lastReadBook && stats.lastReadBook.bookId) {
          const book = stats.lastReadBook.bookId;
          const total = book.NumPages || 1;
          const read = stats.lastReadBook.lastReadPage || 0;
          const progress = Math.min(100, Math.round((read / total) * 100));

          setLastEbook({
            titre: book.titre,
            progress,
            cover: `${AppURL}${book.coverImage || book.folderPath + "cover.png"}`
          });
          setLoadingEbooks(false); // ✅

        } else {
          setLastEbook(null);
          setLoadingEbooks(false); // ✅

        }
      } catch (error) {
        console.error("❌ Erreur Dashboard ebooks:", error);
        setLoadingEbooks(false); // ✅

      }
    };

    fetchDashboardEbooks();
  }, [user]);


  useEffect(() => {
    if (!user?.id) return;

    const fetchDashboardFormations = async () => {
      try {
        const res = await axios.get(`${AppURL}/api/myFormationRoutes/stats/${user.id}`);
        const formationStats = res.data;

        setTotalFormations(formationStats.totalFormations || 0);
        setUnwatchedFormations(formationStats.unwatchedFormations || []);

        if (formationStats.lastWatchedFormation && formationStats.lastWatchedFormation.formationId) {
          const formation = formationStats.lastWatchedFormation.formationId;
          const totalChapters = formation.chapitres.length || 1;
          const watched = formationStats.lastWatchedFormation.lastWatchedChapter || 0;
          const progress = Math.min(100, Math.round((watched / totalChapters) * 100));

          setLastFormation({
            titre:
              formation.type === "scolaire"
                ? formation.matiere
                : formation.titreFormation,
            progress,
            cover: `${AppURL}${formation.coverImage || formation.folderPath + "cover.png"}`
          });
          setLoadingFormations(false); // ✅

        } else {
          setLastFormation(null);
          setLoadingFormations(false); // ✅

        }
      } catch (error) {
        console.error("❌ Erreur Dashboard formations:", error);
        setLoadingFormations(false); // ✅
      }
    };

    fetchDashboardFormations();
  }, [user]);



  const investments = {
    total: totalInvest,
    variation: variation,
    trend: variation.startsWith('+') ? "📈" : "📉"
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 p-6 text-white mt-20">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 text-center">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">
          {language === 'fr' ? 'Tableau de bord' : language === 'en' ? 'Dashboard' : 'لوحة التحكم'}
        </span>

      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">


        {/* My Ebooks */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-400/30 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-400/20">
          <div className="p-4 border-b border-orange-400/30 bg-gradient-to-r from-orange-400/10 to-transparent flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {language === 'fr' ? 'Mes Ebooks' : language === 'en' ? 'My Ebooks' : 'كتبي الإلكترونية'}
              </h2>
              <p className="text-sm text-gray-400">
                
                  {language === 'fr'
                    ? 'Contient la lecture de votre dernier ebook'
                    : language === 'en'
                      ? 'Includes your latest ebook reading'
                      : 'يتضمن قراءة آخر كتاب إلكتروني لك'}
                
              </p>
            </div>
            <p className="text-xs text-gray-400">{language === 'fr'
              ? `Total : ${totalEbooks}`
              : language === 'en'
                ? `Total: ${totalEbooks}`
                : `الإجمالي: ${totalEbooks}`}
            </p>
          </div>

          <div className="p-6">
            {loadingEbooks ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-400"></div>
              </div>
            ) : lastEbook ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={lastEbook.cover}
                    alt="Cover"
                    className="w-16 h-20 object-cover rounded-md shadow-md"
                  />
                  <div>
                    <h3 className="font-medium">{lastEbook.titre}</h3>
                    <p className="text-sm text-gray-400">
                      {language === 'fr'
                        ? 'Dernière lecture'
                        : language === 'en'
                          ? 'Last reading'
                          : 'آخر قراءة'}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-orange-500 h-2.5 rounded-full"
                    style={{ width: `${lastEbook.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-400">
                  <span>
                    {language === 'fr'
                      ? 'Progression'
                      : language === 'en'
                        ? 'Progress'
                        : 'التقدم'}
                  </span>
                  <span>{lastEbook.progress}%</span>
                </div>

                {unreadBooks.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-orange-300 mb-2">
                      {language === 'fr'
                        ? 'Livres jamais ouverts :'
                        : language === 'en'
                          ? 'Never opened books:'
                          : 'كتب لم تُفتح مطلقًا:'}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {unreadBooks.map((book) => (
                        <img
                          key={book._id}
                          src={`${AppURL}${book.bookId.coverImage || book.bookId.folderPath + "cover.png"}`}
                          alt={book.bookId.titre}
                          title={book.bookId.titre}
                          className="w-10 h-14 object-cover rounded-sm border border-orange-300 hover:scale-105 transition"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => navigate('/MyEbooks')}
                  className="mt-4 w-full px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-md transition-colors text-orange-400"
                >
                  {language === 'fr'
                    ? 'Accéder à ma bibliothèque'
                    : language === 'en'
                      ? 'Go to my library'
                      : 'الذهاب إلى مكتبتي'}
                </button>

              </>
            ) : (
              <p className="text-gray-400 text-sm">
                {language === 'fr'
                  ? 'Aucun ebook encore lu.'
                  : language === 'en'
                    ? 'No ebook read yet.'
                    : 'لم يتم قراءة أي كتاب إلكتروني بعد.'}
              </p>
            )}
          </div>
        </div>




        {/* My Formations */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-blue-400/30 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-400/20">
          <div className="p-4 border-b border-blue-400/30 bg-gradient-to-r from-blue-400/10 to-transparent flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                {language === 'fr'
                  ? 'Mes Formations'
                  : language === 'en'
                    ? 'My Courses'
                    : 'دوراتي'}
              </h2>
              <p className="text-sm text-gray-400">
                {language === 'fr'
                  ? 'Contient votre dernière formation regardée'
                  : language === 'en'
                    ? 'Includes your last watched course'
                    : 'يتضمن آخر دورة شاهدتها'}
              </p>
            </div>
            <p className="text-xs text-gray-400">
              {language === 'fr'
                ? `Total : ${totalFormations}`
                : language === 'en'
                  ? `Total: ${totalFormations}`
                  : `الإجمالي: ${totalFormations}`}
            </p>
          </div>

          <div className="p-6">
            {loadingFormations ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : lastFormation ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={lastFormation.cover}
                    alt="Cover"
                    className="w-16 h-20 object-cover rounded-md shadow-md"
                  />
                  <div>
                    <h3 className="font-medium">{lastFormation.titre}</h3>
                    <p className="text-sm text-gray-400">
                      {language === 'fr'
                        ? 'Dernière formation regardée'
                        : language === 'en'
                          ? 'Last watched course'
                          : 'آخر دورة تم مشاهدتها'}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: `${lastFormation.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-400">
                  <span>
                    {language === 'fr'
                      ? 'Progression'
                      : language === 'en'
                        ? 'Progress'
                        : 'التقدم'}
                  </span>
                  <span>{lastFormation.progress}%</span>
                </div>

                {/* Formations jamais commencées */}
                {unwatchedFormations.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-blue-300 mb-2">
                      {language === 'fr'
                        ? 'Formations jamais commencées :'
                        : language === 'en'
                          ? 'Never started courses:'
                          : 'دورات لم تبدأ أبدًا:'}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {unwatchedFormations.map((item) => (
                        <img
                          key={item._id}
                          src={`${AppURL}${item.formationId.coverImage || item.formationId.folderPath + "cover.png"}`}
                          alt={item.formationId.titre}
                          title={item.formationId.titre}
                          className="w-10 h-14 object-cover rounded-sm border border-blue-300 hover:scale-105 transition"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => navigate('/MyFormations')}
                  className="mt-4 w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-md transition-colors text-blue-400"
                >
                  {language === 'fr'
                    ? 'Accéder à mes formations'
                    : language === 'en'
                      ? 'Go to my courses'
                      : 'الذهاب إلى دوراتي'}
                </button>
              </>
            ) : (
              <p className="text-gray-400 text-sm">
                {language === 'fr'
                  ? 'Aucune formation encore regardée.'
                  : language === 'en'
                    ? 'No course watched yet.'
                    : 'لم يتم مشاهدة أي دورة بعد.'}
              </p>
            )}
          </div>
        </div>



        {/* My Creation */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-400/30 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-400/20">
          <div className="p-4 border-b border-purple-400/30 bg-gradient-to-r from-purple-400/10 to-transparent">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {language === 'fr'
                ? 'Mes Créations'
                : language === 'en'
                  ? 'My Creations'
                  : 'إبداعاتي'}
            </h2>
            <p className="text-sm text-gray-400">
              {language === 'fr'
                ? 'Créations en attente ou refusées'
                : language === 'en'
                  ? 'Pending or rejected creations'
                  : 'الإبداعات المعلقة أو المرفوضة'}
            </p>
          </div>

          <div className="p-6 space-y-6">
            {loadingCreations ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-700"></div>
              </div>
            ) : rejectedOrPending.length > 0 ? (
              <><>
                {/* Ebooks */}
                {rejectedOrPending.filter(item => item.type === 'ebook').length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-purple-300 mb-2">
                      <span className="text-sm font-medium">
                        📚 {language === 'fr' ? 'eBooks' : language === 'en' ? 'eBooks' : 'الكتب الإلكترونية'}
                      </span>
                      <span className="text-xs bg-purple-700/30 px-2 py-0.5 rounded-full text-purple-200">
                        {rejectedOrPending.filter(item => item.type === 'ebook').length}
                      </span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500/60 pb-2">
                      {rejectedOrPending.filter(item => item.type === 'ebook').map(item => (
                        <div key={item._id} className="relative w-24 h-32 rounded-lg overflow-hidden group border border-purple-400/40 shadow-md flex-shrink-0">
                          <img
                            src={item.cover}
                            alt="ebook"
                            className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300" />
                          <span
                            className={`absolute top-1 left-1 text-[10px] font-bold rounded-full px-2 py-0.5 shadow-md ${item.status === 'pending' ? 'bg-yellow-400 text-black' : 'bg-red-600 text-white'}`}
                          >
                            {item.status === 'pending'
                              ? language === 'fr'
                                ? 'En attente'
                                : language === 'en'
                                  ? 'Pending'
                                  : 'قيد الانتظار'
                              : language === 'fr'
                                ? 'Refusé'
                                : language === 'en'
                                  ? 'Rejected'
                                  : 'مرفوض'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formations */}
                {rejectedOrPending.filter(item => item.type === 'formation').length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-purple-300 mt-4 mb-2">
                      <span className="text-sm font-medium">
                        🎓 {language === 'fr' ? 'Formations' : language === 'en' ? 'Courses' : 'الدورات'}
                      </span>
                      <span className="text-xs bg-purple-700/30 px-2 py-0.5 rounded-full text-purple-200">
                        {rejectedOrPending.filter(item => item.type === 'formation').length}
                      </span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500/60 pb-2">
                      {rejectedOrPending.filter(item => item.type === 'formation').map(item => (
                        <div key={item._id} className="relative w-24 h-32 rounded-lg overflow-hidden group border border-purple-400/40 shadow-md flex-shrink-0">
                          <img
                            src={item.cover}
                            alt="formation"
                            className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300" />
                          <span
                            className={`absolute top-1 left-1 text-[10px] font-bold rounded-full px-2 py-0.5 shadow-md ${item.status === 'pending' ? 'bg-yellow-400 text-black' : 'bg-red-600 text-white'}`}
                          >
                            {item.status === 'pending'
                              ? language === 'fr'
                                ? 'En attente'
                                : language === 'en'
                                  ? 'Pending'
                                  : 'قيد الانتظار'
                              : language === 'fr'
                                ? 'Refusée'
                                : language === 'en'
                                  ? 'Rejected'
                                  : 'مرفوضة'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </><button
                onClick={() => navigate('/MyCreations')}
                className="w-full px-4 py-2 bg-purple-700/30 hover:bg-purple-700/50 border border-purple-500/60 rounded-md transition-all text-purple-200 font-medium"
              >
                  {language === 'fr'
                    ? 'Voir toutes mes créations'
                    : language === 'en'
                      ? 'View all my creations'
                      : 'عرض جميع إبداعاتي'}
                </button></>
            ) : (
              <p className="text-sm text-gray-400 text-center">
                {totalEbooks + totalFormations === 0
                  ? language === 'fr'
                    ? 'Toutes vos créations sont approuvées ✅'
                    : language === 'en'
                      ? 'All your creations are approved ✅'
                      : 'تمت الموافقة على جميع إبداعاتك ✅'
                  : rejectedOrPending.length === 0
                    ? language === 'fr'
                      ? "Vous n'avez encore créé aucun contenu."
                      : language === 'en'
                        ? 'You have not created any content yet.'
                        : 'لم تقم بإنشاء أي محتوى بعد.'
                    : null}
              </p>


            )}


          </div>
        </div>



        {/* Suivi Investissement */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-green-400/30 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-green-400/20">
          <div className="p-4 border-b border-green-400/30 bg-gradient-to-r from-green-400/10 to-transparent">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {language === 'fr'
                ? 'Suivi Investissement'
                : language === 'en'
                  ? 'Investment Tracking'
                  : 'تتبع الاستثمار'}
            </h2>
            <p className="text-sm text-gray-400">
              {language === 'fr'
                ? 'Suivi de vos investissements'
                : language === 'en'
                  ? 'Track your investments'
                  : 'تتبع استثماراتك'}
            </p>
          </div>

          <div className="p-6">
            {loadingInvestments ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : investments.total === 0 ? (
              <p className="text-center text-sm text-gray-400">
                {language === 'fr'
                  ? 'Aucun investissement pour le moment.'
                  : language === 'en'
                    ? 'No investment at the moment.'
                    : 'لا يوجد استثمار في الوقت الحالي.'}
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-gray-400">
                      {language === 'fr'
                        ? 'Portefeuille total'
                        : language === 'en'
                          ? 'Total portfolio'
                          : 'إجمالي المحفظة'}
                    </p>
                    <p className="text-2xl font-bold">
                      ${investments.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-4xl">{investments.trend}</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      {language === 'fr'
                        ? 'Performance (7j)'
                        : language === 'en'
                          ? 'Performance (7d)'
                          : 'الأداء (7 أيام)'}
                    </span>
                    <span className={`${investments.variation.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {investments.variation}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      {language === 'fr'
                        ? 'Dernière opération'
                        : language === 'en'
                          ? 'Last transaction'
                          : 'آخر عملية'}
                    </span>
                    <span className="truncate max-w-[140px] text-right">{lastOperation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      {language === 'fr'
                        ? 'Montant en attente'
                        : language === 'en'
                          ? 'Pending amount'
                          : 'المبلغ المعلق'}
                    </span>
                    <span className="text-yellow-400">{pendingInvest.toFixed(2)} $</span>
                  </div>
                </div>

                <div className="mt-10">
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="name" stroke="#ccc" fontSize={10} />
                      <YAxis hide />
                      <Tooltip formatter={(val: number) => `${val.toFixed(2)} $`} />
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#2f855a" opacity={0.1} />
                      <Bar dataKey="value" fill="#34d399" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <button
                  onClick={() => navigate('/MyInvestissements')}
                  className="mt-10 w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-md transition-colors text-green-400"
                >
                  {language === 'fr'
                    ? 'Analyser le portefeuille'
                    : language === 'en'
                      ? 'Analyze portfolio'
                      : 'تحليل المحفظة'}
                </button>
              </>
            )}

          </div>
        </div>




      </div>
    </div>
  );
};

export default Dashboard;