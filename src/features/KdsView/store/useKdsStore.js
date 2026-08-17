// src/features/KdsView/store/useKdsStore.js — store de cocina (task 2.7)
// Slice de estado del KDS (patrón FSD docs/03): tickets de cocina + la
// estación activa del filtro por tabs. Zustand v5 (design D6), sin persist:
// los tickets son transitorios de sesión (PR 4 llega el bus realtime).
// NOTA: el estado de UI (estación activa) vive en el store porque los tabs
// (StationFilterTabs) y la grilla comparten ese filtro.

// create: fábrica de store de Zustand v5 (hooks de React directos).
import { create } from 'zustand';
// Servicio de la capa de datos de cocina (tickets de preparación).
import { fetchKitchenTickets } from '../services/kdsService.js';

// Identificador de la estación "todas": filtro sin restricción de estación.
export const STATION_ALL = 'todas';

// Estado inicial del slice (se reinicia con resetDemo en PR 4).
const initialState = {
  // Tickets de cocina cargados desde el servicio.
  tickets: [],
  // Estación activa del filtro (STATION_ALL = ver todas).
  activeStation: STATION_ALL,
  // Flag de carga de la primera llamada al servicio.
  loading: true,
};

// Store de cocina: estado + acciones que mutan ese estado.
export const useKdsStore = create((set) => ({
  // Estado inicial del slice (copiado para no mutar el objeto fuente).
  ...initialState,

  // Carga los tickets de cocina desde el servicio (una vez al montar).
  loadTickets: async () => {
    // Resuelve la promesa del servicio de tickets.
    const tickets = await fetchKitchenTickets();
    // Setea los tickets y apaga el flag de carga.
    set({ tickets, loading: false });
  },

  // Fija la estación activa del filtro (clave de los tabs de estación).
  setStation: (activeStation) => set({ activeStation }),

  // Reinicia el slice a su estado inicial (resetDemo de PR 4 lo coordina).
  resetDemo: () => set(initialState),
}));
