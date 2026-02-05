import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Vital para que Railway detecte el servicio
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    strictPort: true,
  },
  preview: {
    // Vital para cuando Railway corre la versión de producción
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    strictPort: true,
  }
})