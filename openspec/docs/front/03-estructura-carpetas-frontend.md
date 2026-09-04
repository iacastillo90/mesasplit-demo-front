# Estructura de Carpetas Frontend — LabTab

Este documento describe la arquitectura de software recomendada para la aplicación web de demostración de **LabTab**, utilizando **React + Vite**, **Zustand** para el manejo de estado local/global, **React Router v6**, y la metodología **Feature-Sliced Design (FSD)**.

---

## 1. Árbol de Directorios del Proyecto (`src/`)

```
src/
├── app/
│   ├── App.jsx                     # Punto de entrada de React con RouterProvider
│   └── main.jsx                    # Configuración inicial y React.render
├── routes/
│   └── index.jsx                   # createBrowserRouter con definición de rutas
├── features/                       # Módulos aislados por dominio de negocio
│   ├── Portal/                     # Hub de Demostración (Landing para la reunión comercial)
│   │   ├── pages/PortalPage.jsx
│   │   └── components/ViewLauncherCard.jsx
│   ├── ClientView/                 # Mesa Virtual / Cliente QR (PWA)
│   │   ├── pages/ClientPage.jsx
│   │   ├── components/
│   │   │   ├── SharedCartDrawer.jsx
│   │   │   ├── AllergySelectorModal.jsx
│   │   │   ├── CourseOrderTracker.jsx
│   │   │   └── BillSplitterModal.jsx
│   │   ├── services/clientService.js
│   │   └── store/useClientStore.js
│   ├── WaiterView/                 # Mozo / Garzón (PWA)
│   │   ├── pages/WaiterPage.jsx
│   │   ├── components/
│   │   │   ├── TableGrid.jsx
│   │   │   ├── OrderPad.jsx
│   │   │   ├── CourseControlPicker.jsx
│   │   │   └── PinAuthModal.jsx
│   │   ├── services/waiterService.js
│   │   └── store/useWaiterStore.js
│   ├── KdsView/                    # Cocina / KDS (Modo Oscuro #011623)
│   │   ├── pages/KdsPage.jsx
│   │   ├── components/
│   │   │   ├── KdsHeader.jsx
│   │   │   ├── TicketCard.jsx
│   │   │   ├── AllergyShieldAlert.jsx
│   │   │   └── StationFilterTabs.jsx
│   │   ├── services/kdsService.js
│   │   └── store/useKdsStore.js
│   ├── PosView/                    # Caja / POS (Modo Claro #E6F6FF)
│   │   ├── pages/PosPage.jsx
│   │   ├── components/
│   │   │   ├── TicketSummary.jsx
│   │   │   ├── NumpadPayment.jsx
│   │   │   ├── DteInvoiceForm.jsx
│   │   │   └── BlindCloseModal.jsx
│   │   ├── services/posService.js
│   │   └── store/usePosStore.js
│   ├── RadarView/                  # Local Admin / Radar de Turno
│   │   ├── pages/RadarPage.jsx
│   │   ├── components/
│   │   │   ├── TopologicalMap.jsx
│   │   │   ├── ExceptionFeedDrawer.jsx
│   │   │   ├── FocusModeToggle.jsx
│   │   │   └── MermaConsoleBar.jsx
│   │   └── store/useRadarStore.js
│   └── CorporateView/              # Super Admin / Panel Estratégico
│       ├── pages/SuperAdminPage.jsx
│       └── components/
│           ├── PrimaryCostCard.jsx
│           ├── WhatIfSimulator.jsx
│           └── ComplianceHubWidget.jsx
├── shared/                         # Elementos compartidos transversales
│   ├── ui/                         # Sistema de Componentes UI Base
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Badge.jsx
│   │   └── Toast.jsx
│   ├── constants/                  # Tokens, colores semánticos, enums
│   │   ├── colors.js
│   │   └── statusEnums.js
│   └── utils/                      # Formateadores (RUT chileno, Pesos CLP)
│       ├── formatCurrency.js
│       └── validateRut.js
├── hooks/                          # Custom Hooks reactivos
│   └── useRealtimeBus.js           # Event Bus (BroadcastChannel / Firebase bridge)
├── mocks/                          # Fixtures de demostración
│   ├── tables.json
│   ├── menu.json
│   ├── users.json
│   └── folios.json
└── store/
    └── useDemoStore.js             # Zustand root store con persistencia en localStorage
```

---

## 2. Definición de Rutas del Router (`routes/index.jsx`)

| Ruta | Vista | Propósito |
| :--- | :--- | :--- |
| `/` | **Portal de Demo** | Hub para lanzar pestañas independientes |
| `/client/table/:tableId` | **Cliente (Mesa Virtual)** | Experiencia QR con `tableId` dinámico |
| `/waiter` | **Mozo (PWA)** | Toma de pedidos y control de salón |
| `/kds` | **Cocina (KDS)** | Visualizador de comandas en línea de cocina |
| `/pos` | **Caja (POS)** | Cobro, arqueo ciego y facturación DTE |
| `/admin/radar` | **Local Admin** | Mapa del salón y feed de excepciones |
| `/admin/super` | **Super Admin** | Tablero financiero y compliance |

---

## 3. Patrón de Servicios Adaptadores (`services/`)

Cada vista debe consumir sus datos a través de una abstracción en `services/`, sin importar si proviene de fixtures JSON locales o del backend real.

```javascript
// src/features/WaiterView/services/waiterService.js
import tablesMock from '../../../mocks/tables.json';

export async function fetchAssignedTables(waiterId) {
  // En fase Demo: retorna fixtures con retardo simulado para UI feeling real
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(tablesMock.filter(t => t.assignedWaiterId === waiterId));
    }, 300);
  });
}
```
