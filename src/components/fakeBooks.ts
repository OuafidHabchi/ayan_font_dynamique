// fakeBooks.ts

export interface Book {
  id: string;
  titre: string;
  categorie: string;
  nombreDePages: number;
  image: string; // couverture
  prix: number;
  auteur: string;
  images: string[]; // ✅ ajout des images du photobook
  
}

const categories = ["Informatique", "Business", "Psychologie", "Motivation", "Finance", "Marketing", "Développement personnel", "Santé", "Voyage", "Cuisine", "Science", "Fiction", "Histoire", "Arts", "Biographie"];

export const fakeBooks: Book[] = [
  {
    id: "1",
    titre: "Les Secrets du Succès",
    categorie: "Développement personnel",
    nombreDePages: 10,
    image: "https://picsum.photos/seed/book1/150/220",
    prix: 14.99,
    auteur: "Jean Dupont",
    images: Array.from({ length: 10 }, (_, j) => `https://picsum.photos/seed/book1_page${j + 1}/600/800`),
  },
  {
    id: "2",
    titre: "La Magie de Penser Grand",
    categorie: "Motivation",
    nombreDePages: 8,
    image: "https://picsum.photos/seed/book2/150/220",
    prix: 19.99,
    auteur: "David Schwartz",
    images: Array.from({ length: 8 }, (_, j) => `https://picsum.photos/seed/book2_page${j + 1}/600/800`),
  },
  ...Array.from({ length: 80 }, (_, i) => {
    const id = `${1 + i}`;
    const numImages = Math.floor(Math.random() * 11) + 5; // ✅ entre 5 et 15 images

    return {
      id,
      titre: `Livre Exemple ${id}`,
      categorie: categories[i % categories.length],
      nombreDePages: numImages, // ✅ nombre de pages = nombre d'images
      image: `https://picsum.photos/seed/book${id}/150/220`,
      prix: 10 + (i % 20) + 0.99,
      auteur: `Auteur ${id}`,
      images: Array.from({ length: numImages }, (_, j) =>
        `https://picsum.photos/seed/book${id}_page${j + 1}/600/800`
      ),
    };
  }),
];
