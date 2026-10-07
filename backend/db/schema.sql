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

-- ── Users ───────────────────────────────────────────────────────────────────
-- A user signs in with a phone number OR an email (one-time code, no password).
-- Their data is tied to whichever one they used, so they must keep using it.
-- The app language is NOT stored: it only changes the screens and lives on
-- the device, so switching it never touches saved data.
CREATE TABLE IF NOT EXISTS users (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone                    TEXT UNIQUE,              -- E.164, e.g. +972501234567 ("123" = demo)
  email                    TEXT UNIQUE,              -- lowercase
  translation_history_size INT  NOT NULL DEFAULT 5
                           CHECK (translation_history_size IN (3, 5, 10)),
  disclaimer_version       INT,                      -- legal disclaimer version accepted
  is_demo                  BOOLEAN NOT NULL DEFAULT false,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

-- Login sessions. Like contract tokens, only the token's SHA-256 is stored.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);

-- A signed-in user's contract lives in the same table (one per user), plus an
-- encrypted structured summary. Uploaded files are never stored, only text.
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS user_id          UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS file_name        TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS summary_ciphertext BYTEA;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS summary_iv         BYTEA;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS summary_auth_tag   BYTEA;
CREATE UNIQUE INDEX IF NOT EXISTS contracts_user_idx ON contracts (user_id) WHERE user_id IS NOT NULL;

-- Legal chat history, encrypted. Capped per user by the backend (see legal.js).
CREATE TABLE IF NOT EXISTS legal_messages (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  ciphertext BYTEA NOT NULL,      -- {text, sources}
  iv         BYTEA NOT NULL,
  auth_tag   BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS legal_messages_user_idx ON legal_messages (user_id, id);

-- Recent translations, encrypted (medical letters are personal).
-- The backend keeps at most 10 per user.
CREATE TABLE IF NOT EXISTS translations (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ciphertext BYTEA NOT NULL,      -- {sourceText, translatedText, phonetic, note, ...}
  iv         BYTEA NOT NULL,
  auth_tag   BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS translations_user_idx ON translations (user_id, id);

-- ── Lock the tables down for Supabase's API roles ───────────────────────────
-- Row Level Security on with no policies = anon/authenticated see nothing.
-- (The backend connects as the database owner, which bypasses RLS.)
ALTER TABLE pages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations   ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA careconnect FROM anon, authenticated;
    REVOKE ALL ON SCHEMA careconnect FROM anon, authenticated;
  END IF;
END $$;
