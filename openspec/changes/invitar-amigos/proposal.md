# Proposal: invitar-amigos — Vista Dedicada de Invitar Amigos (Referidos) con Compartir y Envío Demo

## Intención

El perfil del cliente (`ClientProfilePage.jsx`, tab "Invitar Amigos") ya expone un mecanismo básico de referidos: código hardcodeado `CONSTANZA-REWARDS-2026`, copiado al portapapeles (`copiedReferral`) y un link de WhatsApp. Falta una experiencia de invitación completa. Este change crea una vista DEDICADA mobile-first que eleva el referido a un flujo demo de alta calidad: link + código compartible, share por redes sociales, envío por email/teléfono con validación e historial, coherente con el lenguaje de diseño actual (bottom nav, botón volver, cards).

## Alcance

### In Scope
- `shareUtils.js` (puro, RED-GREEN): `buildReferralLink(code)` → `https://mesasplit.app/r/<CODE>`, `buildShareUrl(canal, url, texto)` para WhatsApp (wa.me), X/Twitter (intent), Facebook (sharer), Email (mailto) y Telegram (t.me), `isValidEmail` e `isValidPhone`.
- `InviteFriendsPage.jsx` (subvista del área cliente, ruta `/cliente/invitar-amigos`): card prominente código + link con copiar; botones sociales que abren la share URL en pestaña nueva; formulario email/teléfono + mensaje opcional con validación y confirmación demo "Invitación enviada a <destinatario>" (fallback mailto/wa.me); historial de invitaciones (fixture demo: destinatario, canal, fecha, estado) y stats (enviadas/aceptadas); persistencia localStorage opcional (MAY).
- Mobile-first: AppHeader con botón volver, `ClientBottomNav`, cards `rounded-3xl bg-white shadow-soft` y padding inferior `pb-24`.
- Integración mínima: botón "Invitar amigos" en el tab Referidos de `ClientProfilePage.jsx` que navega a la vista.
- Tests RTL de la vista (copiado, URLs sociales, validación, confirmación).

### Out of Scope
- Backend, envío real SMS/email, auth real — todo simulado (demo).
- Nuevo transporte realtime.
- Reescribir el mecanismo de referidos existente de `ClientProfilePage` más allá del punto de integración.

## Capacidades

> Contrato entre proposal y sdd-spec.

### Nuevas Capacidades
- `client-referrals`: flujo de invitación/referidos del cliente — código y link de referido con copiado, share URLs sociales, envío demo por email/teléfono con validación, historial y estadísticas, mobile-first.

### Capacidades Modificadas
- None — ningún requirement spec-level de las capabilities existentes cambia (la integración en `ClientProfilePage` es de implementación).

## Enfoque

Toda la lógica compartida vive en `shareUtils.js` puro (testable con `strict_tdd: true`); la vista es una página nueva registrada en `routes/index.jsx` + lazy en `routes/views.jsx`, siguiendo el patrón de `ClientQrScanPage`. El código de referido se centraliza en una constante compartida para eliminar el hardcodeo duplicado. Entrega por commits por unidad lógica directo a `main`.

## Áreas Afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `src/features/ClientView/utils/shareUtils.js` | Nuevo | Link, share URLs, validación |
| `src/features/ClientView/pages/InviteFriendsPage.jsx` | Nuevo | Vista dedicada mobile-first |
| `src/features/ClientView/utils/shareUtils.test.js` + `InviteFriendsPage.test.jsx` | Nuevo | Tests RED-GREEN |
| `src/routes/views.jsx` / `src/routes/index.jsx` | Modificado | Export lazy + ruta `/cliente/invitar-amigos` |
| `src/features/ClientView/pages/ClientProfilePage.jsx` | Modificado | Botón "Invitar amigos" (integración mínima) |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Clipboard no disponible en jsdom/tests | Media | try/catch + mock de `navigator.clipboard` (patrón existente) |
| Popup blockers cortan share URLs | Media | `window.open(url, '_blank', 'noopener')` en handler síncrono; tests solo de URLs puras |
| Colisión multi-agente en `routes`/`ClientProfilePage` | Media | Scope declarado en openspec/; tocar solo los archivos listados |
| Código de referido hardcodeado duplicado | Media | Constante centralizada en `shareUtils` |

## Plan de Reversión

Commits por unidad lógica directo a `main`; revert por commit (`git revert`). El cambio es aditivo (ruta + página nuevas) y no altera flujos existentes; sin cambio de contrato con otras vistas.

## Dependencias

- Ninguna externa. Vitest 3 + Testing Library ya activos; `npm run test` (strict_tdd).

## Criterios de Éxito

- [ ] `npm run test` verde incluyendo los tests RED-GREEN nuevos (share-utils + vista).
- [ ] `/cliente/invitar-amigos` accesible desde Perfil → Referidos → "Invitar amigos", con bottom nav y botón volver.
- [ ] Cada botón social abre la share URL correcta en pestaña nueva (wa.me/t.me/intent/mailto).
- [ ] La validación email/teléfono bloquea formatos inválidos y la confirmación demo se muestra tras enviar.
- [ ] Historial y stats demo visibles; sin regresión en `ClientProfilePage` (tests existentes pasan).
- [ ] `npm run build` verde.
