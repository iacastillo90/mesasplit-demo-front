// eslint.config.js — ESLint 9 con config plana (flat) para MesaSplit
// Un solo array de configs: base recomendada + React + Hooks + globals.

import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  // Carpetas que ESLint jamás debe analizar (build, deps, cobertura).
  { ignores: ['dist/', 'node_modules/', 'coverage/'] },
  // Config recomendada de ESLint core (reglas de código general).
  js.configs.recommended,
  // Reglas recomendadas de React (validan JSX y accesibilidad básica).
  react.configs.flat.recommended,
  // Desactiva react-in-jsx-scope: Vite usa el transform automático de JSX,
  // así que importar React en cada archivo sería código muerto.
  react.configs.flat['jsx-runtime'],
  {
    // Aplica las reglas de React solo a archivos JS/JSX.
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // Habilita sintaxis JSX en el parser.
      parserOptions: { ecmaFeatures: { jsx: true } },
      // Variables globales del navegador (window, document) y de Node.
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      // Plugin de hooks registrado explícitamente en la config plana.
      'react-hooks': reactHooks,
    },
    settings: {
      // Versión de React para reglas que dependen de ella (18.3 pinned).
      react: { version: '18.3' },
    },
    rules: {
      // Los hooks solo se llaman en el nivel superior de componentes.
      'react-hooks/rules-of-hooks': 'error',
      // Advertir sobre deps faltantes en useEffect/useMemo.
      'react-hooks/exhaustive-deps': 'warn',
      // Permite props "any" en componentes demo sin tipado estricto.
      'react/prop-types': 'off',
    },
  },
];
