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

// --- Shim de test: data router de React Router v6 en jsdom (PR 4) -------------
// PROBLEMA: en cada navegación el data router crea `new Request(url, { signal })`
// donde `signal` viene del AbortController GLOBAL. En el entorno jsdom de Vitest
// ese AbortController es el de jsdom, mientras que `Request` es el de undici
// (global de Node). undici valida `signal instanceof SuAbortSignal` y rechaza el
// cross-realm con "Expected signal to be an instance of AbortSignal", rompiendo
// toda navegación de los tests de routing.
// SOLUCIÓN (solo test): un Request compatible que DELEGA en el nativo y descarta
// el signal jsdom. La demo no usa loaders/actions ni abortos, así que el signal
// nunca se consume en la suite; los tests cubren render + navegación client-side.
const NativeRequest = globalThis.Request;

// Clase wrapper: misma interfaz que Request, sin validación cross-realm del signal.
class CompatRequest extends NativeRequest {
  // Constructor: recibe los mismos argumentos que el Request nativo.
  constructor(input, init = {}) {
    // Copia las opciones del init sin mutar el objeto recibido.
    const cleanInit = { ...init };
    // Elimina el signal jsdom (incompatible con undici) de las opciones.
    delete cleanInit.signal;
    // Delega en el Request nativo SIN el signal problemático.
    super(input, cleanInit);
  }
}

// Reemplaza el Request global SOLO dentro del entorno de tests.
globalThis.Request = CompatRequest;

// --- Shim de test: localStorage en jsdom 25 (PR 4) ----------------------------
// PROBLEMA: con jsdom 25.0.1 dentro de Vitest, el getter `window.localStorage`
// existe pero devuelve undefined (sessionStorage sí funciona). El persist del
// store raíz (zustand, spec realtime-bus) depende de localStorage para probar
// "state survives reload", así que el entorno necesita un storage real.
// SOLUCIÓN (solo test): si el window no expone localStorage, se instala un
// Storage en memoria con la misma API (getItem/setItem/removeItem/clear/key/length).

// Builds una implementación mínima de Storage sobre un Map (API estándar).
function createMemoryStorage() {
  // Mapa interno: clave → valor serializado (strings, como el storage real).
  let store = new Map();
  // Devuelve el objeto Storage en memoria.
  return {
    // Cantidad de entradas almacenadas (propiedad length del storage real).
    get length() {
      return store.size;
    },
    // Devuelve el valor de la clave o null si no existe (contrato Storage).
    getItem(key) {
      return store.has(String(key)) ? store.get(String(key)) : null;
    },
    // Guarda el valor bajo la clave (ambos coerced a string, como el browser).
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    // Elimina la clave del storage.
    removeItem(key) {
      store.delete(String(key));
    },
    // Vacía por completo el storage (aislamiento entre tests).
    clear() {
      store.clear();
    },
    // Devuelve el nombre de la clave en el índice dado (contrato Storage).
    key(index) {
      return [...store.keys()][index] ?? null;
    },
  };
}

// Instala el polyfill SOLO si el window no expone un localStorage usable.
if (
  typeof globalThis.window !== 'undefined' &&
  typeof globalThis.window.localStorage === 'undefined'
) {
  // Crea el storage en memoria para esta sesión de tests.
  const memoryStorage = createMemoryStorage();
  // Expone localStorage en window (lo que el store raíz lee vía createJSONStorage).
  Object.defineProperty(globalThis.window, 'localStorage', {
    // El valor es el storage en memoria (no reescribible por otros shims).
    value: memoryStorage,
    // No enumerable: no contamina la inspección del window.
    enumerable: false,
    // Configurable: permite que otro shim lo redefina si hiciera falta.
    configurable: true,
  });
}
