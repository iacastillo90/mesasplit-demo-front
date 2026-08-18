// vite.config.js — configuración unificada de Vite + Vitest para MesaSplit
// Un solo archivo define build, dev-server y test para no duplicar settings.

import { defineConfig } from 'vite';
// Plugin oficial de React: habilita JSX con fast-refresh y el transform automático.
import react from '@vitejs/plugin-react';

// Corre en Node, donde process.env sí existe (el navegador no lo tiene).
const demoMode = process.env.VITE_DEMO_MODE || 'same-device';

export default defineConfig({
  // Carga el plugin de React para compilar JSX y dar hot-reload en desarrollo.
  plugins: [react()],
  // Substitución en build-time: si el usuario no define VITE_DEMO_MODE, cae a
  // "same-device" (Escenario A de docs/01) sin romper import.meta.env en runtime.
  define: {
    'import.meta.env.VITE_DEMO_MODE': JSON.stringify(demoMode),
  },
  // Sección de Vitest: reusa la config de Vite y agrega el runner de tests.
  test: {
    // jsdom simula un navegador para que Testing Library y React rendericen.
    environment: 'jsdom',
    // jsdom solo expone localStorage/Storage con un origin http(s) real: sin esta
    // opción el environment cae a about:blank y el persist del store raíz no puede
    // testear el contrato realtime-bus (spec "state survives reload").
    environmentOptions: {
      jsdom: { url: 'http://localhost:3000' },
    },
    // Ejecuta setup global (matchers de jest-dom) antes de cada suite.
    setupFiles: './src/test/setup.js',
    // Expone describe/it/expect globales, al estilo de Jest.
    globals: true,
    // Restaura mocks y limpieza automática entre tests para evitar fugas.
    restoreMocks: true,
    clearMocks: true,
    // Aumenta el timeout de los tests a 15s para evitar fallos por jsdom bajo carga masiva.
    testTimeout: 15000,
    // Limpia el DOM de Testing Library tras cada test (evita estados colgados).
    css: false,
  },
});
