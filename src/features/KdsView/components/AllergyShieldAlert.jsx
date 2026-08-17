// src/features/KdsView/components/AllergyShieldAlert.jsx — escudo de alergias (task 2.7)
// Alerta de salud/seguridad del ticket: SOLO rojo semántico (danger #EF4444).
// El spec design-tokens reserva el rojo para alergias y emergencias; cualquier
// otra urgencia operativa debe usar naranja (urgent), nunca este componente.
// El resplandor danger-glow refuerza la alerta en la pantalla de cocina.

// Escudo de alergias: píldora roja con las alergias declaradas del ítem.
export default function AllergyShieldAlert({ allergens }) {
  // Si no hay alergias declaradas, no renderiza nada (sin falso positivo).
  if (!allergens || allergens.length === 0) return null;
  return (
    // Píldora roja de salud/seguridad con resplandor danger-glow (shadow token).
    <span
      role="alert"
      className="inline-flex items-center gap-1 rounded-full bg-semantic-danger px-2.5 py-1 text-[11px] font-bold text-white shadow-danger-glow"
    >
      {/* Símbolo de advertencia de la alerta (salud/seguridad). */}
      <span aria-hidden="true">⚠</span>
      {/* Etiqueta que identifica la naturaleza de la alerta. */}
      Alergia:
      {/* Lista de alergias declaradas separadas por coma. */}
      {allergens.join(', ')}
    </span>
  );
}
