// src/app/NotFoundPage.jsx — vista 404 (ruta catch-all "*" de la tabla)
// Cumple el spec app-routing: cualquier URL fuera de la tabla renderiza esta
// vista sin crashear, y ofrece un link de vuelta al hub en "/".

// Link: navegación declarativa de React Router (sin recargar la página).
import { Link } from 'react-router-dom';

// Componente 404: pantalla centrada con el código, mensaje y retorno al hub.
export default function NotFoundPage() {
  return (
    // Fondo claro de marca y centrado vertical/horizontal (patrón del scaffold).
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50 px-6 text-center">
      {/* Código 404 en grande con el CTA de marca (brand-500). */}
      <p className="text-6xl font-black text-brand-500">404</p>
      {/* Título del error: la URL no corresponde a ninguna vista del demo. */}
      <h1 className="text-2xl font-bold text-brand-900">La página que buscas no existe</h1>
      {/* Ayuda: sugiere revisar la URL o volver al hub para lanzar una vista. */}
      <p className="max-w-md text-brand-800/70">
        Revisá la dirección o volvé al hub para lanzar una de las vistas del demo.
      </p>
      {/* Link de retorno: cumple el escenario "fallback ofrece una vía de vuelta". */}
      <Link
        to="/"
        // Mismo estilo de CTA primario que shared/ui Button (h-14 + active:scale-95).
        className="mt-2 inline-flex h-14 items-center rounded-xl bg-brand-500 px-6 font-semibold text-white transition hover:bg-brand-800 active:scale-95"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
