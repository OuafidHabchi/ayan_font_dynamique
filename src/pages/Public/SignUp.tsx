import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

type Language = 'fr' | 'en' | 'ar';

interface SignUpProps {
  language: Language;
}

const SignUp: React.FC<SignUpProps> = ({ language }) => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [langue, setLangue] = useState<'ar' | 'en' | 'fr'>('fr');

  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email !== confirmEmail) {
      setError(language === 'fr' ? "Les emails ne correspondent pas" : language === 'en' ? "Emails do not match" : "البريد الإلكتروني غير متطابق");
      return;
    }

    if (password !== confirmPassword) {
      setError(language === 'fr' ? "Les mots de passe ne correspondent pas" : language === 'en' ? "Passwords do not match" : "كلمات المرور غير متطابقة");
      return;
    }

    setError('');

    // 🔥 Envoyer les données au backend
    try {
      const response = await axios.post('http://localhost:3000/api/users/createaccount', {
        nom: lastName,
        prenom: firstName,
        email,
        password,
        role: 'visiteur', // role toujours visiteur
        langue,
      });

      console.log('✅ Utilisateur créé :', response.data);
      navigate('/signin');

    } catch (err: any) {
      console.error(err);
      setError(language === 'fr' ? "Erreur lors de l'inscription" : language === 'en' ? "Sign up error" : "خطأ أثناء التسجيل");
    }
  };

  const titles = {
    fr: 'Créer un compte',
    en: 'Sign Up',
    ar: 'إنشاء حساب',
  };

  const labels = {
    firstName: { fr: 'Prénom', en: 'First Name', ar: 'الاسم' },
    lastName: { fr: 'Nom', en: 'Last Name', ar: 'اللقب' },
    email: { fr: 'Adresse e-mail', en: 'Email address', ar: 'البريد الإلكتروني' },
    confirmEmail: { fr: 'Confirmer l\'e-mail', en: 'Confirm email', ar: 'تأكيد البريد الإلكتروني' },
    phone: { fr: 'Numéro de téléphone', en: 'Phone number', ar: 'رقم الهاتف' },
    password: { fr: 'Mot de passe', en: 'Password', ar: 'كلمة المرور' },
    confirmPassword: { fr: 'Confirmer le mot de passe', en: 'Confirm password', ar: 'تأكيد كلمة المرور' },
    language: { fr: 'Langue', en: 'Language', ar: 'اللغة' },
  };

  const btnText = { fr: 'Créer un compte', en: 'Sign Up', ar: 'إنشاء حساب' };
  const haveAccount = { fr: 'Déjà un compte ?', en: 'Already have an account?', ar: 'لديك حساب بالفعل؟' };
  const signIn = { fr: 'Connexion', en: 'Login', ar: 'تسجيل الدخول' };

  return (
    <div className="flex flex-col md:flex-row min-h-screen pt-16">
      
      {/* Left branding section */}
      <div className="hidden md:flex md:w-1/2 bg-blue-950 text-white items-center justify-center p-10 flex-col">
        <img src="/ayan3.png" alt="Logo" className="h-20 mb-4 rounded-full border-4 border-orange-400 shadow-lg" />
        <h1 className="text-3xl font-bold mb-2 text-orange-400">Ayan Bridge</h1>
        <p className="text-center max-w-sm opacity-80">
          {language === 'fr' && 'Rejoignez-nous et commencez votre parcours maintenant.'}
          {language === 'en' && 'Join us and start your journey now.'}
          {language === 'ar' && 'انضم إلينا وابدأ رحلتك الآن.'}
        </p>
      </div>

      {/* Right sign up form */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold text-blue-950 mb-6 text-center">{titles[language]}</h2>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels.firstName[language]}</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-950"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{labels.lastName[language]}</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-950"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{labels.email[language]}</label>
              <input
                type="email"
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-950"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{labels.confirmEmail[language]}</label>
              <input
                type="email"
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-950"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{labels.phone[language]}</label>
              <input
                type="tel"
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-950"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{labels.language[language]}</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-950"
                value={langue}
                onChange={(e) => setLangue(e.target.value as 'fr' | 'en' | 'ar')}
                required
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{labels.password[language]}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-950"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{labels.confirmPassword[language]}</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-950"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-600"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-blue-950 text-white py-3 rounded-full hover:bg-blue-700 transition font-semibold"
            >
              {btnText[language]}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              {haveAccount[language]}
              <button
                onClick={() => navigate('/signin')}
                className="text-blue-950 hover:underline ml-1 font-medium"
              >
                {signIn[language]}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
