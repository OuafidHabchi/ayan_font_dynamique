// fakeFormations.ts

export interface Contenu {
  sousTitre: string;
  video: string;
  explication: string;
}

export interface Formation {
  id: string;
  titre: string;
  type: "Scolaire" | "Professionnel";
  niveau: "Primaire" | "Secondaire" | "Lycée" | "Universitaire";
  sousNiveau?: string; // ✅ nouveau champ sous-niveau
  matiere?: string;
  categorie?: string;
  contenu: Contenu[];
  duree: string; // ex: "3h 45min"
  prix: number;
  image: string; // couverture
  auteur: string;
  pays: string; // ✅ champ pays
}

const niveaux = ["Primaire", "Secondaire", "Lycée", "Universitaire"] as const;
const types = ["Scolaire", "Professionnel"] as const;

const matieres = [
  "Math",
  "Anglais",
  "Français",
  "Physique",
  "Chimie",
  "SVT",
  "Histoire",
  "Géographie",
  "Philosophie",
  "Informatique"
];

const categories = [
  "Informatique",
  "Business",
  "Psychologie",
  "Motivation",
  "Finance",
  "Marketing",
  "Développement personnel",
  "Santé",
  "Voyage",
  "Cuisine",
  "Science",
  "Fiction",
  "Histoire",
  "Arts",
  "Biographie"
];

const paysList = [
  "France",
  "Maroc",
  "Canada",
  "Belgique",
  "Suisse",
  "Tunisie",
  "Algérie",
  "USA",
  "Emirats",
  "Qatar"
];

const sousNiveauxMap: Record<string, string[]> = {
  Primaire: ["1ère année", "2ème année", "3ème année"],
  Secondaire: ["1ère année", "2ème année", "3ème année", "4ème année"],
  Lycée: ["1ère année", "2ème année", "3ème année"],
  Universitaire: [
    "1ère année Licence",
    "2ème année Licence",
    "3ème année Licence",
    "1ère année Master",
    "2ème année Master"
  ]
};

function randomFromArray<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const fakeFormations: Formation[] = Array.from({ length: 50 }, (_, i) => {
  const id = `${i + 1}`;
  const type = randomFromArray(types);
  const niveau = randomFromArray(niveaux);

  const numContenus = Math.floor(Math.random() * 6) + 5; // 5 à 10 contenus

  const contenu: Contenu[] = Array.from({ length: numContenus }, (_, j) => ({
    sousTitre: `Module ${j + 1} - Introduction`,
    video: `https://picsum.photos/seed/formation${id}_video${j + 1}/640/360`,
    explication: `Explication détaillée du module ${j + 1}.`
  }));

  const dureeHeures = Math.floor(Math.random() * 5) + 1; // 1 à 5 heures
  const dureeMinutes = Math.floor(Math.random() * 60);
  const duree = `${dureeHeures}h ${dureeMinutes}min`;

  return {
    id,
    titre: `Formation Exemple ${id}`,
    type,
    niveau,
    sousNiveau:
      type === "Scolaire"
        ? randomFromArray(sousNiveauxMap[niveau])
        : undefined, // ✅ sous-niveau généré seulement pour scolaire
    matiere: type === "Scolaire" ? randomFromArray(matieres) : undefined,
    categorie: type === "Professionnel" ? randomFromArray(categories) : undefined,
    contenu,
    duree,
    prix: 20 + (i % 10) + 0.99,
    image: `https://picsum.photos/seed/formation${id}/150/220`,
    auteur: `Formateur ${id}`,
    pays: randomFromArray(paysList), // ✅ pays généré aléatoirement
  };
});
