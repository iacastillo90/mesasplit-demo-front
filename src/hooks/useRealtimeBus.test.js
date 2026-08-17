// src/hooks/useRealtimeBus.test.js — suite del bus realtime (task 4.2)
// Cubre el spec realtime-bus pub/sub: subscribe→receive, unsubscribe, drop
// silencioso sin listeners y cruce entre tabs del mismo origen (cross-tab).
// En jsdom NO existe BroadcastChannel nativo: se inyecta un stub (clase
// FakeBroadcastChannel) que emula el transporte del navegador, tal como indica
// el design (adapter inyectable / stub para la aserción cross-tab).

// API de Vitest importada explícita: ESLint no declara los globals de Vitest.
import { afterEach, describe, expect, it, vi } from 'vitest';
// Factory del bus: expone createRealtimeBus para tests sin React.
import { createRealtimeBus } from './useRealtimeBus.js';

// Stub de BroadcastChannel: emula dos tabs del mismo origen compartiendo canal.
// El registro estático es compartido por instancias del mismo canal (como el
// navegador real), pero el post solo llega a las OTRAS instancias (nunca a sí).
class FakeBroadcastChannel {
  // Registro global: nombre de canal → conjunto de instancias vivas.
  static registry = new Map();

  // Constructor: se registra como "tab" dentro de su canal.
  constructor(name) {
    // Nombre del canal (mesasplit-bus en producción).
    this.name = name;
    // Handler que el bus asigna para recibir mensajes remotos.
    this.onmessage = null;
    // Obtiene (o crea) el conjunto de peers del canal.
    const peers = FakeBroadcastChannel.registry.get(name) ?? new Set();
    // Se agrega a sí mismo como peer vivo del canal.
    peers.add(this);
    // Actualiza el registro con el conjunto modificado.
    FakeBroadcastChannel.registry.set(name, peers);
  }

  // Envía el mensaje a las demás instancias del canal (cross-tab).
  postMessage(data) {
    // Obtiene los peers actuales del canal.
    const peers = FakeBroadcastChannel.registry.get(this.name) ?? new Set();
    // Recorre cada peer del canal.
    peers.forEach((peer) => {
      // Entrega SOLO a las otras tabs (BroadcastChannel no se auto-entrega).
      if (peer !== this && typeof peer.onmessage === 'function') {
        // Invoca el onmessage del peer con el mensaje recibido.
        peer.onmessage({ data });
      }
    });
  }

  // Cierra el canal: se desregistra del conjunto de peers.
  close() {
    // Pide el conjunto de peers del canal.
    const peers = FakeBroadcastChannel.registry.get(this.name);
    // Si existe, se remueve a sí mismo del conjunto.
    peers?.delete(this);
  }

  // Limpia el registro estático entre tests (aislamiento total).
  static reset() {
    // Vacía el mapa de canales del stub.
    FakeBroadcastChannel.registry.clear();
  }
}

describe('realtime-bus: pub/sub (spec)', () => {
  // Restaura el entorno global de BroadcastChannel entre tests.
  afterEach(() => {
    // Si el test polifilleó el stub, lo remueve del globalThis.
    delete globalThis.BroadcastChannel;
    // Vacía el registro estático del stub.
    FakeBroadcastChannel.reset();
  });

  it('entrega el payload a los suscriptores del tópico (subscribe→receive)', () => {
    // Crea un bus aislado para el test (sin React, factory directa).
    const bus = createRealtimeBus('ch-sync');
    // Handler espía que captura los eventos recibidos.
    const handler = vi.fn();
    // Suscribe el handler al tópico course.fire.
    bus.subscribe('course.fire', handler);
    // Publica un evento con payload del dominio (comanda disparada).
    bus.publish('course.fire', { tableId: 't1', orderId: 'o1' });
    // El listener recibió el evento UNA vez (entrega puntual).
    expect(handler).toHaveBeenCalledTimes(1);
    // El primer argumento es el payload tal como se publicó.
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ tableId: 't1', orderId: 'o1' }),
      // El segundo argumento es el envelope con topic, ts y fromTab.
      expect.objectContaining({ topic: 'course.fire', fromTab: expect.any(String) }),
    );
  });

  it('deja de entregar eventos tras unsubscribe (off)', () => {
    // Crea un bus aislado para el test.
    const bus = createRealtimeBus('ch-unsub');
    // Handler espía de la suscripción que se cancelará.
    const handler = vi.fn();
    // Suscribe el handler y guarda la función off() de cancelación.
    const off = bus.subscribe('order.created', handler);
    // Cancela la suscripción (off devuelto por subscribe).
    off();
    // Publica un evento en el tópico del handler desuscripto.
    bus.publish('order.created', { orderId: 'o9' });
    // El listener NO recibió el evento tras desuscribirse.
    expect(handler).not.toHaveBeenCalled();
  });

  it('descarta eventos sin listeners sin lanzar errores (drop silencioso)', () => {
    // Crea un bus aislado SIN suscriptores en el tópico.
    const bus = createRealtimeBus('ch-empty');
    // Publicar en un tópico vacío NO debe lanzar ninguna excepción.
    expect(() => bus.publish('allergy.alert', { tableId: 't3' })).not.toThrow();
  });

  it('cruza eventos entre tabs del mismo origen vía BroadcastChannel', () => {
    // Instala el stub como BroadcastChannel global (jsdom no lo tiene).
    globalThis.BroadcastChannel = FakeBroadcastChannel;
    // Tab A: publica el evento (misma origin, mismo canal).
    const tabA = createRealtimeBus('mesasplit-test');
    // Tab B: recibe el evento (segunda instancia del mismo canal).
    const tabB = createRealtimeBus('mesasplit-test');
    // Handler espía de la tab B para el tópico order.status.change.
    const handlerB = vi.fn();
    // La tab B se suscribe al tópico.
    tabB.subscribe('order.status.change', handlerB);
    // La tab A publica el evento con payload del dominio.
    tabA.publish('order.status.change', { orderId: 'o1', status: 'ready' });
    // La tab B recibió el evento remoto exactamente una vez.
    expect(handlerB).toHaveBeenCalledTimes(1);
    // El payload llegó intacto y el envelope identifica la tab de origen.
    expect(handlerB).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: 'o1', status: 'ready' }),
      expect.objectContaining({ topic: 'order.status.change', fromTab: expect.any(String) }),
    );
  });

  it('funciona sin BroadcastChannel (offline): entrega local y no lanza', () => {
    // Fuerza la ausencia del transporte (simula sin BroadcastChannel nativo).
    delete globalThis.BroadcastChannel;
    // Crea un bus con el adapter Noop (cae el transporte cross-tab).
    const bus = createRealtimeBus('ch-offline');
    // Handler espía de la entrega local.
    const handler = vi.fn();
    // Suscribe el handler al tópico course.fire.
    bus.subscribe('course.fire', handler);
    // Publicar sin transporte NO debe lanzar errores.
    expect(() => bus.publish('course.fire', { tableId: 't2' })).not.toThrow();
    // La entrega LOCAL sigue funcionando aunque no haya cross-tab.
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
