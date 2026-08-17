// src/routes/views.jsx — registro de vistas de la tabla de rutas (task 2.2)
// MECANISMO PR2 → PR3 (documentado): la tabla de rutas (index.jsx) referencia
// SOLO estos nombres. Las páginas reales viven en src/features/* y se crean
// en PR 3; hoy cada vista es un placeholder lazy con el nombre del slice.
// PR 3 edita UNICAMENTE este archivo (la cadena de import de cada lazy),
// sin tocar ni un path de la tabla de rutas.

// lazy: el componente se resuelve recién cuando la ruta se monta (code split).
import { lazy } from 'react';
// NOTA: PlaceholderView NO se importa estático aquí; se carga por el import
// dinámico de la factory (import('./PlaceholderView.jsx')) para que PR 3
// reemplace solo esa cadena por el slice real.

// Factory: devuelve un lazy que renderiza el placeholder con el nombre dado.
// PR 3 reemplaza el cuerpo de esta factory o cada vista individual por
// lazy(() => import('../features/<Slice>/pages/<Page>.jsx')).
const placeholderView = (viewName) =>
  // Import dinámico del placeholder; PR 3 cambia esta cadena por el slice.
  lazy(() =>
    // El módulo default del placeholder se envuelve con el nombre de la vista.
    import('./PlaceholderView.jsx').then((mod) => ({
      // Devuelve el componente con la prop viewName ya fijada.
      default: () => <mod.default viewName={viewName} />,
    })),
  );

// Vistas exportadas: los nombres que la tabla de rutas importa y usa.
// PR 3 mantiene estos mismos nombres (export) y solo cambia sus imports.
export const PortalView = placeholderView('Portal Hub');
export const ClientView = placeholderView('Mesa Virtual (Cliente)');
export const WaiterView = placeholderView('Waiter (Garzón)');
export const KdsView = placeholderView('KDS Cocina');
export const RadarView = placeholderView('Local Admin Radar');
export const SuperAdminView = placeholderView('Super Admin');
