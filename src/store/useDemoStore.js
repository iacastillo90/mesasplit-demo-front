// src/store/useDemoStore.js — store raíz persistente de la demo (task 3.3)
// Zustand v5 con persist(localStorage 'mesasplit-demo') (design D6): siembra el
// estado demo desde los mocks en sesión fresca y sobrevive al reload (spec
// realtime-bus persist "state survives reload"). Es la fuente de verdad para
// los slices que leen el estado del salón (ej: useRadarStore carga sus mesas
// desde acá, task 3.3) y expone la semilla que usará el bus realtime (PR 4).

// create: fábrica de store de Zustand v5 (hooks de React directos).
import { create } from 'zustand';
// persist + createJSONStorage: middleware de persistencia en localStorage.
import { persist, createJSONStorage } from 'zustand/middleware';
// Fixtures canónicos: seed del estado demo (fuente única en src/mocks).
import tablesData from '../mocks/tables.json';
import menuData from '../mocks/menu.json';
import usersData from '../mocks/users.json';

// Clave del localStorage donde vive el estado persistido (design D6).
const STORAGE_KEY = 'mesasplit-demo';

// Estado inicial del store: seed síncrono desde los mocks (sesión fresca).
const initialState = {
  // Mesas del salón (fixture tables.json): las consume el radar y el garzón.
  tables: tablesData,
  // Menú del restaurante (fixture menu.json): lo consume la Mesa Virtual.
  menu: menuData,
  // Empleados demo (fixture users.json): perfiles de roles del demo.
  users: usersData,
  // Órdenes demo: arrancan vacías (sin fixture dedicado en los mocks).
  orders: [],
};

// Store raíz con persistencia: crea el store y lo persiste en localStorage.
// Export nombrado: los slices importan useDemoStore desde src/store (design).
export const useDemoStore = create(
  // Envuelve la definición del store con el middleware persist.
  persist(
    // Definición del store: estado inicial + acciones que lo mutan.
    (set) => ({
      // Estado inicial (seed de los mocks para la primera visita).
      ...initialState,

      // Re-siembra el estado demo desde los mocks (reset coordinado).
      seedFromMocks: () => set(initialState),

      // Reinicia la demo al seed (también sobreescribe el persist en storage).
      resetDemo: () => set(initialState),

      // Cambia el estado de una mesa (lo consumirá el bus realtime en PR 4).
      // Recibe el id de la mesa y el nuevo estado (enum TABLE_STATUS).
      setTableStatus: (tableId, status) =>
        set((state) => ({
          // Mapea las mesas actualizando el estado de la indicada.
          tables: state.tables.map((table) =>
            // Reemplaza SOLO la mesa con el id recibido (inmutable).
            table.id === tableId ? { ...table, status } : table,
          ),
        })),
    }),
    {
      // Clave del localStorage donde vive el estado persistido (design D6).
      name: STORAGE_KEY,
      // Storage síncrono: localStorage del navegador (compatible con jsdom).
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
