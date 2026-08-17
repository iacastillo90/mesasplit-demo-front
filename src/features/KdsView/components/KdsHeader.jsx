// src/features/KdsView/components/KdsHeader.jsx — cabecera de cocina (task 2.7)
// Cabecera del KDS en modo oscuro estricto: superficie brand-950 (igual que el
// fondo de la página) y texto claro. Presentacional: recibe el conteo de
// tickets en curso por props. Ninguna superficie clara acá (spec: sin leakage).

// Cabecera del KDS: título de la estación de trabajo + resumen del flujo.
export default function KdsHeader({ activeCount }) {
  return (
    // Barra superior: separada del fondo por un borde sutil muy oscuro.
    <header className="flex items-center justify-between border-b border-brand-800/60 px-6 py-4">
      {/* Bloque del título de la cocina. */}
      <div>
        {/* Título de la vista: legible a distancia (texto brand-50). */}
        <h1 className="text-2xl font-bold text-brand-50">Cocina</h1>
        {/* Subtítulo: turno actual del servicio (texto secundario claro). */}
        <p className="text-sm text-brand-50/60">Turno tarde · Preparación en vivo</p>
      </div>
      {/* Contador de tickets activos: píldora oscura con texto claro. */}
      <span className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-3 py-1.5 text-sm font-semibold text-brand-50">
        {/* Punto de estado: verde semántico (cocina operativa). */}
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-semantic-success" />
        {/* Cantidad de tickets en curso en la cocina. */}
        {activeCount} tickets
      </span>
    </header>
  );
}
