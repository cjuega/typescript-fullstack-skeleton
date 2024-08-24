import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    resolve: {
        alias: {
            '@src': resolve(__dirname, './src'),
            '@tests': resolve(__dirname, './tests')
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './tests/setup.ts'
    }
});
