// src/features/RadarView/store/useDeliveryStore.js — Store Zustand de despachos delivery y live tracking de repartidor
// Administra pedidos omnicanal (Uber Eats, Rappi, PedidosYa), la progresión de estados y el mapa de seguimiento.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Zustand create para instanciar el store global de delivery.
import { create } from 'zustand';

// Lista inicial simulada de pedidos de delivery activos.
export const INITIAL_DELIVERY_ORDERS = [
  {
    id: 'DEL-901',
    platform: 'Uber Eats 🟢',
    customerName: 'Matías Silva',
    address: 'Av. Holanda 450, Providencia',
    items: ['Lomo Lo Ovalle x2', 'Pisco Sour x2'],
    total: 38900,
    stage: 'ON_THE_WAY', // RECEIVED | PREPARING | COURIER_ASSIGNED | ON_THE_WAY | DELIVERED
    stageLabel: 'En Camino 🛵',
    courierName: 'Franco M. 🏍️',
    etaMinutes: 12,
    routeProgressPct: 65,
  },
  {
    id: 'DEL-902',
    platform: 'Rappi 🟠',
    customerName: 'Valeria Rojas',
    address: 'Pedro de Valdivia 1100',
    items: ['Hamburguesa Gourmet x1', 'Papas Nativas x1'],
    total: 18500,
    stage: 'PREPARING',
    stageLabel: 'En Preparación 🍳',
    courierName: 'Buscando repartidor... ⏳',
    etaMinutes: 25,
    routeProgressPct: 25,
  },
];

// Store Zustand `useDeliveryStore`.
export const useDeliveryStore = create((set, get) => ({
  // Lista de pedidos de delivery.
  deliveries: INITIAL_DELIVERY_ORDERS,
  // Pedido seleccionado actualmente para ver el mapa de live tracking.
  selectedDeliveryId: 'DEL-901',

  // Selecciona una orden para ver en el modal de tracking.
  setSelectedDeliveryId: (id) => set({ selectedDeliveryId: id }),

  // Avanza el estado del delivery a la siguiente etapa.
  advanceDeliveryStage: (id) => {
    set((prev) => ({
      deliveries: prev.deliveries.map((del) => {
        if (del.id !== id) return del;

        let nextStage = 'DELIVERED';
        let nextLabel = 'Entregado ✓';
        let nextProgress = 100;
        let nextEta = 0;

        if (del.stage === 'RECEIVED') {
          nextStage = 'PREPARING';
          nextLabel = 'En Preparación 🍳';
          nextProgress = 30;
          nextEta = 20;
        } else if (del.stage === 'PREPARING') {
          nextStage = 'COURIER_ASSIGNED';
          nextLabel = 'Repartidor Asignado 🧍';
          nextProgress = 50;
          nextEta = 15;
        } else if (del.stage === 'COURIER_ASSIGNED') {
          nextStage = 'ON_THE_WAY';
          nextLabel = 'En Camino 🛵';
          nextProgress = 80;
          nextEta = 8;
        }

        return {
          ...del,
          stage: nextStage,
          stageLabel: nextLabel,
          routeProgressPct: nextProgress,
          etaMinutes: nextEta,
        };
      }),
    }));
  },

  // Crea una orden simulada de delivery.
  createDeliveryOrder: (platformName) => {
    const newId = `DEL-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder = {
      id: newId,
      platform: platformName,
      customerName: 'Cliente Simulación',
      address: 'Calle Demo 123, Providencia',
      items: ['Combo Franquicia x1'],
      total: 24500,
      stage: 'RECEIVED',
      stageLabel: 'Recibido 📥',
      courierName: 'Asignando... 🛵',
      etaMinutes: 30,
      routeProgressPct: 10,
    };

    set((prev) => ({
      deliveries: [newOrder, ...prev.deliveries],
      selectedDeliveryId: newId,
    }));

    return newOrder;
  },
}));
