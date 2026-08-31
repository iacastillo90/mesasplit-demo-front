// src/mocks/tableContext.js — contexto de mesa del cliente (task 3.1)
// Fixture del contexto de la Mesa Virtual (de dónde llega el QR del comensal).
// Vive fuera de menu.json porque su shape no es un listado de ítems del menú:
// la Mesa Virtual lo consume como objeto único (banner superior de la página).

// Contexto demo de la mesa virtual (número, comensales y código QR).
export const TABLE_CONTEXT = {
  // Número de mesa asignada al comensal.
  number: 12,
  // Cantidad de comensales sentados en la mesa.
  guests: 4,
  // Código corto del QR que identifica la sesión de la mesa.
  code: '4F2K',
};
