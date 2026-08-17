// src/features/RadarView/pages/RadarPage.jsx — Local Admin Radar (task 2.8)
// Ruta "/admin" (index) del spec feature-views: mapa topológico de mesas como
// elemento crítico + feed de excepciones (escenario "radar renders table map").
// La página vive en modo claro (docs/04: admin light); el panel del mapa es la
// "pantalla oscura de radar" (proposal: "Radar renders dark map shell").
// Orquesta el store del slice RadarView (fixtures seed de PR 3).

// useEffect: dispara la "carga" de datos del radar al montar la vista.
import { useEffect } from 'react';
// Badge base: estado del turno en la cabecera de la vista.
import { Badge } from '../../../shared/ui/index.js';
// Store del radar: mesas, excepciones y acciones del slice.
import { useRadarStore } from '../store/useRadarStore.js';
// Mapa topológico de mesas (elemento crítico de la vista).
import TopologicalMap from '../components/TopologicalMap.jsx';
// Feed lateral de excepciones del turno.
import ExceptionFeedDrawer from '../components/ExceptionFeedDrawer.jsx';

// RadarPage: pantalla del Local Admin con el plano del salón.
export default function RadarPage() {
  // Suscripción al store: mesas del salón para el mapa.
  const tables = useRadarStore((s) => s.tables);
  // Excepciones del turno para el feed lateral.
  const exceptions = useRadarStore((s) => s.exceptions);
  // Flag de carga que simula la preparación de datos.
  const loading = useRadarStore((s) => s.loading);
  // Acción de carga del radar (seed local en PR 3).
  const loadTables = useRadarStore((s) => s.loadTables);

  // Dispara la carga del radar UNA vez al montar la vista.
  useEffect(() => {
    // Invoca la acción del store (en PR 4 siembra desde los mocks).
    loadTables();
    // Sin deps: solo al montar (los datos del demo no cambian en sesión).
  }, [loadTables]);

  return (
    // Contenedor claro de la vista admin (docs/04: fondo brand-50).
    <main className="min-h-screen bg-brand-50 px-6 py-6">
      {/* Contenido centrado con ancho máximo de lectura cómoda. */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {/* Cabecera de la vista: identidad del Local Admin y su turno. */}
        <header className="flex items-center justify-between">
          {/* Bloque del título del radar. */}
          <div>
            {/* Título de la vista de administración local. */}
            <h1 className="text-2xl font-bold text-brand-900">Local Admin</h1>
            {/* Subtítulo: contexto del turno en curso. */}
            <p className="text-sm text-brand-800/60">Turno tarde · Visión del salón completa</p>
          </div>
          {/* Badge del estado del radar: operativo (semántica success). */}
          <Badge variant="success">Radar activo</Badge>
        </header>

        {/* Cuerpo de la vista: mapa + feed en grilla de dos zonas. */}
        {loading ? (
          // Estado de carga mientras se "preparan" los datos del radar.
          <p className="py-16 text-center text-brand-800/60">Cargando plano del salón…</p>
        ) : (
          // Grilla: mapa (2/3) a la izquierda y feed de excepciones (1/3).
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Zona del mapa topológico: ocupa dos columnas en desktop. */}
            <section aria-label="Mapa topológico de mesas" className="lg:col-span-2">
              {/* Mapa presentacional con las mesas del store. */}
              <TopologicalMap tables={tables} />
            </section>
            {/* Zona del feed de excepciones: columna lateral. */}
            <section aria-label="Excepciones del turno">
              {/* Feed presentacional con las excepciones del store. */}
              <ExceptionFeedDrawer exceptions={exceptions} />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
