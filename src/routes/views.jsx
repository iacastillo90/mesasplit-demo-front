// src/routes/views.jsx — registro de vistas de la tabla de rutas (tasks 2.2 + 2.4–2.8)
// MECANISMO PR2 → PR3 (completado): la tabla de rutas (index.jsx) referencia
// SOLO estos nombres exportados. PR 3 reemplazó la factory de placeholders por
// los lazy imports de los slices FSD reales (src/features/*). Ningún path de la
// tabla de rutas cambió: el corte fue UNICAMENTE acá (mecanismo documentado).

// lazy: el componente se resuelve recién cuando la ruta se monta (code split).
import { lazy } from 'react';

// Vista del hub Portal ("/"): tarjetas lanzadoras de todas las vistas.
// Slice: src/features/Portal (task 2.4).
export const PortalView = lazy(() => import('../features/Portal/pages/PortalPage.jsx'));

// Mesa Virtual del cliente ("/cliente"): menú, carrito y banner de mesa.
// Slice: src/features/ClientView (task 2.5).
export const ClientView = lazy(() => import('../features/ClientView/pages/ClientPage.jsx'));

// Vista dedicada de comanda y carrito del cliente ("/cliente/carrito").
export const ClientCartView = lazy(() => import('../features/ClientView/pages/ClientCartPage.jsx'));

// Vista del garzón ("/garzon"): grilla de mesas y pad de comanda.
// Slice: src/features/WaiterView (task 2.6).
export const WaiterView = lazy(() => import('../features/WaiterView/pages/WaiterPage.jsx'));

// Cocina KDS ("/cocina"): tickets en modo oscuro estricto (brand-950).
// Slice: src/features/KdsView (task 2.7).
export const KdsView = lazy(() => import('../features/KdsView/pages/KdsPage.jsx'));

// Local Admin Radar ("/admin"): mapa topológico de mesas + feed.
// Slice: src/features/RadarView (task 2.8).
export const RadarView = lazy(() => import('../features/RadarView/pages/RadarPage.jsx'));

// Super Admin ("/admin/super"): placeholder explícito no implementado.
// Slice: src/features/CorporateView (task 2.8).
export const SuperAdminView = lazy(
  () => import('../features/CorporateView/pages/SuperAdminPage.jsx'),
);

// Caja POS ("/admin/caja"): cobro, boletas DTE, arqueo y nota de crédito.
// Slice: src/features/PosView.
export const PosView = lazy(() => import('../features/PosView/pages/PosPage.jsx'));
