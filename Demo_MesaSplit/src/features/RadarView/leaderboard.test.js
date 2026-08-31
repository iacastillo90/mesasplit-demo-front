// src/features/RadarView/leaderboard.test.js — suite de tests de leaderboard de staff (radar-gamification)
// Cubre el spec radar-gamification: ordenamiento descendente por puntaje con desempate alfabético,
// derivación pura desde users y kdsTickets, inmutabilidad y tolerancia a lista vacía.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios en español).

import { describe, expect, it } from 'vitest';
import { selectStaffLeaderboard } from './services/leaderboardService.js';

describe('radar-gamification: Leaderboard de staff en RadarView (read-only)', () => {
  it('Scenario 1: Ordena descendente por puntaje según pedidos y comandas completadas', () => {
    const mockUsers = [
      { id: 'u1', name: 'Ana Silva', salesCountToday: 12 },
      { id: 'u3', name: 'Camila Torres', salesCountToday: 21 },
    ];
    const mockKdsTickets = [{ id: 't1', status: 'completed' }];

    const leaderboard = selectStaffLeaderboard(mockUsers, mockKdsTickets);

    expect(leaderboard[0].name).toBe('Camila Torres');
    expect(leaderboard[0].score).toBeGreaterThan(leaderboard[1].score);
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[0].badge).toBe('🥇');
  });

  it('Scenario 2: Desempate alfabético por nombre cuando dos empleados tienen el mismo puntaje', () => {
    const mockUsers = [
      { id: 'u2', name: 'Zulema Pérez', salesCountToday: 10 },
      { id: 'u1', name: 'Alberto Ruiz', salesCountToday: 10 },
    ];

    const leaderboard = selectStaffLeaderboard(mockUsers, []);

    expect(leaderboard[0].name).toBe('Alberto Ruiz');
    expect(leaderboard[1].name).toBe('Zulema Pérez');
  });

  it('Scenario 3: Panel read-only no muta los arreglos de entrada', () => {
    const mockUsers = [{ id: 'u1', name: 'Ana', salesCountToday: 5 }];
    const before = JSON.stringify(mockUsers);

    selectStaffLeaderboard(mockUsers, []);

    expect(JSON.stringify(mockUsers)).toBe(before);
  });

  it('Scenario 4: Arreglo de usuarios vacío devuelve lista vacía sin error', () => {
    const leaderboard = selectStaffLeaderboard([], []);
    expect(leaderboard).toHaveLength(0);
  });
});
