// src/features/RadarView/components/ExceptionFeedDrawer.jsx — feed de excepciones (task 2.8)
// Shell del feed de excepciones del turno (spec: "exception feed shell present").
// Lista las alertas operativas del Local Admin con su nivel semántico.
// NOTA PR3 → PR4: los ítems llegan hoy del seed del store; en PR 4 el bus
// realtime (order.status.change, allergy.alert) alimenta este feed en vivo.

// Mapa nivel de excepción → clases de chip (fondo tinte + borde + texto).
// danger SOLO para salud/seguridad (alergias) — spec design-tokens.
const LEVEL_CLASSES = {
  // Alerta media: ámbar semántico (stock, esperas cortas).
  warning: 'bg-semantic-warning/10 text-semantic-warning ring-semantic-warning/30',
  // Urgencia operativa: naranja (cobros demorados, NUNCA rojo).
  urgent: 'bg-semantic-urgent/10 text-semantic-urgent ring-semantic-urgent/30',
  // Salud/seguridad: rojo reservado (alergias, emergencias).
  danger: 'bg-semantic-danger/10 text-semantic-danger ring-semantic-danger/40',
};

// Feed de excepciones: recibe el arreglo de excepciones del store.
export default function ExceptionFeedDrawer({ exceptions }) {
  return (
    // Panel del feed: tarjeta blanca del modo claro admin (docs/04).
    <aside className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-soft">
      {/* Cabecera del feed: título + conteo de excepciones activas. */}
      <header className="flex items-center justify-between">
        {/* Título del panel lateral de alertas. */}
        <h3 className="font-bold text-brand-900">Excepciones</h3>
        {/* Conteo de excepciones en el turno. */}
        <span className="text-xs font-semibold text-brand-800/60">{exceptions.length} activas</span>
      </header>

      {/* Cuerpo del feed: lista de excepciones o estado vacío. */}
      {exceptions.length === 0 ? (
        // Estado vacío: sin alertas activas en el turno.
        <p className="py-6 text-center text-sm text-brand-800/60">Sin excepciones en el turno.</p>
      ) : (
        // Lista de excepciones con scroll propio (feed crece con el turno).
        <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
          {/* Renderiza una fila por excepción del turno. */}
          {exceptions.map((exception) => {
            // Resuelve las clases del chip según el nivel de la excepción.
            const levelClasses = LEVEL_CLASSES[exception.level] ?? LEVEL_CLASSES.warning;
            return (
              // Fila de la excepción: chip con tinte semántico y borde.
              <li
                key={exception.id}
                className={`rounded-xl px-3 py-2 text-sm ring-1 ${levelClasses}`}
              >
                {/* Mensaje de la excepción (texto del nivel coloreado). */}
                <p className="font-medium">{exception.message}</p>
                {/* Contexto: mesa asociada a la excepción, si existe. */}
                {exception.table && (
                  // Referencia a la mesa en texto mini del mismo tono.
                  <p className="mt-0.5 text-xs opacity-70">Mesa {exception.table}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
