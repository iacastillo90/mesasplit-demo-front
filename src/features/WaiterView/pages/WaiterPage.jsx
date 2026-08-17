// src/features/WaiterView/pages/WaiterPage.jsx — vista del garzón (task 2.6)
// Ruta "/garzon" del spec feature-views: grilla de mesas asignadas (sourced
// desde la capa de servicios) + pad de comanda de la mesa seleccionada
// (escenario "waiter screen shows tables"). Modo claro (docs/04).
// Orquesta servicio (datos) y store (estado) del slice WaiterView.

// useEffect: dispara la carga de mesas al montar la vista.
import { useEffect, useMemo } from 'react';
// Badge base: identidad del garzón en la cabecera.
import { Badge } from '../../../shared/ui/index.js';
// Store del slice: mesas, selección y acciones del garzón.
import { useWaiterStore } from '../store/useWaiterStore.js';
// Grilla de mesas asignadas (presentacional, recibe datos por props).
import TableGrid from '../components/TableGrid.jsx';
// Pad de comanda de la mesa seleccionada (shell, recibe la mesa por props).
import OrderPad from '../components/OrderPad.jsx';

// WaiterPage: pantalla principal del garzón con grilla y pad de comanda.
export default function WaiterPage() {
  // Suscripción al store: mesas asignadas al garzón.
  const tables = useWaiterStore((s) => s.tables);
  // Id de la mesa seleccionada para la comanda (null = sin selección).
  const selectedTableId = useWaiterStore((s) => s.selectedTableId);
  // Flag de carga de la primera llamada al servicio.
  const loading = useWaiterStore((s) => s.loading);
  // Acción de carga inicial de mesas (se dispara una vez abajo).
  const loadTables = useWaiterStore((s) => s.loadTables);
  // Acción de seleccionar/limpiar la mesa activa del pad.
  const selectTable = useWaiterStore((s) => s.selectTable);

  // Carga las mesas asignadas UNA vez al montar la vista.
  useEffect(() => {
    // Invoca la acción del store que resuelve las mesas del servicio.
    loadTables();
    // Sin deps: solo al montar (los datos del demo no cambian en sesión).
  }, [loadTables]);

  // Resuelve el objeto de la mesa seleccionada para el pad (o null).
  const selectedTable = useMemo(
    // Busca en la lista la mesa cuyo id coincide con la selección.
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    // Recalcula solo si cambian las mesas o la selección.
    [tables, selectedTableId],
  );

  return (
    // Contenedor claro de la vista del garzón (docs/04: fondo brand-50).
    <main className="min-h-screen bg-brand-50 px-6 py-6">
      {/* Contenido centrado con ancho máximo de lectura cómoda. */}
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {/* Cabecera de la vista: identidad del garzón y su turno. */}
        <header className="flex items-center justify-between">
          {/* Bloque del título del perfil de garzón. */}
          <div>
            {/* Título grande de la vista. */}
            <h1 className="text-2xl font-bold text-brand-900">Garzón</h1>
            {/* Subtítulo: turno actual del demo. */}
            <p className="text-sm text-brand-800/60">Turno tarde · Salón principal</p>
          </div>
          {/* Badge de identidad del garzón logueado (demo). */}
          <Badge variant="brand">Pedro Soto</Badge>
        </header>

        {/* Sección de mesas asignadas: título con el total en el salón. */}
        <section aria-label="Mesas asignadas">
          {/* Título de la sección con la cantidad de mesas a cargo. */}
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-500">
            Mis mesas ({tables.length})
          </h2>
          {/* Grilla de mesas o estado de carga mientras resuelve el servicio. */}
          {loading ? (
            // Mensaje de carga mientras llegan las mesas del servicio.
            <p className="py-10 text-center text-brand-800/60">Cargando mesas…</p>
          ) : (
            // Grilla presentacional con mesas, selección y handler de click.
            <TableGrid tables={tables} selectedTableId={selectedTableId} onSelect={selectTable} />
          )}
        </section>

        {/* Pad de comanda: muestra la mesa seleccionada y su comanda. */}
        <section aria-label="Comanda de la mesa seleccionada">
          {/* Título de la sección del pad de comanda. */}
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-500">
            Comanda
          </h2>
          {/* Pad: mesa seleccionada y cierre (limpia la selección en el store). */}
          <OrderPad table={selectedTable} onClose={() => selectTable(null)} />
        </section>
      </div>
    </main>
  );
}
