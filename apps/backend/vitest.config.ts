import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    include: ['**/*.spec.ts', '**/*.spec.cts', '**/*.spec.mts', '**/*.spec.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    globals: true,
    watch: false,
    passWithNoTests: true,
    mockReset: false,
    environment: 'node'
  }
});
