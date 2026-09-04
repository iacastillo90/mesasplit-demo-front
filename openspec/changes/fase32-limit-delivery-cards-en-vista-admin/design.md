# Design Document: Fase 32 — Limitación de Cards Delivery en Vista Resumen Admin

```mermaid
graph TD
    RadarPage["RadarPage.jsx (overview mode)"] -->|limit=1| DeliveryCol["DeliveryColumn.jsx (renders 1 latest card)"]
    DeliveryCol -->|Boton "Ver todas ➔"| DeliveryTab["Pestaña Delivery (renders all cards without limit)"]
```
