import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    reporters: 'default',
    globals: true,
    clearMocks: true,
  },
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, './lib'),
    },
  },
});
