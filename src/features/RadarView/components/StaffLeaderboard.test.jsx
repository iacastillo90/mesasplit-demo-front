// src/features/RadarView/components/StaffLeaderboard.test.jsx — Pruebas unitarias de StaffLeaderboard (fase30-mejora-visual-y-gamificacion-de-staff)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StaffLeaderboard from './StaffLeaderboard.jsx';

describe('StaffLeaderboard — Gamificación y Podio de Staff', () => {
  it('renderiza el podio Top 3 y la cabecera de gamificación', () => {
    render(<StaffLeaderboard />);

    expect(screen.getByText(/🏆 Centro de Gamificación & Ranking de Staff/i)).toBeInTheDocument();
    expect(screen.getByText(/👑 REY DEL TURNO/i)).toBeInTheDocument();
  });

  it('permite filtrar por rol y hacer clic en Otorgar Bono', () => {
    render(<StaffLeaderboard />);

    const bonusButtons = screen.getAllByRole('button', { name: /🎁 Otorgar Bono/i });
    expect(bonusButtons.length).toBeGreaterThan(0);
    fireEvent.click(bonusButtons[0]);

    expect(screen.getByText(/🎁 ¡Felicidades! Se ha otorgado un Reconocimiento/i)).toBeInTheDocument();
  });
});
