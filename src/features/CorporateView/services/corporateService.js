// src/features/CorporateView/services/corporateService.js — servicio del Super Admin Corporativo (super-admin-corporate + costo-primario)
// Servicio de datos corporativos: provee información resumida de ventas, costo primario y salud de sucursales.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// mockFetch: transporte de datos simulado.
import { mockFetch } from '../../../mocks/mockFetch.js';

// Obtiene la visión general de la franquicia y sus sucursales.
export async function fetchFranchiseOverview() {
  const tables = await mockFetch('/api/tables');
  // Simula el resumen multi-sucursal a partir del estado de la demo.
  return {
    branches: [
      { id: 'b-lc', name: 'Salón Las Condes', salesTotal: 620000, foodCost: 186000, activeTables: (tables ?? []).filter((t) => t.status === 'occupied').length, totalTables: 8, activeStaff: 5, avgTicket: 34500, healthStatus: 'optimal' },
      { id: 'b-pr', name: 'Terraza Providencia', salesTotal: 480000, foodCost: 144000, activeTables: 8, totalTables: 10, activeStaff: 6, avgTicket: 28900, healthStatus: 'peak' },
      { id: 'b-vt', name: 'Barra Vitacura', salesTotal: 510000, foodCost: 153000, activeTables: 4, totalTables: 6, activeStaff: 4, avgTicket: 42000, healthStatus: 'optimal' },
      { id: 'b-sc', name: 'Express Santiago Centro', salesTotal: 240000, foodCost: 72000, activeTables: 5, totalTables: 8, activeStaff: 3, avgTicket: 19500, healthStatus: 'alert' },
    ],
    timestamp: Date.now(),
  };
}
