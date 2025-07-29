import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import AppURL from "../../components/AppUrl";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaPhone, FaLanguage, FaGift, FaSave } from "react-icons/fa";
import { FiCopy } from "react-icons/fi";

interface ProfileData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  langue: string;
  promoCode?: string;
}


type Language = 'fr' | 'en' | 'ar';

export default function Profil() {
  const { user, login } = useAuth();
  const language: Language = ['fr', 'en', 'ar'].includes(user?.langue as string) ? (user?.langue as Language) : 'fr'
  const [form, setForm] = useState({
    email: "",
    phone: "",
    langue: "fr",
    promoCode: "",
  });


  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${AppURL}/api/users/${user?.id}`);
        setProfileData(res.data.user);
        setForm({
          email: res.data.user.email || "",
          phone: res.data.user.phone || "",
          langue: res.data.user.langue || "fr",
          promoCode: res.data.user.promoCode || "",
        });
        setPromoCode(res.data.user.promoCode || null); // ✅ AJOUT ICI
      } catch (err) {
        console.error("❌ Erreur chargement données utilisateur :", err);
      }
    };


    if (user?.id) fetchUserData();
  }, [user?.id]);




  const handleGenerateCode = async () => {
    setLoading(true);
    try {
      const generateLocalCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      const newCode = generateLocalCode();
      setPromoCode(newCode);

      // 🔁 Envoyer vers le backend pour sauvegarder dans le user
      await axios.put(`${AppURL}/api/users/promo/save`, {
        userId: user?.id,
        promoCode: newCode,
      });

    } catch (err) {
      console.error("❌ Erreur:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleUpdate = async () => {
    if (!user?.id) return;

    setUpdating(true);
    try {
      const res = await axios.put(`${AppURL}/api/users/update/${user.id}`, form);

      const updatedUser = res.data.user; // ✅ Le backend renvoie les données mises à jour
      login(updatedUser, localStorage.getItem('token') || ''); // ✅ Mise à jour du contexte et localStorage

    } catch (err) {
      console.error("❌ Erreur mise à jour profil :", err);
    } finally {
      setUpdating(false);
    }
  };





  return (
    <div className="px-4 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 min-h-screen pt-24 pb-12">
      <div className="mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-orange-400 mb-4">
            {language === 'fr'
              ? 'Mon Profil'
              : language === 'en'
                ? 'My Profile'
                : 'ملفي الشخصي'}
          </h2>
          <p className="text-blue-200 max-w-2xl mx-auto">
            {language === 'fr'
              ? 'Gérez vos informations personnelles et votre code promo'
              : language === 'en'
                ? 'Manage your personal information and your promo code'
                : 'قم بإدارة معلوماتك الشخصية ورمز العرض الترويجي الخاص بك'}
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 rounded-xl shadow-xl overflow-hidden border border-blue-700"
        >
          {/* Profile Form Section */}
          <div className="p-6 md:p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaUser className="text-orange-400" />
              <span>
                {language === 'fr'
                  ? 'Informations Personnelles'
                  : language === 'en'
                    ? 'Personal Information'
                    : 'المعلومات الشخصية'}
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom - Readonly */}
              <div>
                <label className="block text-blue-200 mb-2 font-medium">
                  {language === 'fr'
                    ? 'Nom'
                    : language === 'en'
                      ? 'Name'
                      : 'الاسم'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData?.nom || ''}
                    disabled
                    className="w-full bg-blue-950 border border-blue-700 rounded-lg px-4 py-3 text-white cursor-not-allowed"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-blue-400">
                    {language === 'fr'
                      ? '(Lecture seule)'
                      : language === 'en'
                        ? '(Read only)'
                        : '(للقراءة فقط)'}
                  </div>
                </div>
              </div>

              {/* Prénom - Readonly */}
              <div>
                <label className="block text-blue-200 mb-2 font-medium">
                  {language === 'fr'
                    ? 'Prénom'
                    : language === 'en'
                      ? 'First Name'
                      : 'الاسم الأول'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData?.prenom || ''}
                    disabled
                    className="w-full bg-blue-950 border border-blue-700 rounded-lg px-4 py-3 text-white cursor-not-allowed"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-blue-400">
                    {language === 'fr'
                      ? '(Lecture seule)'
                      : language === 'en'
                        ? '(Read only)'
                        : '(للقراءة فقط)'}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className=" text-blue-200 mb-2 font-medium flex items-center gap-2">
                  <FaEnvelope />
                  <span>
                    {language === 'fr'
                      ? 'Email'
                      : language === 'en'
                        ? 'Email'
                        : 'البريد الإلكتروني'}
                  </span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-blue-950 border border-blue-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className=" text-blue-200 mb-2 font-medium flex items-center gap-2">
                  <FaPhone />
                  <span>
                    {language === 'fr'
                      ? 'Téléphone'
                      : language === 'en'
                        ? 'Phone'
                        : 'رقم الهاتف'}
                  </span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-blue-950 border border-blue-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {/* Langue */}
              <div>
                <label className=" text-blue-200 mb-2 font-medium flex items-center gap-2">
                  <FaLanguage />
                  <span>
                    {language === 'fr'
                      ? 'Langue'
                      : language === 'en'
                        ? 'Language'
                        : 'اللغة'}
                  </span>
                </label>
                <select
                  value={form.langue}
                  onChange={(e) => setForm({ ...form, langue: e.target.value })}
                  className="w-full bg-blue-950 border border-blue-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <motion.button
                onClick={handleUpdate}
                disabled={updating}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold ${updating
                  ? 'bg-blue-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                  }`}
              >
                <FaSave />
                {updating
                  ? language === 'fr'
                    ? 'Enregistrement...'
                    : language === 'en'
                      ? 'Saving...'
                      : 'جارٍ الحفظ...'
                  : language === 'fr'
                    ? 'Sauvegarder'
                    : language === 'en'
                      ? 'Save'
                      : 'حفظ'}
              </motion.button>
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="border-t border-blue-700 p-6 md:p-8 bg-blue-900/30">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaGift className="text-orange-400" />
              <span>
                {language === 'fr'
                  ? 'Code Promo'
                  : language === 'en'
                    ? 'Promo Code'
                    : 'رمز العرض'}
              </span>
            </h3>

            {promoCode ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-950/50 border border-blue-600 rounded-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-blue-300 text-sm mb-1">
                      {language === 'fr'
                        ? 'Votre code promo personnel'
                        : language === 'en'
                          ? 'Your personal promo code'
                          : 'رمز العرض الترويجي الشخصي الخاص بك'}
                    </p>
                    <p className="text-orange-400 font-mono text-xl font-bold">{promoCode}</p>
                  </div>

                  <motion.button
                    onClick={async () => {
                      try {
                        if (navigator.clipboard?.writeText) {
                          await navigator.clipboard.writeText(promoCode);
                        } else {
                          const textarea = document.createElement("textarea");
                          textarea.value = promoCode;
                          textarea.setAttribute("readonly", "");
                          textarea.style.position = "absolute";
                          textarea.style.left = "-9999px";
                          document.body.appendChild(textarea);
                          textarea.select();
                          document.execCommand("copy");
                          document.body.removeChild(textarea);
                        }

                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } catch (err) {
                        console.error("❌ Échec de copie :", err);
                      }
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 p-2 px-4 bg-blue-800 rounded-lg hover:bg-blue-700 transition"
                    title="Copier le code"
                  >
                    <FiCopy className={`text-xl ${copied ? 'text-green-400' : 'text-blue-300'}`} />
                    <span className={`text-sm font-medium ${copied ? 'text-green-400' : 'text-blue-200'}`}>
                      {copied
                        ? language === 'fr'
                          ? 'Copié'
                          : language === 'en'
                            ? 'Copied'
                            : 'تم النسخ'
                        : language === 'fr'
                          ? 'Copier'
                          : language === 'en'
                            ? 'Copy'
                            : 'نسخ'}
                    </span>
                  </motion.button>
                </div>

                <p className="text-blue-300 text-xs mt-2">
                  {language === 'fr'
                    ? 'Partagez ce code avec vos amis pour obtenir des avantages !'
                    : language === 'en'
                      ? 'Share this code with your friends to get rewards!'
                      : 'شارك هذا الرمز مع أصدقائك للحصول على مزايا!'}
                </p>
              </motion.div>
            ) : (
              <motion.button
                onClick={handleGenerateCode}
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg font-bold ${loading
                  ? 'bg-blue-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                  }`}
              >
                <FaGift />
                {loading
                  ? language === 'fr'
                    ? 'Génération en cours...'
                    : language === 'en'
                      ? 'Generating...'
                      : 'جاري التوليد...'
                  : language === 'fr'
                    ? 'Générer mon code promo'
                    : language === 'en'
                      ? 'Generate my promo code'
                      : 'توليد رمز العرض الخاص بي'}
              </motion.button>
            )}

          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >

        </motion.div>
      </div>
    </div>
  );
}