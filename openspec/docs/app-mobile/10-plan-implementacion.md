# 10 - Plan de Implementacion

## Timeline General: 6 semanas

| Semana | Fase | Entregable |
|--------|------|------------|
| 1 | Setup + Auth | Proyecto, login, QR onboarding |
| 2 | Menu + Ordenes | Ver menu, hacer pedido |
| 3 | Tiempo Real | WebSocket, estado de pedidos |
| 4 | Cuenta + Division | Bill, split, seleccion de items |
| 5 | Pagos | Webpay, MercadoPago, cash, transfer |
| 6 | Polish + QA | Tests, bugs, performance, handoff |

---

## Fase 1: Setup y Autenticacion (Semana 1)

### Dia 1-2: Proyecto Base

```
[ ] Inicializar proyecto Flutter
[ ] Configurar estructura de directorios (Clean Architecture)
[ ] Configurar go_router con rutas base
[ ] Configurar Riverpod
[ ] Configurar retrofit + dio + interceptors
[ ] Configurar flutter_secure_storage
[ ] Configurar freezed + json_serializable + build_runner
[ ] Crear tema (theme.dart) con colores LabTab
[ ] Crear constantes (API URLs, timeouts)
[ ] Crear widget base (LabTabButton, LabTabCard, PriceText)
```

### Dia 3-4: Auth

```
[ ] Implementar AuthRepository (login, refresh, logout, guestSession)
[ ] Implementar AuthProvider (state management)
[ ] Crear LoginScreen con formulario
[ ] Crear OnboardingScreen (nombre + alergenos)
[ ] Implementar auto-refresh token (interceptor)
[ ] Implementar Splash Screen (auto-login check)
[ ] Configurar ProtectedRoute (guard de navegacion)
```

### Dia 5: QR Scanner

```
[ ] Integrar mobile_scanner para QR
[ ] Implementar parseo de QR payload
[ ] Conectar con POST /auth/guest-session
[ ] Manejo de errores (QR invalido, mesa no encontrada)
[ ] Test manual: QR fisico del backend
```

### Criterios de Cierre Fase 1

- [ ] App compila y corre en Android + iOS
- [ ] Login funciona con credenciales reales
- [ ] QR scan redirige a onboarding
- [ ] Guest session crea JWT valido
- [ ] Tokens se almacenan en secure storage
- [ ] Auto-refresh funciona (testear con token near-expiry)

---

## Fase 2: Menu y Ordenes (Semana 2)

### Dia 1-2: Menu

```
[ ] Implementar MenuRepository (getSections, getDish)
[ ] Implementar MenuProvider
[ ] Crear MenuScreen con secciones sticky
[ ] Crear DishCard widget
[ ] Crear DishDetailScreen (modal con foto, precio, alergenos)
[ ] Implementar cache de menu (flutter_cache_manager)
[ ] Pull-to-refresh
[ ] Marcar platos no disponibles (Lista 86)
```

### Dia 3-4: Ordenes

```
[ ] Implementar OrderRepository (createOrder, getOrders, getSessionOrders)
[ ] Implementar OrderProvider (carrito + pedidos)
[ ] Crear CartWidget (bottom sheet con items seleccionados)
[ ] Crear OrderScreen (lista de pedidos con estados)
[ ] Crear OrderLineCard (item con estado y color)
[ ] Implementar notas y modificadores
[ ] Implementar seleccion de curso (entrada/fondo/postre)
```

### Dia 5: Integracion Menu-Orden

```
[ ] Conectar "Agregar" del plato al carrito
[ ] Enviar pedido: POST /orders
[ ] Mostrar pedido creado en OrdersScreen
[ ] Badge en tab de pedidos con cantidad
[ ] Test: agregar 3 platos distintos, enviar, verificar en backend
```

### Criterios de Cierre Fase 2

- [ ] Menu carga desde backend con datos reales
- [ ] Se pueden agregar platos al carrito
- [ ] Se puede enviar un pedido completo
- [ ] El pedido aparece en la pantalla de pedidos
- [ ] Los precios coinciden con el backend (zero-trust verificado)

---

## Fase 3: Estado en Vivo (Semana 3)

> **Gap de canal GUEST**: el backend hoy bloquea al rol GUEST en los topics `/topic/branch/...`. El MVP arranca con **polling** (`GET /sessions/{sessionId}/orders`); STOMP se suma cuando el back habilite un topic de sesión (ver 08).

### Dia 1-2: Polling de Estado

```
[ ] Implementar OrderProvider con polling de GET /sessions/{sessionId}/orders
[ ] Intervalo de polling configurable (5-10s), pausar en background
[ ] Mostrar estados PLACED/IN_PREPARATION/READY/SERVED/CANCELLED
[ ] Test de polling con backend real
```

### Dia 3-4: Notificaciones Locales

```
[ ] Detectar transición de línea a READY vía polling
[ ] Implementar notificacion local (flutter_local_notifications)
[ ] Sonido/haptico cuando item esta READY
[ ] Evitar notificaciones duplicadas (trackear id ya notificado)
```

### Dia 5: Sincronizacion y Cierre

```
[ ] Test end-to-end: enviar pedido -> ver cambio de estado (polling)
[ ] Test: pausar/reanudar polling en background/foreground
[ ] Verificar que no haya parpadeo de UI entre polls
```

### Criterios de Cierre Fase 3

- [ ] Los estados de los platos se actualizan sin recarga manual
- [ ] Se recibe notificacion local cuando un plato pasa a READY
- [ ] El polling no se dispara en background (ahorro de red)
- [ ] No hay duplicados de notificaciones

> Si antes del cierre el backend habilita un topic de sesión para GUEST, esta fase migra a STOMP manteniendo el polling como fallback.

---

## Fase 4: Cuenta y Division (Semana 4)

### Dia 1-2: Ver Cuenta

```
[ ] Implementar BillRepository (getSessionBill, getSummaryByGuest)
[ ] Implementar BillProvider
[ ] Crear BillScreen (desglose de cuenta)
[ ] Crear BillSummaryCard (subtotal, servicio, propina, total)
[ ] Crear BillLineList (items de la cuenta)
[ ] Conectar con POST /bills para crear cuenta
```

### Dia 3-4: Dividir Cuenta

```
[ ] Crear BillSplitScreen
[ ] Implementar checkboxes para seleccionar items
[ ] Mostrar items compartidos con division calculada
[ ] Recalculo en tiempo real al seleccionar/deseleccionar
[ ] Conectar con GET /bills/{id}/summary-by-guest
[ ] Mostrar resumen por comensal
[ ] Implementar "Pagar mi parte"
```

### Dia 5: Integracion

```
[ ] Flujo completo: ver cuenta -> dividir -> seleccionar items -> ver total
[ ] Test con 2+ comensales
[ ] Test con items compartidos e individuales
[ ] Verificar que el backend calcula correctamente
```

### Criterios de Cierre Fase 4

- [ ] La cuenta se muestra con desglose correcto
- [ ] La division por comensal funciona
- [ ] Los items compartidos se dividen equitativamente
- [ ] El total por comensal es correcto
- [ ] La UI se actualiza al seleccionar items

---

## Fase 5: Pagos (Semana 5)

### Dia 1-2: MercadoPago

```
[ ] Integrar checkout MercadoPago (WebView)
[ ] Implementar flujo: POST /payments -> checkout -> verificar GET /payments/{id}
[ ] Crear PaymentSuccessScreen
[ ] Manejar estados PENDING/COMPLETED (polling)
[ ] Manejar errores de pago (rechazo, timeout)
```

### Dia 3: Webpay (Transbank) + Alternativos

```
[ ] Implementar Webpay (Transbank) — al escalar
[ ] Implementar pago en Efectivo (marcar como pendiente, el staff confirma)
[ ] Implementar pago por Transferencia (mostrar datos + monto)
[ ] Crear PaymentMethodSelector widget
```

### Dia 4: Propina

```
[ ] Implementar seleccion de propina ($0, $3000, $5000, otro)
[ ] Calcular total con propina
[ ] Enviar tipAmount en CreatePaymentRequest
```

### Dia 5: Cierre de Sesion

```
[ ] Cuando balanceDue == 0 -> cerrar sesion automaticamente
[ ] Mostrar pantalla de exito
[ ] Table status -> AVAILABLE (via WebSocket)
[ ] Redirigir a pantalla inicial
```

### Criterios de Cierre Fase 5

- [ ] Pago con MercadoPago funciona end-to-end (sandbox)
- [ ] Pago con efectivo y transferencia funciona
- [ ] La propina se envia correctamente
- [ ] La sesion se cierra al pagar todo
- [ ] La mesa vuelve a AVAILABLE
- [ ] No hay doble pago (optimistic locking verificado)

---

## Fase 6: Polish y QA (Semana 6)

### Dia 1-2: Testing

```
[ ] Unit tests para toda la business logic
[ ] Widget tests para pantallas criticas
[ ] Integration test: happy path completo
[ ] Fix de bugs encontrados
```

### Dia 3: Performance

```
[ ] Optimizar carga de imagenes (cache + thumbnails)
[ ] Medir cold start time (target < 3s)
[ ] Medir memory usage (target < 150MB)
[ ] Optimizar builds (tree shaking)
[ ] Reducir tamaño de APK/IPA (target < 25MB)
```

### Dia 4: UX Polish

```
[ ] Skeleton loaders en todas las pantallas
[ ] Empty states (sin pedidos, sin cuenta)
[ ] Error states (sin conexion, error del servidor)
[ ] Loading states (botoes deshabilitados durante request)
[ ] Animaciones de transicion
[ ] Haptico en acciones importantes
```

### Dia 5: QA Final y Handoff

```
[ ] QA del flujo completo comensal (QR -> pedido -> pago)
[ ] Fix de bugs encontrados
[ ] Documentación de handoff (cómo levantar y probar)
[ ] Demo funcional quincenal (criterio de la propuesta)
```

### Criterios de Cierre Fase 6

- [ ] Todos los tests pasan
- [ ] Cobertura >= 80%
- [ ] Performance dentro de targets
- [ ] Sin crashes en test manual completo
- [ ] Demo funcional del flujo comensal punta a punta

> **La publicación en App Store / Google Play NO es de este hito** (es *Producto terminado*, 31 dic). En el MVP el comensal se entrega como app nativa (APK/iOS) instalada manualmente, no como web app.

---

## Dependencias entre Fases

```
Fase 1 (Setup + Auth)
  └──> Fase 2 (Menu + Ordenes)
         └──> Fase 3 (WebSocket)
                └──> Fase 4 (Cuenta)
                       └──> Fase 5 (Pagos)
                              └──> Fase 6 (Polish)
```

**No se puede saltar fases**. Cada una depende de la anterior.

## Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigacion |
|--------|---------|------------|
| Backend no listo | Alto | Usar mock server (prism) para desarrollo paralelo |
| Transbank sandbox inestable | Medio | Implementar mock de Webpay para tests |
| Canal GUEST (STOMP) no habilitado | Alto | Polling como mecanismo base hasta resolver la `pregunta-arquitectura` (ver 08) |
| Performance en devices low-end | Medio | Testear en device fisico desde Fase 2 |
| Cambios en API del backend | Alto | Contratos definidos en docs, comunicacion constante |

## Definition of Done (por Feature)

- [ ] Codigo implementado siguiendo Clean Architecture
- [ ] Unit tests escritos (>= 80% coverage)
- [ ] Widget tests para pantallas
- [ ] Funciona en Android (APK) + iOS (nativo)
- [ ] Funciona en device fisico (no solo emulator)
- [ ] No hay warnings de analyzer
- [ ] Code review completado
- [ ] Documentado en este doc si es feature compleja
