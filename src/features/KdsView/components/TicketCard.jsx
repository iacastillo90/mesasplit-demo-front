// src/features/KdsView/components/TicketCard.jsx — tarjeta de ticket KDS (task 2.7)
// Tarjeta de comanda de cocina en modo oscuro estricto: superficie brand-800
// (#024064, spec design-tokens) sobre el fondo brand-950 de la página, texto
// claro y semáforo de espera. El rojo (danger) aparece SOLO en el Escudo de
// Alergias; un ticket atrasado usa naranja (urgent) — spec design-tokens.

// Escudo de alergias: alerta roja de salud/seguridad de los ítems.
import AllergyShieldAlert from './AllergyShieldAlert.jsx';

// Mapa estado (TICKET_STATUS) → chip oscuro de la tarjeta (sin superficies claras).
const STATUS_CHIP = {
  // Pendiente: ámbar semántico (espera de preparación).
  pending: { classes: 'bg-semantic-warning text-brand-950', label: 'Pendiente' },
  // En cocción: azul de marca (trabajo en curso).
  cooking: { classes: 'bg-brand-500 text-white', label: 'En cocción' },
  // Listo: verde semántico (éxito, listo para servir).
  ready: { classes: 'bg-semantic-success text-white', label: 'Listo' },
  // Servido: gris oscuro neutro (ciclo cerrado, superficie oscura).
  served: { classes: 'bg-brand-800 text-brand-50/70 ring-1 ring-brand-500/40', label: 'Servido' },
};

// Formatea segundos a "m:ss" para el semáforo de espera del ticket.
// Recibe segundos totales y devuelve el texto compacto del temporizador.
function formatElapsed(sec) {
  // Divide los segundos en minutos y segundos restantes.
  const minutes = Math.floor(sec / 60);
  // Segundos restantes tras quitar los minutos completos.
  const seconds = sec % 60;
  // Devuelve "m:ss" con el segundo siempre a dos dígitos.
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// Tarjeta del ticket: recibe el ticket del store (presentacional).
export default function TicketCard({ ticket }) {
  // Resuelve el chip de estado del ticket (o cae al default pendiente).
  const status = STATUS_CHIP[ticket.status] ?? STATUS_CHIP.pending;
  // Flag: el ticket superó su presupuesto de espera (semáforo naranja).
  const isOverdue = ticket.elapsedSec > ticket.budgetSec;
  // Flag: el ticket tiene al menos un ítem con alergia declarada.
  const hasAllergy = ticket.items.some((item) => item.allergens.length > 0);
  return (
    // Tarjeta oscura brand-800 del ticket (spec: ticket cards brand-800).
    <article className="flex flex-col gap-3 rounded-2xl bg-brand-800 p-4 shadow-dark-glow">
      {/* Cabecera del ticket: mesa, temporizador y estado del pedido. */}
      <header className="flex items-start justify-between gap-2">
        {/* Bloque izquierdo: número de mesa con tipografía grande y clara. */}
        <div>
          {/* Número de mesa: identificación primaria del ticket. */}
          <p className="text-xl font-bold text-brand-50">Mesa {ticket.tableNumber}</p>
          {/* Temporizador: color según el semáforo de espera. */}
          <p
            className={`text-sm font-semibold ${isOverdue ? 'text-semantic-urgent' : 'text-brand-50/70'}`}
          >
            {/* Valor del temporizador formateado a m:ss. */}
            {formatElapsed(ticket.elapsedSec)}
          </p>
        </div>
        {/* Bloque derecho: chip de estado + escudo si el ticket tiene alergias. */}
        <div className="flex flex-col items-end gap-2">
          {/* Chip del estado: semántica del ticket sin superficies claras. */}
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status.classes}`}>
            {status.label}
          </span>
          {/* Indicador de atraso: SOLO naranja urgente (spec: urgencia ≠ rojo). */}
          {isOverdue && (
            <span className="rounded-full bg-semantic-urgent px-2.5 py-1 text-xs font-bold text-brand-950">
              {/* Etiqueta del ticket que superó el presupuesto. */}
              Atrasado
            </span>
          )}
        </div>
      </header>

      {/* Lista de ítems del ticket con su alergia si la declaran. */}
      <ul className="flex flex-col gap-2">
        {/* Renderiza una línea por ítem del ticket. */}
        {ticket.items.map((item) => (
          // Línea del ítem: cantidad, nombre y escudo de alergia.
          <li key={item.id} className="flex flex-wrap items-center gap-2 text-sm text-brand-50">
            {/* Cantidad del ítem en píldora azul (marca, sin superficie clara). */}
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-bold text-white">
              {/* Valor numérico de la cantidad. */}
              {item.qty}
            </span>
            {/* Nombre del plato: texto claro legible a distancia. */}
            <span className="font-medium">{item.name}</span>
            {/* Escudo rojo de alergia: solo si el ítem declara alergias. */}
            <AllergyShieldAlert allergens={item.allergens} />
          </li>
        ))}
      </ul>

      {/* Pie de la tarjeta: banner rojo si hay alergias + estación del ticket. */}
      {hasAllergy && (
        // Barra de salud/seguridad: fondo danger con texto blanco legible.
        <div className="rounded-lg bg-semantic-danger/15 px-3 py-2 text-xs font-bold text-semantic-danger ring-1 ring-semantic-danger/40">
          {/* Mensaje global del ticket: verificar alergias antes de servir. */}
          Verificar alergias antes de servir
        </div>
      )}

      {/* Pie neutro: estación de cocina que prepara el ticket (texto secundario). */}
      <footer className="border-t border-brand-500/20 pt-2 text-xs uppercase tracking-widest text-brand-50/50">
        {/* Nombre de la estación del ticket. */}
        Estación {ticket.station}
      </footer>
    </article>
  );
}
