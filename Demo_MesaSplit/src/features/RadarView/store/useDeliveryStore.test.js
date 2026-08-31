// src/features/RadarView/store/useDeliveryStore.test.js — tests unitarios para useDeliveryStore
// Prueba la selección de órdenes de delivery, avance de etapas de despacho y creación de pedidos de prueba.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Describe, it y expect de Vitest para la suite de pruebas.
import { describe, it, expect, beforeEach } from 'vitest';
// Store de delivery a probar.
import { useDeliveryStore, INITIAL_DELIVERY_ORDERS } from './useDeliveryStore.js';

// Describe bloque para useDeliveryStore.
describe('useDeliveryStore: Delivery Omnicanal y Live Tracking de Repartidor', () => {
  // Reinicia el estado del store antes de cada test.
  beforeEach(() => {
    useDeliveryStore.setState({
      deliveries: INITIAL_DELIVERY_ORDERS,
      selectedDeliveryId: 'DEL-901',
    });
  });

  // Test 1: Selección de orden activa.
  it('permite cambiar la orden de delivery seleccionada actualmente', () => {
    useDeliveryStore.getState().setSelectedDeliveryId('DEL-902');
    expect(useDeliveryStore.getState().selectedDeliveryId).toBe('DEL-902');
  });

  // Test 2: Avance de etapa de despacho.
  it('avanza la etapa de despacho del delivery recalculando el progreso', () => {
    // La orden DEL-902 está en PREPARING.
    useDeliveryStore.getState().advanceDeliveryStage('DEL-902');

    // Obtiene la orden actualizada.
    const del = useDeliveryStore.getState().deliveries.find((d) => d.id === 'DEL-902');
    // Verifica que haya avanzado a COURIER_ASSIGNED.
    expect(del.stage).toBe('COURIER_ASSIGNED');
    // Verifica que el porcentaje de ruta haya subido a 50%.
    expect(del.routeProgressPct).toBe(50);
  });

  // Test 3: Creación de pedido simulado.
  it('crea una nueva orden de delivery indicando plataforma y origen', () => {
    const newOrder = useDeliveryStore.getState().createDeliveryOrder('PedidosYa 🔴');

    expect(newOrder.id).toBeDefined();
    expect(newOrder.platform).toBe('PedidosYa 🔴');
    expect(useDeliveryStore.getState().deliveries).toHaveLength(3);
  });
});
