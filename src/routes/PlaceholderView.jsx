// src/routes/PlaceholderView.jsx — vista temporal de PR 2 para cada ruta
// MECANISMO PR2 → PR3: las vistas reales viven en src/features/* (PR 3).
// Hoy cada ruta resuelve este placeholder; PR 3 reemplaza SOLO la cadena de
// import dentro de lazy(() => import('...')) por el slice real, sin tocar la
// estructura de la tabla de rutas (src/routes/index.jsx).

// Link: permite volver al hub mientras la vista real no existe.
import { Link } from 'react-router-dom';

// Props: viewName = nombre de la vista que ocupará esta ruta en PR 3.
export default function PlaceholderView({ viewName }) {
  return (
    // Fondo claro de marca, centrado igual que NotFoundPage (patrón del demo).
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50 px-6 text-center">
      {/* Badge de aviso: deja claro que es un esqueleto, no la vista final. */}
      <span className="inline-flex items-center rounded-full bg-semantic-warning px-3 py-1 text-xs font-semibold text-brand-950">
        Vista temporal
      </span>
      {/* Nombre de la vista destino (llega en la fase de features, PR 3). */}
      <h1 className="text-3xl font-bold text-brand-900">{viewName}</h1>
      {/* Explica por qué se ve este esqueleto y qué viene después. */}
      <p className="max-w-md text-brand-800/70">
        El slice real de esta vista se monta en la fase de features (PR 3).
      </p>
      {/* Link de regreso al hub mientras la vista no está implementada. */}
      <Link
        to="/"
        // Mismo estilo de CTA primario que shared/ui (h-14 + active:scale-95).
        className="mt-2 inline-flex h-14 items-center rounded-xl bg-brand-500 px-6 font-semibold text-white transition hover:bg-brand-800 active:scale-95"
      >
        Volver al hub
      </Link>
    </main>
  );
}
