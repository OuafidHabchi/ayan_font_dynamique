import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Configuration de Vite pour un projet avec des ressources statiques
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    // Définit le répertoire de sortie pour le build
    outDir: 'dist', // Ce répertoire contiendra tous vos fichiers statiques générés
    assetsDir: 'assets', // Spécifie où les ressources comme les images et les fichiers CSS/JS seront placées
    rollupOptions: {
      input: './index.html', // Vous pouvez spécifier un fichier d'entrée si nécessaire
    },
    // Options supplémentaires pour améliorer l'expérience de build
    minify: 'esbuild', // Optimisation pour minimiser les fichiers
    sourcemap: true, // Générer des sourcemaps si nécessaire (utile pour le débogage)
  }
})
