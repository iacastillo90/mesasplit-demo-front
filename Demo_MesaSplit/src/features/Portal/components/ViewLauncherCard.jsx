// src/features/Portal/components/ViewLauncherCard.jsx — tarjeta lanzadora (task 2.4)
// Componente de un solo launcher del hub Portal: tarjeta clickeable que navega
// a la vista destino. Solo presenta datos (route, título, descripción, tono);
// la lista de vistas la arma PortalPage con los destinos del spec app-routing.

// Link: navegación declarativa de React Router (sin recarga de página).
import { Link } from 'react-router-dom';

// Mapa de tonos de tarjeta → clases de superficie y texto (tokens de marca).
// El launcher de Cocina usa el tono "dark" para anticipar su modo oscuro.
const TONE_CLASSES = {
  // Tarjeta clara por defecto: fondo blanco con sombra suave y resplandor neón en hover.
  light: 'bg-white text-brand-900 shadow-soft hover:shadow-[0_0_25px_rgba(56,189,248,0.2)] hover:border-sky-300 border border-brand-100',
  // Tarjeta oscura (Cocina): modo oscuro KDS con resplandor ámbar.
  dark: 'bg-slate-950 text-white shadow-2xl border border-slate-800 hover:border-amber-500/60 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]',
  // Super Admin / Local Admin: superficie de contraste elevado.
  neutral: 'bg-brand-900 text-white border border-brand-800 hover:border-sky-500/50 hover:shadow-[0_0_25px_rgba(56,189,248,0.2)]',
};

// Card del launcher: recibe el destino, el título, la descripción y el tono.
export default function ViewLauncherCard({ to, title, description, tone = 'light' }) {
  // Resuelve las clases de superficie según el tono elegido por el hub.
  const surfaceClasses = TONE_CLASSES[tone] ?? TONE_CLASSES.light;
  // Compone la tarjeta completa: superficie + hover + feedback de presión.
  const cardClasses = `group flex flex-col gap-3 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] ${surfaceClasses}`;
  return (
    // Link a pantalla completa: toda la tarjeta es el área clickeable.
    <Link to={to} className={cardClasses}>
      {/* Título de la vista destino con tipografía fuerte (legible a la vista). */}
      <h2 className="text-lg font-bold">{title}</h2>
      {/* Descripción breve de qué hace la vista dentro de la demo. */}
      <p
        className={`text-sm leading-relaxed ${tone === 'dark' ? 'text-brand-50/70' : 'text-brand-800/70'}`}
      >
        {description}
      </p>
      {/* Pie de la tarjeta: affordance "abrir vista" alineado al final. */}
      <span
        aria-hidden="true"
        className="mt-auto flex items-center gap-1 text-sm font-semibold text-brand-500"
      >
        Abrir vista
        {/* Flecha que se desplaza sutilmente en hover (refuerza la acción). */}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
