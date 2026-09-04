# Proposal: Fase 17 — Layout de Navegación Inferior Móvil (Bottom Navigation Bar) para Cliente

## Contexto y Motivación

Para permitir que el cliente retroceda de forma intuitiva, navegue entre la Mesa Virtual, el Dashboard, el Escáner QR, la Comanda y su Perfil sin perderse en móviles:
1. **Barra de Navegación Inferior Fija (`ClientBottomNav.jsx`)**: Pestañas inferiores fijas en móviles (`fixed bottom-0 inset-x-0 z-40`) con íconos táctiles, insignias en tiempo real y etiquetas.
2. **Botón Volver/Retroceder ⬅️**: Integrado en la barra de contexto superior para retroceder instantáneamente al Dashboard o a la Mesa Virtual.

## Alcance del Cambio

- **`src/features/ClientView/components/ClientBottomNav.jsx`**: [NUEVO] Componente de navegación inferior móvil.
- **`src/features/ClientView/components/ClientBottomNav.test.jsx`**: [NUEVO] Test unitario de pestañas móviles.
- **`src/features/ClientView/pages/*`**: Integración del layout inferior en las páginas de cliente (`ClientPage.jsx`, `ClientCartPage.jsx`, `ClientProfilePage.jsx`, `ClientQrScanPage.jsx`, `ClientDashboardPage.jsx`).
