import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Permet d'appeler DragonBall depuis le navigateur sans CORS.
      // Toute requête vers /dragonball-api/* sera relayée vers https://dragonball-api.com/*.
      '/dragonball-api': {
        target: 'https://dragonball-api.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dragonball-api/, ''),
      },
    },
  },
})
