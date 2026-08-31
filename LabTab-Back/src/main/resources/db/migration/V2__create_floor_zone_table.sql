-- =====================================================================
-- Migración: V2__create_floor_zone_table.sql
-- Entidades: DINING_FLOOR, MAP_ZONE, DINING_TABLE
-- Diagrama_V3.mmd líneas: 144-178
-- Autor: LabTab Backend Team
--
-- Nota de decisión: el plan de migraciones del Doc 06b agrupa en V2 también
-- DINE_SESSION y DINE_GUEST. Se separa en una migración por dominio para
-- mantener 1 issue = 1 PR = 1 unidad mergeable (los 6 dominios de Fase 1).
-- Los índices de performance del Doc 06b §4.3 van en V12; acá solo los índices
-- de FK básicos (PostgreSQL no los crea automáticamente).
-- =====================================================================

CREATE TABLE dining_floor (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id     UUID NOT NULL REFERENCES branch(id),
    name          VARCHAR(255) NOT NULL DEFAULT 'Principal',
    layout        JSONB,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE map_zone (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    floor_id      UUID NOT NULL REFERENCES dining_floor(id),
    name          VARCHAR(100) NOT NULL,
    x             INTEGER NOT NULL DEFAULT 0,
    y             INTEGER NOT NULL DEFAULT 0,
    w             INTEGER NOT NULL DEFAULT 0,
    h             INTEGER NOT NULL DEFAULT 0,
    color         VARCHAR(20),
    z_index       INTEGER NOT NULL DEFAULT 0,
    is_label_only BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE dining_table (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id   UUID NOT NULL REFERENCES branch(id),
    floor_id    UUID NOT NULL REFERENCES dining_floor(id),
    name        VARCHAR(100) NOT NULL,
    zone        VARCHAR(100),
    capacity    INTEGER NOT NULL DEFAULT 4,
    status      VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE'
                    CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING')),
    qr_token    VARCHAR(100) NOT NULL UNIQUE,
    position_x  INTEGER NOT NULL DEFAULT 100,
    position_y  INTEGER NOT NULL DEFAULT 100,
    shape       VARCHAR(20) NOT NULL DEFAULT 'rect',
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dining_floor_branch ON dining_floor(branch_id);
CREATE INDEX idx_map_zone_floor ON map_zone(floor_id);
CREATE INDEX idx_dining_table_floor ON dining_table(floor_id);
CREATE INDEX idx_dining_table_branch ON dining_table(branch_id);
