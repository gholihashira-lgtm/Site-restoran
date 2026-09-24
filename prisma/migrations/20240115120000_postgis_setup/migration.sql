-- ============================================================================
-- Loghme PostGIS Setup Migration
-- Migration: 20240115120000_postgis_setup
-- Description: Add PostGIS geography columns, GIST indexes, full-text search,
--              distance helper functions, and location auto-update triggers
-- ============================================================================

-- 1. افزودن ستون PostGIS برای Vendor
ALTER TABLE vendors
    ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

UPDATE vendors
    SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vendors_location_gist
    ON vendors USING GIST (location);

-- 2. افزودن ستون PostGIS برای Address
ALTER TABLE addresses
    ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

UPDATE addresses
    SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_addresses_location_gist
    ON addresses USING GIST (location);

-- 3. ایندکس‌های Trigram برای full-text search فارسی
CREATE INDEX IF NOT EXISTS idx_products_title_trgm
    ON products USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_description_trgm
    ON products USING GIN (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_vendors_name_trgm
    ON vendors USING GIN (name gin_trgm_ops);

-- 4. Function محاسبه فاصله بین دو نقطه جغرافیایی
CREATE OR REPLACE FUNCTION loghme_distance_meters(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN ST_Distance(
        ST_SetSRID(ST_MakePoint(lon1, lat1), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)::geography
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Trigger برای auto-update فیلد location در addresses
CREATE OR REPLACE FUNCTION update_address_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_addresses_location ON addresses;
CREATE TRIGGER trg_addresses_location
    BEFORE INSERT OR UPDATE OF latitude, longitude ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_address_location();

-- 6. Trigger برای auto-update فیلد location در vendors
CREATE OR REPLACE FUNCTION update_vendor_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vendors_location ON vendors;
CREATE TRIGGER trg_vendors_location
    BEFORE INSERT OR UPDATE OF latitude, longitude ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_location();