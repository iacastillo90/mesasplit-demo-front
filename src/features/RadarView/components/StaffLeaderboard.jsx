// src/features/RadarView/components/StaffLeaderboard.jsx — panel de gamificación de staff (radar-gamification)
// Componente presentacional read-only que muestra la tabla de clasificación (leaderboard) del personal.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

import { useDemoStore } from '../../../store/useDemoStore.js';
import { useKdsStore } from '../../KdsView/store/useKdsStore.js';
import { selectStaffLeaderboard } from '../services/leaderboardService.js';

export default function StaffLeaderboard() {
  const users = useDemoStore((s) => s.users);
  const kdsTickets = useKdsStore((s) => s.tickets);

  const leaderboard = selectStaffLeaderboard(users, kdsTickets);

  if (leaderboard.length === 0) return null;

  return (
    <div aria-label="Ranking de Desempeño" className="rounded-2xl bg-white p-5 shadow-soft border border-brand-100 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-brand-100 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-500">🏆 Ranking de Desempeño (Gamificación)</h3>
        <span className="text-[11px] font-semibold text-brand-800/60">Turno en vivo</span>
      </div>

      <div className="flex flex-col gap-2">
        {leaderboard.map((staff) => (
          <div
            key={staff.id}
            className="flex items-center justify-between rounded-xl bg-brand-50/50 p-3 border border-brand-100 transition hover:bg-brand-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{staff.badge}</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-brand-900">{staff.name}</span>
                <span className="text-[10px] text-brand-800/60 capitalize">{staff.role} · {staff.salesCountToday} pedidos</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-brand-100 px-2.5 py-1 text-xs font-extrabold text-brand-900">
                {staff.score} pts
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
