// src/features/ClientView/services/clientService.js — servicio del cliente (Mesa Virtual).
// Capa de datos de la Mesa Virtual: menú y contexto de mesa. En modo backend
// llama al backend LabTab y adapta; en demo usa mockFetch/fixtures. La firma
// de getMenu/getTableContext no cambia: las stores del slice no se tocan.

// mockFetch: capa de datos simulada con latencia (~300ms) sobre los mocks.
import { mockFetch } from '../../../mocks/mockFetch.js';
// http e isBackendMode: cliente real + flag de modo.
import { http, isBackendMode } from '../../../api/httpClient.js';
// mapMenu: adaptador back → shape del front (menú plano).
import { mapMenu } from '../../../api/mappers.js';

// getMenu: menú del restaurante (back o mock según el modo).
export function getMenu() {
  // Modo backend: GET /menu/sections y aplana a ítems planos.
  if (isBackendMode()) {
    return http.get('/api/v1/menu/sections').then(mapMenu);
  }
  // Modo demo: resuelve el fixture menu.json tras ~300ms.
  return mockFetch('/api/menu');
}

// getTableContext: contexto de mesa (banner de la Mesa Virtual).
export function getTableContext() {
  // En backend el contexto real llega del onboarding QR (guest-session); acá se
  // mantiene el mock para el banner de la demo, sin romper la vista.
  return mockFetch('/api/table-context');
}

// guestSession: onboarding QR del comensal (POST /auth/guest-session).
// Devuelve { accessToken, expiresIn, guest } del backend.
export function guestSession(qrToken, displayName, allergies) {
  return http.post('/api/v1/auth/guest-session', { qrToken, displayName, allergies });
}
