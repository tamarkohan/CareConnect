/**
 * db.js
 *
 * Shared PostgreSQL connection pool (Supabase or any Postgres with pgvector).
 *
 * Environment variables:
 *   DATABASE_URL   (required) Postgres connection string.
 *                  On Supabase use the "Session pooler" string (IPv4), e.g.
 *                  postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
 *   DATABASE_SSL   "false" to turn off TLS (only for a local dev database).
 */

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error(
    "[db] DATABASE_URL is not set. " +
    "Please add it to backend/.env (see RAG_SETUP.md)."
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires TLS. Its pooler certificate isn't in Node's default CA
  // list, so we encrypt the connection without pinning the CA.
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (err) => {
  console.error("[db] Idle client error:", err.message);
});

// Every connection looks in our private schema first; "extensions" holds
// pgvector on Supabase. Set once per new connection, before its first query.
const prepared = new WeakSet();

async function getClient() {
  const client = await pool.connect();
  if (!prepared.has(client)) {
    try {
      await client.query("SET search_path TO careconnect, public, extensions");
    } catch (err) {
      client.release(err);
      throw err;
    }
    prepared.add(client);
  }
  return client;
}

/** Run a single query. */
async function query(text, params) {
  const client = await getClient();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

/** Run `fn(client)` inside a transaction. */
async function withTransaction(fn) {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** pgvector literal for a JS number array, e.g. "[0.1,0.2,...]". */
function toVector(values) {
  return `[${values.join(",")}]`;
}

module.exports = { pool, query, withTransaction, toVector };
