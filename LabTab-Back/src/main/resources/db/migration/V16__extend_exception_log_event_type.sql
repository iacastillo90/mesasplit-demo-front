-- =====================================================================
-- Migración: V16__extend_exception_log_event_type.sql
-- SEC-009: agrega ITEM_VOID_PRE_KITCHEN a la lista cerrada de event_type
-- (la migración V6 dejó un CHECK con los 5 valores originales).
-- =====================================================================

ALTER TABLE exception_log DROP CONSTRAINT IF EXISTS exception_log_event_type_check;

ALTER TABLE exception_log ADD CONSTRAINT exception_log_event_type_check
    CHECK (event_type IN (
        'ITEM_VOID_AFTER_KITCHEN',
        'ITEM_VOID_PRE_KITCHEN',
        'MANUAL_DISCOUNT',
        'DRAWER_OPENED_NO_SALE',
        'REFUND_ISSUED',
        'PIN_AUTH_FAILED'
    ));
