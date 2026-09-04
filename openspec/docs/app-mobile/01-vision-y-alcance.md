# 01 - Visión y Alcance

## Visión

LabTab Mobile es la **interfaz del comensal**. En el hito MVP se entrega como **app nativa** (Android APK e iOS, probada con instalación manual en dispositivo): cuando un comensal escanea el QR de una mesa en un restaurante que usa LabTab, la app le permite:

1. Unirse a la sesión de la mesa (identificado o anónimo)
2. Ver el menú completo con precios, fotos y alérgenos
3. Hacer pedidos desde su celular (con modificadores/adicionales)
4. Seguir el estado de sus pedidos
5. Ver su subtotal y la cuenta
6. Pagar lo suyo (split por comensal)
7. Pagar con métodos reales (Mercado Pago para partir, Transbank/Webpay al escalar)

## Para Quién

**Comensal**: persona que escanea el QR de su mesa. No es el personal del restaurante (esos son los roles `STAFF`/`MANAGER`/`KITCHEN`/`OWNER` del backend).

## Alcance del Hito MVP (31 de octubre)

> La propuesta define el MVP del comensal así: *"la web app por QR: escanea, se une a la mesa, pide, ve su subtotal y paga lo suyo. También los pagos reales, con Mercado Pago para partir y Transbank cuando escalemos."*
> La app **descargable** (App Store / Google Play) es de **Producto terminado (31 dic)**, no de este hito.

### INCLUIDO en MVP

| Feature | Descripción | Prioridad |
|---------|-------------|-----------|
| QR Onboarding | Escanear QR, **unirse a sesión OPEN** existente (no la crea) | P0 |
| Ver Menú | Secciones, platos, precios, alérgenos, disponibilidad (Lista 86) | P0 |
| Hacer Pedido | Agregar platos + modificadores/adicionales, enviar a cocina | P0 |
| Seguir Estado | Estados del pedido (ver nota de tiempo real en 08) | P0 |
| Ver Cuenta | Subtotal, servicio, propina, total, saldo | P0 |
| Pagar lo suyo | Split por comensal (`summary-by-guest`) + pago parcial | P0 |
| Pago real | Mercado Pago (P0) · Transbank/Webpay (al escalar) | P0 |
| Manejo de errores/devoluciones | Estados de error, reintento, reembolso vía staff | P1 |
| S.O.S. (Llamar al mesero) | Botón para pedir mesero/cuenta/agua desde la mesa | P0 |
| Feedback Post-Pago | Modal de calificación 1-5 al momento de pagar | P1 |
| Login/Registro | Email + password, JWT | P1 |
| Perfil | Ver/editar nombre, alérgenos | P1 |

### NO INCLUIDO en MVP (futuro)

| Feature | Razón |
|---------|-------|
| App descargable (App/Play Store) | *Producto terminado* (31 dic) |
| Arqueo / cierre de caja / turnos | Lado del **local**, no del comensal; falta entidad en back (gap) |
| Reservas | Entidad `RESERVATION` post-MVP |
| Favoritos | `FAVORITE` post-MVP |
| DTE / SII (boleta/factura) | `TAX_DOCUMENT`, `SII_CAF_POOL` post-MVP |
| Inventario | `STOCK_ITEM`, `RECIPE_INGREDIENT` (1ra versión) |
| Multi-idioma | MVP solo `es-CL` |
| Dark mode | Fase 2 |

> **Dependencia de backend (S.O.S. y Feedback)**: `SERVICE_REQUEST` y `DINE_FEEDBACK` están en el modelo de 29 entidades y con enums preparados (`ServiceRequestStatusEnum`, `ServiceRequestTypeEnum`), pero **aún no tienen controller/endpoint implementado** en `LabTab-Back` (solo figuran como contrato en `back/api-contracts/rest-api.md`). Se incluyen en el alcance MVP condicionado a que el backend exponga `POST /service-requests` y `POST /feedback`. Ver 08.

## Usuario Target

- Adulto 18-55 años
- Usa smartphone (Android 10+ / iOS 15+)
- Compra en restaurantes, usa apps de delivery (Rappi, PedidosYa)
- Valora comodidad: no quiere esperar al mesero para pedir o pagar
- Comparte cuentas con amigos/compañeros

## Propuesta de Valor

> "Escaneá, pedí y pagá desde tu celular. Sin filas, sin esperas, sin complicaciones."

## Restricciones del MVP

1. **Solo Chile**: CLP, horario Santiago, Transbank/Webpay y Mercado Pago
2. **Sin delivery**: solo dine-in
3. **El comensal no crea sesiones**: la mesa debe tener una sesión OPEN abierta por el staff
4. **Sin L10n**: solo español
5. **Offline mínimo**: solo menú cacheado, todo lo demás requiere red
6. **Una mesa a la vez**: el comensal está en UNA mesa de UNA sucursal

## Relación con la Propuesta (alineación)

| Fase propuesta | Fecha | Rol de la app del comensal |
|---|---|---|
| Alfa | 30 sep | Backend operado por el staff (mozo/cocina/cobro). El comensal **no** tiene app todavía |
| **MVP** | **31 oct** | **Web app por QR: escanea → se une → pide → ve subtotal → paga lo suyo + pagos reales** |
| 1ra versión | 30 nov | Inventario, analíticas, logs (no es comensal) |
| Producto terminado | 31 dic | **App descargable** publicada en App Store / Google Play |
