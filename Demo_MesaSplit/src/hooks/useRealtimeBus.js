// src/hooks/useRealtimeBus.js — bus realtime same-device de la demo (task 3.2)
// Pub/sub + adaptador BroadcastChannel para el Escenario A de docs/01
// (VITE_DEMO_MODE='same-device'): eventos que cruzan pestañas SIN Firebase ni
// socket.io (fuera de alcance del proposal). Contrato del design:
// useRealtimeBus('mesasplit') → { subscribe, publish, close }.
// Envelope: { topic, payload, ts, fromTab } (subset de websocket-payloads.md).
// Testeable: createRealtimeBus acepta un adapter inyectable (tests de task 4.2)
// y entrega local = síncrona (spec "publish → listeners + cross-tab").

// useMemo: el hook devuelve la instancia del bus estable entre renders.
import { useMemo } from 'react';

// Tópicos "shipped" de la demo (subset de docs/api-contracts/websocket-payloads.md).
export const TOPICS = {
  // Orden creada por el cliente/garzón (nueva comanda al sistema).
  ORDER_CREATED: 'order.created',
  // Cambio de estado de una orden (pago, cancelación, etc.).
  ORDER_STATUS_CHANGE: 'order.status.change',
  // Comanda disparada a la estación de cocina (course.fire).
  COURSE_FIRE: 'course.fire',
  // Alerta de alergia declarada (salud y seguridad, escudo KDS).
  ALLERGY_ALERT: 'allergy.alert',
};

// Genera un id de tab único para el envelope (identidad de eventos cross-tab).
function randomTabId() {
  // Prefiere crypto.randomUUID del navegador si está disponible.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    // UUID v4: identidad no colisionante entre pestañas.
    return crypto.randomUUID();
  }
  // Fallback sin crypto (entornos viejos): timestamp + aleatorio.
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Adaptador Noop: sin transporte cross-tab (offline o entorno sin BroadcastChannel).
// Mantiene la API del adaptador para que el bus no distinga el transporte.
function createNoopAdapter() {
  // Devuelve la interfaz vacía del adaptador (post/onMessage/close).
  return {
    // No transporta nada (sin peers): la entrega local ya la hace el bus.
    post() {},
    // Devuelve un noop de limpieza: no hay handler remoto que remover.
    onMessage() {
      return () => {};
    },
    // No hay canal real que cerrar.
    close() {},
  };
}

// Adaptador BroadcastChannel: transporte cross-tab del mismo origen (Escenario A).
// Recibe el nombre del canal ('mesasplit') para instanciar el BroadcastChannel.
function createBroadcastChannelAdapter(channelName) {
  // Instancia el canal real del navegador (mismo origen, sin red).
  const channel = new BroadcastChannel(channelName);
  // Devuelve la interfaz del adaptador (post/onMessage/close).
  return {
    // Publica el envelope hacia las OTRAS instancias del canal.
    post(envelope) {
      // postMessage entrega el envelope a las demás tabs del canal.
      channel.postMessage(envelope);
    },
    // Registra el handler de mensajes remotos en el canal.
    onMessage(handler) {
      // El browser entrega los envelopes remotos por onmessage.
      channel.onmessage = (event) => handler(event.data);
      // Devuelve la limpieza: desregistra el handler del canal.
      return () => {
        // Quita el handler remoto (onmessage = null).
        channel.onmessage = null;
      };
    },
    // Cierra el canal: libera el recurso del navegador.
    close() {
      // Cierra el BroadcastChannel (contrato del browser).
      channel.close();
    },
  };
}

// Resuelve el adaptador por defecto según el demo mode (Escenario A).
function resolveDefaultAdapter(channelName) {
  // Usa BroadcastChannel SOLO en same-device Y si el global existe (jsdom no).
  if (import.meta.env.VITE_DEMO_MODE === 'same-device' && typeof BroadcastChannel !== 'undefined') {
    // Transporte real cross-tab del mismo origen.
    return createBroadcastChannelAdapter(channelName);
  }
  // Sin transporte disponible: las entregas locales del bus siguen funcionando.
  return createNoopAdapter();
}

// Fabrica un bus realtime: pub/sub + adaptador + envelope (core del hook).
// Exportada para tests (task 4.2): acepta options.adapter por inyección.
export function createRealtimeBus(channelName = 'mesasplit', options = {}) {
  // Adapter del bus: el inyectado por el test o el default según demo mode.
  const adapter = options.adapter ?? resolveDefaultAdapter(channelName);
  // Id de esta tab: identidad del envelope (evita loops de eco cross-tab).
  const fromTab = randomTabId();
  // Registro de listeners: tópico → Set de handlers.
  const listeners = new Map();
  // Guarda la limpieza del handler remoto para el close().
  let removeRemoteHandler = () => {};

  // Construye el envelope del evento con el contrato del design.
  function makeEnvelope(topic, payload) {
    // Devuelve { topic, payload, ts, fromTab } tal como define websocket-payloads.
    return { topic, payload, ts: Date.now(), fromTab };
  }

  // Entrega un envelope a los listeners LOCALES de su tópico.
  function dispatchLocally(envelope) {
    // Obtiene el Set de handlers registrado para ese tópico.
    const topicListeners = listeners.get(envelope.topic);
    // Sin listeners: drop silencioso (spec: no error, se descarta).
    if (!topicListeners) return;
    // Recorre una copia del Set (tolera unsubscribe durante la entrega).
    [...topicListeners].forEach((handler) => {
      // Invoca el handler con el payload y el envelope completo.
      handler(envelope.payload, envelope);
    });
  }

  // Handler de mensajes REMOTOS (otras tabs vía el adaptador).
  function handleRemote(envelope) {
    // Ignora los propios envelopes (eco) para no duplicar entregas.
    if (!envelope || envelope.fromTab === fromTab) return;
    // Entrega el envelope remoto a los listeners locales.
    dispatchLocally(envelope);
  }

  // Conecta el adaptador al handler de mensajes remotos.
  removeRemoteHandler = adapter.onMessage(handleRemote);

  // API pública del bus: subscribe (con off), publish y close.
  return {
    // Suscribe un handler a un tópico; devuelve off() para cancelarlo.
    subscribe(topic, handler) {
      // Obtiene (o crea) el Set de handlers del tópico.
      const topicListeners = listeners.get(topic) ?? new Set();
      // Agrega el handler al Set.
      topicListeners.add(handler);
      // Actualiza el registro con el Set modificado.
      listeners.set(topic, topicListeners);
      // Devuelve off(): cancela esta suscripción al invocarse.
      return () => {
        // Remueve el handler del Set (desuscripción idempotente).
        topicListeners.delete(handler);
      };
    },
    // Publica un evento: entrega local síncrona + broadcast cross-tab.
    publish(topic, payload) {
      // Arma el envelope del evento (contrato del design).
      const envelope = makeEnvelope(topic, payload);
      // 1) Entrega a los listeners locales de ESTA tab (sync, spec pub/sub).
      dispatchLocally(envelope);
      // 2) Envía a las OTRAS tabs del mismo origen vía el adaptador.
      adapter.post(envelope);
    },
    // Cierra el bus: desregistra el handler remoto y cierra el canal.
    close() {
      // Desregistra el onMessage del adaptador.
      removeRemoteHandler();
      // Cierra el canal (BroadcastChannel real o noop).
      adapter.close();
    },
  };
}

// Registro de buses singleton por canal (el hook devuelve la instancia estable).
const busRegistry = new Map();

// useRealtimeBus: hook React que devuelve el bus singleton del canal.
// Contrato del design: useRealtimeBus('mesasplit') → { subscribe, publish }.
export function useRealtimeBus(channelName = 'mesasplit') {
  // useMemo: la misma instancia de bus entre renders del mismo canal.
  return useMemo(() => {
    // Reusa el bus ya creado para ese canal (singleton por canal).
    if (!busRegistry.has(channelName)) {
      // Crea y registra el bus del canal con el adaptador por defecto.
      busRegistry.set(channelName, createRealtimeBus(channelName));
    }
    // Devuelve el bus singleton del canal.
    return busRegistry.get(channelName);
  }, [channelName]);
}
