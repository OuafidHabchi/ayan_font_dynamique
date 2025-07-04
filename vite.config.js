import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Configuration de Vite pour un projet avec des ressources statiques
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // Permet l'accès via IP locale
    port: 5173, // facultatif, assure que le port est fixé si tu le souhaites
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: './index.html',
    },
    minify: 'esbuild',
    sourcemap: true,
  }
})
