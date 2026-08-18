// src/features/RadarView/components/StaffLeaderboard.jsx — panel de gamificación de staff (radar-gamification)
// Componente presentacional read-only que muestra la tabla de clasificación (leaderboard) del personal.
// Soporta tema dinámico Claro ☀️ y Oscuro 🌙 con useThemeStore.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por cada línea en español).

import { useDemoStore } from '../../../store/useDemoStore.js';
import { useKdsStore } from '../../KdsView/store/useKdsStore.js';
import { selectStaffLeaderboard } from '../services/leaderboardService.js';
import { useThemeStore } from '../../../shared/store/useThemeStore.js';

export default function StaffLeaderboard() {
  const users = useDemoStore((s) => s.users);
  const kdsTickets = useKdsStore((s) => s.tickets);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const leaderboard = selectStaffLeaderboard(users, kdsTickets);

  if (leaderboard.length === 0) return null;

  return (
    <div
      aria-label="Ranking de Desempeño"
      className={`rounded-2xl p-5 border transition-colors flex flex-col gap-4 ${
        isDark ? 'bg-brand-900 border-brand-800 text-brand-50 shadow-xl' : 'bg-white border-brand-200 text-brand-900 shadow-soft'
      }`}
    >
      <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-brand-800' : 'border-brand-100'}`}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-500">🏆 Ranking de Desempeño (Gamificación)</h3>
        <span className={`text-[11px] font-semibold ${isDark ? 'text-brand-50/60' : 'text-brand-800/60'}`}>Turno en vivo</span>
      </div>

      <div className="flex flex-col gap-2">
        {leaderboard.map((staff) => (
          <div
            key={staff.id}
            className={`flex items-center justify-between rounded-xl p-3 border transition ${
              isDark ? 'bg-brand-950/60 border-brand-800 hover:bg-brand-800' : 'bg-brand-50/50 border-brand-100 hover:bg-brand-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{staff.badge}</span>
              <div className="flex flex-col">
                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-brand-900'}`}>{staff.name}</span>
                <span className={`text-[10px] capitalize ${isDark ? 'text-brand-50/60' : 'text-brand-800/60'}`}>{staff.role} · {staff.salesCountToday} pedidos</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-brand-500/10 border border-brand-500/30 px-2.5 py-1 text-xs font-extrabold text-brand-500">
                {staff.score} pts
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
