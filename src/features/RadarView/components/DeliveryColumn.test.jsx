// src/features/RadarView/components/DeliveryColumn.test.jsx — Pruebas unitarias de DeliveryColumn (fase29-tarjetas-delivery-omnicanal-uber-pedidosya-justo-y-estados)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeliveryColumn from './DeliveryColumn.jsx';

describe('DeliveryColumn — Tarjetas de Delivery Omnicanal (Uber Eats, PedidosYa, Rappi, Justo)', () => {
  const mockOrders = [
    { id: 'd-1', platform: 'ubereats', customerName: 'Camila Rojas', itemsSummary: '2x Hamburguesa Brioche', total: 17800, elapsedMinutes: 8, driverName: 'Chef Pedro', status: 'in_prep' },
    { id: 'd-2', platform: 'pedidosya', customerName: 'Felipe Soto', itemsSummary: '1x Lomo Lo Ovalle', total: 24800, elapsedMinutes: 18, driverName: 'Matías L. 🛵', status: 'on_way' },
    { id: 'd-3', platform: 'justo', customerName: 'Valentina Bravo', itemsSummary: '2x Pizza Pepperoni', total: 28300, elapsedMinutes: 12, driverName: 'Delivery Propio 🛵', status: 'delivered' },
  ];

  it('renderiza tarjetas con logos de Uber Eats, PedidosYa y Justo App', () => {
    render(<DeliveryColumn orders={mockOrders} />);

    expect(screen.getByText(/Uber Eats/i)).toBeInTheDocument();
    expect(screen.getByText(/PedidosYa/i)).toBeInTheDocument();
    expect(screen.getByText(/Justo App/i)).toBeInTheDocument();
  });

  it('permite filtrar por estado (Preparación, En Camino, Entregados)', () => {
    render(<DeliveryColumn orders={mockOrders} />);

    const deliveredFilterBtn = screen.getByRole('button', { name: /✅ Entregados/i });
    fireEvent.click(deliveredFilterBtn);

    expect(screen.getByText('Valentina Bravo')).toBeInTheDocument();
    expect(screen.queryByText('Camila Rojas')).not.toBeInTheDocument();
  });
});
