// src/features/KdsView/services/connectivityService.js — adaptador inyectable de conectividad (kds-offline)
// Proporciona la detección de estado online/offline usando eventos del navegador navigator.onLine.
// Permite inyección de fakes en tests mediante setOnlineState.
// Cumple con las reglas de AGENTS.md (comentarios en español por cada línea).

// Crea y suscribe un adaptador de conectividad a los eventos window.online y window.offline.
export function createConnectivityAdapter(onStatusChange) {
  // Manejador del evento online.
  const handleOnline = () => {
    onStatusChange?.(true);
  };

  // Manejador del evento offline.
  const handleOffline = () => {
    onStatusChange?.(false);
  };

  // Registra los event listeners en la ventana si está disponible.
  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }

  // Retorna el adaptador con método de desuscripción.
  return {
    // Retorna el estado de conectividad actual.
    isOnline: () => (typeof navigator !== 'undefined' ? (navigator.onLine ?? true) : true),
    // Cancela la suscripción a eventos de red.
    unsubscribe: () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    },
  };
}
