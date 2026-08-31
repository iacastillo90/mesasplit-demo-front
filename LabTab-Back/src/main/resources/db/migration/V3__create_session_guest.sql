-- =====================================================================
-- Migración: V3__create_session_guest.sql
-- Entidades: DINE_SESSION, DINE_GUEST
-- Diagrama_V3.mmd líneas: 180-200
-- Autor: LabTab Backend Team
--
-- Nota: branch_id en DINE_SESSION está denormalizado (RLS) a propósito —
-- el filtro por sucursal queda en una sola columna sin join (Regla 1).
-- =====================================================================

CREATE TABLE dine_session (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id    UUID NOT NULL REFERENCES dining_table(id),
    branch_id   UUID NOT NULL REFERENCES branch(id),
    status      VARCHAR(50) NOT NULL DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN', 'CLOSING', 'CLOSED')),
    guest_count INTEGER NOT NULL DEFAULT 1,
    opened_by   UUID NOT NULL REFERENCES person(id),
    started_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at    TIMESTAMP WITH TIME ZONE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE dine_guest (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dine_session_id UUID NOT NULL REFERENCES dine_session(id),
    person_id       UUID REFERENCES person(id),
    display_name    VARCHAR(255),
    temp_label      VARCHAR(100),
    merged_into_id  UUID REFERENCES dine_guest(id),
    joined_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    left_at         TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dine_session_table ON dine_session(table_id);
CREATE INDEX idx_dine_session_branch ON dine_session(branch_id);
CREATE INDEX idx_dine_guest_session ON dine_guest(dine_session_id);
