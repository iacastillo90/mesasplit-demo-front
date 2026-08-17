// src/features/RadarView/services/radarService.js — servicio del Radar Local Admin (local-admin-radar)
// Capa de datos del radar: entrega el resumen de mesas, estados y zonas del salón.
// Conecta a mockFetch para simular la carga con latencia de red.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea).

// mockFetch: capa de datos simulada sobre los fixtures.
import { mockFetch } from '../../../mocks/mockFetch.js';

// Servicio de obtención del resumen de mesas del radar.
export async function fetchRadarOverview() {
  // Solicita las mesas al endpoint simulado del salón.
  const tables = await mockFetch('/api/tables');
  // Devuelve la estructura de visión general del local.
  return {
    tables: tables ?? [],
    activeCount: (tables ?? []).filter((t) => t.status === 'occupied').length,
    timestamp: Date.now(),
  };
}
