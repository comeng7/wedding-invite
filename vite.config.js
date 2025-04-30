import path from 'path'; // Node.js 'path' 모듈 import

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // '@' 별칭을 src 폴더로 설정
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
});
