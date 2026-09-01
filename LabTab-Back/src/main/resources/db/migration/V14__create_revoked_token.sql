-- =====================================================================
-- Migración: V14__create_revoked_token.sql
-- Entidad: REVOKED_TOKEN
-- Denylist global de refresh tokens revocados (no está acotada a sucursal).
-- =====================================================================

CREATE TABLE IF NOT EXISTS revoked_token (
    jti        VARCHAR(36) PRIMARY KEY,
    expires_at TIMESTAMPTZ NOT NULL
);
