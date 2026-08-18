// src/shared/utils/index.js — barrel de src/shared/utils
// Exporta las utilidades en un solo punto para imports limpios desde slices:
//   import { formatCurrency, validateRut } from '@/shared/utils'
// Convención FSD: los slices nunca importan archivos individuales directo.

// Re-exporta el formateador de montos CLP.
export { formatCurrency } from './formatCurrency.js';
// Re-exporta el validador de RUT chileno y su normalizador.
export { normalizeRut, validateRut } from './validateRut.js';
// Re-exporta el filtro de carta por dieta (paridad cliente/mozo).
export { filterMenuByDiet } from './menuFilters.js';
