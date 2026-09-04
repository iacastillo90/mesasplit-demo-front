# Design: fase5-experiencia-integral-saas — Arquitectura de Experiencia Integral

## Arquitectura por Módulos

### 1. Track 1: Gamificación & Rewards (`useRewardsStore.js`, `RewardsBadgeWidget.jsx`)
- **Store**: `src/features/ClientView/store/useRewardsStore.js`.
- **Widget**: `src/features/ClientView/components/RewardsBadgeWidget.jsx`.
- **Integración**: Montado en la barra superior y pie de `ClientPage.jsx`.

### 2. Track 2: Reviews por Plato (`ItemReviewModal.jsx`)
- **Componente**: `src/features/ClientView/components/ItemReviewModal.jsx`.
- **Integración**: Botón "★ Evaluar Plato" en la tarjeta del ítem o post-pago.

### 3. Track 3: Ergonomía PWA Garzón/Cocina (`QuickSplitCalculatorModal.jsx`)
- **Garzón**: `src/features/WaiterView/components/QuickSplitCalculatorModal.jsx`.
- **Cocina**: Badges de lectura a distancia y urgencia visual en `TicketCard.jsx`.

### 4. Track 4: Panel Corporativo Super Admin (`FranchiseComparisonWidget.jsx`)
- **Widget**: `src/features/CorporateView/components/FranchiseComparisonWidget.jsx`.
- **Integración**: Incorporado en `src/features/CorporateView/pages/SuperAdminPage.jsx`.
