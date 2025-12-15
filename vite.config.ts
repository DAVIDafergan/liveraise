import path from 'path';
import { fileURLToPath } from 'url';
import {zh} from 'vite';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), 
        // שים לב: בדרך כלל התיקייה היא src. אם הקבצים שלך יושבים בראשי, שנה את זה ל: path.resolve(__dirname, '.')
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true
    }
  };
});