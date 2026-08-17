// src/shared/constants/statusEnums.js — enums de estado de la demo (task 2.3)
// Estados canónicos del dominio gastronómico compartidos por las vistas.
// Los slices (PR 3) consumen estos enums en lugar de strings sueltos.

// Estados de una mesa en el salón (Radar, Waiter).
export const TABLE_STATUS = {
  // Mesa libre, lista para recibir comensales.
  FREE: 'free',
  // Mesa con comensales activos (cuenta abierta).
  OCCUPIED: 'occupied',
  // Mesa en proceso de cobro / cierre de cuenta.
  BILLING: 'billing',
  // Mesa sucia, en limpieza antes de volver a libre.
  CLEANING: 'cleaning',
};

// Estados de un ticket de cocina (KDS).
export const TICKET_STATUS = {
  // Ticket recibido, aún no comenzó la preparación.
  PENDING: 'pending',
  // En preparación dentro de la cocina.
  COOKING: 'cooking',
  // Listo para ser servido por el garzón.
  READY: 'ready',
  // Entregado a la mesa (cierra el ciclo del ticket).
  SERVED: 'served',
};

// Estados de una orden/comanda (cliente, mozo).
export const ORDER_STATUS = {
  // Orden activa, se pueden agregar ítems.
  OPEN: 'open',
  // Orden cerrada (cuenta emitida o ticket servido completo).
  CLOSED: 'closed',
  // Orden cancelada por el cliente o el salón.
  CANCELLED: 'cancelled',
};
