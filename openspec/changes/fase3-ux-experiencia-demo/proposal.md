# Proposal: fase3-ux-experiencia-demo — Mejoras Integrales de Experiencia de Usuario (UX)

## Intent

Elevar la experiencia de usuario (**UX**) de la demo de **MesaSplit** a un estándar SaaS *state-of-the-art* mediante un plan de 5 fases enfocadas en:
1. **Demo Control Floating Bar**: Hub de simulación en tiempo real para ejecutantes y evaluadores comerciales.
2. **Sincronización Inter-Vistas & Feedback**: Notificaciones flotantes/sonoras de S.O.S., stepper visual de pedido y patrón "Deshacer" (Undo).
3. **División de Cuenta & Pagos**: Progreso visual del pago de mesa, compartir QR/link por WhatsApp y slider interactivo de propinas.
4. **Menú Digital Personalizable**: Filtros nutricionales/dieta (`Vegano`, `Gluten Free`) y modal de modificadores de plato.
5. **Ergonomía Operativa & Atajos**: Atajos de teclado en POS/KDS (`F2`, `Espacio`, `Esc`) y modo táctil de alta densidad.

## Scope

### In Scope

**Fase 1: Demo Control Floating Bar**
- Componente global `DemoControlBar.jsx` colapsable en la esquina inferior con botones de disparo directo de eventos:
  - ⚡ *Simular Pedido de Mesa 4*
  - ⚡ *Simular Alerta S.O.S.*
  - ⚡ *Simular Plato Listo en Cocina*
  - ⚡ *Simular Solicitud de Cuenta & Pago QR*
  - 🔄 *Resetear Estado Demo*

**Fase 2: Sincronización Inter-Vistas & Feedback UX**
- Alerta flotante/sonora de S.O.S. en `/garzon` y `/admin` al pulsar el botón en `/cliente`.
- Stepper animado de progreso en `OrderTrackingBanner.jsx` (`Enviado` ➔ `Preparando` ➔ `Listo` ➔ `Entregado`).
- Toast con botón de "Deshacer" (`Undo`) de 5 segundos al completar tickets en KDS o anular comandas en Waiter.

**Fase 3: División de Cuenta & Pagos (Split Bill UX)**
- Componente `GroupSplitProgressBar.jsx` (% pagado, $ pendiente y estado por comensal).
- Botón "Compartir Link de Pago por WhatsApp" en el modal de división.
- Selector dinámico de propina sugerida (0%, 10%, 15%, 20%) con desglose inmediato por persona.

**Fase 4: Menú Digital Personalizable**
- Chips de filtro rápido por dieta (`🌱 Vegano`, `🌾 Gluten Free`, `🌶️ Picante`, `⭐ Popular`) en `ClientPage.jsx`.
- Modal `ItemCustomizerModal.jsx` para seleccionar término de cocción, acompañamiento e ingredientes a excluir.

**Fase 5: Ergonomía Operativa & Atajos (POS & KDS)**
- Listeners de atajos de teclado (`F2` Pagar en POS, `Espacio` Avanzar KDS, `Esc` Cerrar) con badges explicativos.
- Toggle de Modo Táctil de Botones Extragrandes para pantallas táctiles de baja precisión.

### Out of Scope
- Backend real, pasarelas de pago reales (MercadoPago/Webpay live) o SII DTE en producción.
- Cambios en el modelo de base de datos o arquitectura de stores (usaremos los stores Zustand existentes).

## Approach

Desarrollar incrementalmente en 5 fases lógicas. Cada fase mantiene `npm run test` y `npm run build` en verde, respetando `AGENTS.md` (comentarios por línea en español y commits convencional en español con el porqué de la decisión).
