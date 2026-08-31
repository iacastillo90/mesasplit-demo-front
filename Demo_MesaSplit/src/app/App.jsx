// src/app/App.jsx — componente raíz de la SPA MesaSplit
// Reemplaza el placeholder del PR 1: ahora monta el data router (RR v6)
// con la tabla de rutas definida en src/routes/index.jsx (task 2.2).

// Suspense: boundary único para todas las vistas lazy de la tabla de rutas.
import { Suspense } from 'react';
// RouterProvider: monta el router de data API de React Router v6 (design D5).
import { RouterProvider } from 'react-router-dom';
// Tabla de rutas (createBrowserRouter) creada en el task 2.2.
import { router } from '../routes/index.jsx';
// Fallback visual mientras resuelven las vistas lazy (solo spinner, tokens).
import RouteFallback from '../routes/RouteFallback.jsx';

// Componente raíz: envuelve el RouterProvider en un Suspense para que las
// vistas diferidas (lazy) muestren un loading en lugar de romper el render.
export default function App() {
  return (
    // Suspense captura la suspensión de cualquier ruta lazy de la tabla.
    <Suspense fallback={<RouteFallback />}>
      {/* RouterProvider ejecuta la tabla de rutas y renderiza la vista match. */}
      <RouterProvider router={router} />
    </Suspense>
  );
}
