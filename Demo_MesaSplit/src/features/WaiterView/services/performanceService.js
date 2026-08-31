// src/features/WaiterView/services/performanceService.js — selector de rendimiento del garzón (waiter-performance)
// Selector puro que deriva métricas read-only a partir de los datos existentes en users y tables.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// Selector puro que calcula las métricas de rendimiento de un garzón.
export function selectWaiterPerformance(userId, users = [], tables = []) {
  // Busca el registro del usuario en la lista de usuarios.
  const user = (users ?? []).find((u) => u.id === userId);

  // Conteo de pedidos tomados hoy (derivado de salesCountToday del fixture demo).
  const ordersTaken = Number(user?.salesCountToday ?? 0);

  // Conteo de mesas asignadas y servidas por el garzón.
  const tablesServed = (tables ?? []).filter((t) => t.waiterId === userId).length;

  // Ticket promedio demo estimado (promedio de referencia $14.200).
  const avgTicket = ordersTaken > 0 ? 14200 : 0;

  // Rating promedio del garzón (derivado de avgRating en users.json).
  const avgRating = Number(user?.avgRating ?? 0);

  return {
    ordersTaken,
    tablesServed,
    avgTicket,
    avgRating,
  };
}
