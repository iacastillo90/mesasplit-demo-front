// src/shared/utils/validateRut.js — validador de RUT chileno (task 2.3)
// Verifica el dígito verificador de un RUT usando el algoritmo módulo 11.
// Acepta formatos con/sin puntos y guión: "12.345.678-9", "12345678-9", "k".

// Normaliza un RUT de entrada: quita puntos y guiones y pasa a mayúsculas.
// Devuelve el string limpio listo para validar (ej: "12345678K").
export function normalizeRut(rut) {
  // Convierte a string por si llega un número y remueve separadores.
  // toUpperCase estandariza el dígito verificador "k" → "K".
  // Clase [.-]: quita puntos y guiones (el guion al final no necesita escape).
  return String(rut).replace(/[.-]/g, '').toUpperCase();
}

// Calcula el dígito verificador esperado para un cuerpo de RUT (mód. 11).
// Recibe solo la parte numérica (ej: "12345678") y devuelve "0"-"9" o "K".
function expectedCheckDigit(body) {
  // Serie de pesos 2..7 que se repite de derecha a izquierda (algoritmo oficial).
  const weights = [2, 3, 4, 5, 6, 7];
  // Suma ponderada recorriendo el cuerpo invertido (de la unidad hacia arriba).
  let sum = 0;
  for (let i = body.length - 1, w = 0; i >= 0; i -= 1, w += 1) {
    // Cada dígito se multiplica por el peso según su posición.
    sum += Number(body[i]) * weights[w % weights.length];
  }
  // Resto sobre 11 y complemento a 11: el DV final calculado.
  const remainder = 11 - (sum % 11);
  // Caso 11 → dígito "0"; caso 10 → dígito "K"; resto → el número mismo.
  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return String(remainder);
}

// Valida un RUT chileno completo (cuerpo + dígito verificador) => boolean.
// Devuelve false ante formatos inválidos o DV incorrecto (sin lanzar error).
export function validateRut(rut) {
  // Normaliza la entrada (puntos, guiones, mayúsculas).
  const normalized = normalizeRut(rut);
  // Extrae cuerpo (1-8 dígitos) y DV final; si no matchea, RUT inválido.
  const match = normalized.match(/^(\d{1,8})([\dK])$/);
  // Sin match: longitud o caracteres fuera del formato chileno.
  if (!match) return false;
  // Desestructura el cuerpo numérico y el dígito verificador declarado.
  const [, body, checkDigit] = match;
  // El RUT es válido si el DV declarado coincide con el calculado.
  return expectedCheckDigit(body) === checkDigit;
}
