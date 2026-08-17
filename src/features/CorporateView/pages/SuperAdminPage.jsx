// src/features/CorporateView/pages/SuperAdminPage.jsx — placeholder Super Admin (task 2.8)
// Vista "/admin/super" del spec feature-views: placeholder EXPLÍCITO que
// declara la vista como no implementada (escenario "placeholder is explicit").
// NO renderiza ningún widget funcional (spec: "no functional widget is
// rendered") — solo el mensaje y el vínculo de regreso al radar local.

// Link: navegación declarativa de vuelta al radar del Local Admin.
import { Link } from 'react-router-dom';

// SuperAdminPage: placeholder del panel corporativo (fuera del alcance demo).
export default function SuperAdminPage() {
  return (
    // Contenedor claro de marca, centrado como el resto de las vistas demo.
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50 px-6 text-center">
      {/* Badge de estado: aviso de "no implementado" (ámbar de advertencia). */}
      <span className="inline-flex items-center rounded-full bg-semantic-warning px-3 py-1 text-xs font-semibold text-brand-950">
        No implementado
      </span>
      {/* Título del placeholder: declara explícitamente el estado de la vista. */}
      <h1 className="text-3xl font-bold text-brand-900">Super Admin</h1>
      {/* Mensaje: deja claro que el panel corporativo aún no existe en la demo. */}
      <p className="max-w-md text-brand-800/70">
        El panel corporativo de Super Admin aún no está implementado. Esta vista queda reservada
        para la gestión global de locales de la demo.
      </p>
      {/* Sin widgets funcionales (spec); solo el vínculo de regreso al radar. */}
      <Link
        to="/admin"
        // Mismo estilo de CTA primario que shared/ui Button (h-14 + scale activo).
        className="mt-2 inline-flex h-14 items-center rounded-xl bg-brand-500 px-6 font-semibold text-white transition hover:bg-brand-800 active:scale-95"
      >
        Volver al radar local
      </Link>
    </main>
  );
}
