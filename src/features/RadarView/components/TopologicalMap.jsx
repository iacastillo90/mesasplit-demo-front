// src/features/RadarView/components/TopologicalMap.jsx — mapa topológico (task 2.8)
// Elemento MÁS CRÍTICO de la demo (spec feature-views): mapa visual de mesas
// con posición "topológica" (relación espacial aproximada, no geográfica real).
// El panel vive en superficie oscura brand-950 (estilo "pantalla de radar") y
// cada mesa es un nodo posicionado por su x,y NORMALIZADO (0–100) del fixture.
// Presentacional: recibe las mesas por props y las colorea por TABLE_STATUS.

// Mapa estado (TABLE_STATUS) → clases de borde del nodo + color del punto.
// Los colores salen de la paleta semántica (spec design-tokens; urgent nunca rojo).
const NODE_STATUS = {
  // Mesa libre: borde verde semántico (lista para recibir).
  free: { border: 'border-semantic-success', dot: 'bg-semantic-success', label: 'Libre' },
  // Mesa ocupada: borde azul de marca (comensales presentes).
  occupied: { border: 'border-brand-500', dot: 'bg-brand-500', label: 'Ocupada' },
  // Mesa cobrando: borde naranja urgente (operación en curso).
  billing: { border: 'border-semantic-urgent', dot: 'bg-semantic-urgent', label: 'Cobrando' },
  // Mesa en limpieza: borde ámbar de advertencia media.
  cleaning: { border: 'border-semantic-warning', dot: 'bg-semantic-warning', label: 'Limpieza' },
};

// Mapa topológico: recibe las mesas del store y las posiciona en el plano.
export default function TopologicalMap({ tables }) {
  return (
    // Panel oscuro del radar: fondo brand-950 con borde sutil (pantalla de admin).
    <div className="flex flex-col overflow-hidden rounded-2xl bg-brand-950 shadow-dark-glow">
      {/* Barra superior del panel: título y conteo de mesas en el plano. */}
      <div className="flex items-center justify-between border-b border-brand-800/60 px-4 py-3">
        {/* Título de la herramienta del Local Admin. */}
        <h3 className="font-bold text-brand-50">Plano del salón</h3>
        {/* Conteo de mesas dibujadas en el mapa (texto secundario claro). */}
        <span className="text-sm text-brand-50/60">{tables.length} mesas</span>
      </div>

      {/* Área del plano: contenedor relativo donde se posicionan los nodos. */}
      <div className="relative h-[420px] sm:h-[520px]">
        {/* Renderiza un nodo de mesa por cada mesa del fixture. */}
        {tables.map((table) => {
          // Resuelve las clases del nodo según el estado de la mesa.
          const nodeStatus = NODE_STATUS[table.status] ?? NODE_STATUS.free;
          // Estilo de posicionamiento: x% e y% (topología normalizada 0–100).
          const positionStyle = { left: `${table.x}%`, top: `${table.y}%` };
          // Flag: mesa en estado operativo activo (ocupada o cobrando).
          const isActive = table.status === 'occupied' || table.status === 'billing';
          return (
            // Nodo de la mesa: círculo oscuro posicionado en el plano.
            <div
              key={table.id}
              style={positionStyle}
              className={`absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 bg-brand-800 transition sm:h-16 sm:w-16 ${
                // Borde según el estado (token semántico del mapa).
                nodeStatus.border
              } ${isActive ? 'shadow-dark-glow' : ''}`}
            >
              {/* Número de la mesa: texto claro legible sobre el nodo oscuro. */}
              <span className="text-sm font-bold leading-none text-brand-50">{table.number}</span>
              {/* Capacidad de la mesa en texto mini secundario. */}
              <span className="mt-0.5 text-[10px] leading-none text-brand-50/50">
                {table.seats}p
              </span>
            </div>
          );
        })}
      </div>

      {/* Leyenda del mapa: mapea cada estado semántico a su color y label. */}
      <div className="flex flex-wrap items-center gap-3 border-t border-brand-800/60 px-4 py-3">
        {/* Renderiza una entrada de leyenda por estado del enum. */}
        {Object.entries(NODE_STATUS).map(([status, view]) => (
          // Entrada de leyenda: punto de color + etiqueta del estado.
          <span key={status} className="inline-flex items-center gap-1.5 text-xs text-brand-50/70">
            {/* Punto de color del estado (token semántico). */}
            <span aria-hidden="true" className={`h-2 w-2 rounded-full ${view.dot}`} />
            {/* Etiqueta del estado en texto claro. */}
            {view.label}
          </span>
        ))}
      </div>
    </div>
  );
}
