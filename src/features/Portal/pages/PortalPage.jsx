// src/features/Portal/pages/PortalPage.jsx — hub del demo en la ruta "/" (task 2.4)
// Landing obligatoria del spec app-routing: lista TODAS las vistas con sus
// tarjetas lanzadoras (escenario "hub lists all views"). Navegar desde acá a
// /cliente, /garzon, /cocina, /admin y /admin/super (escenario "launcher
// navigates to its view"). Es una vista de presentación: no consume stores.

// useMemo: estabiliza la lista de destinos entre renders (datos estáticos).
import { useMemo } from 'react';
// Tarjeta lanzadora de una vista: navega con Link al destino correspondiente.
import ViewLauncherCard from '../components/ViewLauncherCard.jsx';

// Lista estática de destinos del hub: UN dato de configuración del demo.
// Los destinos son exactamente las rutas de la tabla de src/routes/index.jsx.
const VIEW_DESTINATIONS = [
  {
    // Ruta de la Mesa Virtual del cliente (spec app-routing).
    to: '/cliente',
    // Nombre visible de la vista en el hub.
    title: 'Mesa Virtual',
    // Descripción corta del caso de uso del cliente.
    description: 'Menú digital, carrito compartido y división de la cuenta.',
    // Tono claro: la vista cliente vive en modo claro (docs/04).
    tone: 'light',
  },
  {
    // Ruta del garzón (mesero).
    to: '/garzon',
    // Nombre visible del perfil de garzón.
    title: 'Garzón',
    // Descripción del flujo de mesas y comandas del mozo.
    description: 'Grilla de mesas a cargo y pad de comanda para el salón.',
    // Tono claro: la vista garzón también es modo claro.
    tone: 'light',
  },
  {
    // Ruta de la cocina KDS.
    to: '/cocina',
    // Nombre visible de la cocina.
    title: 'Cocina',
    // Descripción del flujo de tickets de cocina.
    description: 'Tickets de preparación en modo oscuro estricto.',
    // Tono oscuro: la card anticipa la superficie brand-950 del KDS.
    tone: 'dark',
  },
  {
    // Ruta del Local Admin (Radar de turno).
    to: '/admin',
    // Nombre visible del radar local.
    title: 'Local Admin',
    // Descripción del mapa topológico de mesas y excepciones.
    description: 'Mapa topológico de mesas y feed de excepciones del turno.',
    // Tono neutro: vista de administración, secundaria en el hub.
    tone: 'neutral',
  },
  {
    // Ruta del Super Admin (anidada bajo /admin).
    to: '/admin/super',
    // Nombre visible del super administrador.
    title: 'Super Admin',
    // Descripción del estado del módulo corporativo.
    description: 'Panel corporativo (placeholder: aún no implementado).',
    // Tono neutral: igual que Local Admin, superficie secundaria.
    tone: 'neutral',
  },
];

// PortalPage: página del hub "/" con las tarjetas lanzadoras de cada vista.
export default function PortalPage() {
  // Memoiza la lista de destinos: no se re-crea en cada render (reference-equal).
  const destinations = useMemo(() => VIEW_DESTINATIONS, []);
  return (
    // Contenedor claro de marca, scroll vertical completo (docs/04 light).
    <main className="min-h-screen bg-brand-50 px-6 py-10">
      {/* Contenido centrado con ancho máximo de lectura (mobile-first). */}
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        {/* Cabecera del hub: identidad + propuesta de la demo. */}
        <header className="flex flex-col gap-2">
          {/* Marca del demo en el CTA de marca (docs/04: azul transmite confianza). */}
          <p className="text-sm font-bold uppercase tracking-widest text-brand-500">MesaSplit</p>
          {/* Título del hub: qué ofrece la demo. */}
          <h1 className="text-3xl font-bold text-brand-900">Demo de división de cuentas</h1>
          {/* Subtítulo que invita a abrir una vista desde los launchers. */}
          <p className="text-brand-800/70">
            Elegí una vista para explorar el flujo completo del salón, la cocina y la
            administración.
          </p>
        </header>
        {/* Grilla de tarjetas lanzadoras: 1 columna mobile, 2 columnas desktop. */}
        <section aria-label="Vistas del demo" className="grid gap-4 sm:grid-cols-2">
          {/* Renderiza una ViewLauncherCard por destino del hub. */}
          {destinations.map((view) => (
            // Key estable: el destino (ruta) identifica cada tarjeta.
            <ViewLauncherCard key={view.to} {...view} />
          ))}
        </section>
        {/* Pie informativo del hub: aclara que es una demo cliente-side. */}
        <footer className="border-t border-brand-100 pt-4 text-xs text-brand-800/60">
          {/* Nota de alcance: sin backend, datos locales simulados. */}
          Demo local con datos simulados — el modo oscuro vive en la cocina.
        </footer>
      </div>
    </main>
  );
}
