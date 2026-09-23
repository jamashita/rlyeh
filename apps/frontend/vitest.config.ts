import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'frontend',
    include: ['src/**/__tests__/**/*.spec.ts'],
    globals: true,
    watch: false
  }
});
