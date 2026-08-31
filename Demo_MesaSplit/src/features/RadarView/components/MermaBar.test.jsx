// src/features/RadarView/components/MermaBar.test.jsx — Pruebas unitarias de MermaBar (fase31-modulo-avanzado-control-de-mermas)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MermaBar from './MermaBar.jsx';

describe('MermaBar — Control de Mermas & Desperdicios Gastronómicos', () => {
  it('renderiza la cabecera, KPIs de pérdidas y tabla de mermas', () => {
    render(<MermaBar mermaLogs={[]} onAddMerma={() => {}} />);

    expect(screen.getByText(/🗑️ Control & Auditoría de Mermas Gastronómicas/i)).toBeInTheDocument();
    expect(screen.getByText(/Pérdida Total Acumulada/i)).toBeInTheDocument();
    expect(screen.getByText(/Exportar Mermas \(Excel CSV\)/i)).toBeInTheDocument();
  });

  it('permite registrar una nueva merma clasificando la causa y el área', () => {
    render(<MermaBar mermaLogs={[]} onAddMerma={() => {}} />);

    const input = screen.getByPlaceholderText(/ej. 3.0 kg Tomate San Marzano/i);
    fireEvent.change(input, { target: { value: '5 kg de queso mohoso' } });

    const submitBtn = screen.getByRole('button', { name: /⚠️ Registrar Merma de Insumo/i });
    fireEvent.submit(submitBtn.closest('form'));

    expect(screen.getByText(/5 kg de queso mohoso/i)).toBeInTheDocument();
  });
});
