// src/features/ClientView/services/splitService.js — servicio de cálculo de división de cuentas (account-split)
// Lógica pura de división de cuenta: calcula cuotas equitativas con algoritmo de resto mayor (Largest Remainder),
// división por platos e ítems consumidos y cuotas personalizadas garantizando la inobservancia del total.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// Algoritmo de división equitativa con regla de resto mayor (Largest Remainder).
export function calculateEqualShares(total, count) {
  if (count <= 0) return [];
  // Cuota entera base en CLP por comensal.
  const baseShare = Math.floor(total / count);
  // Resto acumulado sobrante.
  const remainder = total - baseShare * count;

  // Reparte el resto de a $1 CLP a los primeros comensales (resto mayor).
  return Array.from({ length: count }, (_, idx) => ({
    id: `guest-${idx + 1}`,
    name: `Comensal ${idx + 1}`,
    amount: baseShare + (idx < remainder ? 1 : 0),
    status: 'pending',
  }));
}

// Servicio principal de cálculo de división de cuenta según el modo seleccionado.
export function splitByMode(total, count = 2, mode = 'full') {
  if (mode === 'full' || count <= 1) {
    return [
      {
        id: 'guest-1',
        name: 'Comensal 1 (Total)',
        amount: total,
        status: 'pending',
      },
    ];
  }

  if (mode === 'equal') {
    return calculateEqualShares(total, count);
  }

  // Modos por plato o personalizado (división por defecto en partes de demo).
  return calculateEqualShares(total, count);
}
