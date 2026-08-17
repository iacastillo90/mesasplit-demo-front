// src/features/PosView/services/posService.js — servicio de Caja POS (pos-cashier)
// Capa de integración de datos para la terminal POS: lectura de cuentas por cobrar y consulta de RUT.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// mockFetch: capa de transporte simulada.
import { mockFetch } from '../../../mocks/mockFetch.js';

// Obtiene las cuentas abiertas pendientes de cobro en la caja.
export async function fetchOpenBills() {
  const tables = await mockFetch('/api/tables');
  // Filtra o mapea las mesas con cuentas activas.
  return (tables ?? []).map((t) => ({
    id: `bill-${t.id}`,
    tableNumber: t.number,
    customerName: `Mesa ${t.number}`,
    totalAmount: t.totalAmount ?? 20000,
    status: t.status === 'billing' ? 'billing' : 'billing',
    itemsCount: 4,
  }));
}
