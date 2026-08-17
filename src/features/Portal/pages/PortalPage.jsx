// src/features/Portal/pages/PortalPage.jsx — hub del demo en la ruta "/" (task 2.4 + demo-controller)
// Landing obligatoria del spec app-routing: lista TODAS las vistas con sus
// tarjetas lanzadoras (Mesa Virtual, Garzón, Cocina, Local Admin y Super Admin Corporativo)
// e incluye una barra interactiva de simulación de eventos en tiempo real (BroadcastChannel).
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

// useMemo: estabiliza la lista de destinos entre renders (datos estáticos).
import { useMemo, useState } from 'react';
// Tarjeta lanzadora de una vista: navega con Link al destino correspondiente.
import ViewLauncherCard from '../components/ViewLauncherCard.jsx';
// Instancia del bus en tiempo real para el controlador de simulación.
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';
// Toast de notificación de eventos simulados.
import { Toast, AppHeader, AppFooter } from '../../../shared/ui/index.js';

// Instancia única del bus de eventos para disparar simulaciones.
const bus = createRealtimeBus('mesasplit');

// Lista estática de destinos del hub: las 5 vistas operacionales de MesaSplit.
const VIEW_DESTINATIONS = [
  {
    to: '/cliente',
    title: 'Mesa Virtual',
    description: 'Menú digital, carrito compartido y división de la cuenta en 4 modos.',
    tone: 'light',
  },
  {
    to: '/garzon',
    title: 'Garzón',
    description: 'Marcaje Ley 40 Horas, comanda con una mano y Escudo de Alergias.',
    tone: 'light',
  },
  {
    to: '/cocina',
    title: 'Cocina',
    description: 'KDS en modo oscuro estricto (#011623), tiempos, Lista 86 y Expo View.',
    tone: 'dark',
  },
  {
    to: '/admin/caja',
    title: 'Caja POS',
    description: 'Cobro de cuentas, boletas DTE, turno de caja, notas de crédito y CFD.',
    tone: 'light',
  },
  {
    to: '/admin',
    title: 'Local Admin',
    description: 'Plano topológico con mapa de calor, delivery omnicanal y gamificación.',
    tone: 'neutral',
  },
  {
    to: '/admin/super',
    title: 'Super Admin',
    description: 'Panel corporativo multi-local, KPIs globales, What-If e Ingeniería de Menú.',
    tone: 'neutral',
  },
];

// PortalPage: página del hub "/" con las tarjetas lanzadoras de cada vista.
export default function PortalPage() {
  // Memoiza la lista de destinos.
  const destinations = useMemo(() => VIEW_DESTINATIONS, []);
  // Estado local para el toast de simulación.
  const [simulationToast, setSimulationToast] = useState(null);

  // Dispara eventos simulados por el bus de tiempo real.
  const triggerSimulation = (topic, payload, message) => {
    bus.publish(topic, payload);
    setSimulationToast(message);
    window.setTimeout(() => setSimulationToast(null), 2500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-50 text-brand-900">
      <AppHeader title="Hub Principal" subtitle="Lanzador de Vistas" currentRoute="/" theme="light" />
      {/* Contenedor claro de marca, scroll vertical completo (docs/04 light). */}
      <main className="flex-1 px-6 py-10">
        {/* Contenido centrado con ancho máximo de lectura. */}
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        {/* Cabecera del hub: identidad + propuesta de la demo. */}
        <header className="flex flex-col gap-2">
          {/* Marca del demo en el CTA de marca. */}
          <p className="text-sm font-bold uppercase tracking-widest text-brand-500">MesaSplit Gastronomía</p>
          {/* Título del hub. */}
          <h1 className="text-3xl font-bold text-brand-900">Plataforma Omnicanal de División de Cuentas</h1>
          {/* Subtítulo de bienvenida. */}
          <p className="text-brand-800/70">
            Seleccioná una vista para operar en tiempo real entre el salón, la cocina y la gerencia corporativa.
          </p>
        </header>

        {/* Control de simulación de eventos multiventana en tiempo real. */}
        <section aria-label="Simulador de eventos" className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-soft border border-brand-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-500">
              ⚡ Simulador de Eventos Multi-Pestaña
            </h2>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Realtime Bus Activo
            </span>
          </div>

          <p className="text-xs text-brand-800/70">
            Abrí varias pestañas del navegador en distintas vistas y dispará un evento global para probar la sincronización automática:
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              type="button"
              onClick={() =>
                triggerSimulation(
                  'payment.qr_received',
                  { tableId: 't-12', amount: 35000, timestamp: Date.now() },
                  '💳 Simulación: Pago QR recibido en Mesa 12',
                )
              }
              className="rounded-xl bg-brand-50 p-2.5 text-xs font-bold text-brand-900 border border-brand-200 hover:bg-brand-100 transition active:scale-95 text-left"
            >
              💳 Pago QR Mesa 12
            </button>

            <button
              type="button"
              onClick={() =>
                triggerSimulation(
                  'order.submitted',
                  { tableId: 't-14', items: [{ name: 'Lomo Lo Ovalle', qty: 2 }], timestamp: Date.now() },
                  '🍳 Simulación: Nueva comanda enviada a KDS Cocina',
                )
              }
              className="rounded-xl bg-brand-50 p-2.5 text-xs font-bold text-brand-900 border border-brand-200 hover:bg-brand-100 transition active:scale-95 text-left"
            >
              🍳 Nueva Comanda KDS
            </button>

            <button
              type="button"
              onClick={() =>
                triggerSimulation(
                  'delivery.received',
                  { platform: 'uber_eats', id: 'DEL-99', total: 18900, timestamp: Date.now() },
                  '🛵 Simulación: Pedido Uber Eats recibido en Radar',
                )
              }
              className="rounded-xl bg-brand-50 p-2.5 text-xs font-bold text-brand-900 border border-brand-200 hover:bg-brand-100 transition active:scale-95 text-left"
            >
              🛵 Delivery Omnicanal
            </button>

            <button
              type="button"
              onClick={() =>
                triggerSimulation(
                  'reservation.created',
                  { customerName: 'Reserva VIP Hub', guests: 4, time: '21:00', zone: 'Terraza', timestamp: Date.now() },
                  '📅 Simulación: Nueva Reserva recibida en Providencia',
                )
              }
              className="rounded-xl bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition active:scale-95 text-left"
            >
              📅 Reserva Providencia
            </button>

            <button
              type="button"
              onClick={() =>
                triggerSimulation(
                  'alert.panic',
                  { branch: 'Salón Las Condes', timestamp: Date.now() },
                  '🚨 Simulación: Botón de Pánico activado',
                )
              }
              className="rounded-xl bg-semantic-danger/10 p-2.5 text-xs font-bold text-semantic-danger border border-semantic-danger/20 hover:bg-semantic-danger/20 transition active:scale-95 text-left"
            >
              🚨 Alerta de Pánico
            </button>
          </div>
        </section>

        {/* Grilla de tarjetas lanzadoras de vistas. */}
        <section aria-label="Vistas del demo" className="grid gap-4 sm:grid-cols-2">
          {destinations.map((view) => (
            <ViewLauncherCard key={view.to} {...view} />
          ))}
        </section>

        {/* Toast flotante de simulación. */}
        {simulationToast && <Toast variant="success" message={simulationToast} />}
      </div>
    </main>
    <AppFooter theme="light" />
  </div>
);
}
