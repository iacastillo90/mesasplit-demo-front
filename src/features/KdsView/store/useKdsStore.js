// src/features/KdsView/store/useKdsStore.js — store de cocina KDS (kds-kitchen)
// Slice de estado de KDS: tickets activos, historial de Recall (últimos 10),
// productos en Lista 86 (agotados), filtro de estación y acciones de despacho.
// Integra suscripciones y publicación a createRealtimeBus (eventos kds.item_ready y kds.stock_86).

// create: fábrica de store de Zustand v5.
import { create } from 'zustand';
// Servicio de datos de cocina.
import { fetchKitchenTickets } from '../services/kdsService.js';
// Instancia pura del bus en tiempo real (no hook React para uso en Zustand).
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';

// Instancia única del bus para las acciones del store.
const bus = createRealtimeBus('mesasplit');

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
  // Estado de carga inicial.
  loading: true,
};

// Store de Zustand para la vista de cocina KDS.
export const useKdsStore = create((set, get) => ({
  // Carga las propiedades del estado inicial.
  ...initialState,

  // Carga los tickets de cocina desde la capa de servicio mockFetch.
  loadTickets: async () => {
    // Solicita los tickets al servicio de cocina.
    const rawTickets = await fetchKitchenTickets();
    // Procesa los tickets asignando secciones de Course Control y alergias.
    const tickets = rawTickets.map((t) => ({
      ...t,
      // Asigna la propiedad data-has-allergy si algún ítem tiene alérgenos declarados.
      hasAllergy: t.items.some((item) => item.allergens && item.allergens.length > 0),
    }));
    // Actualiza el store con los tickets procesados y desactiva el spinner de carga.
    set({ tickets, loading: false });
  },

  // Selecciona la estación activa del filtro.
  setStation: (activeStation) => set({ activeStation }),

  // Marca un ticket completo como despachado ("MARCAR LISTO").
  completeTicket: (ticketId) => {
    // Obtiene el ticket objetivo a completar.
    const state = get();
    // Encuentra la comanda correspondiente por ID.
    const targetTicket = state.tickets.find((t) => t.id === ticketId);
    // Si no existe el ticket, cancela la operación.
    if (!targetTicket) return;

    // Filtra la lista eliminando la comanda despachada.
    const newTickets = state.tickets.filter((t) => (t.id === ticketId ? false : true));
    // Agrega la comanda al historial de Recall manteniendo máximo 10 elementos.
    const newRecallStack = [targetTicket, ...state.recallStack].slice(0, 10);

    // Actualiza el estado con la lista filtrada y la pila de Recall.
    set({ tickets: newTickets, recallStack: newRecallStack });

    // Emite el evento en tiempo real kds.item_ready por el bus de la demo.
    bus.publish('kds.item_ready', {
      ticketId: targetTicket.id,
      tableNumber: targetTicket.tableNumber,
      status: 'ready',
      timestamp: Date.now(),
    });
  },

  // Restaura un ticket completado desde la pila de Recall de vuelta a la pantalla.
  restoreTicket: (ticketId) => {
    // Obtiene el estado actual.
    const state = get();
    // Busca el ticket a restaurar en la pila de Recall.
    const ticketToRestore = state.recallStack.find((t) => t.id === ticketId);
    // Si no está en la pila, finaliza la acción.
    if (!ticketToRestore) return;

    // Quita el ticket de la pila de Recall.
    const newRecallStack = state.recallStack.filter((t) => (t.id === ticketId ? false : true));
    // Lo inserta al inicio de la lista de tickets activos.
    const newTickets = [ticketToRestore, ...state.tickets];

    // Guarda los cambios en el store.
    set({ tickets: newTickets, recallStack: newRecallStack });
  },

  // Conmuta el estado de disponibilidad de un producto (Lista 86).
  toggleStock86: (productId, productName) => {
    // Lee el estado actual de Lista 86.
    const state = get();
    // Calcula el nuevo valor booleano (si estaba agotado pasa a disponible y viceversa).
    const isCurrently86 = Boolean(state.stock86[productId]);
    // Crea el objeto actualizado de mapa de productos agotados.
    const newStock86 = { ...state.stock86, [productId]: !isCurrently86 };

    // Actualiza la lista en el store.
    set({ stock86: newStock86 });

    // Emite el evento kds.stock_86 por el bus en tiempo real.
    bus.publish('kds.stock_86', {
      productId,
      productName,
      status: isCurrently86 ? 'available' : 'out_of_stock',
      timestamp: Date.now(),
    });
  },

  // Maneja eventos course.fire de Mozo para activar platos en espera.
  fireCourse: (orderId, courseType) => {
    // Obtiene el listado de tickets activos.
    const { tickets } = get();
    // Actualiza los tickets que coincidan con la orden.
    const updatedTickets = tickets.map((ticket) => {
      // Si la comanda no pertenece a la orden objetivo, no sufre cambios.
      if (ticket.id !== orderId && ticket.tableNumber !== orderId) return ticket;
      // Modifica los ítems cuyo curso corresponda al evento enviado.
      const updatedItems = ticket.items.map((item) => {
        if (item.course === courseType || !item.course) {
          return { ...item, onHold: false };
        }
        return item;
      });
      return { ...ticket, items: updatedItems };
    });
    // Guarda los tickets actualizados en el store.
    set({ tickets: updatedTickets });
  },

  // Tacha o destacha un ítem individual de una comanda al tocarlo.
  toggleItemPrepared: (ticketId, itemId) => {
    // Obtiene el estado actual de tickets.
    const { tickets } = get();
    // Recorre y muta el ítem objetivo en el ticket correspondiente.
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
    // Guarda los tickets modificados.
    set({ tickets: updatedTickets });
  },

  // Restablece el slice a su estado inicial.
  resetDemo: () => set(initialState),
}));
