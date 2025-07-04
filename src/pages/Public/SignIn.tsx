import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // adapte ton chemin


type Language = 'fr' | 'en' | 'ar';

interface SignInProps {
  language: Language;
}

const SignIn: React.FC<SignInProps> = ({ language }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  // const handleSignIn = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   try {
  //     const response = await axios.post("http://192.168.2.14:3000/api/users/login", {
  //       email,
  //       password,
  //     });

  //     console.log("✅ Connexion réussie :", response.data);

  //     const { token, user } = response.data;

  //     // ➡️ Sauvegarder user + token via context
  //     login(user, token);

  //     // ⚠️ Sauvegarder le password en clair est dangereux. Si nécessaire :
  //     localStorage.setItem('password', password);

  //     // ➡️ Rediriger vers dashboard
  //     window.location.href = '/dashboard';

  //   } catch (err: any) {
  //     console.error(err);
  //     alert(language === 'fr' ? "Email ou mot de passe incorrect" : language === 'en' ? "Incorrect email or password" : "البريد الإلكتروني أو كلمة المرور غير صحيحة");
  //   }
  // };

  const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();

  // ✅ Test local sans requête backend
  if (email === "123@gmail.com" && password === "123") {
    console.log("✅ Connexion test réussie");

    // ➡️ Créer un fake user et token pour le contexte
    const user = {
      id: "test123",
      name: "Test User",
      email: "123@gmail.com",
      nom: "User",
      prenom: "Test",
      role: "user",
      langue: "language"
    };
    const token = "fake-token-123";

    // ➡️ Sauvegarder user + token via context
    login(user, token);

    // ⚠️ Sauvegarder le password en clair est dangereux. Si nécessaire :
    localStorage.setItem('password', password);

    // ➡️ Rediriger vers dashboard
    window.location.href = '/dashboard';

  } else {
    alert(language === 'fr'
      ? "Email ou mot de passe incorrect"
      : language === 'en'
      ? "Incorrect email or password"
      : "البريد الإلكتروني أو كلمة المرور غير صحيحة"
    );
  }
};


  const titles = {
    fr: 'Bienvenue',
    en: 'Welcome Back',
    ar: 'مرحبًا بعودتك',
  };

  const subtitles = {
    fr: 'Connectez-vous à votre compte',
    en: 'Sign in to your account',
    ar: 'قم بتسجيل الدخول إلى حسابك',
  };

  const emailLabel = {
    fr: 'Adresse e-mail',
    en: 'Email address',
    ar: 'البريد الإلكتروني',
  };

  const passwordLabel = {
    fr: 'Mot de passe',
    en: 'Password',
    ar: 'كلمة المرور',
  };

  const btnText = {
    fr: 'Se connecter',
    en: 'Login',
    ar: 'تسجيل الدخول',
  };

  const noAccount = {
    fr: "Vous n'avez pas de compte ?",
    en: "Don't have an account?",
    ar: "ليس لديك حساب؟",
  };

  const signUp = {
    fr: "Créer un compte",
    en: "Sign Up",
    ar: "إنشاء حساب",
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">

      {/* Left branding section */}
      <div className="hidden md:flex md:w-1/2 bg-blue-950 text-white items-center justify-center p-10 flex-col">
        <img src="/ayan3.png" alt="Logo" className="h-20 mb-4 rounded-full border-4 border-orange-400 shadow-lg" />
        <h1 className="text-3xl font-bold mb-2 text-orange-400">Ayan Bridge</h1>
        <p className="text-center max-w-sm opacity-80">
          {language === 'fr' && 'La plateforme complète pour apprendre, créer et investir.'}
          {language === 'en' && 'The complete platform to learn, create and invest.'}
          {language === 'ar' && 'المنصة الكاملة للتعلم والإنشاء والاستثمار.'}
        </p>
      </div>

      {/* Right login form */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold text-blue-950 mb-2 text-center">{titles[language]}</h2>
          <p className="text-gray-600 text-center mb-6">{subtitles[language]}</p>

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {emailLabel[language]}
              </label>
              <input
                id="email"
                type="email"
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-950"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {passwordLabel[language]}
              </label>
              <div className="relative">
                <input
                  id="password"
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

            <button
              type="submit"
              className="w-full bg-blue-950 text-white py-3 rounded-full hover:bg-blue-700 transition font-semibold"
            >
              {btnText[language]}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              {noAccount[language]}
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-950 hover:underline ml-1 font-medium"
              >
                {signUp[language]}
              </button>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SignIn;
