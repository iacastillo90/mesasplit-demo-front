// src/features/ClientView/services/clientService.js — servicio del cliente (task 2.5)
// Capa de datos de la Mesa Virtual: expone el menú y el contexto de la mesa.
// PR 4 (task 3.1): los fixtures inline migraron a src/mocks (menu.json y
// tableContext.js) y este servicio pasa a llamar la capa mockFetch (~300ms),
// siguiendo el design "FeaturePage → services → mockFetch → mocks".
// La firma de getMenu/getTableContext NO cambia: las stores del slice no se tocan.

// mockFetch: capa de datos simulada con latencia (~300ms) sobre los mocks.
import { mockFetch } from '../../../mocks/mockFetch.js';

// Servicio del cliente: expone el menú con la latencia simulada de red.
export function getMenu() {
  // Delega en mockFetch: resuelve el fixture menu.json tras ~300ms.
  return mockFetch('/api/menu');
}

// Servicio de contexto de mesa: banner superior de la Mesa Virtual.
export function getTableContext() {
  // Delega en mockFetch: resuelve el fixture tableContext (Mesa 12, código 4F2K).
  return mockFetch('/api/table-context');
}