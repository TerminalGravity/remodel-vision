import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, '.', '');
    return {
        server: {
            port: 3001,
            host: '0.0.0.0',
        },
        plugins: [react()],
        define: {
            'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
            'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@remodelvision/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
            },
        },
        build: {
            outDir: 'dist',
            sourcemap: true,
        },
    };
});
