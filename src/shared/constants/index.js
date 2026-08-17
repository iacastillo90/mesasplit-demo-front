// src/shared/constants/index.js — barrel de src/shared/constants
// Exporta en un solo punto los colores y enums para imports limpios:
//   import { BRAND, TABLE_STATUS } from '@/shared/constants' (alias si aplica)
// Mantiene la convención FSD: los slices importan desde el barrel, no desde
// archivos individuales.

// Re-exporta los tokens de color (escala brand + semánticos + mapa plano).
export { BRAND, SEMANTIC, TOKEN_MAP } from './colors.js';
// Re-exporta los enums de estado del dominio (mesa, ticket, curso, pago y split).
// ORDER_STATUS fue reemplazado por TABLE_STATUS/TICKET_STATUS en fases previas.
export { COURSE_TYPE, GUEST_PAYMENT_STATUS, PAYMENT_METHOD, SPLIT_TYPE, TABLE_STATUS, TICKET_STATUS } from './statusEnums.js';
