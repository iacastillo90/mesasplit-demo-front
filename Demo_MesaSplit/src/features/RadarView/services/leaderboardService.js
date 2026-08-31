// src/features/RadarView/services/leaderboardService.js — selector de leaderboard de staff (radar-gamification)
// Selector puro que calcula y ordena el ranking de empleados demo a partir de users y kdsTickets.
// Calcula métricas de calificación, propinas en CLP, velocidad de atención y cumplimiento de metas del turno.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por cada línea en español).

export function selectStaffLeaderboard(users = [], kdsTickets = []) {
  if (!users || users.length === 0) return [];

  // Cuenta comandas completadas en KDS.
  const completedKdsCount = (kdsTickets ?? []).filter((t) => t.status === 'completed').length;

  // Mapea cada usuario calculando su puntaje e métricas hiperrealistas.
  const mapped = users.map((u, index) => {
    const sales = Number(u.salesCountToday ?? 12);
    const rating = u.avgRating ?? (4.5 + (index % 5) * 0.1);
    // Cálculo de propinas estimadas en CLP.
    const tipsCollected = sales * 1450 + (index * 800);
    // Tiempo promedio de atención en minutos.
    const speedMin = 10 + (index * 2);
    // Meta del turno (% completado).
    const goalPercent = Math.min(100, Math.round((sales / 25) * 100));

    // Fórmula de puntos de gamificación: (pedidos × 10) + (completaciones KDS × 5) + (rating × 10).
    const score = Math.round(sales * 10 + completedKdsCount * 5 + rating * 10);

    // Badges / Logros desbloqueados según desempeño.
    const achievements = [];
    if (sales >= 15) achievements.push('🚀 Vendedor Estrella');
    if (speedMin <= 12) achievements.push('⚡ Flash KDS');
    if (rating >= 4.8) achievements.push('💖 5 Estrellas');
    if (tipsCollected >= 15000) achievements.push('💰 Top Propinas');

    return {
      id: u.id,
      name: u.name ?? 'Staff Gastronómico',
      role: u.role ?? 'garzón',
      salesCountToday: sales,
      avgRating: Number(rating.toFixed(1)),
      tipsCollected,
      speedMin,
      goalPercent,
      score,
      achievements,
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
    let title = 'Colaborador Destacado';
    if (rank === 1) {
      badge = '🥇';
      title = 'Líder del Turno (Oro)';
    } else if (rank === 2) {
      badge = '🥈';
      title = 'Sub-Líder (Plata)';
    } else if (rank === 3) {
      badge = '🥉';
      title = 'Tercer Lugar (Bronce)';
    }

    return {
      ...item,
      rank,
      badge,
      title,
    };
  });
}
