-- UX Collective — database/init.sql
-- Author: Md Shahed
-- Date: 2026-10-23

-- UX Collective MySQL bootstrap.
-- Tables and demo data are created by the backend on startup (backend/db/schema.sql + migrate.js),
-- so this file only ensures the database exists with full Unicode support.
CREATE DATABASE IF NOT EXISTS uxco_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
