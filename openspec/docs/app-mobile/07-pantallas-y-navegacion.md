# 07 - Pantallas y Navegacion

## Arbol de Navegacion

```
App
├── Splash Screen (carga, auto-login)
├── QR Scanner Screen (camara)
├── Onboarding Screen (nombre requerido, sin alergios en UI)
├── Login Screen
├── Home Screen (ShellRoute - BottomNav)
│   ├── Tab 1: Menu Screen
│   │   └── Dish Detail Screen (pantalla completa)
│   ├── Tab 2: Orders Screen (polling manual, sin auto-refresh)
│   └── Tab 3: Bill Screen
│       └── Payment Screen
│           └── Payment Success Screen
├── Sos Screen (mocked, FAB desde HomeScreen)
└── Feedback Screen (mocked, desde BillScreen)

⚠️ NO implementado en MVP:
- BillSplitScreen
- ProfileScreen
- WebpayWebView
```

---

## Pantalla 1: QR Scanner

**Pantalla de entrada**. La app abre directamente en la camara.

```
┌──────────────────────────────┐
│  ◄  LabTab                   │
│                              │
│   ┌──────────────────────┐   │
│   │                      │   │
│   │    [CAMARA LIVE]     │   │
│   │                      │   │
│   │   ┌──────────────┐   │   │
│   │   │  Marco QR    │   │   │
│   │   │  (animated)  │   │   │
│   │   └──────────────┘   │   │
│   │                      │   │
│   └──────────────────────┘   │
│                              │
│  Escanea el QR de tu mesa   │
│                              │
│  ¿No tienes QR?              │
│  [Ingresar codigo manual]    │
│                              │
│  ¿Ya tienes cuenta?          │
│  [Iniciar sesion]            │
└──────────────────────────────┘
```

**Comportamiento**:
- Abre camara automaticamente al iniciar app
- Detecta QR con formato `labtab://b/{branchId}/t/{tableId}/s/{qrToken}`
- Loading overlay mientras backend procesa
- Error toast si QR invalido
- Bottom links: codigo manual + login

---

## Pantalla 2: Onboarding (post-QR)

```
┌──────────────────────────────┐
│  ◄  Bienvenido a             │
│     LabTab Centro            │
│                              │
│  Mesa: 5                     │
│                              │
│  ¿Como te llamas? *          │
│  ┌──────────────────────┐   │
│  │ Juan                 │   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │    Unirme a la mesa   │   │
│  └──────────────────────┘   │
│                              │
│  Ya tengo cuenta → Login     │
└──────────────────────────────┘
```

> ⚠️ MVP: nombre es REQUERIDO (no opcional). Sin campo de alergios en UI (backend lo soporta pero la app nunca lo envía — siempre `[]`).

---

## Pantalla 3: Login

```
┌──────────────────────────────┐
│  ◄  LabTab                   │
│                              │
│  ┌──────────────────────┐   │
│  │      [LOGO]          │   │
│  └──────────────────────┘   │
│                              │
│  Email                       │
│  ┌──────────────────────┐   │
│  │ juan@example.com      │   │
│  └──────────────────────┘   │
│                              │
│  Contrasena                  │
│  ┌──────────────────────┐   │
│  │ ••••••••       [ojo] │   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │      Ingresar        │   │
│  └──────────────────────┘   │
│                              │
│  ¿Olvidaste tu contrasena?   │
│  ¿No tienes cuenta? Registrarse │
└──────────────────────────────┘
```

---

## Pantalla 4: Home (Menu) - Tab 1

```
┌──────────────────────────────┐
│  LabTab Centro    [Perfil ◉] │
│  Mesa 5 - 3 personas         │
├──────────────────────────────┤
│  [Entradas] [Fondos] [Bebi- │
│   das] [Postres]             │
├──────────────────────────────┤
│  ┌──────────────────────┐   │
│  │ [IMG] Empanadas      │   │
│  │       de mariscos    │   │
│  │  4 unidades, salsa   │   │
│  │  de ajo              │   │
│  │  ⚠ Gluten, Mariscos  │   │
│  │  $8.900              │   │
│  │         [Agregar +]  │   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │ [IMG] Papas bravas   │   │
│  │  Con salsa picante   │   │
│  │  ⚠ Lactosa           │   │
│  │  $6.500              │   │
│  │         [Agregar +]  │   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │ [IMG] Ceviche congrio│   │
│  │  NO DISPONIBLE       │   │
│  │  (tachado)           │   │
│  └──────────────────────┘   │
│                              │
├──────────────────────────────┤
│  [Menu]  [Pedidos(2)]  [Cta] │
│           ^badge              │
└──────────────────────────────┘
```

**Comportamiento**:
- Scroll vertical con secciones como headers en lista plana (no expandible/colapsable)
- Tap en plato → DishDetailScreen (pantalla completa, no modal)
- Pull-to-refresh para recargar menú
- Platos no disponibles se muestran atenuados sin botón
- Badge en tab "Pedidos" con cantidad de items activos
- Skeleton loader en carga inicial

---

## Pantalla 5: Detalle de Plato (Modal)

```
┌──────────────────────────────┐
│  ✕                            │
│  ┌──────────────────────┐   │
│  │                      │   │
│  │   [FOTO GRANDE]      │   │
│  │                      │   │
│  └──────────────────────┘   │
│                              │
│  Empanadas de mariscos       │
│  4 unidades con salsa de ajo │
│                              │
│  ⚠ Gluten, Mariscos          │
│                              │
│  Notas para la cocina:       │
│  ┌──────────────────────┐   │
│  │ Sin cebolla por favor │   │
│  └──────────────────────┘   │
│                              │
│  Cantidad:  [-]  2  [+]     │
│                              │
│  Curso:                       │
│  (●) Entrada  ( ) Fondo      │
│  ( ) Postre                   │
│                              │
│  ┌──────────────────────┐   │
│  │   Agregar $17.800    │   │
│  └──────────────────────┘   │
└──────────────────────────────┘
```

---

## Pantalla 6: Pedidos - Tab 2

```
┌──────────────────────────────┐
│  Mis Pedidos                  │
├──────────────────────────────┤
│                              │
│  Pedido #1 - Entradas        │
│  Hace 5 min                  │
│  ┌─────────────────────────┐│
│  │ Empanadas x2    🟡 Prep ││
│  │ Salmón          🟢 Listo││
│  └─────────────────────────┘│
│                              │
│  Pedido #2 - Fondo           │
│  Hace 2 min                  │
│  ┌─────────────────────────┐│
│  │ Pisco Sour x3   🔵 Rec.││
│  └─────────────────────────┘│
│                              │
│  ┌──────────────────────┐   │
│  │   Hacer otro pedido   │   │
│  └──────────────────────┘   │
│                              │
├──────────────────────────────┤
│  [Menu]  [Pedidos(2)]  [Cta] │
└──────────────────────────────┘
```

**Colores de estado**:
- 🔵 Azul = PLACED (Recibido)
- 🟠 Naranja = ACCEPTED / IN_PREPARATION (En cocina)
- 🟢 Verde = READY (Listo para servir)
- 🟢 Verde oscuro = SERVED (Entregado)
- 🔴 Rojo = CANCELLED

**Comportamiento**:
- Carga inicial con `CircularProgressIndicator`
- Pull-to-refresh para actualizar manualmente
- ⚠️ Polling automático NO implementado en MVP (solo refresh manual)
- Tap en pedido muestra detalle inline

---

## Pantalla 7: Cuenta - Tab 3

```
┌──────────────────────────────┐
│  Mi Cuenta                    │
├──────────────────────────────┤
│                              │
│  Subtotal           $26.700  │
│  Servicio (10%)      $2.670  │
│  Propina               $0   │
│  Descuento             $0   │
│  ─────────────────────────  │
│  TOTAL              $29.370  │
│                              │
│  Ya pagado:            $0   │
│  Saldo pendiente: $29.370   │
│                              │
│  ┌──────────────────────┐   │
│  │  Dividir cuenta       │   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │  Pagar todo ($29.370) │   │
│  └──────────────────────┘   │
│                              │
├──────────────────────────────┤
│  [Menu]  [Pedidos]  [Cta(1)]│
└──────────────────────────────┘
```

---

## Pantalla 8: Dividir Cuenta

```
┌──────────────────────────────┐
│  ◄  Dividir Cuenta           │
├──────────────────────────────┤
│                              │
│  Tus items:                  │
│  ☑ Empanadas x2     $17.800 │
│  ☑ Salmón           $18.900 │
│  ☐ Pisco Sour (compartido)  │
│                              │
│  Items compartidos:          │
│  Pisco Sour x3     $22.500  │
│  (3 personas = $7.500 c/u)  │
│                              │
│  ─────────────────────────  │
│  Tu total:           $44.200 │
│  + Servicio (10%)    $4.420  │
│  ─────────────────────────  │
│  Total a pagar:      $48.620 │
│                              │
│  ┌──────────────────────┐   │
│  │   Pagar $48.620       │   │
│  └──────────────────────┘   │
│                              │
│  Otros comensales:           │
│  Maria: $8.250 pendiente     │
│  Pedro: $8.250 pendiente     │
└──────────────────────────────┘
```

**Comportamiento**:
- Checkboxes para items individuales
- Items compartidos se muestran con division calculada
- Total se recalcula en tiempo real al marcar/desmarcar
- La division final la calcula el backend (zero-trust)

---

## Pantalla 9: Seleccion de Metodo de Pago

```
┌──────────────────────────────┐
│  ◄  Pagar                    │
├──────────────────────────────┤
│                              │
│  Monto a pagar:              │
│  ┌──────────────────────┐   │
│  │      $48.620         │   │
│  └──────────────────────┘   │
│                              │
│  Propina (opcional):         │
│  [$0] [$1.000] [$2.000]     │
│  [$3.000]                   │
│                              │
│  Metodo de pago:             │
│  ┌──────────────────────┐   │
│  │ ● Efectivo (CASH)    │   │
│  │ ○ Tarjeta (WEBPAY)   │   │
│  │ ○ Mercado Pago       │   │
│  │ ○ Transferencia      │   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │   Pagar ahora         │   │
│  └──────────────────────┘   │
│                              │
│  🔒 Pago seguro              │
└──────────────────────────────┘
```

> ⚠️ MVP: sin integración real con gateway. Métodos son solo registro.
> No hay QR como método de pago. Tarjeta y MP son métodos separados.
> Propinas: solo botones predefinidos (sin input libre).

---

## Pantalla 10: Exito de Pago

```
┌──────────────────────────────┐
│                              │
│                              │
│         ┌────────┐           │
│         │   ✓    │           │
│         └────────┘           │
│                              │
│      ¡Pago exitoso!          │
│                              │
│      $48.620                 │
│      Efectivo                │
│                              │
│  ┌──────────────────────┐   │
│  │    Volver al menú    │   │
│  └──────────────────────┘   │
│                              │
└──────────────────────────────┘
```

> ⚠️ MVP: navegación post-pago es a /menu (no a la cuenta).
> No hay muestra de "Tu cuenta está saldada" ni "Gracias por visitarnos".

---

## Componente: Boton S.O.S. (Pantalla completa)

Botón flotante (FAB) visible en HomeScreen (todas las tabs). Navega a `/sos` (pantalla completa, no bottom sheet).

```
┌──────────────────────────────┐
│  ◄  S.O.S.                   │
│                              │
│  ┌──────────────────────┐   │
│  │ 🛎 Mesero            │   │
│  │ Necesito atención    │   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │ 💰 Cuenta            │   │
│  │ Quiero pagar         │   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │ 💧 Agua              │   │
│  │ Necesito agua        │   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │ ❓ Otro              │   │
│  │ Otro problema        │   │
│  └──────────────────────┘   │
└──────────────────────────────┘
```

**Comportamiento**: MVP: mock hardcoded — muestra "Solicitud enviada. El mesero se acercará pronto." Sin backend real. Sin flags `kSosEnabled`.

---

## Componente: Pantalla Feedback

Pantalla completa en `/feedback` (no es modal). Accesible desde BillScreen ("Dejar feedback" button).

```
┌──────────────────────────────┐
│  ◄  Feedback                 │
│                              │
│     ★ ★ ★ ★ ☆   (1-5)       │
│                              │
│  ┌──────────────────────┐   │
│  │ Comentario (opcional)│   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │    Enviar            │   │
│  └──────────────────────┘   │
└──────────────────────────────┘
```

**Comportamiento**: MVP: mock hardcoded — muestra "Gracias por tu feedback!" Sin backend real. Sin flags `kFeedbackEnabled`. Botón deshabilitado si no hay rating.

---

## Arbol de Rutas (go_router)

> ⚠️ Rutas reales de la implementación (difieren del spec original)

```
/splash              → SplashScreen (auto-login check)
/qr-scan             → QrScanScreen (cámara)
/onboarding          → OnboardingScreen (nombre requerido)
/login               → LoginScreen (staff)
/menu                → MenuScreen (ShellRoute tab 1)
/menu/:dishId        → DishDetailScreen
/orders              → OrderScreen (ShellRoute tab 2)
/bill                → BillScreen (ShellRoute tab 3)
/payment             → PaymentScreen (desde BillScreen)
/payment-success     → PaymentSuccessScreen
/sos                 → SosScreen (FAB desde HomeScreen)
/feedback            → FeedbackScreen (desde BillScreen)
```

**Notas**:
- ShellRoute con 3 tabs: Menu, Orders, Bill
- FAB S.O.S. visible en todas las tabs de HomeScreen
- BillSplitScreen NO implementado en MVP
- ProfileScreen NO implementado en MVP
- WebpayWebView NO implementado en MVP
