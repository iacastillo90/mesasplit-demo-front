// src/shared/ui/Button.jsx — botón base reutilizable (task 2.3)
// Token-only: estilo exclusivamente con la paleta de marca/semántica.
// Sin lógica de dominio; props: variant, disabled y las de <button>.

// Mapa de variantes → clases utilitarias de Tailwind (tokens, sin hex sueltos).
const VARIANT_CLASSES = {
  // CTA principal: fondo brand-500 (spec design-tokens, escenario Button).
  primary: 'bg-brand-500 text-white hover:bg-brand-800 active:bg-brand-800',
  // Acción secundaria: contorno sutil sobre el fondo claro (brand-100).
  secondary: 'bg-brand-100 text-brand-900 hover:bg-brand-50',
  // Acción peligrosa: reservado a salud/seguridad (semantic-danger).
  danger: 'bg-semantic-danger text-white hover:bg-semantic-danger/90',
  // Variante fantasma: invisible hasta el hover (para acciones inline).
  ghost: 'bg-transparent text-brand-900 hover:bg-brand-100',
};

// Botón base de la demo: alto táctil h-14 y feedback de presión mobile.
// Recibe variant (clave del mapa), children y el resto de props de button.
export default function Button({ variant = 'primary', className = '', children, ...props }) {
  // Clases base: alto táctil, radius, transición y feedback activo (spec).
  // active:scale-95 da respuesta física al toque en celulares (h-14 mobile).
  const baseClasses =
    'inline-flex h-14 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50';
  // Compone base + variante + clases extra del consumidor (para tamaños).
  const classes = `${baseClasses} ${VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary} ${className}`;
  return (
    // type="button" por defecto: evita submits accidentales dentro de forms.
    <button type="button" className={classes} {...props}>
      {/* Cualquier contenido: label, icono, loading, etc. */}
      {children}
    </button>
  );
}
