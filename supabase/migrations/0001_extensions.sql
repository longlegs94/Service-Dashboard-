-- 0001_extensions.sql
-- Postgres extensions used across the schema.

-- gen_random_uuid() for primary keys (available in pgcrypto).
create extension if not exists "pgcrypto" with schema "extensions";

-- Useful trigram / fuzzy search later (clients, jobs). Safe to enable now.
create extension if not exists "pg_trgm" with schema "extensions";
