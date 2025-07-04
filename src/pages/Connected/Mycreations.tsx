import { useAuth } from "../../context/AuthContext";

export default function Mycreations() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🎨 My Creations</h1>
        <p className="text-lg">Bienvenue, {user?.prenom || "Utilisateur"} !</p>
      </div>
    </div>
  );
}
