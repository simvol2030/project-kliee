-- Migration: Fix Shop Module schema mismatches
-- Date: 2025-12-21
-- Description: Align production database with code expectations

-- =====================================================
-- 1. Fix artworks table
-- =====================================================

-- Add missing columns to artworks
ALTER TABLE artworks ADD COLUMN technique TEXT;
ALTER TABLE artworks ADD COLUMN is_featured INTEGER DEFAULT 0;
ALTER TABLE artworks ADD COLUMN is_for_sale INTEGER DEFAULT 1;
ALTER TABLE artworks ADD COLUMN order_index INTEGER DEFAULT 0;

-- Migrate data from technique_en to technique (use English as default)
UPDATE artworks SET technique = technique_en WHERE technique_en IS NOT NULL;

-- =====================================================
-- 2. Fix series table - rename title_* to name_*
-- =====================================================

-- Create temporary table with correct schema
CREATE TABLE series_new (
    id TEXT PRIMARY KEY NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    name_en TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    name_es TEXT NOT NULL,
    name_zh TEXT NOT NULL,
    description_en TEXT,
    description_ru TEXT,
    description_es TEXT,
    description_zh TEXT,
    cover_image TEXT,
    artwork_count INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cover_image_id INTEGER,
    order_index INTEGER DEFAULT 0,
    is_visible INTEGER DEFAULT 1,
    is_featured INTEGER DEFAULT 0,
    seo_title_en TEXT,
    seo_title_ru TEXT,
    seo_title_es TEXT,
    seo_title_zh TEXT,
    seo_description_en TEXT,
    seo_description_ru TEXT,
    seo_description_es TEXT,
    seo_description_zh TEXT
);

-- Copy data from old table (title_* → name_*)
INSERT INTO series_new (
    id, slug,
    name_en, name_ru, name_es, name_zh,
    description_en, description_ru, description_es, description_zh,
    cover_image, artwork_count, "order", created_at, updated_at
)
SELECT
    id, slug,
    title_en, title_ru, title_es, title_zh,
    description_en, description_ru, description_es, description_zh,
    cover_image, artwork_count, "order", created_at, updated_at
FROM series;

-- Drop old table and rename new one
DROP TABLE series;
ALTER TABLE series_new RENAME TO series;

-- =====================================================
-- 3. Create artwork_images table if not exists
-- =====================================================

CREATE TABLE IF NOT EXISTS artwork_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artwork_id INTEGER NOT NULL,
    media_id INTEGER,
    image_url TEXT,
    is_primary INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE SET NULL
);

-- =====================================================
-- 4. Verify migration
-- =====================================================

-- Check artworks schema
-- PRAGMA table_info(artworks);

-- Check series schema
-- PRAGMA table_info(series);

-- Check artwork_images schema
-- PRAGMA table_info(artwork_images);
