import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tailwindcss()],
  test: {
    include: ['**/*.spec.ts', '**/*.spec.cts', '**/*.spec.mts', '**/*.spec.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    globals: true,
    watch: false,
    mockReset: false,
    environment: 'jsdom'
  }
});
