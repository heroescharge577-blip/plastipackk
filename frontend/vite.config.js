import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Esto permite que Codespaces exponga el puerto correctamente
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 443 // Ayuda a que el "Hot Reload" funcione sobre HTTPS en GitHub
    }
  }
});