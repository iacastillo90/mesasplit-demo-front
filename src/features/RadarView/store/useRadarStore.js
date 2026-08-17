// src/features/RadarView/store/useRadarStore.js — store del Radar Local Admin (local-admin-radar + modo-hora-punta)
// Slice de estado de RadarView: mapa topológico, delivery omnicanal, registro de excepciones (alert.fraud),
// Modo Hora Punta, control de mermas y botón de pánico.
// Escucha y publica eventos en tiempo real a través de createRealtimeBus.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// create: fábrica de store de Zustand v5.
import { create } from 'zustand';
// Servicio de datos del radar.
import { fetchRadarOverview } from '../services/radarService.js';
// Instancia del bus en tiempo real de la aplicación.
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';

// Instancia única del bus para las acciones y suscripciones del radar.
const bus = createRealtimeBus('mesasplit');

// Fixture canónico inicial de comandas de delivery omnicanal.
const INITIAL_DELIVERY = [
  { id: 'del-1', platform: 'ubereats', customerName: 'Camila Rojas', itemsSummary: '2x Hamburguesa + Limonada', total: 15400, elapsedMinutes: 8, driverName: 'Juan P.', status: 'pending' },
  { id: 'del-2', platform: 'rappi', customerName: 'Ignacio Silva', itemsSummary: '1x Pizza Margherita', total: 10900, elapsedMinutes: 14, driverName: 'Rodrigo M.', status: 'in_prep' },
  { id: 'del-3', platform: 'pedidosya', customerName: 'Felipe Soto', itemsSummary: '3x Papas fritas + 2x Cerveza', total: 13500, elapsedMinutes: 22, driverName: 'Matías L.', status: 'in_prep' },
];

// Fixture canónico inicial de auditorías y excepciones registradas.
const INITIAL_EXCEPTIONS = [
  { id: 'ex-1', title: 'Anulación de plato enviado a cocina', description: 'Item "Hamburguesa Clásica" anulado en Mesa 1 con PIN 9921', adminPin: '9921', reason: 'Cortesía', timestamp: Date.now() - 600000 },
  { id: 'ex-2', title: 'Apertura manual de gaveta de dinero', description: 'Apertura de caja sin transacción en POS 1', adminPin: '9921', reason: 'Cambio de sencillo', timestamp: Date.now() - 1200000 },
];

// Estado inicial del store de Radar.
const initialState = {
  // Mesas asignadas para el plano topológico.
  tables: [],
  // Zona seleccionada para el filtro ('todos', 'Salón', 'Terraza', 'Barra').
  activeZone: 'todos',
  // Lista de comandas de delivery omnicanal.
  deliveryOrders: INITIAL_DELIVERY,
  // Lista de auditorías y excepciones registradas.
  exceptionLogs: INITIAL_EXCEPTIONS,
  // Visibilidad del cajón modal de excepciones.
  exceptionDrawerOpen: false,
  // Indicador de activación del Modo Hora Punta (alta luminosidad/contraste).
  focusMode: false,
  // Registro de mermas de insumos.
  mermaLogs: [
    { id: 'm-1', description: '2 kilos de palta oxidadas', estimatedLoss: 7000, timestamp: Date.now() - 3600000 },
  ],
  // Flag de activación del Botón de Pánico de emergencia.
  panicActive: false,
  // Estado de carga inicial de datos.
  loading: true,
};

// Selector puro: filtra las mesas en estado crítico (esperando comida o cuenta pedida/pagando).
export const selectCriticalTables = (tables = []) =>
  tables.filter(
    (t) =>
      t.status === 'waiting_food' ||
      t.status === 'bill_requested' ||
      t.status === 'paying',
  );

// Selector puro: filtra los pedidos de delivery activos pendientes o en preparación.
export const selectActiveDelivery = (orders = []) =>
  orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');

// Store de Zustand para el slice de RadarView.
export const useRadarStore = create((set, get) => ({
  // Carga las propiedades del estado inicial.
  ...initialState,

  // Carga los datos generales del radar desde la capa de servicio.
  loadRadarData: async () => {
    // Si ya existen mesas cargadas (ej. fixture inyectado por test), no sobrescribe.
    if (get().tables.length > 0) {
      set({ loading: false });
      return;
    }
    // Solicita mesas y resúmenes al servicio del radar.
    const overview = await fetchRadarOverview();
    // Actualiza las mesas en el estado y finaliza la carga.
    set({ tables: overview.tables ?? [], loading: false });
  },

  // Suscribe el store a eventos del bus en tiempo real (table.status_changed, alert.fraud).
  setupRealtimeListeners: () => {
    // Escucha cambios de estado de mesa (table.status_changed).
    const offTableStatus = bus.subscribe('table.status_changed', (payload) => {
      if (!payload || !payload.tableId) return;
      const { tables } = get();
      const updatedTables = tables.map((t) =>
        t.id === payload.tableId ? { ...t, status: payload.status } : t,
      );
      set({ tables: updatedTables });
    });

    // Escucha eventos de auditoría de fraude y excepciones (alert.fraud).
    const offFraudAlert = bus.subscribe('alert.fraud', (payload) => {
      if (!payload) return;
      const newEntry = {
        id: `ex-${Date.now()}`,
        title: 'Anulación autorizada de comanda',
        description: `Ítem ${payload.itemId ?? ''} anulado por el mozo`,
        adminPin: payload.adminPin ?? '9921',
        reason: payload.reason ?? 'Cortesía',
        timestamp: payload.timestamp ?? Date.now(),
      };
      set({ exceptionLogs: [newEntry, ...get().exceptionLogs] });
    });

    // Devuelve la función de limpieza de desuscripción.
    return () => {
      offTableStatus();
      offFraudAlert();
    };
  },

  // Cambia el filtro de zona activa del plano (Salón, Terraza, Barra).
  setZone: (activeZone) => set({ activeZone }),

  // Conmuta la visibilidad del cajón modal de excepciones de auditoría.
  setExceptionDrawerOpen: (exceptionDrawerOpen) => set({ exceptionDrawerOpen }),

  // Conmuta el estado de Modo Hora Punta (Focus Mode).
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),

  // Registra una nueva entrada en el control de mermas de insumos.
  addMerma: (description) => {
    // Crea la entrada de merma con timestamp y estimación.
    const newEntry = {
      id: `merma-${Date.now()}`,
      description,
      estimatedLoss: 3500,
      timestamp: Date.now(),
    };
    // Agrega el registro al inicio del listado de mermas.
    set({ mermaLogs: [newEntry, ...get().mermaLogs] });
  },

  // Activa el Botón de Pánico de emergencia y emite el evento alert.panic.
  triggerPanic: () => {
    // Enciende la alerta de pánico en el estado.
    set({ panicActive: true });

    // Emite el evento de pánico por el bus en tiempo real.
    bus.publish('alert.panic', {
      type: 'emergency_button_pressed',
      supervisor: 'Local Admin',
      timestamp: Date.now(),
    });
  },

  // Desactiva la alerta de pánico.
  clearPanic: () => set({ panicActive: false }),

  // Restablece el slice a su estado inicial.
  resetDemo: () => set(initialState),
}));
