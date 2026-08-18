// src/features/WaiterView/services/waiterService.js — servicio del garzón (task 2.6)
// Capa de datos del garzón: entrega las mesas asignadas a su cargo.
// El spec feature-views exige que la grilla consuma las mesas desde la capa de
// servicios ("table grid sourced from the service layer").
// PR 4 (task 3.1): los fixtures inline migraron a src/mocks/tables.json y este
// servicio pasa a la capa mockFetch (~300ms), según el design
// "service → mockFetch → mocks". La firma no cambia: el store se mantiene igual.

// mockFetch: capa de datos simulada con latencia (~300ms) sobre los mocks.
import { mockFetch } from '../../../mocks/mockFetch.js';

// Servicio del garzón: devuelve las mesas asignadas con latencia simulada.
export function fetchAssignedTables() {
  // Delega en mockFetch: resuelve el fixture tables.json tras ~300ms.
  return mockFetch('/api/tables');
}

// Servicio del garzón: devuelve la carta real (task 4.2, D10).
// Espejo de clientService.getMenu: la fuente única de ítems es menu.json.
export function getMenu() {
  // Delega en mockFetch: resuelve el fixture menu.json tras ~300ms.
  return mockFetch('/api/menu');
}
