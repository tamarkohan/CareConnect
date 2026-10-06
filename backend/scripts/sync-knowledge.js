/**
 * scripts/sync-knowledge.js  —  `npm run sync`
 *
 * Keeps the knowledge base in step with the websites in rag/sources.js:
 *   - new pages        → chunked, embedded, stored
 *   - changed pages    → old chunks replaced (detected by a hash of the text)
 *   - unchanged pages  → only "last seen" is updated (no Gemini calls)
 *   - removed pages    → deleted (only after a complete, healthy crawl)
 * It also purges expired contracts.
 *
 * Re-running is cheap and safe: if a run stops half way (e.g. Gemini quota),
 * the next run continues with whatever is still missing.
 *
 * Usage:
 *   npm run sync                  all sources
 *   npm run sync -- kolzchut-en   only the given source id(s)
 */

require("dotenv").config();

const crypto = require("crypto");
const db = require("../services/db");
const { embedMany } = require("../services/embeddingService");
const { crawlSource } = require("../rag/crawler");
const { chunkText } = require("../rag/chunker");
const SOURCES = require("../rag/sources");

// Don't delete "missing" pages if more than this share of fetches failed —
// the site was probably down, not emptied.
const MAX_FAILURE_RATE = 0.2;

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

async function storePage(source, { url, title, text }, counts) {
  const hash = sha256(`${title}\n${text}`);

  const { rows } = await db.query("SELECT content_hash FROM pages WHERE url = $1", [url]);
  if (rows[0]?.content_hash === hash) {
    await db.query("UPDATE pages SET last_seen_at = now(), source_id = $2 WHERE url = $1", [url, source.id]);
    counts.unchanged++;
    return;
  }

  const chunks = chunkText(text);
  // The title gives each chunk context ("Annual leave – …") for better matches.
  const vectors = await embedMany(chunks.map((c) => `${title}\n${c}`), "RETRIEVAL_DOCUMENT");

  await db.withTransaction(async (client) => {
    await client.query(
      `INSERT INTO pages (url, source_id, title, content_hash, last_seen_at, last_changed_at)
       VALUES ($1, $2, $3, $4, now(), now())
       ON CONFLICT (url) DO UPDATE
         SET source_id = EXCLUDED.source_id, title = EXCLUDED.title,
             content_hash = EXCLUDED.content_hash,
             last_seen_at = now(), last_changed_at = now()`,
      [url, source.id, title, hash]
    );
    await client.query("DELETE FROM chunks WHERE page_url = $1", [url]);
    for (let i = 0; i < chunks.length; i++) {
      await client.query(
        "INSERT INTO chunks (page_url, chunk_index, content, embedding) VALUES ($1, $2, $3, $4::vector)",
        [url, i, chunks[i], db.toVector(vectors[i])]
      );
    }
  });

  rows.length ? counts.changed++ : counts.added++;
  console.log(`  ${rows.length ? "~" : "+"} ${url} (${chunks.length} chunks)`);
}

async function syncSource(source) {
  console.log(`\n▶ ${source.id} – ${source.name}`);
  const runStartedAt = new Date();
  const counts = { added: 0, changed: 0, unchanged: 0, removed: 0 };

  const stats = await crawlSource(source, (page) => storePage(source, page, counts));

  // Pages that failed to load this time are kept: mark them as seen.
  if (stats.failed.length) {
    await db.query(
      "UPDATE pages SET last_seen_at = now() WHERE source_id = $1 AND url = ANY($2)",
      [source.id, stats.failed]
    );
  }

  const failureRate = stats.fetched ? stats.failed.length / stats.fetched : 1;
  if (stats.hitLimit) {
    console.log(`  maxPages (${source.maxPages}) reached – skipping removal of old pages.`);
  } else if (failureRate > MAX_FAILURE_RATE) {
    console.log(`  ${Math.round(failureRate * 100)}% of requests failed – skipping removal of old pages.`);
  } else {
    const { rowCount } = await db.query(
      "DELETE FROM pages WHERE source_id = $1 AND last_seen_at < $2",
      [source.id, runStartedAt]
    );
    counts.removed = rowCount;
  }

  console.log(
    `  done: ${stats.fetched} fetched, ${counts.added} new, ${counts.changed} changed, ` +
    `${counts.unchanged} unchanged, ${counts.removed} removed, ${stats.failed.length} failed`
  );
}

async function main() {
  const only = process.argv.slice(2);
  const sources = only.length ? SOURCES.filter((s) => only.includes(s.id)) : SOURCES;
  if (!sources.length) throw new Error(`No source matches: ${only.join(", ")}`);

  let failed = false;
  for (const source of sources) {
    try {
      await syncSource(source);
    } catch (err) {
      // e.g. Gemini quota used up – keep what was stored, try the rest next run.
      failed = true;
      console.error(`  ✖ ${source.id} stopped: ${err.status || ""} ${err.message}`);
    }
  }

  // Sources that were removed from rag/sources.js.
  const { rowCount: orphaned } = await db.query(
    "DELETE FROM pages WHERE NOT (source_id = ANY($1))",
    [SOURCES.map((s) => s.id)]
  );
  if (orphaned) console.log(`\nRemoved ${orphaned} pages of sources no longer in rag/sources.js.`);

  // Done here with plain SQL so this job never needs CONTRACT_ENCRYPTION_KEY.
  const { rowCount: purged } = await db.query("DELETE FROM contracts WHERE expires_at <= now()");
  if (purged) console.log(`Purged ${purged} expired contract(s).`);

  await db.pool.end();
  if (failed) process.exitCode = 1;
}

main().catch(async (err) => {
  console.error(err);
  await db.pool.end().catch(() => {});
  process.exit(1);
});
