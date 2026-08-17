// src/hooks/useDemoSimulator.js — helper/hook de simulación de eventos en tiempo real para la demo MesaSplit
// Permite disparar simulación de eventos entre vistas (Mesa 4 pedido, SOS, plato listo, pago QR y reset)
// interactuando directamente con Zustand stores y useRealtimeBus sin requerir backend ni múltiples pantallas.

// useCallback y useState de React.
import { useCallback, useState } from 'react';
// Stores globales de la demo: cliente, cocina KDS y división de cuenta.
import { useClientStore } from '../features/ClientView/store/useClientStore.js';
import { useKdsStore } from '../features/KdsView/store/useKdsStore.js';
import { useSplitStore } from '../features/ClientView/store/useSplitStore.js';
// Bus realtime same-device de la app.
import { createRealtimeBus, TOPICS } from './useRealtimeBus.js';

// Instancia singleton del bus para emisión de simulación.
const bus = createRealtimeBus('mesasplit');

// Hook personalizado useDemoSimulator.
export function useDemoSimulator() {
  // Estado local para notificar el último evento ejecutado en la UI de simulación.
  const [lastAction, setLastAction] = useState(null);

  // Acciones de la vista cliente y KDS.
  const loadMenu = useClientStore((s) => s.loadMenu);
  const openSplit = useSplitStore((s) => s.openSplit);


  // 1. Simular pedido de Mesa 4 (Cliente -> Cocina).
  const simulateOrderMesa4 = useCallback(() => {
    // Genera un ID de ticket corto y único para la demo.
    const ticketId = `SIM-${Math.floor(1000 + Math.random() * 9000)}`;
    // Construye la comanda simulada de la Mesa 4.
    const mockTicket = {
      id: ticketId,
      tableNumber: 4,
      dinerName: 'Camila Soto (Mesa 4)',
      timeAgo: 'Justo ahora',
      elapsedSeconds: 0,
      urgent: false,
      status: 'pending',
      items: [
        { id: 'sim-1', name: 'Hamburguesa Smash Especial', qty: 2, station: 'parrilla', notes: 'Sin cebolla', allergyAlert: false },
        { id: 'sim-2', name: 'Schop Kross Golden 500cc', qty: 2, station: 'barra', notes: '', allergyAlert: false },
      ],
    };

    // Agrega el ticket directamente al store de cocina KDS.
    useKdsStore.setState((state) => ({
      tickets: [mockTicket, ...state.tickets],
    }));

    // Publica el evento de orden creada en el bus realtime.
    bus.publish(TOPICS.ORDER_CREATED, {
      ticketId,
      table: 4,
      itemsCount: 4,
      timestamp: Date.now(),
    });

    // Registra la acción en el estado local para feedback visual.
    setLastAction(`⚡ Pedido comanda #${ticketId} enviado a Cocina (Mesa 4)`);
  }, []);

  // 2. Simular alerta de S.O.S. en mesa.
  const simulateSosCall = useCallback(() => {
    // Payload de llamada de emergencia S.O.S.
    const sosPayload = {
      table: 4,
      type: 'sos',
      message: '🚨 ¡Mesa 4 solicita atención urgente del mozo!',
      timestamp: Date.now(),
    };

    // Publica la alerta de urgencia por el bus realtime.
    bus.publish(TOPICS.ALLERGY_ALERT, sosPayload);

    // Registra la acción para feedback inmediato.
    setLastAction('🚨 Alerta S.O.S. emitida para Mesa 4');
  }, []);

  // 3. Simular plato listo en cocina (KDS -> Garzón/Cliente).
  const simulateKitchenReady = useCallback(() => {
    // Lee los tickets activos de cocina.
    const currentTickets = useKdsStore.getState().tickets;
    // Si hay tickets, toma el primero o crea uno listo.
    if (currentTickets.length > 0) {
      // Obtiene el ID del ticket más antiguo/activo.
      const targetId = currentTickets[0].id;
      // Remueve el ticket de la cocina y lo mueve al historial de recall.
      useKdsStore.setState((state) => {
        const remaining = state.tickets.filter((t) => t.id !== targetId);
        const completedTicket = state.tickets.find((t) => t.id === targetId);
        return {
          tickets: remaining,
          recallStack: completedTicket ? [completedTicket, ...state.recallStack].slice(0, 10) : state.recallStack,
        };
      });

      // Publica la notificación de plato listo en el bus.
      bus.publish(TOPICS.ORDER_STATUS_CHANGE, {
        ticketId: targetId,
        table: 4,
        status: 'ready',
        message: `¡Comanda #${targetId} de Mesa 4 lista para servir!`,
      });

      setLastAction(`🍳 Comanda #${targetId} marcada como LISTA en Cocina`);
    } else {
      // Si no había tickets, emite un aviso simulado directo.
      bus.publish(TOPICS.ORDER_STATUS_CHANGE, {
        table: 4,
        status: 'ready',
        message: '¡Platos de Mesa 4 listos en pasaplatos!',
      });
      setLastAction('🍳 Simulación: Platos de Mesa 4 listos en pasaplatos');
    }
  }, []);

  // 4. Simular solicitud de cuenta y pago QR.
  const simulateQrPayment = useCallback(() => {
    // Abre el modal de división de cuenta en la vista cliente.
    openSplit();

    // Publica el evento de solicitud de pago en el bus realtime.
    bus.publish(TOPICS.ORDER_STATUS_CHANGE, {
      table: 4,
      status: 'payment_requested',
      message: '💳 Mesa 4 ha solicitado la cuenta y escaneado QR de pago',
    });

    setLastAction('💳 Solicitud de cuenta y Pago QR gatillados en Mesa 4');
  }, [openSplit]);

  // 5. Resetear estado demo a valores iniciales.
  const resetDemoState = useCallback(() => {
    // Recarga el menú limpio en el cliente.
    loadMenu();
    // Limpia el carrito.
    useClientStore.setState({ cart: [], cartOpen: false });
    // Resetea el store de KDS con tickets de prueba limpios.
    useKdsStore.setState({
      tickets: [
        {
          id: '101',
          tableNumber: 2,
          dinerName: 'Juan Pérez',
          timeAgo: 'Hace 4 min',
          elapsedSeconds: 240,
          urgent: false,
          status: 'pending',
          items: [
            { id: '101-1', name: 'Lomo a lo Pobre', qty: 1, station: 'parrilla', notes: 'Punto 3/4', allergyAlert: false },
          ],
        },
      ],
      recallStack: [],
    });
    // Limpia el estado de acción.
    setLastAction('🔄 Estado demo restablecido por completo');
  }, [loadMenu]);

  // Retorna las funciones y el último evento ejecutado.
  return {
    lastAction,
    simulateOrderMesa4,
    simulateSosCall,
    simulateKitchenReady,
    simulateQrPayment,
    resetDemoState,
  };
}
