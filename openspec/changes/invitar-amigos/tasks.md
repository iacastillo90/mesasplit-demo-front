# Tasks: invitar-amigos — Vista dedicada de Invitar Amigos (client-referrals)

## Reglas de ejecución (multi-agente — MUST)

- Delivery: commits por unidad lógica DIRECTOS a `main` (decisión del usuario; NO chained PRs). Commit en español, conventional, con porqué (AGENTS.md).
- TDD estricto: en cada fase correr el test RED (debe fallar) antes de implementar, luego GREEN con `npm run test`.
- Antes de cada commit: `git status` para detectar cambios ajenos (Antigravity). Stage explícito por archivo — NUNCA `git add .`.
- Tocar SOLO archivos del scope: `src/features/ClientView/utils/shareUtils.js` (+test), `src/features/ClientView/pages/InviteFriendsPage.jsx` (+test), `src/routes/views.jsx`, `src/routes/index.jsx`, `src/features/ClientView/pages/ClientProfilePage.jsx` (+test).
- Archivos compartidos (views.jsx, index.jsx, ClientProfilePage.jsx): antes de editar, verificar con `git diff` que su contenido no cambió desde el spec; si cambió, PARAR y reportar. No committear `openspec/` ni `.atl/`.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~620–700 (aditivo) |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | 7 unidades (commits directos a main) |
| Delivery strategy | exception-ok |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | shareUtils puras | N/A (commit main) | `npm run test -- src/features/ClientView/utils/shareUtils.test.js` | N/A — lógica pura | revert commit 1 |
| 2 | Vista + card código | N/A (commit main) | `npm run test -- src/features/ClientView/pages/InviteFriendsPage.test.jsx` | jsdom vitest | revert commit 2 |
| 3 | Share social | N/A (commit main) | ídem 2 (suites share) | jsdom vitest | revert commit 3 |
| 4 | Form envío | N/A (commit main) | ídem 2 (suites form) | jsdom vitest | revert commit 4 |
| 5 | Historial + persist | N/A (commit main) | ídem 2 (suites history) | jsdom vitest | revert commit 5 |
| 6 | Ruta + integración | N/A (commit main) | `npm run test -- src/routes/__tests__/routing.test.jsx` | jsdom vitest | revert commit 6 |
| 7 | Verificación final | N/A (sin commit) | `npm run test` + `npm run build` + `npm run lint` | suite completa | N/A |

## Fase 1: shareUtils (fundación)

- [ ] 1.1 RED: crear `src/features/ClientView/utils/shareUtils.test.js`: `buildReferralLink` → `https://mesasplit.app/r/<CODE>` (referral-code-card sc.1), `buildShareUrl` por canal con encodeURIComponent (social-share sc.1–3), `isValidEmail('x@y.cl'/'malo')` e `isValidPhone('+56987654321'/'abc')` → true/false (send-invite-form "Validadores puros"); ver fallar.
- [ ] 1.2 GREEN: crear `shareUtils.js`: `REFERRAL_CODE='CONSTANZA-REWARDS-2026'`, `buildReferralLink`, `buildShareUrl` (mapa WhatsApp/X/Facebook/Email/Telegram), validadores; comentar cada línea en español; `npm run test` verde.
- [ ] 1.3 Commit `feat: crear utilidades de compartir referidos (shareUtils)` + lint.

## Fase 2: vista + card de código con copiado

- [ ] 2.1 RED: crear `InviteFriendsPage.test.jsx`: card muestra código y link (referral-code-card sc.1); copiado con `navigator.clipboard.writeText` mockeado → "¡Copiado!" (sc.2); clipboard indefinido no crashea (sc.3).
- [ ] 2.2 GREEN: crear `InviteFriendsPage.jsx` (esqueleto mobile: AppHeader `currentRoute="/cliente/invitar-amigos"`, ClientBottomNav, `pb-24`, card código + botón Copiar try/catch, feedback ≥2s); `npm run test` verde.
- [ ] 2.3 Commit `feat: crear vista de invitar amigos con card de código y copiado`.

## Fase 3: botones de compartir social

- [ ] 3.1 RED: tests de URLs puras por canal (social-share sc.1–3) y spy `window.open(url,'_blank','noopener')` al presionar WhatsApp (sc.4).
- [ ] 3.2 GREEN: sección de 5 botones visibles (WhatsApp/X/Facebook/Email/Telegram) que abren la share URL en pestaña nueva; `npm run test` verde.
- [ ] 3.3 Commit `feat: agregar botones de compartir por redes sociales`.

## Fase 4: formulario de envío

- [ ] 4.1 RED: envío email válido (`amiga@ejemplo.cl` → confirmación + `window.open` mailto), teléfono válido (`+56 9 8765 4321` → wa.me), inválido bloqueado con error visible (`no-es-un-email`/`abc`) (send-invite-form sc.1–3).
- [ ] 4.2 GREEN: formulario email O teléfono + mensaje opcional + CTA "Enviar invitación" al fondo de la card a ancho completo (mobile-responsive), validación con `isValidEmail`/`isValidPhone`, confirmación "Invitación enviada a <destinatario>", fallback mailto/wa.me; `npm run test` verde.
- [ ] 4.3 Commit `feat: agregar formulario de envío de invitación con validación`.

## Fase 5: historial y estadísticas

- [ ] 5.1 RED: fixture ≥3 filas (destinatario, canal, fecha, estado); stats "Enviadas: 4"/"Aceptadas: 2" (invite-history sc.1–2); historial idéntico tras rehidratar localStorage (sc.3).
- [ ] 5.2 GREEN: sección historial read-only + stats derivadas del fixture + persistencia localStorage (MAY, clave propia); `npm run test` verde.
- [ ] 5.3 Commit `feat: agregar historial y estadísticas de invitaciones con persistencia`.

## Fase 6: ruta e integración en perfil

- [ ] 6.1 RED: en `src/routes/__tests__/routing.test.jsx`: `/cliente/invitar-amigos` renderiza la vista (routing-integration sc.1); botón "Invitar amigos" del tab Referidos navega (sc.2); copiar del tab sigue funcionando (sc.3).
- [ ] 6.2 GREEN: en `views.jsx` export lazy `ClientInviteFriendsView` → InviteFriendsPage.jsx; en `index.jsx` ruta `/cliente/invitar-amigos` tras `/cliente/perfil` (patrón ClientQrScanView); en `ClientProfilePage.jsx` botón/enlace "Invitar amigos" en el tab Referidos (Línea ~736) que navega con Link; verificar shared files sin cambios ajenos antes de editar; `npm run test` verde.
- [ ] 6.3 Commit `feat: registrar ruta invitar-amigos e integrar botón en perfil`.

## Fase 7: verificación final integrada

- [ ] 7.1 `npm run test` (suite completa verde), `npm run build` y `npm run lint` sin errores.
- [ ] 7.2 Chequeo manual demo: cada botón social abre el intent correcto, validación bloquea inválidos, historial consistente tras reload.
- [ ] 7.3 Reportar al orchestrator con resumen de commits y estado de tareas marcadas `[x]`.