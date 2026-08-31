// src/api/stompClient.js — cliente STOMP sobre SockJS hacia el backend LabTab.
// Conecta a /ws, autentica con JWT en el frame CONNECT y suscribe a los topics
// del branch (kitchen, radar, pos, alerts). onEvent recibe el envelope
// {event, payload} de websocket-payloads.md; onStatus reporta el estado.

// Client de @stomp/stompjs (protocolo STOMP sobre WebSocket/SockJS).
import { Client } from '@stomp/stompjs';
// SockJS: transporte con fallback que expone el backend (WebSocketConfiguration).
import SockJS from 'sockjs-client';
// getToken: JWT para el header de CONNECT; getStoredUser: persona (branchId).
import { getToken } from './httpClient';
import { getStoredUser } from './authService';

// URL base del backend (misma que la del httpClient).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// createStompClient: instancia y activa el cliente STOMP; devuelve la instancia
// para poder desactivarla (client.deactivate) al desmontar la vista.
export function createStompClient({ onEvent, onStatus }) {
  // Cliente STOMP: webSocketFactory crea el SockJS hacia el endpoint /ws.
  const client = new Client({
    webSocketFactory: () => new SockJS(`${API_URL}/ws`),
    // Header de CONNECT: el StompAuthInterceptor del back valida este JWT.
    connectHeaders: { Authorization: `Bearer ${getToken()}` },
    // Reintenta la conexión cada 5s si se cae (resiliencia del KDS).
    reconnectDelay: 5000,
    onConnect: () => {
      onStatus?.('connected');
      // branchId del usuario logueado (viene del JWT/persona del login).
      const branchId = getStoredUser()?.branchId;
      if (!branchId) return;
      // Suscripción a los 4 topics del branch; en cada frame se parsea el
      // envelope {event, payload} y se propaga a onEvent.
      ['kitchen', 'radar', 'pos', 'alerts'].forEach((scope) => {
        client.subscribe(`/topic/branch/${branchId}/${scope}`, (msg) => {
          try {
            onEvent?.(JSON.parse(msg.body));
          } catch {
            // Ignora frames que no son JSON (keepalive o errores).
          }
        });
      });
    },
    onStompError: () => onStatus?.('error'),
    onWebSocketClose: () => onStatus?.('disconnected'),
  });
  // Activa la conexión (handshake SockJS + CONNECT STOMP).
  client.activate();
  return client;
}
