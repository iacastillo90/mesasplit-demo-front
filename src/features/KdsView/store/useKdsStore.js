// src/features/KdsView/store/useKdsStore.js — store de cocina KDS (kds-kitchen + kds-offline)
// Slice de estado de KDS: tickets activos, historial de Recall (últimos 10),
// productos en Lista 86 (agotados), filtro de estación, acciones de despacho y cola offline FIFO.
// Integra suscripciones y publicación a createRealtimeBus (eventos kds.item_ready y kds.stock_86).
// Cumple con las reglas de AGENTS.md (comentarios en español por línea).

// create: fábrica de store de Zustand v5.
import { create } from 'zustand';
// Servicio de datos de cocina.
import { fetchKitchenTickets } from '../services/kdsService.js';
// Instancia pura del bus en tiempo real (no hook React para uso en Zustand).
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';

// Instancia única del bus para las acciones del store.
export const kdsBus = createRealtimeBus('mesasplit');
const bus = kdsBus;

// Estación por defecto para mostrar todos los tickets.
export const STATION_ALL = 'todas';

// Estado inicial del store de KDS.
const initialState = {
  // Tickets activos en la pantalla de la cocina.
  tickets: [],
  // Historial de comandas despachadas (Recall, máx 10).
  recallStack: [],
  // Productos marcados como Lista 86 (agotados).
  stock86: {},
  // Estación seleccionada en el filtro de pestañas.
  activeStation: STATION_ALL,
  // Estado de conectividad de red del KDS.
  isOnline: true,
  // Cola local de eventos encolados en modo offline (FIFO).
  offlineQueue: [],
  // Modo exhibición fullscreen Expo View.
  expoMode: false,
  // Estado de carga inicial.
  loading: true,
};

// Publica un evento por el bus o lo encola en la cola FIFO si el KDS está offline.
function publishOrEnqueue(get, set, topic, payload) {
  const { isOnline, offlineQueue } = get();
  if (isOnline) {
    try {
      bus.publish(topic, payload);
    } catch {
      // Tolera la ausencia de transporte realtime sin lanzar excepción.
    }
  } else {
    set({ offlineQueue: [...offlineQueue, { topic, payload }] });
  }
}

// Store de Zustand para la vista de cocina KDS.
export const useKdsStore = create((set, get) => ({
  // Carga las propiedades del estado inicial.
  ...initialState,

  // Carga los tickets de cocina desde la capa de servicio mockFetch.
  loadTickets: async () => {
    const rawTickets = await fetchKitchenTickets();
    const tickets = rawTickets.map((t) => ({
      ...t,
      hasAllergy: t.items.some((item) => item.allergens && item.allergens.length > 0),
    }));
    set({ tickets, loading: false });
  },

  // Actualiza el estado de conectividad e inicia auto-flush al reconectar a internet.
  setOnlineState: (isOnline) => {
    const state = get();
    const wasOffline = !state.isOnline;

    set({ isOnline });

    // Si pasó de offline a online y hay eventos en la cola, ejecuta flush FIFO.
    if (wasOffline && isOnline && state.offlineQueue.length > 0) {
      const queueToFlush = [...state.offlineQueue];
      // Vacía la cola en el estado antes de publicar para evitar loops.
      set({ offlineQueue: [] });

      // Emite cada evento encolado en orden de llegada exacto.
      queueToFlush.forEach((item) => {
        try {
          bus.publish(item.topic, item.payload);
        } catch {
          // Noop: tolera fallos de transmisión sin bloquear el flush.
        }
      });
    }
  },

  // Selecciona la estación activa del filtro.
  setStation: (activeStation) => set({ activeStation }),

  // Marca un ticket completo como despachado ("MARCAR LISTO").
  completeTicket: (ticketId) => {
    const state = get();
    const targetTicket = state.tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    const newTickets = state.tickets.filter((t) => (t.id === ticketId ? false : true));
    const newRecallStack = [targetTicket, ...state.recallStack].slice(0, 10);

    set({ tickets: newTickets, recallStack: newRecallStack });

    // Publica kds.item_ready o encola si se encuentra en modo offline.
    const payload = {
      ticketId: targetTicket.id,
      tableNumber: targetTicket.tableNumber,
      status: 'ready',
      timestamp: Date.now(),
    };
    publishOrEnqueue(get, set, 'kds.item_ready', payload);
  },

  // Restaura un ticket completado desde la pila de Recall de vuelta a la pantalla.
  restoreTicket: (ticketId) => {
    const state = get();
    const ticketToRestore = state.recallStack.find((t) => t.id === ticketId);
    if (!ticketToRestore) return;

    const newRecallStack = state.recallStack.filter((t) => (t.id === ticketId ? false : true));
    const newTickets = [ticketToRestore, ...state.tickets];

    set({ tickets: newTickets, recallStack: newRecallStack });
  },

  // Conmuta el estado de disponibilidad de un producto (Lista 86).
  toggleStock86: (productId, productName) => {
    const state = get();
    const isCurrently86 = Boolean(state.stock86[productId]);
    const newStock86 = { ...state.stock86, [productId]: !isCurrently86 };

    set({ stock86: newStock86 });

    // Publica kds.stock_86 o encola si se encuentra en modo offline.
    const payload = {
      productId,
      productName,
      status: isCurrently86 ? 'available' : 'out_of_stock',
      timestamp: Date.now(),
    };
    publishOrEnqueue(get, set, 'kds.stock_86', payload);
  },

  // Maneja eventos course.fire de Mozo para activar platos en espera.
  fireCourse: (orderId, courseType) => {
    const { tickets } = get();
    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id !== orderId && ticket.tableNumber !== orderId) return ticket;
      const updatedItems = ticket.items.map((item) => {
        if (item.course === courseType || !item.course) {
          return { ...item, onHold: false };
        }
        return item;
      });
      return { ...ticket, items: updatedItems };
    });
    set({ tickets: updatedTickets });
  },

  // Tacha o destacha un ítem individual de una comanda al tocarlo.
  toggleItemPrepared: (ticketId, itemId) => {
    const { tickets } = get();
    const updatedTickets = tickets.map((t) => {
      if (t.id !== ticketId) return t;
      const updatedItems = t.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, prepared: !item.prepared };
        }
        return item;
      });
      return { ...t, items: updatedItems };
    });
    set({ tickets: updatedTickets });
  },

  // Alterna el modo exhibición fullscreen Expo View.
  toggleExpoMode: () => set((state) => ({ expoMode: !state.expoMode })),

  // Restablece el slice a su estado inicial.
  resetDemo: () => set(initialState),
}));
