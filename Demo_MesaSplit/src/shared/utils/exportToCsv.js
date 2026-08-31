// src/shared/utils/exportToCsv.js — Utility para exportar arreglos de objetos a archivos CSV descargables (Excel compatible)
// Convierte colecciones de datos en cadenas CSV codificadas en UTF-8 y dispara la descarga en el navegador.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Función exportToCsv que recibe el nombre del archivo y la lista de datos.
export function exportToCsv(filename, data) {
  if (!data || !data.length) return false;

  // Obtiene las cabeceras (nombres de las propiedades del primer objeto).
  const headers = Object.keys(data[0]);

  // Construye la fila de cabeceras en formato CSV.
  const csvRows = [headers.join(',')];

  // Recorre cada objeto y convierte sus valores a formato CSV seguro.
  data.forEach((row) => {
    const values = headers.map((header) => {
      const val = row[header];
      const escaped = ('' + (val ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  // Une todas las filas con saltos de línea.
  const csvString = csvRows.join('\n');

  // En entorno del navegador, crea el Blob e inicia la descarga simulada.
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof URL.createObjectURL === 'function') {
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return true;
}
