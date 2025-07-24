import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  envDir: '../',
  server: {
    proxy: {
      '/api': {
        target: 'https://server-rummikub.santiagotp.workers.dev/',
        changeOrigin: true,
        secure: true,
        ws: true,
      },
    },
    hmr: {
      clientPort: 443,
    },
    allowedHosts: [
      "https://client-rummikub.santiagotp.workers.dev/"
    ]
  },
});
