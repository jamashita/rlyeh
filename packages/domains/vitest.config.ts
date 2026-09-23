import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'domains',
    include: ['src/**/__tests__/**/*.spec.ts'],
    globals: true,
    watch: false
  }
});
