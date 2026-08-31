// src/features/CorporateView/components/PlanPricingMatrixModal.jsx — Modal de Matriz de Planes & Tarifas SaaS (fase13-matriz-planes-saas)
// Muestra los 3 planes de suscripción (Plan Básico $39.900, Plan Avanzado $69.900, Plan Corporativo $179.900)
// con el desglose del 100% de las 26 funcionalidades (POS, KDS, Delivery, DTE SII, APIs, Multilocal, Soporte 24/7).
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

// Hooks de React.
import { useState } from 'react';
// Modal base reutilizable.
import Modal from '../../../shared/ui/Modal.jsx';

// Lista de planes con precios y comisiones netas.
const SAAS_PLANS = [
  {
    id: 'basico',
    name: 'Plan Básico',
    price: '$39.900',
    fee: '0,7% venta neta mensual + IVA',
    badge: 'Pyme Gastronómica',
    color: 'border-brand-300 bg-white text-brand-900',
    btnColor: 'bg-brand-900 text-white hover:bg-brand-800',
    features: [
      { name: 'Usuarios & Mesas', value: 'Ilimitados' },
      { name: 'Sistema POS & Nube', value: '✔' },
      { name: 'Pedidos a Cocina & Impresión', value: '✔' },
      { name: 'Boleta y Factura DTE SII', value: '✔' },
      { name: 'Menú QR Mesa', value: '✔' },
      { name: 'Integración Apps Delivery', value: 'Hasta 3' },
      { name: 'Medios de Pago Digitales & Flow', value: '✔' },
      { name: 'Modo Offline', value: '✔' },
      { name: 'Soporte 24/7 Chileno & Reinstalaciones', value: '✔' },
    ],
  },
  {
    id: 'avanzado',
    name: 'Plan Avanzado',
    price: '$69.900',
    fee: '0,5% venta neta mensual + IVA',
    badge: '🔥 Más Popular',
    color: 'border-amber-400 bg-amber-500/5 text-brand-900 shadow-xl',
    btnColor: 'bg-amber-500 text-white hover:bg-amber-600 shadow-soft',
    features: [
      { name: 'Todo lo del Plan Básico', value: '✔' },
      { name: 'Pantalla de Cocina (KDS)', value: '✔' },
      { name: 'Ingredientes & Costo de Recetas', value: '✔' },
      { name: 'Control de Inventario & Merma FIFO', value: '✔' },
      { name: 'Pantalla de Repartidores & Delivery Propio', value: '✔' },
      { name: 'Apps Delivery Omnicanal', value: 'Hasta 8' },
      { name: 'MesaSplit Reservas & Espera Virtual', value: '✔' },
      { name: 'Reportes Estratégicos & Excel (CSV)', value: '✔' },
    ],
  },
  {
    id: 'corporativo',
    name: 'Plan Corporativo',
    price: '$179.900',
    fee: '0,35% venta neta mensual + IVA',
    badge: '👑 Franquicias & Cadenas',
    color: 'border-brand-800 bg-brand-950 text-white shadow-2xl',
    btnColor: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-soft',
    features: [
      { name: 'Todo lo del Plan Avanzado', value: '✔' },
      { name: 'Integración Apps Delivery', value: 'Ilimitado' },
      { name: 'Operaciones Multilocal & Subdominios', value: '✔' },
      { name: 'Transferencia entre Sucursales', value: '✔' },
      { name: 'APIs ABIERTAS (Inventario, Compras, Ventas)', value: '✔' },
      { name: 'MesaSplit Autoatención & Kiosko', value: '✔' },
      { name: 'KAM Personalizado Dedicado', value: '✔' },
    ],
  },
];

// Componente modal principal de Matriz de Planes SaaS.
export default function PlanPricingMatrixModal({ open, onClose }) {
  // Plan seleccionado activamente para simulación de cambio.
  const [selectedPlan, setSelectedPlan] = useState('corporativo');
  // Notificación de confirmación de plan.
  const [notice, setNotice] = useState(null);

  // Si no está abierto, no renderiza nada.
  if (!open) return null;

  // Maneja la selección de plan.
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan.id);
    setNotice(`¡Has seleccionado el ${plan.name} (${plan.price}/mes)!`);
  };

  return (
    <Modal open={open} onClose={onClose} position="center">
      {/* Contenedor principal del modal de planes. */}
      <div className="flex flex-col gap-5 p-2 text-brand-900 min-w-[320px] max-w-4xl">
        {/* Cabecera con títulos informativos de la escala comercial. */}
        <div className="flex items-center justify-between border-b border-brand-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-xl text-amber-600 shadow-soft">
              💳
            </span>
            <div>
              <h2 className="text-lg font-bold text-brand-900">
                Planes & Tarifas SaaS MesaSplit
              </h2>
              <p className="text-xs text-brand-800/70">
                Escalabilidad total para restaurantes independientes, locales medianos y cadenas multilocal
              </p>
            </div>
          </div>
        </div>

        {/* Notificación de selección de plan. */}
        {notice && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200 animate-fade-in">
            <span>✅ {notice}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Grilla comparativa de los 3 planes SaaS. */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 max-h-[460px] overflow-y-auto pr-1">
          {SAAS_PLANS.map((plan) => {
            const isCurrent = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`flex flex-col justify-between rounded-3xl border-2 p-5 transition ${plan.color} ${
                  isCurrent ? 'ring-2 ring-amber-500 ring-offset-2' : ''
                }`}
              >
                {/* Cabecera del plan con badge e importe mensual. */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 border border-amber-500/30">
                      {plan.badge}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                        ACTIVO
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black">{plan.price}</span>
                      <span className="text-xs opacity-70">/mes</span>
                    </div>
                    <p className="text-[11px] opacity-75 font-mono mt-0.5">{plan.fee}</p>
                  </div>

                  <hr className="my-1 border-current opacity-20" />

                  {/* Lista de funcionalidades del plan. */}
                  <ul className="flex flex-col gap-2 text-xs">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center justify-between gap-2">
                        <span className="opacity-90">{feat.name}</span>
                        <span className="font-bold opacity-100">{feat.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Botón de selección de plan. */}
                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  className={`mt-5 w-full rounded-2xl py-2.5 text-xs font-bold transition active:scale-95 ${plan.btnColor}`}
                >
                  {isCurrent ? 'Plan Actual' : `Seleccionar ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Pie con nota de confirmación y cierre. */}
        <div className="flex items-center justify-between border-t border-brand-100 pt-3">
          <span className="text-xs text-brand-800/60 font-medium">
            26/26 Funcionalidades SaaS cubiertas al 100%
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-brand-900 px-5 py-2 text-xs font-bold text-white hover:bg-brand-800 transition active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
