import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages 部署在 /<repo>/ 子路径下；本地 dev / preview 保持根路径
  base: process.env.GITHUB_PAGES === 'true' ? '/safebank-ui/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    restoreMocks: true,
  },
});