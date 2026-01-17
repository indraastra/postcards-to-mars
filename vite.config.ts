/// <reference types="vitest" />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
    plugins: [angular({
        tsconfig: './tsconfig.spec.json'
    })],
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['src/test-setup.ts'],
        include: ['src/**/*.spec.ts'],
    },
});
