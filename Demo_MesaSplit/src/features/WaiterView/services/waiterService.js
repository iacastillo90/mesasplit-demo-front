// src/features/WaiterView/services/waiterService.js — servicio del garzón.
// Capa de datos del garzón: mesas asignadas + carta. En modo backend
// (VITE_DEMO_MODE='backend') llama al backend LabTab y adapta la respuesta al
// shape del front; en modo demo usa mockFetch (fixtures). La firma no cambia:
// el store se mantiene igual.

// mockFetch: capa de datos simulada de la demo (modo same-device).
import { mockFetch } from '../../../mocks/mockFetch.js';
// http e isBackendMode: cliente HTTP real + flag de modo.
import { http, isBackendMode } from '../../../api/httpClient.js';
// mapTable/mapMenu: adaptadores back → shape del front.
import { mapTable, mapMenu } from '../../../api/mappers.js';

// fetchAssignedTables: mesas del garzón (back o mock según el modo).
export function fetchAssignedTables() {
  // Modo backend: GET /branch/tables y mapeo a la forma del front.
  if (isBackendMode()) {
    return http.get('/api/v1/branch/tables').then((tables) => tables.map(mapTable));
  }
  // Modo demo: resuelve el fixture tables.json tras ~300ms.
  return mockFetch('/api/tables');
}

// getMenu: carta real (back o mock según el modo).
export function getMenu() {
  // Modo backend: GET /menu/sections y aplana a ítems planos.
  if (isBackendMode()) {
    return http.get('/api/v1/menu/sections').then(mapMenu);
  }
  // Modo demo: resuelve el fixture menu.json tras ~300ms.
  return mockFetch('/api/menu');
}
