// src/features/RadarView/services/leaderboardService.js — selector de leaderboard de staff (radar-gamification)
// Selector puro que calcula y ordena el ranking de empleados demo a partir de users y kdsTickets.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

export function selectStaffLeaderboard(users = [], kdsTickets = []) {
  if (!users || users.length === 0) return [];

  // Cuenta comandas completadas en KDS.
  const completedKdsCount = (kdsTickets ?? []).filter((t) => t.status === 'completed').length;

  // Mapea cada usuario calculando su puntaje determinista.
  const mapped = users.map((u) => {
    const sales = Number(u.salesCountToday ?? 0);
    // Fórmula de puntos: (pedidos × 10) + (completaciones KDS × 5).
    const score = sales * 10 + completedKdsCount * 5;

    return {
      id: u.id,
      name: u.name ?? 'Staff',
      role: u.role ?? 'garzón',
      salesCountToday: sales,
      score,
    };
  });

  // Ordena descendente por puntaje, con desempate alfabético por nombre.
  mapped.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.name.localeCompare(b.name, 'es');
  });

  // Asigna ranking e insignias cosméticas.
  return mapped.map((item, index) => {
    const rank = index + 1;
    let badge = '⭐';
    if (rank === 1) badge = '🥇';
    else if (rank === 2) badge = '🥈';
    else if (rank === 3) badge = '🥉';

    return {
      ...item,
      rank,
      badge,
    };
  });
}
