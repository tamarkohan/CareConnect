-- CareConnect database schema (PostgreSQL + pgvector).
--
-- Run once, in the Supabase dashboard → SQL Editor (or `psql "$DATABASE_URL" -f db/schema.sql`).
-- Safe to re-run: everything uses IF NOT EXISTS.
--
-- Everything lives in the private "careconnect" schema. Supabase's public REST
-- API only exposes the "public" schema, so these tables can't be reached with
-- the project's anon/public key — only the backend's direct DB connection can.

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

CREATE SCHEMA IF NOT EXISTS careconnect;
SET search_path TO careconnect, public, extensions;

-- ── Knowledge base: one row per crawled web page ────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  url             TEXT PRIMARY KEY,
  source_id       TEXT NOT NULL,             -- id from rag/sources.js
  title           TEXT,
  content_hash    TEXT NOT NULL,             -- sha256 of the extracted text
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),  -- last crawl that found it
  last_changed_at TIMESTAMPTZ NOT NULL DEFAULT now()   -- last time its text changed
);
CREATE INDEX IF NOT EXISTS pages_source_idx ON pages (source_id);

-- ── Knowledge base: text chunks + their embeddings ──────────────────────────
-- 768 dims = gemini-embedding-001 with outputDimensionality 768
-- (must match EMBED_DIM in services/embeddingService.js).
CREATE TABLE IF NOT EXISTS chunks (
  id          BIGSERIAL PRIMARY KEY,
  page_url    TEXT NOT NULL REFERENCES pages(url) ON DELETE CASCADE,
  chunk_index INT  NOT NULL,
  content     TEXT NOT NULL,
  embedding   vector(768) NOT NULL,
  UNIQUE (page_url, chunk_index)
);
CREATE INDEX IF NOT EXISTS chunks_embedding_idx
  ON chunks USING hnsw (embedding vector_cosine_ops);

-- ── Contracts (sensitive) ───────────────────────────────────────────────────
-- The contract text is encrypted by the backend (AES-256-GCM) before it is
-- stored, so the database only ever holds ciphertext. The row is keyed by the
-- SHA-256 of the user's random contract token — the token itself is never stored.
CREATE TABLE IF NOT EXISTS contracts (
  token_hash  TEXT PRIMARY KEY,
  ciphertext  BYTEA NOT NULL,
  iv          BYTEA NOT NULL,
  auth_tag    BYTEA NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS contracts_expires_idx ON contracts (expires_at);

-- ── Lock the tables down for Supabase's API roles ───────────────────────────
-- Row Level Security on with no policies = anon/authenticated see nothing.
-- (The backend connects as the database owner, which bypasses RLS.)
ALTER TABLE pages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA careconnect FROM anon, authenticated;
    REVOKE ALL ON SCHEMA careconnect FROM anon, authenticated;
  END IF;
END $$;
