-- =====================================================================
-- Migración: V4__create_menu_section_dish.sql
-- Entidades: MENU_SECTION, DISH
-- Diagrama_V3.mmd líneas: 215-236
-- Autor: LabTab Backend Team
--
-- Nota: branch_id en DISH está denormalizado (RLS). allergens alimenta el
-- Escudo de Alergias (00-ecosistema-maestro-sdd.md). El CHECK price >= 0
-- es el único constraint financiero de este dominio (Doc 06b §4.1).
-- =====================================================================

CREATE TABLE menu_section (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id     UUID NOT NULL REFERENCES branch(id),
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE dish (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id    UUID NOT NULL REFERENCES menu_section(id),
    branch_id     UUID NOT NULL REFERENCES branch(id),
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    price         NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    image_url     TEXT,
    is_available  BOOLEAN NOT NULL DEFAULT TRUE,
    tags          TEXT[],
    allergens     TEXT[],
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menu_section_branch ON menu_section(branch_id);
CREATE INDEX idx_dish_section ON dish(section_id);
CREATE INDEX idx_dish_branch ON dish(branch_id);
