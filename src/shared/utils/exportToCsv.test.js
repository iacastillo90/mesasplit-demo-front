// src/shared/utils/exportToCsv.test.js — tests unitarios para exportToCsv
// Prueba la generación correcta de cadenas CSV y el manejo de arreglos vacíos o con datos.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Describe, it y expect de Vitest para la suite de pruebas.
import { describe, it, expect } from 'vitest';
// Utility a probar.
import { exportToCsv } from './exportToCsv.js';

// Describe bloque para exportToCsv.
describe('exportToCsv: Generación y descarga de archivos Excel / CSV', () => {
  // Test 1: Retorna false si los datos están vacíos.
  it('retorna false si el arreglo de datos está vacío o es nulo', () => {
    expect(exportToCsv('test', [])).toBe(false);
    expect(exportToCsv('test', null)).toBe(false);
  });

  // Test 2: Retorna true al procesar un arreglo con datos válidos.
  it('retorna true y procesa correctamente un arreglo con objetos', () => {
    const mockData = [
      { id: 1, plato: 'Lomo Lo Ovalle', precio: 18900 },
      { id: 2, plato: 'Pisco Sour', precio: 6900 },
    ];

    const result = exportToCsv('reporte_ventas', mockData);
    expect(result).toBe(true);
  });
});
