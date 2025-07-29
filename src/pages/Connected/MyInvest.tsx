import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  FaDollarSign,
  FaShoppingCart,
  FaCheckCircle,
  FaChartLine,
  FaChartPie,
  FaTable,
  FaFilter,
  FaDownload,
  FaSearch,
  FaUserTie,
  FaUserEdit,
  FaKey,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import AppURL from "../../components/AppUrl";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Switch from "react-switch"; // Si tu utilises react-switch

interface RevenuItem {
  date: string;
  produit: {
    id: string;
    titre: string;
    type: string;
    prix: number;
    matiere?: string;
    niveau?: string;
    titreFormation?: string;
  };
  revenu: {
    amount: number;
    percent: number;
    payed: boolean;
  };
  role: string;
  venteId: string;
}

interface Stats {
  totalVentes: number;
  totalGagne: number;
  pendingAmount: number;
  roleStats: {
    [role: string]: {
      count: number;
      montant: number;
    };
  };
  typeStats: {
    [type: string]: {
      count: number;
      montant: number;
    };
  };
}

interface ChartDataItem {
  name: string;
  value: number;
  count: number;
}

interface TimeDataItem {
  name: string;
  value: number;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#A4DE6C', '#D0ED57'];

type Language = 'fr' | 'en' | 'ar';

export default function MyInvest() {
  const { user } = useAuth();
  const language: Language = ['fr', 'en', 'ar'].includes(user?.langue as string) ? (user?.langue as Language) : 'fr';
  const [revenus, setRevenus] = useState<RevenuItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalVentes: 0,
    totalGagne: 0,
    pendingAmount: 0,
    roleStats: {},
    typeStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [localOptions, setLocalOptions] = useState<any | null>(null);
  const [hasSponsor, setHasSponsor] = useState(false);
  const [licenceMontant, setLicenceMontant] = useState(0);



  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  useEffect(() => {
    if (selectedItem && showModal) {
      const hasInvestor = selectedItem.revenueParticipants?.investors?.length > 0;

      setHasSponsor(hasInvestor);

      setLocalOptions({
        ...selectedItem.investmentOptions,
        // 👇 Forcer sponsoring à false s'il y a un investisseur
        sponsoring: hasInvestor ? false : selectedItem.investmentOptions.sponsoring
      });

      setLicenceMontant(
        selectedItem.investmentOptions.licence
          ? selectedItem.investmentOptions.licenceMontant || 0
          : 0
      );
    }
  }, [selectedItem, showModal]);


  // 🧠 Exécution initiale au chargement
  useEffect(() => {
    fetchParticipations();
  }, [user?.id, language]);



  // 👇 Fonction placée AVANT le useEffect
  const fetchParticipations = async () => {
    if (!user?.id) return;

    try {
      const [ebooksRes, formationsRes] = await Promise.all([
        axios.get(`${AppURL}/api/Collectionebooks/creator/${user.id}`),
        axios.get(`${AppURL}/api/StudioFormationRoutes/creator/${user.id}`)
      ]);
   
      setEbooks(ebooksRes.data.ebooks || []);
      setFormations(formationsRes.data.formations || []);
    } catch (error) {
      console.error("Error fetching participations:", error);

    } finally {
      setLoading(false);
    }
  };



  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${AppURL}/api/ventes/revenus/${user?.id}`);
      const revenusData: RevenuItem[] = data.revenus || [];

      const roleStats: Stats["roleStats"] = {};
      const typeStats: Stats["typeStats"] = {};
      let total = 0;
      let pending = 0;

      revenusData.forEach((item) => {
        const role = item.role;
        const type = item.produit.type;
        const montant = item.revenu.amount;

        // Role stats
        if (!roleStats[role]) {
          roleStats[role] = { count: 0, montant: 0 };
        }
        roleStats[role].count += 1;
        roleStats[role].montant += montant;

        // Type stats
        if (!typeStats[type]) {
          typeStats[type] = { count: 0, montant: 0 };
        }
        typeStats[type].count += 1;
        typeStats[type].montant += montant;

        // Totals
        total += montant;
        if (!item.revenu.payed) pending += montant;
      });

      setRevenus(revenusData);
      setStats({
        totalVentes: revenusData.length,
        totalGagne: total,
        pendingAmount: pending,
        roleStats,
        typeStats
      });
    } catch (err) {
      console.error("Erreur lors du chargement des revenus :", err);
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    try {
      const payload: any = { investmentOptions: localOptions };
      payload.investmentOptions.licenceMontant = licenceMontant;

      const endpoint = selectedItem.type === 'ebook'
        ? '/api/Collectionebooks/investment-options/'
        : '/api/StudioFormationRoutes/investment-options/';

      await axios.patch(`${AppURL}${endpoint}${selectedItem._id}`, payload);
      setShowModal(false);
      fetchParticipations();
    } catch (err) {
      console.error(err);
    }
  };



  const getRoleChartData = (): ChartDataItem[] => {
    return Object.entries(stats.roleStats).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: data.montant,
      count: data.count
    }));
  };

  const getTypeChartData = (): ChartDataItem[] => {
    return Object.entries(stats.typeStats).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: data.montant,
      count: data.count
    }));
  };

  const getTimeChartData = (): TimeDataItem[] => {
    const timeData: Record<string, { value: number, count: number }> = {};

    revenus.forEach(item => {
      const dateKey = format(new Date(item.date), 'MMM yyyy', { locale: fr });
      if (!timeData[dateKey]) timeData[dateKey] = { value: 0, count: 0 };
      timeData[dateKey].value += item.revenu.amount;
      timeData[dateKey].count += 1;
    });

    return Object.entries(timeData).map(([name, data]) => ({
      name,
      value: data.value,
      count: data.count
    }));
  };

  const getRecentActivity = (): RevenuItem[] => {
    return [...revenus]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const getTopProducts = (): { name: string, value: number }[] => {
    const productMap: Record<string, number> = {};

    revenus.forEach(item => {
      const productName = item.produit.titre;
      if (!productMap[productName]) productMap[productName] = 0;
      productMap[productName] += item.revenu.amount;
    });

    return Object.entries(productMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const filteredRevenus = revenus.filter(item => {
    // Time range filter
    const itemDate = new Date(item.date);
    const now = new Date();

    if (timeRange === '7days' && itemDate < subDays(now, 7)) return false;
    if (timeRange === '30days' && itemDate < subDays(now, 30)) return false;
    if (timeRange === '90days' && itemDate < subDays(now, 90)) return false;

    // Role filter
    if (roleFilter !== 'all' && item.role !== roleFilter) return false;

    // Type filter
    if (typeFilter !== 'all' && item.produit.type !== typeFilter) return false;

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'paid' && !item.revenu.payed) return false;
      if (statusFilter === 'pending' && item.revenu.payed) return false;
    }

    // Search term
    if (searchTerm && !item.produit.titre.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  const exportData = () => {
    const csvContent = [
      ['Date', 'Titre affiché', 'Type', 'Rôle', 'Montant', 'Pourcentage', 'Statut', 'Matière', 'Niveau'],
      ...filteredRevenus.map(item => {
        const produit = item.produit;
        const { type, matiere, niveau, titre, titreFormation } = produit;

        const titreAffiche =
          type === 'formation'
            ? (matiere && niveau ? `${matiere} - ${niveau}` : titreFormation || titre)
            : titre;

        return [
          format(new Date(item.date), 'PP', { locale: fr }),
          titreAffiche,
          type,
          item.role,
          item.revenu.amount,
          item.revenu.percent,
          item.revenu.payed ? 'Payé' : 'En attente',
          matiere || '',
          niveau || ''
        ];
      })
    ]
      .map(e => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `revenus_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">
            {language === 'fr'
              ? 'Chargement de vos données...'
              : language === 'en'
                ? 'Loading your data...'
                : 'جاري تحميل بياناتك...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-gray-900 mt-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 shadow-lg">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-white">
                {language === 'fr'
                  ? 'Tableau de bord des investissements'
                  : language === 'en'
                    ? 'Investment Dashboard'
                    : 'لوحة معلومات الاستثمارات'}
              </h1>
              <p className="text-blue-100 mt-1">
                <span className="text-white">
                  {language === 'fr'
                    ? 'Bonjour, '
                    : language === 'en'
                      ? 'Hello, '
                      : 'مرحباً، '}
                  <span className="font-medium text-white">{user?.prenom || (language === 'fr' ? 'Utilisateur' : language === 'en' ? 'User' : 'المستخدم')}</span>
                </span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={fetchData}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
              >
                <FiRefreshCw className="mr-2" />
                {language === 'fr'
                  ? 'Actualiser'
                  : language === 'en'
                    ? 'Refresh'
                    : 'تحديث'}
              </button>
              <button
                onClick={exportData}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-700"
              >
                <FaDownload className="mr-2" />
                {language === 'fr'
                  ? 'Exporter'
                  : language === 'en'
                    ? 'Export'
                    : 'تصدير'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={<FaShoppingCart className="text-blue-500 text-xl" />}
            label="Ventes totales"
            value={stats.totalVentes}
            change={`${revenus.length > 0 ? Math.round((stats.totalVentes / revenus.length) * 100) : 0}% de votre portefeuille`}
            bgColor="bg-blue-50"
          />
          <StatsCard
            icon={<FaDollarSign className="text-green-500 text-xl" />}
            label="Gains totaux"
            value={`${stats.totalGagne.toFixed(2)} $`}
            change={`${stats.totalVentes > 0 ? (stats.totalGagne / stats.totalVentes).toFixed(2) : 0} $ par vente`}
            bgColor="bg-green-50"
          />
          <StatsCard
            icon={<FaUserTie className="text-purple-500 text-xl" />}
            label="Rôles actifs"
            value={Object.keys(stats.roleStats).length}
            change={`${Object.keys(stats.typeStats).length} types de produits`}
            bgColor="bg-purple-50"
          />
          <StatsCard
            icon={<FaCheckCircle className="text-yellow-500 text-xl" />}
            label="En attente"
            value={`${stats.pendingAmount.toFixed(2)} $`}
            change={`${stats.totalGagne > 0 ? ((stats.pendingAmount / stats.totalGagne) * 100).toFixed(1) : 0}% du total`}
            bgColor="bg-yellow-50"
          />
        </div>

        {/* Tabs */}
        <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)} className="pt-0 bg-white rounded-lg shadow">
          <TabList className="flex border-b border-gray-200">
            <Tab className="px-4 py-3 text-sm font-medium focus:outline-none" selectedClassName="text-blue-600 border-b-2 border-blue-500">
              <FaChartLine className="inline mr-2" />
              {language === 'fr'
                ? "Vue d'ensemble"
                : language === 'en'
                  ? 'Overview'
                  : 'نظرة عامة'}
            </Tab>
            <Tab className="px-4 py-3 text-sm font-medium focus:outline-none" selectedClassName="text-blue-600 border-b-2 border-blue-500">
              <FaChartPie className="inline mr-2" />
              {language === 'fr'
                ? 'Analytique'
                : language === 'en'
                  ? 'Analytics'
                  : 'تحليلات'}
            </Tab>
            <Tab className="px-4 py-3 text-sm font-medium focus:outline-none" selectedClassName="text-blue-600 border-b-2 border-blue-500">
              <FaTable className="inline mr-2" />
              {language === 'fr'
                ? 'Transactions'
                : language === 'en'
                  ? 'Transactions'
                  : 'المعاملات'}
            </Tab>
            <Tab className="px-4 py-3 text-sm font-medium focus:outline-none" selectedClassName="text-blue-600 border-b-2 border-blue-500">
              <FaKey className="inline mr-2" />
              {language === 'fr'
                ? 'Mes Licences'
                : language === 'en'
                  ? 'My Licenses'
                  : 'تراخيصي'}
            </Tab>


          </TabList>

          {/* Overview Tab */}
          <TabPanel className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {language === 'fr'
                      ? 'Revenus mensuels'
                      : language === 'en'
                        ? 'Monthly Revenue'
                        : 'الإيرادات الشهرية'}
                  </h3>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="block pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="all">
                      {language === 'fr' ? 'Toutes périodes' : language === 'en' ? 'All periods' : 'كل الفترات'}
                    </option>
                    <option value="7days">
                      {language === 'fr' ? '7 derniers jours' : language === 'en' ? 'Last 7 days' : 'آخر 7 أيام'}
                    </option>
                    <option value="30days">
                      {language === 'fr' ? '30 derniers jours' : language === 'en' ? 'Last 30 days' : 'آخر 30 يومًا'}
                    </option>
                    <option value="90days">
                      {language === 'fr' ? '90 derniers jours' : language === 'en' ? 'Last 90 days' : 'آخر 90 يومًا'}
                    </option>

                  </select>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={getTimeChartData()}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [
                          `${value} $`,
                          language === 'fr'
                            ? 'Montant'
                            : language === 'en'
                              ? 'Amount'
                              : 'المبلغ'
                        ]}
                        labelFormatter={(label) =>
                          language === 'fr'
                            ? `Période : ${label}`
                            : language === 'en'
                              ? `Period: ${label}`
                              : `الفترة: ${label}`
                        }
                      />
                      <Area type="monotone" dataKey="value" stroke="#4f46e5" fill="#c7d2fe" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {language === 'fr'
                    ? 'Top Produits'
                    : language === 'en'
                      ? 'Top Products'
                      : 'أفضل المنتجات'}
                </h3>
                <div className="space-y-4">
                  {getTopProducts().map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium mr-3">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                          {product.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">
                        {product.value.toFixed(2)} $
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {language === 'fr'
                    ? 'Répartition par rôle'
                    : language === 'en'
                      ? 'Breakdown by Role'
                      : 'التوزيع حسب الدور'}
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getRoleChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {getRoleChartData().map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `${value} $`,
                          language === 'fr'
                            ? 'Montant'
                            : language === 'en'
                              ? 'Amount'
                              : 'المبلغ'
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {language === 'fr'
                    ? 'Répartition par type'
                    : language === 'en'
                      ? 'Breakdown by Type'
                      : 'التوزيع حسب النوع'}
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getTypeChartData()}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip
                        formatter={(value: number) => [
                          `${value} $`,
                          language === 'fr'
                            ? 'Montant'
                            : language === 'en'
                              ? 'Amount'
                              : 'المبلغ'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="value" name="Revenus" fill="#8884d8" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {language === 'fr'
                    ? 'Analyse détaillée'
                    : language === 'en'
                      ? 'Detailed Analysis'
                      : 'تحليل مفصل'}
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">
                      {language === 'fr'
                        ? 'Performance par rôle'
                        : language === 'en'
                          ? 'Performance by Role'
                          : 'الأداء حسب الدور'}
                    </h4>
                    <div className="space-y-4">
                      {Object.entries(stats.roleStats).map(([role, data]) => (
                        <div key={role} className="border-b pb-3 last:border-b-0">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center">
                              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium mr-3">
                                {role === 'owner' ? <FaUserTie /> : <FaUserEdit />}
                              </span>
                              <span className="font-medium capitalize">{role}</span>
                            </div>
                            <span className="text-blue-600 font-medium">{data.montant.toFixed(2)} $</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${(data.montant / stats.totalGagne) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>
                              {data.count}{" "}
                              {language === 'fr'
                                ? 'ventes'
                                : language === 'en'
                                  ? 'sales'
                                  : 'مبيعات'}
                            </span>
                            <span>
                              {((data.montant / stats.totalGagne) * 100).toFixed(1)}%{' '}
                              {language === 'fr'
                                ? 'du total'
                                : language === 'en'
                                  ? 'of total'
                                  : 'من الإجمالي'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">
                      {language === 'fr'
                        ? 'Performance par type de produit'
                        : language === 'en'
                          ? 'Performance by Product Type'
                          : 'الأداء حسب نوع المنتج'}
                    </h4>
                    <div className="space-y-4">
                      {Object.entries(stats.typeStats).map(([type, data]) => (
                        <div key={type} className="border-b pb-3 last:border-b-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium capitalize">{type}</span>
                            <span className="text-green-600 font-medium">{data.montant.toFixed(2)} $</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-green-600 h-2.5 rounded-full"
                              style={{ width: `${(data.montant / stats.totalGagne) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>
                              {data.count}{' '}
                              {language === 'fr'
                                ? 'ventes'
                                : language === 'en'
                                  ? 'sales'
                                  : 'مبيعات'}
                            </span>
                            <span>
                              {((data.montant / stats.totalGagne) * 100).toFixed(1)}%{' '}
                              {language === 'fr'
                                ? 'du total'
                                : language === 'en'
                                  ? 'of total'
                                  : 'من الإجمالي'}
                            </span>

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {language === 'fr'
                    ? 'Activité récente'
                    : language === 'en'
                      ? 'Recent Activity'
                      : 'النشاط الأخير'}
                </h3>
                <div className="space-y-4">
                  {getRecentActivity().map((item, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{item.produit.titre}</h5>
                          <p className="text-sm text-gray-500">{item.produit.type}</p>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">
                          +{item.revenu.amount.toFixed(2)} $
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {item.role}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(item.date), 'PPp', { locale: fr })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Transactions Tab */}
          <TabPanel className="p-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={
                    language === 'fr'
                      ? 'Rechercher un produit...'
                      : language === 'en'
                        ? 'Search for a product...'
                        : 'ابحث عن منتج...'
                  }
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFilter className="text-gray-400 text-sm" />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="block pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="all">
                      {language === 'fr'
                        ? 'Tous les rôles'
                        : language === 'en'
                          ? 'All roles'
                          : 'جميع الأدوار'}
                    </option>
                    {Object.keys(stats.roleStats).map(role => (
                      <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="all">
                      {language === 'fr'
                        ? 'Tous les types'
                        : language === 'en'
                          ? 'All types'
                          : 'جميع الأنواع'}
                    </option>
                    {Object.keys(stats.typeStats).map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="all">
                      {language === 'fr' ? 'Tous statuts' : language === 'en' ? 'All statuses' : 'جميع الحالات'}
                    </option>
                    <option value="paid">
                      {language === 'fr' ? 'Payé' : language === 'en' ? 'Paid' : 'مدفوع'}
                    </option>
                    <option value="pending">
                      {language === 'fr' ? 'En attente' : language === 'en' ? 'Pending' : 'قيد الانتظار'}
                    </option>

                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'fr' ? 'Date' : language === 'en' ? 'Date' : 'التاريخ'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'fr' ? 'Produit' : language === 'en' ? 'Product' : 'المنتج'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'fr' ? 'Type' : language === 'en' ? 'Type' : 'النوع'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'fr' ? 'Rôle' : language === 'en' ? 'Role' : 'الدور'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'fr' ? 'Montant' : language === 'en' ? 'Amount' : 'المبلغ'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'fr' ? 'Statut' : language === 'en' ? 'Status' : 'الحالة'}
                      </th>
                    </tr>

                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRevenus.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          {language === 'fr'
                            ? 'Aucune transaction trouvée avec les filtres actuels'
                            : language === 'en'
                              ? 'No transactions found with the current filters'
                              : 'لم يتم العثور على أي معاملات باستخدام عوامل التصفية الحالية'}
                        </td>
                      </tr>
                    ) : (
                      filteredRevenus.map((revenu, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(revenu.date), 'PP', { locale: fr })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{revenu.produit.titre}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {revenu.produit.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                              {revenu.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="text-blue-600">{revenu.revenu.amount.toFixed(2)} $</div>
                            <div className="text-gray-500 text-xs">{revenu.revenu.percent}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {revenu.revenu.payed ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {language === 'fr'
                                  ? 'Payé'
                                  : language === 'en'
                                    ? 'Paid'
                                    : 'مدفوع'}

                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                {language === 'fr'
                                  ? 'En attente'
                                  : language === 'en'
                                    ? 'Pending'
                                    : 'قيد الانتظار'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabPanel>

          {/* Licences Tab */}
          <TabPanel className="p-6">
            <div className="bg-white rounded-lg shadow">
              <div className="overflow-y-auto max-h-[60vh] pr-1 custom-scrollbar">
                <ul className="space-y-4">
                  {[...ebooks.map(e => ({ ...e, type: 'ebook' })), ...formations.map(f => ({ ...f, type: 'formation' }))].map(item => {
                    let displayTitle = item.titre;
                    if (item.type === 'formation') {
                      if (item.titreFormation) {
                        displayTitle = item.titreFormation;
                      } else if (item.matiere && item.niveau) {
                        displayTitle = `${item.matiere} - ${item.niveau}`;
                      }
                    }

                    return (
                      <li
                        key={item._id}
                        className="cursor-pointer bg-gray-50 hover:bg-gray-100 p-4 rounded-md shadow-sm transition-all duration-200"
                        onClick={() => {
                          setSelectedItem(item);
                          setLocalOptions({ ...item.investmentOptions });
                          const sponsorExists = item.revenueParticipants?.investors?.some((inv: { sponsor: boolean }) => inv.sponsor === true);

                          setHasSponsor(!!sponsorExists);
                          setShowModal(true);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded overflow-hidden border border-blue-200 bg-white flex-shrink-0 flex items-center justify-center">
                              <img
                                src={
                                  item.type === 'ebook'
                                    ? `${AppURL}${item.folderPath}cover.png`
                                    : item.coverImage
                                      ? `${AppURL}${item.coverImage}`
                                      : ''
                                }
                                alt={displayTitle}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.onerror = null;
                                  target.style.display = 'none'; // cache l'image
                                  const emojiWrapper = document.createElement('div');
                                  emojiWrapper.textContent = item.type === 'ebook' ? '📘' : '🎓';
                                  emojiWrapper.style.fontSize = '1.5rem';
                                  emojiWrapper.style.display = 'flex';
                                  emojiWrapper.style.justifyContent = 'center';
                                  emojiWrapper.style.alignItems = 'center';
                                  emojiWrapper.style.width = '100%';
                                  emojiWrapper.style.height = '100%';
                                  target.parentNode?.appendChild(emojiWrapper);
                                }}
                              />
                            </div>


                            <div>
                              <p className="text-base font-medium text-gray-800">{displayTitle}</p>
                              <p className="text-sm text-gray-500 capitalize">
                                {language === 'fr'
                                  ? item.type === 'ebook' ? 'Ebook' : 'Formation'
                                  : language === 'en'
                                    ? item.type === 'ebook' ? 'Ebook' : 'Training'
                                    : item.type === 'ebook' ? 'كتاب رقمي' : 'دورة'}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-blue-600 hover:underline">
                            {language === 'fr'
                              ? 'Voir détails'
                              : language === 'en'
                                ? 'View details'
                                : 'عرض التفاصيل'}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </TabPanel>
        </Tabs>


        {/* Modal for editing investment options */}
        {showModal && selectedItem && localOptions && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-xl shadow-2xl border border-blue-700  w-full p-6 space-y-6 text-white">
              <h4 className="text-2xl font-bold text-center text-orange-400">
                {selectedItem.titre}
              </h4>

              <div className="space-y-4">
                {/* Switches (sans licenceMontant) */}
                {Object.entries(localOptions)
                  .filter(([key]) => key !== 'licenceMontant')
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center border-b border-blue-800 pb-2">
                      <span className="capitalize font-medium">
                        {key}
                      </span>
                      <Switch
                        checked={Boolean(value)}
                        onChange={(checked: boolean) => {
                          setLocalOptions((prev: any) => {
                            const updated = {
                              ...prev,
                              [key]: checked,
                            };
                            if (key === 'licence' && !checked) {
                              updated.licenceMontant = 0;
                              setLicenceMontant(0);
                            }
                            return updated;
                          });
                        }}
                        onColor="#f97316" // orange-500
                        disabled={key === 'sponsoring' && hasSponsor}
                      />
                    </div>
                  ))}

                {/* Champ licenceMontant visible si licence est activée */}
                {localOptions.licence && (
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-orange-400 mb-1">
                      {language === 'fr'
                        ? 'Montant de la licence'
                        : language === 'en'
                          ? 'Licence Amount'
                          : 'مبلغ الترخيص'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={licenceMontant}
                      onChange={(e) => {
                        const montant = Number(e.target.value);
                        setLicenceMontant(montant);
                        setLocalOptions((prev: any) => ({
                          ...prev,
                          licenceMontant: montant
                        }));
                      }}
                      className="w-full border border-blue-800 bg-blue-950 text-white rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-300"
                      placeholder="Ex: 100"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-md"
                >
                  {language === 'fr' ? 'Annuler' : language === 'en' ? 'Cancel' : 'إلغاء'}
                </button>

                <button
                  disabled={
                    JSON.stringify(localOptions) === JSON.stringify(selectedItem.investmentOptions) ||
                    (localOptions.licence && licenceMontant <= 0)
                  }
                  onClick={handleSave}
                  className={`px-4 py-2 rounded-md font-medium transition ${JSON.stringify(localOptions) === JSON.stringify(selectedItem.investmentOptions) ||
                    (localOptions.licence && licenceMontant <= 0)
                    ? 'bg-gray-500 cursor-not-allowed text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                >
                  {language === 'fr' ? 'Enregistrer' : language === 'en' ? 'Save' : 'حفظ'}
                </button>
              </div>
            </div>
          </div>
        )}





      </div>
    </div>
  );
}

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  bgColor?: string;
}

const StatsCard = ({ icon, label, value, change, bgColor = 'bg-white' }: StatsCardProps) => {
  return (
    <div className={`${bgColor} overflow-hidden shadow rounded-lg`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 rounded-md p-3 bg-white">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
            </dd>
            {change && (
              <p className="mt-1 text-sm text-gray-500 truncate">{change}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};