// src/features/KdsView/components/TicketCard.jsx — tarjeta de comanda KDS (kds-kitchen)
// Visualiza una comanda en modo oscuro con semáforos de tiempo, Escudo de Alergias (#EF4444),
// Course Control ("Marchar Ahora" vs "En Espera") y el botón verde "MARCAR LISTO".
// Cumple con las reglas de AGENTS.md (comentarios en español por cada línea).

// Componente presentacional del Escudo de Alergias.
import AllergyShieldAlert from './AllergyShieldAlert.jsx';

// Componente de tarjeta de ticket de comanda de cocina.
export default function TicketCard({ ticket, onComplete, onTogglePrepared }) {
  // Extrae los minutos transcurridos a partir de elapsedSec.
  const elapsedSec = ticket.elapsedSec ?? 0;
  // Convierte los segundos a minutos enteros para calcular la urgencia.
  const elapsedMinutes = Math.floor(elapsedSec / 60);

  // Determina si el ticket tiene alergias declaradas en alguno de sus productos.
  const hasAllergies =
    ticket.hasAllergy ||
    ticket.items.some((item) => item.allergens && item.allergens.length > 0);

  // Recopila todas las alergias únicas declaradas en la comanda.
  const allAllergens = [
    ...new Set(
      ticket.items.flatMap((item) => item.allergens || [])
    ),
  ];

  // Determina la clase del semáforo de tiempo según minutos transcurridos.
  let timeBadgeClass = 'bg-brand-500 text-white';
  let timeLabel = 'En tiempo';

  if (elapsedMinutes >= 20) {
    // Más de 20 minutos: urgencia operativa en NARANJA (#FB923C) parpadeante (nunca rojo puro).
    timeBadgeClass = 'bg-semantic-urgent text-white animate-pulse';
    timeLabel = 'Urgente (+20m)';
  } else if (elapsedMinutes >= 10) {
    // Entre 10 y 20 minutos: advertencia en ÁMBAR (#F59E0B).
    timeBadgeClass = 'bg-semantic-warning text-brand-950 font-bold';
    timeLabel = 'Demorado (+10m)';
  }

  // Separa los ítems por estado de Course Control: activos vs en espera.
  const activeItems = ticket.items.filter((item) => !item.onHold);
  const onHoldItems = ticket.items.filter((item) => item.onHold);

  return (
    // Contenedor principal de la tarjeta: usa borde en Rojo Puro #EF4444 si hay alergias.
    <article
      data-has-allergy={hasAllergies ? 'true' : 'false'}
      className={`flex flex-col gap-3 rounded-2xl bg-brand-800 p-4 shadow-dark-glow transition-all ${
        hasAllergies ? 'border-2 border-semantic-danger shadow-danger-glow' : 'border border-brand-800/80'
      }`}
    >
      {/* Cabecera del ticket: número de mesa, tiempo transcurrido y badge semáforo. */}
      <header className="flex items-start justify-between gap-2 border-b border-brand-500/20 pb-3">
        <div>
          {/* Identificador gigante de la mesa. */}
          <p className="text-xl font-bold text-brand-50">Mesa {ticket.tableNumber}</p>
          {/* Reloj del tiempo transcurrido desde la creación del pedido. */}
          <p className="text-sm font-semibold text-brand-50/70">
            ⏱️ {Math.floor(elapsedSec / 60)}:{(elapsedSec % 60).toString().padStart(2, '0')} min
          </p>
        </div>
        {/* Badge del semáforo de urgencia operativa. */}
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${timeBadgeClass}`}>
            {timeLabel}
          </span>
        </div>
      </header>

      {/* Renderiza el Escudo de Alergias en Rojo Puro si se declararon restricciones médicas. */}
      {hasAllergies && <AllergyShieldAlert allergens={allAllergens} />}

      {/* Sección 1: Ítems en "Marchar Ahora" (Lista activa para cocción). */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-semantic-success">
          ▶️ Marchar Ahora
        </p>
        <ul className="flex flex-col gap-2">
          {activeItems.map((item) => (
            <li
              key={item.id}
              onClick={() => onTogglePrepared && onTogglePrepared(ticket.id, item.id)}
              className={`flex items-center justify-between gap-2 rounded-lg p-2 text-sm transition cursor-pointer ${
                item.prepared ? 'bg-brand-900/60 line-through opacity-60' : 'bg-brand-900/30 text-brand-50 hover:bg-brand-900/80'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Cantidad del producto. */}
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-bold text-white">
                  {item.qty}x
                </span>
                {/* Nombre del plato. */}
                <span className="font-medium">{item.name}</span>
              </div>
              {/* Indicador de tacha manual. */}
              {item.prepared && <span className="text-xs text-semantic-success font-bold">✓ Listo</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* Sección 2: Ítems en "En Espera" (Opacidad al 50% con candado 🔒). */}
      {onHoldItems.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-brand-500/10 pt-2 opacity-50">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-50/60">
            🔒 En Espera (Fondo)
          </p>
          <ul className="flex flex-col gap-1.5">
            {onHoldItems.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-xs text-brand-50/70">
                <span>🔒 {item.qty}x</span>
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pie de tarjeta: estación de cocina y botón verde inmenso "MARCAR LISTO". */}
      <footer className="mt-2 flex flex-col gap-2 border-t border-brand-500/20 pt-3">
        <div className="flex items-center justify-between text-xs text-brand-50/50">
          <span>ESTACIÓN: {ticket.station?.toUpperCase() ?? 'FUEGO'}</span>
        </div>

        {/* Botón Verde inmenso para marcar toda la comanda como lista/despachada. */}
        <button
          type="button"
          onClick={() => onComplete && onComplete(ticket.id)}
          className="w-full rounded-xl bg-semantic-success py-3 text-center text-sm font-bold text-white shadow-lg transition hover:bg-semantic-success/90 active:scale-95"
        >
          ✔️ MARCAR LISTO
        </button>
      </footer>
    </article>
  );
}
