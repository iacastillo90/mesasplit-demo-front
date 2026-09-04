# Tasks: fase6-innovacion-saas-enterprise — Tareas de Desarrollo por Fases

## Fase 1: Inventario, Recetas & Auto-Quiebre 86 (Stock & Costing)
- [ ] 1.1 Crear `useInventoryStore.js` con control de insumos y deducción por receta.
- [ ] 1.2 Crear `InventoryManagementModal.jsx` para visualización y ajuste de stock en Radar Admin.
- [ ] 1.3 Implementar lógica de Auto-Quiebre de stock en Lista 86 cuando el insumo llega a 0.
- [ ] 1.4 Escribir tests unitarios en `useInventoryStore.test.js` e `InventoryManagementModal.test.jsx`.

## Fase 2: Delivery Omnicanal & Live Tracking de Repartidor (Delivery Hub)
- [ ] 2.1 Crear `useDeliveryStore.js` para administrar pedidos de Uber Eats, Rappi y PedidosYa.
- [ ] 2.2 Crear `DeliveryTrackingModal.jsx` con stepper de 5 etapas y mapa visual simulado.
- [ ] 2.3 Integrar modal de despacho en `RadarPage.jsx` y `DeliveryColumn.jsx`.
- [ ] 2.4 Escribir tests unitarios en `useDeliveryStore.test.js` y `DeliveryTrackingModal.test.jsx`.

## Fase 3: UX Auditiva con Web Audio Synth & Mute Global (Sound System)
- [ ] 3.1 Crear hook `useAudioSynth.js` usando la API nativa `AudioContext` para sintetizar tonos auditivos.
- [ ] 3.2 Agregar botón toggle `🔊/🔇` en `AppHeader.jsx`.
- [ ] 3.3 Conectar tonos auditivos en S.O.S., comanda lista KDS y canje de Rewards.
- [ ] 3.4 Escribir tests unitarios en `useAudioSynth.test.js`.

## Fase 4: i18n Selector Multi-Idioma Dinámico (ES / EN / PT)
- [ ] 4.1 Crear `useI18nStore.js` con diccionarios de traducción para Español, English y Português.
- [ ] 4.2 Crear `LanguageSelector.jsx` e integrarlo en `AppHeader.jsx`.
- [ ] 4.3 Aplicar traducciones reactivas en `ClientPage.jsx` y componentes globales.
- [ ] 4.4 Escribir tests unitarios en `useI18nStore.test.js` y `LanguageSelector.test.jsx`.
- [ ] 4.5 Ejecutar verificación completa: tests (`npm run test`), linter (`npm run lint`) y build (`npm run build`).
