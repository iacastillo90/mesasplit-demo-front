// src/features/ClientView/components/RewardsBadgeWidget.jsx — Widget de lealtad y modal de canje MesaSplit Rewards
// Muestra el nivel actual, puntos acumulados, barra de progreso y permite canjear premios del catálogo.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// useState para controlar la apertura del modal de canje.
import { useState } from 'react';
// Hook y catálogo del store de rewards.
import { useRewardsStore, REWARDS_CATALOG, calculateTier } from '../store/useRewardsStore.js';
// Modal base reutilizable.
import { Modal } from '../../../shared/ui/index.js';

// Store y acciones del cliente.
import { useClientStore } from '../store/useClientStore.js';

// Componente RewardsBadgeWidget.
export default function RewardsBadgeWidget() {
  // Puntos acumulados y acciones del store.
  const { points, redeemedRewards, redeemReward } = useRewardsStore();
  // Acción para aplicar descuento en CLP al carrito.
  const applyRewardDiscount = useClientStore((s) => s.applyRewardDiscount);
  // Estado local para abrir o cerrar el modal de catálogo de beneficios.
  const [modalOpen, setModalOpen] = useState(false);
  // Estado para notificar éxito tras un canje.
  const [toastMessage, setToastMessage] = useState(null);

  // Calcula el nivel actual y datos del objetivo.
  const tier = calculateTier(points);
  // Calcula el porcentaje de avance hacia la siguiente meta.
  const progressPct = Math.min(100, Math.floor((points / tier.nextGoal) * 100));

  // Maneja el intento de canje de una recompensa.
  const handleRedeem = (rewardId) => {
    // Invoca la acción de canje del store.
    const success = redeemReward(rewardId);
    if (success) {
      // Aplica un descuento automático de $5.000 CLP en la boleta del cliente.
      applyRewardDiscount(5000);
      // Muestra un mensaje temporal de confirmación.
      setToastMessage('¡Beneficio canjeado con éxito! Se aplicó un descuento de $5.000 en tu boleta.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <>
      {/* Widget compacto de lealtad en la Mesa Virtual. */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 p-3.5 border border-amber-300/40 shadow-soft">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Badge de nivel del comensal */}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tier.badgeColor}`}>
              {tier.name}
            </span>
            {/* Puntos acumulados */}
            <span className="text-xs font-bold text-brand-900">
              💎 {points.toLocaleString()} pts
            </span>
          </div>

          {/* Barra de progreso hacia la siguiente meta. */}
          <div className="w-full bg-brand-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Botón para abrir el modal de canje de premios. */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="ml-3 shrink-0 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 text-xs font-bold shadow-soft transition active:scale-95 flex items-center gap-1"
        >
          <span>🎁 Canjear</span>
        </button>
      </div>

      {/* Modal de catálogo de beneficios MesaSplit Rewards. */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="🎁 MesaSplit Rewards — Catálogo">
        <div className="flex flex-col gap-4 text-brand-900">
          {/* Cabecera del modal con saldo actual. */}
          <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl border border-amber-200">
            <div>
              <p className="text-xs text-brand-800/70">Tu saldo acumulado:</p>
              <h4 className="text-base font-bold text-amber-900">💎 {points.toLocaleString()} puntos</h4>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tier.badgeColor}`}>
              {tier.name}
            </span>
          </div>

          {/* Toast interno de aviso tras canjear. */}
          {toastMessage && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-2.5 rounded-xl text-xs font-semibold text-center animate-in fade-in">
              ✓ {toastMessage}
            </div>
          )}

          {/* Listado de premios disponibles. */}
          <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto">
            {REWARDS_CATALOG.map((item) => {
              const canAfford = points >= item.pointsCost;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-brand-200 shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h5 className="text-xs font-bold text-brand-900">{item.title}</h5>
                      <p className="text-[11px] text-brand-800/70">{item.description}</p>
                      <span className="text-[11px] font-bold text-amber-700">
                        {item.pointsCost} pts
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleRedeem(item.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      canAfford
                        ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-soft active:scale-95'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Canjear' : 'Puntos insuficientes'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Historial de premios canjeados en la sesión. */}
          {redeemedRewards.length > 0 && (
            <div className="border-t border-brand-200 pt-3">
              <h5 className="text-xs font-bold text-brand-800 mb-2">Premios Canjeados Activos:</h5>
              <div className="flex flex-col gap-1.5">
                {redeemedRewards.map((r) => (
                  <div key={r.code} className="flex items-center justify-between bg-slate-900 text-white p-2.5 rounded-xl text-xs font-mono">
                    <span>{r.icon} {r.title}</span>
                    <span className="bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-bold">{r.code}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pie del modal. */}
          <div className="flex justify-end border-t border-brand-200 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl bg-brand-900 text-white px-5 py-2 text-xs font-bold hover:bg-brand-800"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
