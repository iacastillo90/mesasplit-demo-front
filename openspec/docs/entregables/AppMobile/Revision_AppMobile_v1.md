# Revisión de `labtab_app_v1` — Pendientes para llegar al 100%

> Checklist de correcciones. Resolver estos puntos y marcarlos (`[x]`) al cerrar.
> Todo lo demás ya está verificado y aprobado (polling, dinero en `int`, log redactado,
> env por plataforma, notificaciones en READY, perfil, feedback post-pago, specs, envelope).

**Última verificación:** 2026-09-03 — tercera pasada.

---

## ❌ Pendiente

### P1

- `[x]` **Verificación de estado del pago** — `getPayment` existe en `payment_api`/repo pero **no se usa**. El flujo termina en `POST /payments` → `payment_success_screen` directo, que muestra "Tu pago está siendo procesando" sin verificar. Implementar polling de `GET /payments/{paymentId}` (cada 2-3s, máx ~30s) y actualizar la UI a `COMPLETED`/`FAILED`/`REFUNDED`.
- `[x]` **WebView de MercadoPago / Transbank** — hoy el pago es simulado (sin redirect). Implementar la apertura del checkout en WebView (`webview_flutter`, ya en pubspec) y volver a la app para verificar el estado.
- `[x]` **Split con selección de ítems (FR-007)** — no existe `bill_split_screen.dart`. Hoy solo está el "Pagar mi parte" vía `summary-by-guest` (lectura). Implementar la UI de selección de ítems individuales/compartidos (checkbox), o explicitar en el spec que queda post-MVP.

### P2 (opcional)

- [ ] **Tests** — agregar test del flujo de verificación de pago (estado PENDING → COMPLETED) y del servicio de notificaciones.

---

## Prioridad

| Prioridad | Acción |
|---|---|
| P1 | Polling de `GET /payments/{id}` + estados |
| P1 | WebView MercadoPago/Transbank |
| P1 | Split: selección de ítems |
| P2 | Tests de verificación de pago + notificaciones |
