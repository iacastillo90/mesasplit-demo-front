// src/routes/RouteFallback.jsx — fallback de Suspense para vistas lazy
// Se muestra mientras React resuelve un import dinámico de la tabla de rutas.

// Componente de carga: spinner puro con tokens de marca (sin texto alguno).
export default function RouteFallback() {
  return (
    // Centra el spinner en pantalla completa con el fondo claro del demo.
    <div className="flex min-h-screen items-center justify-center bg-brand-50">
      {/* Spinner con la paleta brand: borde claro y sección superior azul. */}
      <span
        aria-label="Cargando"
        className="h-8 w-8 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500"
      />
    </div>
  );
}
