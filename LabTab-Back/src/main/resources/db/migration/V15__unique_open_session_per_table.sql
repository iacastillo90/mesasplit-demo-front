-- =====================================================================
-- Migración: V15__unique_open_session_per_table.sql
-- Regla: una mesa no puede tener más de una sesión OPEN (backstop a nivel DB
-- frente al chequeo de aplicación en createSession).
-- =====================================================================

CREATE UNIQUE INDEX IF NOT EXISTS ux_dine_session_open_table ON dine_session(table_id) WHERE status = 'OPEN';
