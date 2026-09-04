# Spec: client-referrals — Vista dedicada de invitar amigos (referidos) del cliente

## Purpose

Eleva el referido del cliente (`ClientProfilePage`, tab "Invitar Amigos") a una vista dedicada mobile-first (`/cliente/invitar-amigos`) con flujo demo de alta calidad: código + link compartible con copiado, share por redes sociales, envío por email/teléfono con validación y confirmación, e historial con estadísticas. Toda la lógica compartida vive en `src/features/ClientView/utils/shareUtils.js` (puro, testable RED-GREEN con `npm run test`, `strict_tdd: true`). Es una capability NUEVA: no modifica requirements spec-level existentes.

## Decisiones de alcance (resolución de riesgos del proposal)

1. **Código de referido centralizado**: `shareUtils.js` MUST exportar la constante `REFERRAL_CODE` (`CONSTANZA-REWARDS-2026`) como única fuente de la vista nueva; la vista MUST NOT hardcodear el código nuevamente. `ClientProfilePage` conserva su valor inline actual sin cambios (reescribir su mecanismo está out of scope; la integración se limita al botón "Invitar amigos").
2. **Clipboard en jsdom**: los tests MUST mockear `navigator.clipboard.writeText` (jsdom no lo implementa); el componente MUST envolver el copiado en try/catch (patrón existente en `ClientProfilePage.handleCopyReferral`) para no crashear si el API falta.
3. **Compartir archivos (routes)**: el cambio de rutas es mínimo y declarado — un export lazy en `src/routes/views.jsx` (`ClientInviteFriendsView`) + una entrada en la tabla `routes` de `src/routes/index.jsx` para `/cliente/invitar-amigos`, siguiendo el patrón de `ClientQrScanView`. No se reordenan ni modifican rutas existentes.
4. **Popup blockers**: los handlers sociales MUST abrir la URL en pestaña nueva vía `window.open(url, '_blank', 'noopener')` en handler síncrono (demo in-browser); los tests solo validan las URLs puras devueltas por `buildShareUrl`, no la apertura real.
5. **Persistencia del historial**: la persistencia en localStorage es opcional (MAY); si se implementa, el historial MUST ser consistente tras reload (mismo orden y contenido).

## Requirements

### Requirement: Código y link de referido con copiado `[referral-code-card]`

La vista MUST renderizar una card con el código de referido (`REFERRAL_CODE`) y su link compartible `buildReferralLink(code)` → `https://mesasplit.app/r/<CODE>`. El botón "Copiar" MUST invocar `navigator.clipboard.writeText` con el código (try/catch) y MUST mostrar feedback "¡Copiado!" durante al menos 2 segundos tras la acción (patrón `copiedReferral` existente).

#### Scenario: La card muestra código y link correctos

- GIVEN `REFERRAL_CODE = 'CONSTANZA-REWARDS-2026'`
- WHEN la vista renderiza la card
- THEN el código visible es `CONSTANZA-REWARDS-2026` Y el link visible es `https://mesasplit.app/r/CONSTANZA-REWARDS-2026`

#### Scenario: Copiar con clipboard mockeado

- GIVEN `navigator.clipboard.writeText` mockeado en jsdom
- WHEN el cliente presiona "Copiar"
- THEN `writeText` se invoca con `REFERRAL_CODE` Y el feedback "¡Copiado!" es visible

#### Scenario: Clipboard no disponible no crashea

- GIVEN `navigator.clipboard` indefinido (fallo del API)
- WHEN el cliente presiona "Copiar"
- THEN no se lanza excepción Y la vista muestra el feedback "¡Copiado!" (demo)

### Requirement: Compartir por redes sociales `[social-share]`

La vista MUST exponer botones visibles para WhatsApp, X/Twitter, Facebook, Email y Telegram. `buildShareUrl(canal, url, texto)` MUST devolver la URL de intent correcta por canal — WhatsApp `https://wa.me/?text=`, X/Twitter `https://twitter.com/intent/tweet?text=&url=`, Facebook `https://www.facebook.com/sharer/sharer.php?u=`, Email `mailto:?subject=&body=`, Telegram `https://t.me/share/url?url=&text=` — y cada URL MUST incluir el link de referido y el texto de invitación codificados (encodeURIComponent). Al presionar un botón, la vista MUST abrir la URL en pestaña nueva (`window.open(url, '_blank', 'noopener')`).

#### Scenario: URL de WhatsApp correcta

- GIVEN link de referido `https://mesasplit.app/r/CONSTANZA-REWARDS-2026` y texto de invitación
- WHEN se invoca `buildShareUrl('whatsapp', link, texto)`
- THEN devuelve `https://wa.me/?text=<encodeURIComponent(texto + link)>`

#### Scenario: URL de X/Twitter correcta

- GIVEN link y texto de invitación
- WHEN se invoca `buildShareUrl('twitter', link, texto)`
- THEN devuelve `https://twitter.com/intent/tweet?text=<enc>&url=<enc>` con ambos valores codificados

#### Scenario: URL de Facebook, Email y Telegram correctas

- GIVEN link y texto de invitación
- WHEN se invoca `buildShareUrl` para cada canal
- THEN devuelve `https://www.facebook.com/sharer/sharer.php?u=<enc>` (facebook), `mailto:?subject=<enc>&body=<enc>` (email) y `https://t.me/share/url?url=<enc>&text=<enc>` (telegram)

#### Scenario: Apertura en pestaña nueva

- GIVEN un spy sobre `window.open`
- WHEN el cliente presiona el botón social de WhatsApp
- THEN `window.open` se invoca con la URL de wa.me, `'_blank'` y `'noopener'`

### Requirement: Envío por email o teléfono `[send-invite-form]`

La vista MUST exponer un formulario con input de email O teléfono (seleccionable) y mensaje opcional. `isValidEmail` y `isValidPhone` (puras, exportadas desde `shareUtils.js`) MUST validar el input antes de proceder. Con input válido y submit, la vista MUST mostrar la confirmación demo "Invitación enviada a <destinatario>" y MUST abrir el fallback del canal (mailto: si es email, wa.me si es teléfono) en pestaña nueva. Con input inválido, la vista MUST NOT proceder y MUST mostrar error de validación visible.

#### Scenario: Envío demo por email válido

- GIVEN email `amiga@ejemplo.cl` y mensaje opcional
- WHEN el cliente envía el formulario
- THEN se muestra "Invitación enviada a amiga@ejemplo.cl" Y `window.open` se invoca con `mailto:?subject=<enc>&body=<enc>`

#### Scenario: Envío demo por teléfono válido

- GIVEN teléfono `+56 9 8765 4321`
- WHEN el cliente envía el formulario
- THEN se muestra "Invitación enviada a +56 9 8765 4321" Y `window.open` se invoca con `https://wa.me/?text=<enc>`

#### Scenario: Input inválido bloqueado

- GIVEN email `no-es-un-email` o teléfono `abc`
- WHEN el cliente envía el formulario
- THEN no se muestra confirmación Y el mensaje de error de validación es visible

#### Scenario: Validadores puros

- GIVEN `isValidEmail('x@y.cl')`, `isValidEmail('malo')`, `isValidPhone('+56987654321')`, `isValidPhone('abc')`
- WHEN se evalúan los validadores
- THEN devuelven `true`, `false`, `true`, `false` respectivamente

### Requirement: Historial y estadísticas de invitaciones `[invite-history]`

La vista MUST renderizar un historial demo read-only de invitaciones (fixture: destinatario, canal, fecha y estado) y estadísticas de "Enviadas" y "Aceptadas" derivadas del mismo fixture. La vista MUST NOT mutar el fixture (read-only). Si se persiste en localStorage (MAY), el historial MUST restaurarse consistente tras reload.

#### Scenario: Lista demo visible

- GIVEN el fixture con al menos 3 invitaciones
- WHEN la vista renderiza el historial
- THEN cada fila muestra destinatario, canal, fecha y estado

#### Scenario: Stats derivadas del fixture

- GIVEN fixture con 4 invitaciones enviadas y 2 aceptadas
- WHEN la vista renderiza las estadísticas
- THEN muestra "Enviadas: 4" Y "Aceptadas: 2"

#### Scenario: Consistencia tras reload si se persiste

- GIVEN historial persistido en localStorage (clave propia de la demo)
- WHEN la vista se rehidrata tras reload
- THEN el historial mostrado es idéntico al persistido (mismo contenido y orden)

### Requirement: Responsive móvil `[mobile-responsive]`

La vista MUST permanecer usable en viewports pequeños: layout apilado (una columna), acciones a ancho completo, CTA primario alineado al fondo de la card y padding inferior `pb-24` para no quedar tapado por `ClientBottomNav`. Debe seguir los patrones móviles del área cliente: `AppHeader` con `currentRoute` (que provee botón volver ⬅️) y `ClientBottomNav` presente.

#### Scenario: Layout apilado en viewport pequeño

- GIVEN viewport móvil (ej. 375px)
- WHEN la vista renderiza
- THEN la card y sus acciones usan ancho completo y apilamiento vertical, sin scroll horizontal

#### Scenario: CTA primario al fondo de la card

- GIVEN la card de envío visible
- WHEN se inspecciona el layout
- THEN el CTA primario ("Enviar invitación") está alineado al fondo y a ancho completo

#### Scenario: Contenido no tapado por la bottom nav

- GIVEN la vista renderizada con `ClientBottomNav` presente
- WHEN se inspecciona el contenedor principal
- THEN existe padding inferior `pb-24` y el historial completo es desplazable/visible

### Requirement: Ruta y punto de integración `[routing-integration]`

`src/routes/views.jsx` MUST exportar `ClientInviteFriendsView` (lazy → `InviteFriendsPage.jsx`) y `src/routes/index.jsx` MUST registrar `/cliente/invitar-amigos` (cambio mínimo, sin tocar otras rutas). El tab "Invitar Amigos" de `ClientProfilePage` MUST agregar un botón/enlace "Invitar amigos" que navega a la vista, manteniendo el resto del tab (código inline, copiado, historial demo actual) sin cambios funcionales.

#### Scenario: Ruta registrada renderiza la vista

- GIVEN la tabla `routes` exportada
- WHEN se navega a `/cliente/invitar-amigos`
- THEN se renderiza `InviteFriendsPage` con header de cliente y bottom nav

#### Scenario: Navegación desde el tab Referidos

- GIVEN el tab "Invitar Amigos" de `ClientProfilePage`
- WHEN el cliente presiona "Invitar amigos"
- THEN navega a `/cliente/invitar-amigos`

#### Scenario: Sin regresión en el tab Referidos

- GIVEN el tab Referidos de `ClientProfilePage` con su código inline y botón Copiar existentes
- WHEN se agrega el botón "Invitar amigos"
- THEN copiar y feedback siguen funcionando y los tests existentes de `ClientProfilePage` pasan

## Resumen (ADDED)

Todas las requirements anteriores son ADDED para la capability `client-referrals`: `referral-code-card`, `social-share`, `send-invite-form`, `invite-history`, `mobile-responsive`, `routing-integration`. No hay requirements MODIFIED ni REMOVED.
