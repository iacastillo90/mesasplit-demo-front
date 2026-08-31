// tailwind.config.js — tokens de diseño de MesaSplit (fuente única, docs/04)
// Cualquier color en la UI debe venir de esta paleta, nunca de hex sueltos.

/** @type {import('tailwindcss').Config} */
export default {
  // darkMode por clase: el modo oscuro se activa con `dark` en el HTML,
  // permitiendo que KDS/Admin usen dark solo en sus vistas.
  darkMode: 'class',
  // Archivos que Tailwind escanea para detectar clases usadas.
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Escala base "Food-Tech SaaS" (docs/04): azul de marca.
        brand: {
          50: '#E6F6FF', // Fondo general modo claro / texto sobre oscuro claro
          100: '#CDECFE', // Fondos secundarios / hover en modo claro
          500: '#04A0FB', // CTA principal en todas las vistas
          800: '#024064', // Tarjetas y contenedores oscuros (KDS, Mesas)
          900: '#012032', // Texto principal sobre fondos claros
          950: '#011623', // Fondo oscuro estricto (Cocina, Local Admin)
        },
        // Semánticos de negocio: comunican estado, no decoración.
        semantic: {
          success: '#10B981', // Pago ok, plato listo, mesa libre
          warning: '#F59E0B', // Stock crítico, mesa esperando
          urgent: '#FB923C', // Urgencia operativa (nunca rojo)
          danger: '#EF4444', // ROJO: solo alergias/emergencias (docs/04)
        },
      },
      fontFamily: {
        // Inter como fuente principal con fallbacks de sistema (spec design-tokens).
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Sombra suave para tarjetas de vistas claras (cliente/POS).
        soft: '0 4px 20px -2px rgba(1, 32, 50, 0.08)',
        // Resplandor azul para botones activos en KDS/Mozo (modo oscuro).
        'dark-glow': '0 0 15px rgba(4, 160, 251, 0.15)',
        // Resplandor rojo para el Escudo de Alergias (salud y seguridad).
        'danger-glow': '0 0 15px rgba(239, 68, 68, 0.4)',
      },
    },
  },
  plugins: [],
};
