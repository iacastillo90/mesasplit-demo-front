# Proposal: fase6-innovacion-saas-enterprise — Innovaciones SaaS Enterprise

## Intent

Elevar la plataforma **MesaSplit** a un nivel de demostración comercial *SaaS Enterprise* mediante la implementación del 100% de 4 áreas avanzadas de experiencia de usuario (UX):
1. **Inventario & Costeo de Recetas en Tiempo Real**: Deducción automática de insumos por venta y quiebre automático en Lista 86 cuando el stock llega a 0.
2. **Delivery Omnicanal & Live Tracking**: Simulador de despachos (UberEats, Rappi, PedidosYa) con mapa visual de seguimiento de repartidor.
3. **UX Auditiva con Web Audio Synth**: Sintetizador de audio nativo para alertas auditivas profesionales (comanda lista, S.O.S., puntos acreditados) con silenciador en cabecera.
4. **i18n Multi-Idioma Dinámico**: Selector de idioma en tiempo real (Español, English, Português) para atención a comensales e interfaz global.

## Scope

### In Scope
- **Track 1**: `useInventoryStore.js` + `InventoryManagementModal.jsx` con descuento de insumos y auto 86.
- **Track 2**: `useDeliveryStore.js` + `DeliveryTrackingModal.jsx` con barra de estado y mapa simulado.
- **Track 3**: `useAudioSynth.js` + Toggle `🔊/🔇` en `AppHeader.jsx` y disparadores en eventos clave.
- **Track 4**: `useI18nStore.js` + `LanguageSelector.jsx` con diccionarios ES/EN/PT.
- **Tests Unitarios**: Suite de pruebas en Vitest para cada uno de los nuevos stores y componentes de UI.

### Out of Scope
- Integración física con balanzas o sensores IoT de bodegas reales.

## Approach
Desarrollo incremental en 4 fases con TDD (`strict_tdd: true`), comentarios por línea de código en español y commits convencional en español justificando cada decisión técnica.
