import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Vite 6 no permite múltiples entry points cuando el output incluye 'iife'.
// Se usan dos builds separados controlados por la variable de entorno BUILD_MODE:
//   BUILD_MODE=es   → genera simulador.es.js (ESM, para importar como módulo)
//   BUILD_MODE=iife → genera simulador.iife.js (auto-ejecutable, window.SimuladorCredito)
// El script build:widget en package.json ejecuta ambos secuencialmente.

const buildMode = process.env['BUILD_MODE'] ?? 'es';
const isIIFE = buildMode === 'iife';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: !isIIFE, // Solo limpiar en el primer build (ESM)
    lib: isIIFE
      ? {
          entry: resolve(__dirname, 'src/embed.ts'),
          formats: ['iife'],
          name: 'SimuladorCredito',
          fileName: () => 'simulador.iife.js',
        }
      : {
          entry: resolve(__dirname, 'src/index.ts'),
          formats: ['es'],
          name: 'SimuladorCredito',
          fileName: () => 'simulador.es.js',
        },
    rollupOptions: {
      external: isIIFE ? [] : ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
