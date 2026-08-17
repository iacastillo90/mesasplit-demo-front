// src/features/KdsView/services/kdsService.js — servicio de cocina (task 2.7)
// Capa de datos del KDS: entrega los tickets de cocina con sus estaciones.
// Los tickets usan el enum TICKET_STATUS de shared/constants (fuente única).
// PR 4 (task 3.1): los fixtures inline migraron a src/mocks/tickets.json y este
// servicio pasa a la capa mockFetch (~300ms), según el design
// "service → mockFetch → mocks". La firma no cambia: el store se mantiene igual.

// mockFetch: capa de datos simulada con latencia (~300ms) sobre los mocks.
import { mockFetch } from '../../../mocks/mockFetch.js';

// Servicio de cocina: devuelve los tickets con latencia simulada.
export function fetchKitchenTickets() {
  // Delega en mockFetch: resuelve el fixture tickets.json tras ~300ms.
  return mockFetch('/api/tickets');
}