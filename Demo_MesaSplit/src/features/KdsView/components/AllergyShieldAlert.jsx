// src/features/KdsView/components/AllergyShieldAlert.jsx — Escudo de Alergias del KDS (kds-kitchen)
// Muestra una alerta destacada en Rojo Puro (#EF4444) para advertir al cocinero sobre restricciones médicas/alergias.
// Cumple con las reglas de AGENTS.md y la Regla de Oro (el rojo puro se usa exclusivamente para alergias/emergencias).

// Componente presentacional del Escudo de Alergias.
export default function AllergyShieldAlert({ allergens }) {
  // Si no hay alergias declaradas, no renderiza nada.
  if (!allergens || allergens.length === 0) return null;

  return (
    // Banner superior parpadeante en Rojo Puro #EF4444 con sombra de riesgo.
    <div
      role="alert"
      className="flex items-center gap-2 rounded-xl bg-semantic-danger px-3 py-2 text-xs font-bold text-white shadow-danger-glow animate-pulse"
    >
      {/* Ícono visual de advertencia de seguridad alimentaria. */}
      <span className="text-base" aria-hidden="true">⚠️</span>
      {/* Texto explícito en mayúsculas con las alergias declaradas. */}
      <span>ALERGIA: {allergens.join(', ').toUpperCase()} DECLARADA POR CLIENTE</span>
    </div>
  );
}
