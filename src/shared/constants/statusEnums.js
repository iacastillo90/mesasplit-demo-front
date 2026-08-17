// src/shared/constants/statusEnums.js — enums de estado compartidos del sistema (task 2.1)
// Enums inmutables (Object.freeze) de la app gastronómica: estados de mesa, ticket KDS,
// ítem de comanda, métodos de pago y modos de división de cuenta (account-split).
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// Estados posibles de una mesa en el salón.
export const TABLE_STATUS = Object.freeze({
  FREE: 'free',
  OCCUPIED: 'occupied',
  BILLING: 'billing',
  CLEANING: 'cleaning',
});

// Estados de vida de un ticket en la cocina (KDS).
export const TICKET_STATUS = Object.freeze({
  PENDING: 'pending',
  IN_PREPARATION: 'in_preparation',
  READY: 'ready',
  DELIVERED: 'delivered',
});

// Tipos de cursos / tiempos gastronómicos.
export const COURSE_TYPE = Object.freeze({
  STARTER: 'starter',
  MAIN: 'main',
  DESSERT: 'dessert',
  BEVERAGE: 'beverage',
});

// Medios de pago aceptados en la plataforma.
export const PAYMENT_METHOD = Object.freeze({
  CASH: 'efectivo',
  CARD: 'tarjeta',
  TRANSFER: 'transferencia',
  MIXED: 'mixto',
});

// Modos de división de cuenta en la Mesa Virtual (account-split).
// El design exige item_fraction (fracciones por línea) en lugar de custom_amount.
export const SPLIT_TYPE = Object.freeze({
  FULL: 'full',
  EQUAL: 'equal',
  BY_ITEM: 'by_item',
  ITEM_FRACTION: 'item_fraction',
});

// Estado de pago de la cuota individual de un comensal.
export const GUEST_PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
});
