// src/shared/ui/Badge.jsx — etiqueta de estado con tokens (task 2.3)
// Token-only: colorea según el estado semántico del dominio (no decoración).
// Sin lógica específica de dominio: solo mapea variant → clases Tailwind.

// Mapa de variantes semánticas → clases de fondo y texto (tokens).
const VARIANT_CLASSES = {
  // Estado ok: verde semántico (pago ok, plato listo, mesa libre).
  success: 'bg-semantic-success text-white',
  // Alerta media: ámbar (stock crítico, mesa esperando).
  warning: 'bg-semantic-warning text-brand-950',
  // Urgencia operativa: naranja (spec: urgencia ≠ rojo).
  urgent: 'bg-semantic-urgent text-brand-950',
  // Salud/seguridad: rojo reservado (alergias, emergencias).
  danger: 'bg-semantic-danger text-white',
  // Neutro/informativo: azul de marca (estados sin carga semántica).
  neutral: 'bg-brand-100 text-brand-900',
  // Activo/resaltado: azul fuerte (selección, ticket en curso).
  brand: 'bg-brand-500 text-white',
};

// Badge: píldora compacta de estado. Props: variant (clave del mapa) y children.
export default function Badge({ variant = 'neutral', className = '', children }) {
  // Compone las clases de la píldora con la variante elegida.
  const classes = `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.neutral} ${className}`;
  return (
    // span semánticamente neutro; el significado lo da la variante visual.
    <span className={classes} data-variant={variant}>
      {/* Contenido del badge: texto corto y/o ícono (max: pocos caracteres). */}
      {children}
    </span>
  );
}
