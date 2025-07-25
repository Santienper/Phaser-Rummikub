import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    envDir: '../',
    server: {
        proxy: {
            '/.proxy/assets': {
                target: 'https://client-rummikub.santiagotp.workers.dev/public/assets',
                changeOrigin: true,
                secure: true,
                ws: true,
                rewrite: (path) => path.replace(/^\/.proxy\/assets/, ''),
            },
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
