-- Migration: Initialize PostGIS extension
-- Description: Enable PostGIS extension for geospatial capabilities

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify PostGIS version
SELECT PostGIS_version();
