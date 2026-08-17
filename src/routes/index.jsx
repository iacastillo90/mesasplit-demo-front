// src/routes/index.jsx — tabla de rutas de la SPA MesaSplit (task 2.2)
// Crea el data router (createBrowserRouter, design D5) con las 7 rutas del
// spec app-routing: hub, cliente, garzón, cocina, admin (index→Radar),
// admin/super (hijo anidado) y catch-all "*" → 404.
//
// MECANISMO PR2 → PR3: la tabla SOLO referencia los nombres exportados de
// ./views.jsx. PR 3 edita únicamente views.jsx (imports de los slices reales)
// sin tocar esta tabla: paths, index, nested y catch-all quedan iguales.

// React Router v6: createBrowserRouter construye la tabla declarativa.
import { createBrowserRouter } from 'react-router-dom';
// Suspense: necesario para renderizar componentes lazy dentro del router.
import { Suspense } from 'react';
// Vista 404 del task 2.1: fallback de cualquier ruta desconocida.
import NotFoundPage from '../app/NotFoundPage.jsx';
// Vistas de la tabla (placeholders temporales hasta PR 3).
import {
  ClientView,
  KdsView,
  PortalView,
  RadarView,
  SuperAdminView,
  WaiterView,
} from './views.jsx';
// Fallback de Suspense mientras se resuelve el import dinámico de una ruta.
import RouteFallback from './RouteFallback.jsx';

// Envuelve cada vista lazy en su propio Suspense con el fallback de carga.
// Se evita repetir el wrapper en las 7 rutas (DRY dentro del módulo).
const withSuspense = (view) => (
  // Suspense captura la suspensión del lazy y muestra el spinner.
  <Suspense fallback={<RouteFallback />}>{view}</Suspense>
);

// Router único de la app: la tabla de 7 rutas del spec app-routing.
export const router = createBrowserRouter([
  // Ruta raíz del hub: es la landing por defecto (spec "root renders hub").
  {
    path: '/',
    element: withSuspense(<PortalView />),
  },
  // Ruta de la Mesa Virtual del cliente.
  {
    path: '/cliente',
    element: withSuspense(<ClientView />),
  },
  // Ruta del Waiter (garzón).
  {
    path: '/garzon',
    element: withSuspense(<WaiterView />),
  },
  // Ruta de la cocina KDS (modo oscuro, llega en PR 3).
  {
    path: '/cocina',
    element: withSuspense(<KdsView />),
  },
  // Estructura del slot de admin: index → Radar, /super hijo anidado.
  {
    path: '/admin',
    children: [
      // /admin (index) renderiza el Local Admin Radar (spec admin slot).
      {
        index: true,
        element: withSuspense(<RadarView />),
      },
      // /admin/super: hijo anidado con el placeholder de Super Admin.
      {
        path: 'super',
        element: withSuspense(<SuperAdminView />),
      },
    ],
  },
  // Catch-all: cualquier ruta fuera de la tabla cae en la página 404.
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
