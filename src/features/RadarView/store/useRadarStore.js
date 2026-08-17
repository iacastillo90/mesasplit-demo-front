// src/features/RadarView/store/useRadarStore.js — store del radar local (task 2.8)
// Slice de estado del Local Admin (patrón FSD docs/03): mesas del salón para el
// mapa topológico + excepciones del turno para el feed. Zustand v5 (design D6).
// PR 4 (tasks 3.1/3.3): las mesas ya NO viven acá; el store raíz useDemoStore
// las siembra desde src/mocks/tables.json (persist + reseteo coordinado) y
// loadTables las lee de ese store (design: "demo store → radar"). El seed de
// excepciones queda en el slice: no tiene fixture dedicado en los mocks.

// create: fábrica de store de Zustand v5 (hooks de React directos).
import { create } from 'zustand';
// Store raíz de la demo: fuente de las mesas seed (persist + mocks de tables).
import { useDemoStore } from '../../../store/useDemoStore.js';

// Excepciones demo del turno para el feed.
// Cada una: id, nivel (warning/urgent/danger), mensaje y mesa asociada.
// danger queda reservado a salud/seguridad (alergias) — spec design-tokens.
const SEED_EXCEPTIONS = [
  // Alerta de salud: alergia declarada en mesa 3 → SOLO rojo danger.
  { id: 'e1', level: 'danger', message: 'Alergia a maní declarada', table: 3 },
  // Urgencia operativa: mesa 2 esperando cobro → naranja urgent (nunca rojo).
  { id: 'e2', level: 'urgent', message: 'Esperando cobro hace 15 min', table: 2 },
  // Alerta media: stock bajo en barra → ámbar warning.
  { id: 'e3', level: 'warning', message: 'Stock bajo de papas fritas', table: null },
];

// Estado inicial del slice (las mesas llegan del store raíz en loadTables).
const initialState = {
  // Mesas del salón para el mapa topológico (vacías hasta loadTables).
  tables: [],
  // Excepciones del turno para el feed lateral.
  exceptions: SEED_EXCEPTIONS,
  // Flag de carga: simula la preparación de datos al montar la vista.
  loading: true,
};

// Store del radar: estado + acciones que mutan ese estado.
export const useRadarStore = create((set) => ({
  // Estado inicial del slice.
  ...initialState,

  // Carga las mesas del salón desde el STORE RAÍZ (seed de tables.json).
  loadTables: () => {
    // Lee las mesas seed del store raíz (useDemoStore las sembró de los mocks).
    const { tables } = useDemoStore.getState();
    // Setea las mesas del salón y apaga el flag de carga al instante.
    set({ tables, loading: false });
  },

  // Cambia el estado de una mesa (lo consumirá el bus realtime en PR 4).
  // Recibe el id de la mesa y el nuevo estado (enum TABLE_STATUS).
  setTableStatus: (id, status) =>
    set((state) => ({
      // Mapea las mesas actualizando el estado de la indicada.
      tables: state.tables.map((table) => (table.id === id ? { ...table, status } : table)),
    })),

  // Reinicia el slice a su estado inicial (resetDemo de PR 4 lo coordina).
  resetDemo: () => set(initialState),
}));
