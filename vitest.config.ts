import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Le vrai `extpay` s'auto-exécute à l'import et exige les API WebExtension,
      // absentes sous jsdom — les tests reçoivent un stub inerte à la place.
      extpay: path.resolve(__dirname, './src/test/extpay-stub.ts'),
    },
  },
});
