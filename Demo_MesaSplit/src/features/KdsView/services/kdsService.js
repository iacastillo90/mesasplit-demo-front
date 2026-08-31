// src/features/KdsView/services/kdsService.js — servicio de cocina.
// Capa de datos del KDS: tickets de cocina. En modo backend
// (VITE_DEMO_MODE='backend') llama al backend LabTab y adapta la respuesta al
// shape del front; en modo demo usa mockFetch (fixtures). La firma no cambia.

// mockFetch: capa de datos simulada de la demo (modo same-device).
import { mockFetch } from '../../../mocks/mockFetch.js';
// http e isBackendMode: cliente HTTP real + flag de modo.
import { http, isBackendMode } from '../../../api/httpClient.js';
// mapTicket: adaptador back → shape del front (KDS).
import { mapTicket } from '../../../api/mappers.js';

// fetchKitchenTickets: tickets de cocina (back o mock según el modo).
export function fetchKitchenTickets() {
  // Modo backend: GET /kitchen/tickets y mapeo a la forma del front.
  if (isBackendMode()) {
    return http.get('/api/v1/kitchen/tickets').then((tickets) => tickets.map(mapTicket));
  }
  // Modo demo: resuelve el fixture tickets.json tras ~300ms.
  return mockFetch('/api/tickets');
}
