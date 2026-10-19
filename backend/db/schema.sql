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
  translation_history_size INT  NOT NULL DEFAULT 5          -- no longer used (fixed at 10)
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

-- Payslips, encrypted: the explanation (month, amounts, the lines explained in
-- every app language) and the text read from it. Max 60 per user.
CREATE TABLE IF NOT EXISTS payslips (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ciphertext BYTEA NOT NULL,      -- {fileName, text, period, employer, gross, net, en, tl, ml, ru, details}
  iv         BYTEA NOT NULL,
  auth_tag   BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payslips_user_idx ON payslips (user_id, id);

-- The original payslip files (PDF / photos), encrypted, so users can download
-- them later. Deleted together with their payslip.
CREATE TABLE IF NOT EXISTS payslip_files (
  payslip_id BIGINT PRIMARY KEY REFERENCES payslips(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ciphertext BYTEA NOT NULL,      -- [{name, mimeType, base64}]
  iv         BYTEA NOT NULL,
  auth_tag   BYTEA NOT NULL,
  bytes      INTEGER NOT NULL,    -- original size, to watch the database size
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payslip_files_user_idx ON payslip_files (user_id);

-- The user's first name (home greeting, caregivers list) and its spelling in
-- every app language's letters, e.g. {"en":"Rohit","hi":"रोहित","ta":"ரோஹித்",…}.
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT CHECK (char_length(display_name) <= 20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name_i18n JSONB;

-- ── Community: find caregivers in your city and ask to connect ────────────
-- Safe by design: no location, no photos, no free text. A user who joins the
-- list shows only a first name and the city / neighborhood they chose. Contact
-- requests use fixed messages; a phone number is shared only after the other
-- person accepts, and only if the user types it in (stored encrypted).
CREATE TABLE IF NOT EXISTS community_profiles (
  user_id      UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  public_id    UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),   -- what other users see, never the user id
  display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 20),
  city         TEXT NOT NULL CHECK (char_length(city) <= 60),
  neighborhood TEXT CHECK (char_length(neighborhood) <= 60),
  language     TEXT CHECK (char_length(language) <= 5),          -- app language: en / tl / ml / ru
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS community_profiles_city_idx ON community_profiles (city);
-- listed = on the "Near you → Caregivers" list. People who only use places
-- ("I want to go", invites) without joining the list have listed = false and
-- may have no city ('').
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS listed BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS contact_requests (
  id              BIGSERIAL PRIMARY KEY,
  from_user       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_key     TEXT NOT NULL CHECK (char_length(message_key) <= 30),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  from_phone_ct   BYTEA, from_phone_iv BYTEA, from_phone_tag BYTEA,   -- requester's phone, after acceptance
  to_phone_ct     BYTEA, to_phone_iv   BYTEA, to_phone_tag   BYTEA,   -- the other person's phone, if they share it
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at    TIMESTAMPTZ,
  UNIQUE (from_user, to_user),
  CHECK (from_user <> to_user)
);
CREATE INDEX IF NOT EXISTS contact_requests_to_idx ON contact_requests (to_user, status);
-- "Visit together" requests name the place (e.g. "nazareth").
ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS place_id TEXT CHECK (char_length(place_id) <= 40);

-- "I want to go there": places (e.g. Nazareth) a user on the list wants to visit,
-- so others who want to go can invite them. Removed when they leave the list.
CREATE TABLE IF NOT EXISTS place_interests (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id   TEXT NOT NULL CHECK (char_length(place_id) <= 40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, place_id)
);
CREATE INDEX IF NOT EXISTS place_interests_place_idx ON place_interests (place_id);

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
ALTER TABLE payslips       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslip_files  ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_interests    ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA careconnect FROM anon, authenticated;
    REVOKE ALL ON SCHEMA careconnect FROM anon, authenticated;
  END IF;
END $$;
