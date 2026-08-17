// src/features/RadarView/store/useRadarStore.js — store del radar local (task 2.8)
// Slice de estado del Local Admin (patrón FSD docs/03): mesas del salón para el
// mapa topológico + excepciones del turno para el feed. Zustand v5 (design D6).
// NOTA PR3 → PR4: los fixtures viven acá (seed inline) porque src/mocks llega en
// el task 3.1 (PR 4), donde el store raíz useDemoStore los siembra con persist.

// create: fábrica de store de Zustand v5 (hooks de React directos).
import { create } from 'zustand';

// Mesas demo del salón para el mapa topológico.
// Cada mesa: id, número, capacidad, estado (TABLE_STATUS) y posición x,y
// NORMALIZADA 0–100 (topológica: relación espacial, no coordenadas reales).
const SEED_TABLES = [
  // Mesa 1: ocupada, al noroeste del plano.
  { id: 't1', number: 1, seats: 4, status: 'occupied', x: 12, y: 18 },
  // Mesa 2: cobrando, al noreste (semántica de cuenta en curso).
  { id: 't2', number: 2, seats: 6, status: 'billing', x: 82, y: 15 },
  // Mesa 3: libre, junto a la barra.
  { id: 't3', number: 3, seats: 2, status: 'free', x: 25, y: 55 },
  // Mesa 4: en limpieza, al sureste (semántica de advertencia media).
  { id: 't4', number: 4, seats: 4, status: 'cleaning', x: 78, y: 60 },
  // Mesa 5: ocupada, centro del plano.
  { id: 't5', number: 5, seats: 8, status: 'occupied', x: 48, y: 42 },
  // Mesa 6: libre, al oeste.
  { id: 't6', number: 6, seats: 2, status: 'free', x: 8, y: 78 },
  // Mesa 7: ocupada, al este.
  { id: 't7', number: 7, seats: 4, status: 'occupied', x: 62, y: 80 },
  // Mesa 8: libre, al sur (recibe comensales pronto).
  { id: 't8', number: 8, seats: 4, status: 'free', x: 35, y: 88 },
];

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

// Estado inicial del slice (se reinicia con resetDemo en PR 4).
const initialState = {
  // Mesas del salón para el mapa topológico.
  tables: SEED_TABLES,
  // Excepciones del turno para el feed lateral.
  exceptions: SEED_EXCEPTIONS,
  // Flag de carga: simula la preparación de datos al montar la vista.
  loading: true,
};

// Store del radar: estado + acciones que mutan ese estado.
export const useRadarStore = create((set) => ({
  // Estado inicial del slice (seed semilla del demo).
  ...initialState,

  // Simula la carga de mesas/excepciones (sin servicio: seed local en PR 3).
  // PR 4 reemplaza el cuerpo por la siembra desde mocks (task 3.1/3.3).
  loadTables: () => {
    // Programa la "resolución" tras 300ms con los datos del seed.
    window.setTimeout(() => {
      // Apaga el flag de carga dejando las mesas/excepciones ya seedeadas.
      set({ loading: false });
    }, 300);
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
