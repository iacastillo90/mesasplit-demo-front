# Design: fase6-innovacion-saas-enterprise — Arquitectura de Innovaciones Enterprise

## Arquitectura por Módulos

### 1. Track 1: Inventario & Auto 86 (`useInventoryStore.js`, `InventoryManagementModal.jsx`)
- **Store**: `src/features/RadarView/store/useInventoryStore.js`.
- **Modal**: `src/features/RadarView/components/InventoryManagementModal.jsx`.
- **Integración**: Conectado con `useClientStore` y `useKdsStore`.

### 2. Track 2: Delivery & Tracking (`useDeliveryStore.js`, `DeliveryTrackingModal.jsx`)
- **Store**: `src/features/RadarView/store/useDeliveryStore.js`.
- **Modal**: `src/features/RadarView/components/DeliveryTrackingModal.jsx`.
- **Integración**: Conectado en `RadarPage.jsx` y `DeliveryColumn.jsx`.

### 3. Track 3: Notificaciones Auditivas Synth (`useAudioSynth.js`)
- **Hook**: `src/hooks/useAudioSynth.js`.
- **Integración**: Toggle en `AppHeader.jsx` e invocación en S.O.S., KDS y Rewards.

### 4. Track 4: i18n Multi-Idioma (`useI18nStore.js`, `LanguageSelector.jsx`)
- **Store**: `src/shared/i18n/useI18nStore.js`.
- **Selector**: `src/shared/i18n/LanguageSelector.jsx`.
- **Integración**: Montado en `AppHeader.jsx` y utilizado en `ClientPage.jsx`.
