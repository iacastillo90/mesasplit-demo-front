// src/hooks/useStompEvents.js — suscripción realtime al backend en modo backend.
// En modo backend conecta el cliente STOMP y propaga los eventos al callback;
// en modo demo (same-device) no hace nada (el BroadcastChannel ya sincroniza).

// useEffect y useRef de React.
import { useEffect, useRef } from 'react';
// isBackendMode: flag de modo (backend vs same-device).
import { isBackendMode } from '../api/httpClient';
// createStompClient: fábrica del cliente STOMP.
import { createStompClient } from '../api/stompClient';

// useStompEvents(onEvent): hook que conecta STOMP y reenvía eventos realtime.
export function useStompEvents(onEvent) {
  // Ref para el callback: evita re-suscribir cuando cambia la referencia de onEvent.
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  // Efecto de montaje: conecta STOMP solo en modo backend y limpia al desmontar.
  useEffect(() => {
    // En modo demo no hay backend: no se abre conexión WebSocket.
    if (!isBackendMode()) return undefined;
    // Crea y activa el cliente STOMP.
    const client = createStompClient({ onEvent: (e) => onEventRef.current?.(e) });
    // Cleanup: desactiva la conexión al desmontar la vista.
    return () => client.deactivate();
  }, []);
}
