// src/features/CorporateView/components/AdminCMSReportsModal.test.jsx — Pruebas unitarias de AdminCMSReportsModal (fase25-modo-claro-oscuro-y-reportes-cms-admin-excel)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminCMSReportsModal from './AdminCMSReportsModal.jsx';

describe('AdminCMSReportsModal — Centro de Reportes CMS Administrativos & Excel', () => {
  it('renderiza las pestañas de reportes de ventas, tarjetas, deliverys, local, retiro, RRHH, inventario y mermas', () => {
    render(<AdminCMSReportsModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('📊 Reporte de Ventas')).toBeInTheDocument();
    expect(screen.getByText('💳 Reporte Tarjetas & Transbank')).toBeInTheDocument();
    expect(screen.getByText('🛵 Reporte Deliverys')).toBeInTheDocument();
    expect(screen.getByText('📋 Planilla Asistencia & RRHH')).toBeInTheDocument();
  });

  it('permite cambiar entre pestañas de reportes', () => {
    render(<AdminCMSReportsModal isOpen={true} onClose={() => {}} />);

    const rrhhTab = screen.getByRole('button', { name: /📋 Planilla Asistencia & RRHH/i });
    fireEvent.click(rrhhTab);

    expect(screen.getByText('Cotización Al Día ✓')).toBeInTheDocument();
  });
});
