/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['**/tests-e2e/**', '**/node_modules/**', '**/src/acceptance/**', '**/tmp/**'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/acceptance/**', 'src/**/*.spec.ts', 'src/main.ts'],
    },
  },
});
