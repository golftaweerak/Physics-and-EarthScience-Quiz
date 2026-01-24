import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js'],
    exclude: ['tests/e2e/**'], // Exclude Playwright tests
    alias: {
      '@': path.resolve(__dirname, './'),
      'scripts': path.resolve(__dirname, './scripts'),
      'data': path.resolve(__dirname, './data')
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'scripts': path.resolve(__dirname, './scripts'),
      'data': path.resolve(__dirname, './data')
    },
  },
});
