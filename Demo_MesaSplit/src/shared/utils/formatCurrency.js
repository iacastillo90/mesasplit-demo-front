// src/shared/utils/formatCurrency.js — formateo de montos (task 2.3)
// Da formato de moneda CLP a los precios del menú y a las cuentas.

// Formatea un número como moneda chilena (CLP) sin decimales.
// Recibe el monto y devuelve el string listo para mostrar en la UI.
export function formatCurrency(amount) {
  // Intl.NumberFormat: API nativa del navegador, sin dependencias externas.
  // es-CL + CLP → formato "$1.234" (estilo chileno, sin decimales).
  const formatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    // Los menús demos usan precios enteros; 0 decimales evita "$,00".
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  // Devuelve el monto formateado con el símbolo y separadores locales.
  return formatter.format(amount);
}
