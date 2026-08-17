// src/shared/constants/colors.js — tokens de color de MesaSplit (task 2.3)
// Fuente única de hex en JS: la UI y los helpers leen los colores de acá,
// nunca de literales sueltos. Espeja tailwind.config.js (docs/04).

// Escala de marca "Food-Tech SaaS" (docs/04): azules del sistema.
export const BRAND = {
  // Fondo general en modo claro / texto sobre superficies oscuras.
  50: '#E6F6FF',
  // Fondos secundarios o hovers en modo claro.
  100: '#CDECFE',
  // CTA principal en todas las vistas.
  500: '#04A0FB',
  // Tarjetas y contenedores oscuros (KDS, Mesas).
  800: '#024064',
  // Texto principal sobre fondos claros.
  900: '#012032',
  // Fondo oscuro estricto (Cocina, Local Admin).
  950: '#011623',
};

// Semánticos de negocio: comunican estado, no decoración (spec design-tokens).
export const SEMANTIC = {
  // Pago ok, plato listo, mesa libre.
  success: '#10B981',
  // Stock crítico, mesa esperando (nivel medio de alerta).
  warning: '#F59E0B',
  // Urgencia operativa: NUNCA rojo (spec: red reservado a salud/seguridad).
  urgent: '#FB923C',
  // ROJO: solo alergias y emergencias (docs/04, spec design-tokens).
  danger: '#EF4444',
};

// Mapa plano utilidad: nombre de token → hex, para helpers que necesitan
// recorrer todos los colores o resolver uno por nombre de forma dinámica.
export const TOKEN_MAP = {
  'brand-50': BRAND[50],
  'brand-100': BRAND[100],
  'brand-500': BRAND[500],
  'brand-800': BRAND[800],
  'brand-900': BRAND[900],
  'brand-950': BRAND[950],
  'semantic-success': SEMANTIC.success,
  'semantic-warning': SEMANTIC.warning,
  'semantic-urgent': SEMANTIC.urgent,
  'semantic-danger': SEMANTIC.danger,
};
