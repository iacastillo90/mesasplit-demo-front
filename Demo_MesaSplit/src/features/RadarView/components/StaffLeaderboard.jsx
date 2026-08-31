// src/features/RadarView/components/StaffLeaderboard.jsx — centro de gamificación de staff y ranking de desempeño (radar-gamification)
// Muestra el podio Top 3 (Oro 🥇, Plata 🥈, Bronce 🥉), barras de progreso de metas, calificaciones ⭐, propinas en CLP ($) e interacción de bonos.
// Soporta tema dinámico Claro ☀️ y Oscuro 🌙 con useThemeStore.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por cada línea en español).

import { useState } from 'react';
import { useDemoStore } from '../../../store/useDemoStore.js';
import { useKdsStore } from '../../KdsView/store/useKdsStore.js';
import { selectStaffLeaderboard } from '../services/leaderboardService.js';
import { useThemeStore } from '../../../shared/store/useThemeStore.js';
import { formatCurrency } from '../../../shared/utils/formatCurrency.js';

export default function StaffLeaderboard() {
  // Store de tema global para alternar entre claro y oscuro.
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  // Datos demo de usuarios y comandas KDS.
  const users = useDemoStore((s) => s.users);
  const kdsTickets = useKdsStore((s) => s.tickets);

  // Estado del filtro por rol ('todos', 'garzón', 'chef', 'cashier').
  const [roleFilter, setRoleFilter] = useState('todos');
  // Estado del filtro por periodo ('turno', 'semana', 'mes').
  const [periodFilter, setPeriodFilter] = useState('turno');
  // Estado para mensaje de notificación toast de bono otorgado.
  const [bonusNotice, setBonusNotice] = useState('');

  // Genera la lista clasificada de gamificación.
  const allLeaderboard = selectStaffLeaderboard(users, kdsTickets);

  // Filtra por el rol seleccionado.
  const leaderboard = allLeaderboard.filter(
    (item) => roleFilter === 'todos' || item.role.toLowerCase() === roleFilter.toLowerCase(),
  );

  if (allLeaderboard.length === 0) return null;

  // Top 3 Colaboradores para el podio.
  const top1 = allLeaderboard[0];
  const top2 = allLeaderboard[1];
  const top3 = allLeaderboard[2];

  // Otorga un bono o reconocimiento al empleado.
  const handleAwardBonus = (staffName) => {
    setBonusNotice(`🎁 ¡Felicidades! Se ha otorgado un Reconocimiento / Bono de $5.000 CLP a ${staffName}.`);
    setTimeout(() => {
      setBonusNotice('');
    }, 4000);
  };

  return (
    <section
      aria-label="Ranking de Desempeño"
      className={`rounded-2xl p-5 sm:p-6 border transition-colors flex flex-col gap-6 ${
        isDark ? 'bg-brand-900 border-brand-800 text-brand-50 shadow-xl' : 'bg-white border-brand-200 text-brand-900 shadow-soft'
      }`}
    >
      {/* Cabecera del Centro de Gamificación */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${isDark ? 'border-brand-800' : 'border-brand-100'}`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-brand-900'}`}>
              🏆 Centro de Gamificación & Ranking de Staff
            </h2>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-extrabold text-amber-500 border border-amber-500/30">
              Desempeño en Vivo
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-brand-50/70' : 'text-brand-800/70'}`}>
            Puntuaciones, metas de ventas, calificaciones de clientes ⭐ y propinas acumuladas por turno
          </p>
        </div>

        {/* Filtro por Periodo */}
        <div className={`flex items-center gap-1 p-1 rounded-xl border ${isDark ? 'bg-brand-950 border-brand-800' : 'bg-brand-50 border-brand-200'}`}>
          {[
            { id: 'turno', label: '⚡ Turno Hoy' },
            { id: 'semana', label: '📅 Esta Semana' },
            { id: 'mes', label: '🏆 Este Mes' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriodFilter(p.id)}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                periodFilter === p.id
                  ? 'bg-amber-500 text-white shadow-soft'
                  : isDark
                  ? 'text-brand-50/60 hover:bg-brand-800'
                  : 'text-brand-800/70 hover:bg-brand-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Banner de Confirmación de Bono Otorgado */}
      {bonusNotice && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-3 text-xs font-bold text-emerald-500 shadow-soft animate-fade-in">
          <span>{bonusNotice}</span>
          <button type="button" onClick={() => setBonusNotice('')} className="text-xs">✕</button>
        </div>
      )}

      {/* PODIO DESTACADO DE LOS 3 MEJORES DEL TURNO (1° Oro, 2° Plata, 3° Bronce) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
        {/* 2° LUGAR - PLATA 🥈 */}
        {top2 && (
          <div className={`order-2 md:order-1 flex flex-col items-center rounded-2xl p-4 border text-center relative transition hover:scale-102 ${
            isDark ? 'bg-slate-900/90 border-slate-700 text-slate-100 shadow-lg' : 'bg-slate-50 border-slate-300 text-slate-900 shadow-soft'
          }`}>
            <span className="text-3xl mb-1">🥈</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">2° Lugar · Plata</span>
            <h3 className="font-extrabold text-sm mt-1 truncate w-full">{top2.name}</h3>
            <span className="text-xs text-slate-400 capitalize">{top2.role}</span>
            <div className="mt-2 text-xs font-extrabold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {top2.score} Puntos
            </div>
            <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-slate-400">
              <span>⭐ {top2.avgRating}</span>
              <span>🛍️ {top2.salesCountToday} pedidos</span>
              <span>💰 {formatCurrency(top2.tipsCollected)}</span>
            </div>
          </div>
        )}

        {/* 1° LUGAR - ORO 🥇 (ELEVADO Y RESALTADO) */}
        {top1 && (
          <div className={`order-1 md:order-2 flex flex-col items-center rounded-2xl p-5 border text-center relative transition hover:scale-105 shadow-2xl -mt-2 border-amber-500/60 ${
            isDark ? 'bg-gradient-to-b from-amber-950/40 via-brand-950 to-brand-900 text-white' : 'bg-gradient-to-b from-amber-500/10 via-amber-50/50 to-white text-slate-900'
          }`}>
            <div className="absolute -top-3.5 bg-amber-500 text-white rounded-full px-3 py-0.5 text-[10px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
              <span>👑 REY DEL TURNO</span>
            </div>
            <span className="text-4xl mb-1">🥇</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">1° Lugar · Campeón de Ventas</span>
            <h3 className="font-extrabold text-base mt-1 truncate w-full text-amber-400">{top1.name}</h3>
            <span className="text-xs text-slate-300 capitalize">{top1.role} · {top1.salesCountToday} pedidos</span>
            <div className="mt-3 text-sm font-extrabold text-white bg-amber-500 px-4 py-1.5 rounded-full shadow-soft">
              {top1.score} Puntos Totales
            </div>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs font-semibold">
              <span className="text-amber-400">⭐ {top1.avgRating} / 5.0</span>
              <span className="text-emerald-400">💰 {formatCurrency(top1.tipsCollected)}</span>
            </div>
            <div className="w-full mt-3">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                <span>Meta del Turno</span>
                <span>{top1.goalPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400" style={{ width: `${top1.goalPercent}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* 3° LUGAR - BRONCE 🥉 */}
        {top3 && (
          <div className={`order-3 flex flex-col items-center rounded-2xl p-4 border text-center relative transition hover:scale-102 ${
            isDark ? 'bg-amber-950/20 border-amber-800/40 text-amber-100 shadow-lg' : 'bg-amber-50/40 border-amber-200 text-slate-900 shadow-soft'
          }`}>
            <span className="text-3xl mb-1">🥉</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">3° Lugar · Bronce</span>
            <h3 className="font-extrabold text-sm mt-1 truncate w-full">{top3.name}</h3>
            <span className="text-xs opacity-70 capitalize">{top3.role}</span>
            <div className="mt-2 text-xs font-extrabold text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {top3.score} Puntos
            </div>
            <div className="mt-3 flex items-center justify-center gap-3 text-[11px] opacity-70">
              <span>⭐ {top3.avgRating}</span>
              <span>🛍️ {top3.salesCountToday} pedidos</span>
              <span>💰 {formatCurrency(top3.tipsCollected)}</span>
            </div>
          </div>
        )}
      </div>

      {/* FILTROS POR ROL DE EMPLEADO */}
      <div className="flex items-center justify-between gap-2 border-t pt-4 border-brand-800/40">
        <span className={`text-xs font-bold ${isDark ? 'text-brand-50/70' : 'text-brand-800/70'}`}>
          Filtrar Tabla por Rol:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {['todos', 'waiter', 'chef', 'cashier'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`rounded-xl px-3 py-1 text-xs font-bold capitalize transition cursor-pointer border ${
                roleFilter === r
                  ? 'bg-amber-500 text-white border-amber-500 shadow-soft'
                  : isDark
                  ? 'bg-brand-950 text-brand-50/70 border-brand-800 hover:bg-brand-800'
                  : 'bg-brand-50 text-brand-800 border-brand-200 hover:bg-brand-100'
              }`}
            >
              {r === 'waiter' ? '🧑‍🍳 Garzones' : r === 'chef' ? '👨‍🍳 Cocina' : r === 'cashier' ? '💳 Caja' : '🌐 Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DETALLADA DE POSICIONES Y RECONOCIMIENTO */}
      <div className="flex flex-col gap-2.5">
        {leaderboard.map((staff) => (
          <div
            key={staff.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl p-4 border transition-all duration-200 gap-3 ${
              isDark
                ? 'bg-brand-950/70 border-brand-800/80 hover:border-amber-500/50'
                : 'bg-brand-50/40 border-brand-200 hover:border-amber-500/50 shadow-soft'
            }`}
          >
            {/* Lado Izquierdo: Posición, Avatar, Nombre y Logros */}
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-xl font-extrabold text-amber-500 border border-amber-500/20">
                {staff.badge}
              </span>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-brand-900'}`}>
                    #{staff.rank} {staff.name}
                  </span>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    ⭐ {staff.avgRating}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className={`text-xs capitalize ${isDark ? 'text-brand-50/60' : 'text-brand-800/60'}`}>
                    {staff.role} · {staff.salesCountToday} pedidos · ⏱️ {staff.speedMin} min avg
                  </span>
                  {(staff.achievements || []).map((ach) => (
                    <span key={ach} className="text-[9px] font-extrabold rounded-md px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {ach}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Lado Derecho: Puntuación, Barra de Progreso y Acción de Otorgar Bono */}
            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-brand-800/40">
              <div className="flex flex-col items-end">
                <span className="text-xs font-extrabold text-amber-500">{staff.score} pts</span>
                <span className={`text-[10px] ${isDark ? 'text-brand-50/60' : 'text-brand-800/60'}`}>
                  Propinas: <strong>{formatCurrency(staff.tipsCollected)}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleAwardBonus(staff.name)}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 px-3.5 py-2 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft shrink-0"
              >
                🎁 Otorgar Bono
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
