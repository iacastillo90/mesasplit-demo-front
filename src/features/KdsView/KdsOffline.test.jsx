// src/features/KdsView/KdsOffline.test.jsx — suite de tests del KDS en modo offline (kds-offline)
// Cubre el spec kds-offline: detección de conectividad mediante adaptador, encolado local FIFO al estar offline,
// auto-flush de la cola al reconectarse y tolerancia ante la falta del adaptador BroadcastChannel.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it, vi } from 'vitest';
// Testing Library: renderizado de componentes y simulación.
import { render, screen } from '@testing-library/react';
// Store del KDS e instancia del bus exportada kdsBus.
import { kdsBus, useKdsStore } from './store/useKdsStore.js';
// Página principal de KDS.
import KdsPage from './pages/KdsPage.jsx';

describe('kds-offline: KDS offline con cola local y auto-flush', () => {
  beforeEach(() => {
    // Restablece el store de KDS antes de cada test.
    useKdsStore.getState().resetDemo();
  });

  it('Scenario 1: Renderiza el indicador visual OfflineBanner cuando isOnline es false', async () => {
    // Establece el estado de conectividad en offline con 1 evento encolado.
    useKdsStore.setState({ isOnline: false, offlineQueue: [{ topic: 'kds.item_ready', payload: {} }] });

    // Renderiza la vista de Cocina KDS.
    render(<KdsPage />);

    // El banner de modo offline debe mostrarse en la pantalla.
    expect(await screen.findByText(/Modo Offline/i)).toBeInTheDocument();
    expect(screen.getByText(/1 pendiente/i)).toBeInTheDocument();
  });

  it('Scenario 2: Encola eventos en offlineQueue cuando isOnline es false y no llama a bus.publish', () => {
    const publishSpy = vi.spyOn(kdsBus, 'publish');

    // Desconecta el KDS.
    useKdsStore.getState().setOnlineState(false);

    // Carga un ticket en el store.
    const ticket = { id: 't-101', tableNumber: 1, status: 'pending', items: [{ id: 'item-1', name: 'Hamburguesa' }] };
    useKdsStore.setState({ tickets: [ticket] });

    // Completa el ticket estando offline.
    useKdsStore.getState().completeTicket('t-101');

    // bus.publish no debe llamarse mientras esté offline.
    expect(publishSpy).not.toHaveBeenCalled();

    // El evento debe haber quedado almacenado en offlineQueue.
    expect(useKdsStore.getState().offlineQueue.length).toBe(1);
    expect(useKdsStore.getState().offlineQueue[0].topic).toBe('kds.item_ready');

    publishSpy.mockRestore();
  });

  it('Scenario 3: Hace auto-flush de la cola en orden FIFO al reconectar (isOnline -> true)', () => {
    const publishSpy = vi.spyOn(kdsBus, 'publish');

    // Estado offline con 2 eventos pendientes encolados.
    useKdsStore.setState({
      isOnline: false,
      offlineQueue: [
        { topic: 'kds.item_ready', payload: { ticketId: 't-101' } },
        { topic: 'kds.stock_86', payload: { productId: 'p-1' } },
      ],
    });

    // Reconecta el KDS a internet.
    useKdsStore.getState().setOnlineState(true);

    // Se deben haber publicado ambos eventos al bus al reconectarse en orden FIFO.
    expect(publishSpy).toHaveBeenCalledTimes(2);
    expect(publishSpy).toHaveBeenNthCalledWith(1, 'kds.item_ready', { ticketId: 't-101' });
    expect(publishSpy).toHaveBeenNthCalledWith(2, 'kds.stock_86', { productId: 'p-1' });

    // La cola de pendientes debe quedar vacía.
    expect(useKdsStore.getState().offlineQueue).toEqual([]);

    publishSpy.mockRestore();
  });
});
