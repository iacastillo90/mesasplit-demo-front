// src/features/ClientView/components/OrderTrackingBanner.test.jsx — suite de tests de tracking de pedido (client-order-tracking)
// Cubre el spec client-order-tracking: progresión de estado vía bus (order.status.change), estado por defecto ("enviado a cocina")
// al haber orden activa sin eventos, e ignorancia de estados desconocidos sin crashear.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it } from 'vitest';
// Testing Library: renderizado y búsqueda en DOM.
import { render, screen } from '@testing-library/react';
// Hook de bus en tiempo real para publicar eventos en la prueba.
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';
// Componente de banner de tracking.
import OrderTrackingBanner from './OrderTrackingBanner.jsx';

describe('client-order-tracking: Tracking de pedido en tiempo real en Mesa Virtual', () => {
  let bus;

  beforeEach(() => {
    // Instancia del bus para emitir eventos de prueba en el canal mesasplit.
    bus = createRealtimeBus('mesasplit');
  });

  it('Scenario 1: Muestra estado por defecto "enviado a cocina" al haber orden activa sin eventos', async () => {
    // Renderiza el banner con orden activa sin eventos previos.
    render(<OrderTrackingBanner hasActiveOrder={true} />);

    // Muestra "enviado a cocina".
    expect(await screen.findByText(/enviado a cocina/i)).toBeInTheDocument();
  });

  it('Scenario 2: Progresión de estado vía bus actualiza el banner a "listo"', async () => {
    render(<OrderTrackingBanner hasActiveOrder={true} orderId="order-101" />);

    // Muestra el estado inicial.
    expect(await screen.findByText(/enviado a cocina/i)).toBeInTheDocument();

    // Publica el evento de cambio de estado a 'ready' por el bus.
    bus.publish('order.status.change', { orderId: 'order-101', status: 'ready' });

    // El banner debe actualizar su texto a "listo".
    expect(await screen.findByText(/listo/i)).toBeInTheDocument();
  });

  it('Scenario 3: Estado desconocido es ignorado manteniendo el estado actual sin crashear', async () => {
    render(<OrderTrackingBanner hasActiveOrder={true} orderId="order-102" />);

    // Publica primero estado 'in_preparation'.
    bus.publish('order.status.change', { orderId: 'order-102', status: 'in_preparation' });
    expect(await screen.findByText(/en preparación/i)).toBeInTheDocument();

    // Publica estado inválido 'desconocido'.
    bus.publish('order.status.change', { orderId: 'order-102', status: 'desconocido' });

    // Mantiene 'en preparación' sin crashear.
    expect(screen.getByText(/en preparación/i)).toBeInTheDocument();
  });
});
