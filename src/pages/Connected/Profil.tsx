import { useAuth } from "../../context/AuthContext";

export default function Profil() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">👤 Profil</h1>
        <p className="text-lg">Bienvenue, {user?.prenom || "Utilisateur"} !</p>
      </div>
    </div>
  );
}
