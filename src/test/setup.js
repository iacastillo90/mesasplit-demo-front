// src/test/setup.js — setup global de Vitest para MesaSplit
// Se ejecuta antes de cada suite gracias a `setupFiles` en vite.config.js.

// Registra los matchers de jest-dom (toBeInTheDocument, toHaveClass, etc.)
// en el `expect` de Vitest, requeridos por los tests de Testing Library.
import '@testing-library/jest-dom/vitest';

// Limpia el DOM entre tests: desmonta componentes y remueve side effects.
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// afterEach global desmonta cualquier componente montado por RTL,
// evitando que un test contamine el siguiente (patrón estándar RTL).
afterEach(() => {
  cleanup();
});
