const Login = () => {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Connexion</h1>
          <form>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-600 mb-1">
                Email :
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Votre email"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-600 mb-1">
                Mot de passe :
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Votre mot de passe"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  };
  
  export default Login;
  