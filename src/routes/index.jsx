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
  ClientCartView,
  ClientLoginView,
  ClientRegisterView,
  ClientQrScanView,
  ClientProfileView,
  KdsView,
  PortalView,
  PosView,
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

// Tabla de rutas de la SPA: la MISMA definición para el router de la app y para
// los routers de memoria de los tests (design: "memory router for non-/ paths").
// PR 4 extrajo el arreglo a un export nombrado SIN cambiar paths/index/nested/
// catch-all: el router de producción se construye a partir de routes y los tests
// crean su createMemoryRouter con la misma fuente (cero divergencias).
export const routes = [
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
  // Ruta de la comanda y carrito del cliente.
  {
    path: '/cliente/carrito',
    element: withSuspense(<ClientCartView />),
  },
  // Ruta de inicio de sesión del cliente.
  {
    path: '/cliente/login',
    element: withSuspense(<ClientLoginView />),
  },
  // Ruta de registro de nuevo cliente con Ley N° 21.716.
  {
    path: '/cliente/registro',
    element: withSuspense(<ClientRegisterView />),
  },
  // Ruta del simulador de escaneo QR de mesa.
  {
    path: '/cliente/scan',
    element: withSuspense(<ClientQrScanView />),
  },
  // Ruta del Perfil completo de usuario comensal.
  {
    path: '/cliente/perfil',
    element: withSuspense(<ClientProfileView />),
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
      // /admin/caja: Caja POS de cobro, turno de caja y notas de crédito.
      {
        path: 'caja',
        element: withSuspense(<PosView />),
      },
      // /admin/super: hijo anidado con Super Admin Corporativo.
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
];

// Router único de la app (producción): build sobre la tabla compartida.
// React Router v6 data router montado por RouterProvider en src/app/App.jsx.
export const router = createBrowserRouter(routes);
