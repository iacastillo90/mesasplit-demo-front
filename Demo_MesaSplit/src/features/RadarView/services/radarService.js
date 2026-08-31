// src/features/RadarView/services/radarService.js — servicio del Radar Local Admin.
// Capa de datos del radar: resumen de mesas + feed de excepciones. En modo
// backend llama al backend LabTab y adapta; en demo usa mockFetch/fixtures.

// mockFetch: capa de datos simulada sobre los fixtures (modo same-device).
import { mockFetch } from '../../../mocks/mockFetch.js';
// http e isBackendMode: cliente real + flag de modo.
import { http, isBackendMode } from '../../../api/httpClient.js';
// mapTable/mapException: adaptadores back → shape del front.
import { mapTable, mapException } from '../../../api/mappers.js';

// fetchRadarOverview: mesas del salón + resumen (back o mock según el modo).
export async function fetchRadarOverview() {
  // Modo backend: GET /branch/tables y mapeo a la forma del front.
  if (isBackendMode()) {
    const tables = await http.get('/api/v1/branch/tables').then((ts) => ts.map(mapTable));
    return {
      tables: tables ?? [],
      activeCount: (tables ?? []).filter((t) => t.status === 'occupied').length,
      timestamp: Date.now(),
    };
  }
  // Modo demo: fixtures tables.json con latencia simulada.
  const tables = await mockFetch('/api/tables');
  return {
    tables: tables ?? [],
    activeCount: (tables ?? []).filter((t) => t.status === 'occupied').length,
    timestamp: Date.now(),
  };
}

// fetchExceptions: feed de auditoría y excepciones antifraude.
export async function fetchExceptions() {
  // Modo backend: GET /exceptions y mapeo a la forma del front.
  if (isBackendMode()) {
    return http.get('/api/v1/exceptions').then((xs) => xs.map(mapException));
  }
  // Modo demo: sin excepciones adicionales (el store conserva sus fixtures).
  return [];
}
