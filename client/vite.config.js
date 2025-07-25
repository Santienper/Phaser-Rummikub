import { defineConfig } from 'vite';
import { cloudflare } from "@cloudflare/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [cloudflare()],
    envDir: '../',
    server: {
        proxy: {
            '/.proxy/assets': {
                target: 'http://localhost:5173/assets',
                changeOrigin: true,
                ws: true,
                rewrite: (path) => path.replace(/^\/.proxy\/assets/, ''),
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
