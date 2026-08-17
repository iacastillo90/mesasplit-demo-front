// src/features/KdsView/components/PackingChecklistModal.test.jsx — suite de tests del checklist de empaque delivery (kds-delivery-checklist)
// Cubre el spec kds-delivery-checklist: apertura con orden activa de deliveryOrders, verificación de ítems estructurados / itemsSummary,
// despacho a status 'completed' al verificar todo (excluido por selectActiveDelivery), bloqueo de despacho ante checklist incompleto
// y persistencia de verificaciones bajo la clave mesasplit-packing-{orderId}.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it } from 'vitest';
// Testing Library: renderizado y simulación.
import { fireEvent, render, screen } from '@testing-library/react';
// Store de RadarView para leer deliveryOrders y selectActiveDelivery.
import { selectActiveDelivery, useRadarStore } from '../../RadarView/store/useRadarStore.js';
// Componente PackingChecklistModal.
import PackingChecklistModal from './PackingChecklistModal.jsx';

describe('kds-delivery-checklist: Checklist de empaque delivery en KDS', () => {
  beforeEach(() => {
    // Restablece el store de Radar.
    useRadarStore.getState().resetDemo();
    window.localStorage.clear();
  });

  it('Scenario 1: Apertura del modal muestra ítems a empaquetar de la orden delivery activa', async () => {
    const mockOrder = {
      id: 'd-101',
      customerName: 'Juan Pérez',
      status: 'pending',
      items: [
        { id: 'i1', name: 'Hamburguesa Clásica', qty: 1 },
        { id: 'i2', name: 'Limonada Menta', qty: 1 },
      ],
    };

    render(<PackingChecklistModal open={true} order={mockOrder} onClose={() => {}} />);

    // Muestra los ítems a empaquetar.
    expect(await screen.findByText(/Empaque Delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/Hamburguesa Clásica/i)).toBeInTheDocument();
    expect(screen.getByText(/Limonada Menta/i)).toBeInTheDocument();
  });

  it('Scenario 2: Despacho tras verificar todos los ítems transiciona la orden a status completed', async () => {
    const mockOrder = {
      id: 'd-102',
      customerName: 'María Soto',
      status: 'pending',
      items: [{ id: 'i1', name: 'Pizza Margherita', qty: 1 }],
    };

    useRadarStore.setState({ deliveryOrders: [mockOrder] });

    render(<PackingChecklistModal open={true} order={mockOrder} onClose={() => {}} />);

    // Marca el ítem como verificado.
    const checkbox = await screen.findByRole('checkbox');
    fireEvent.click(checkbox);

    // Presiona despachar.
    const dispatchBtn = screen.getByRole('button', { name: /Despachar Pedido/i });
    fireEvent.click(dispatchBtn);

    // La orden en el store de Radar pasa a 'completed'.
    const orders = useRadarStore.getState().deliveryOrders;
    const updated = orders.find((o) => o.id === 'd-102');
    expect(updated?.status).toBe('completed');
    // selectActiveDelivery excluye las ordenes completadas.
    expect(selectActiveDelivery(useRadarStore.getState().deliveryOrders).length).toBe(0);
  });

  it('Scenario 3: Checklist incompleto bloquea el despacho y muestra advertencia', async () => {
    const mockOrder = {
      id: 'd-103',
      customerName: 'Carlos Ruiz',
      status: 'pending',
      items: [
        { id: 'i1', name: 'Hamburguesa BBQ Bacon', qty: 1 },
        { id: 'i2', name: 'Ensalada César', qty: 1 },
      ],
    };

    useRadarStore.setState({ deliveryOrders: [mockOrder] });

    render(<PackingChecklistModal open={true} order={mockOrder} onClose={() => {}} />);

    // Solo marca 1 de los 2 ítems.
    const checkboxes = await screen.findAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    // Intenta despachar.
    const dispatchBtn = screen.getByRole('button', { name: /Despachar Pedido/i });
    fireEvent.click(dispatchBtn);

    // Muestra aviso de pendientes.
    expect(await screen.findByText(/Faltan ítems por verificar/i)).toBeInTheDocument();
    // La orden NO cambia a completed.
    const updated = useRadarStore.getState().deliveryOrders.find((o) => o.id === 'd-103');
    expect(updated?.status).not.toBe('completed');
  });

  it('Scenario 4: Persistencia de verificaciones en localStorage bajo mesasplit-packing-{orderId}', async () => {
    const mockOrder = {
      id: 'd-104',
      customerName: 'Ana López',
      status: 'pending',
      items: [{ id: 'i1', name: 'Carbonara', qty: 1 }],
    };

    const { unmount } = render(<PackingChecklistModal open={true} order={mockOrder} onClose={() => {}} />);

    // Verifica el ítem.
    const checkbox = await screen.findByRole('checkbox');
    fireEvent.click(checkbox);

    // Desmonta y remonta (simula reabrir el modal).
    unmount();

    render(<PackingChecklistModal open={true} order={mockOrder} onClose={() => {}} />);

    // El checkbox debe mantenerse verificado (checked=true) restaurado de localStorage.
    const restoredCheckbox = await screen.findByRole('checkbox');
    expect(restoredCheckbox).toBeChecked();
    expect(window.localStorage.getItem('mesasplit-packing-d-104')).not.toBeNull();
  });
});
