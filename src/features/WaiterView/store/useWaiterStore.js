// src/features/WaiterView/store/useWaiterStore.js — store del garzón (task 2.6)
// Slice de estado del garzón (patrón FSD docs/03): mesas asignadas a cargo +
// la mesa seleccionada para el pad de comanda. Zustand v5 (design D6), sin
// persist: la asignación es transitoria de sesión (PR 4 la siembra del store
// raíz con persist cuando existan mocks).
// NOTA: las selecciones de UI viven acá porque el pad depende de la selección.

// create: fábrica de store de Zustand v5 (hooks de React directos).
import { create } from 'zustand';
// Servicio de la capa de datos del garzón (mesas asignadas).
import { fetchAssignedTables } from '../services/waiterService.js';

// Estado inicial del slice (se reinicia con resetDemo en PR 4).
const initialState = {
  // Mesas asignadas al garzón, cargadas desde el servicio.
  tables: [],
  // Id de la mesa seleccionada para ver su comanda (null = ninguna).
  selectedTableId: null,
  // Flag de carga de la primera llamada al servicio.
  loading: true,
};

// Store del garzón: estado + acciones que mutan ese estado.
export const useWaiterStore = create((set) => ({
  // Estado inicial del slice (copiado para no mutar el objeto fuente).
  ...initialState,

  // Carga las mesas asignadas desde el servicio (una sola vez al montar).
  loadTables: async () => {
    // Resuelve la promesa del servicio de mesas.
    const tables = await fetchAssignedTables();
    // Setea las mesas y apaga el flag de carga.
    set({ tables, loading: false });
  },

  // Selecciona una mesa para abrir su comanda en el OrderPad.
  // Recibe el id; null limpia la selección (cerrar el pad).
  selectTable: (selectedTableId) => set({ selectedTableId }),

  // Reinicia el slice a su estado inicial (resetDemo de PR 4 lo coordina).
  resetDemo: () => set(initialState),
}));
