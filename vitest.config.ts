import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@lucide/astro': path.resolve(__dirname, 'src/__mocks__/@lucide/astro.ts'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
