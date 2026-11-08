/**
 * journal.js
 *
 * The Burden Book (vent & release) and Gratitude Book (positive moments),
 * encrypted: this is the most private thing caregivers write in the app.
 *
 * New users get two example entries, once (users.journal_examples_at). They are
 * stored with an exampleKey instead of a text, so the app shows them in its
 * current language, can't be edited (they stay examples), and are removed as soon
 * as the user has an entry of their own.
 */

const db = require("./db");
const { encryptJson, decryptJson } = require("./crypto");

const MAX_ENTRIES = 1000;       // per user (~1 KB each)
const MAX_TEXT = 4000;
const BOOKS = ["burden", "gratitude"];
const MOODS = ["😢", "😐", "🙂", "😊", "😄"];   // same as the app's mood row
const context = (userId) => `journal:${userId}`;

// exampleKey = a text the app has in every language (T.journalEntry1… in src/translations.ts).
const EXAMPLES = [
  { book: "burden", mood: "😢", exampleKey: "journalEntry1", hoursAgo: 26 },
  { book: "gratitude", mood: "😊", exampleKey: "journalEntry2", hoursAgo: 30 },
];

const userError = (message, code, status = 400) => Object.assign(new Error(message), { expose: true, status, code });

function toEntry(row, userId) {
  const { book, mood, text = null, exampleKey = null } = decryptJson(row, context(userId));
  return { id: String(row.id), book, mood, text, exampleKey, createdAt: row.created_at };
}

async function insert(client, userId, entry, createdAt = new Date()) {
  const { ciphertext, iv, authTag } = encryptJson(entry, context(userId));
  const { rows } = await client.query(
    `INSERT INTO journal_entries (user_id, ciphertext, iv, auth_tag, created_at) VALUES ($1, $2, $3, $4, $5)
     RETURNING id, ciphertext, iv, auth_tag, created_at`,
    [userId, ciphertext, iv, authTag, createdAt]
  );
  return toEntry(rows[0], userId);
}

/** Adds the example entries the first time, unless the user already wrote something. */
async function addExamplesOnce(userId) {
  await db.withTransaction(async (client) => {
    // Only the request that sets the date adds them (two at once can't add them twice).
    const { rowCount } = await client.query(
      "UPDATE users SET journal_examples_at = now() WHERE id = $1 AND journal_examples_at IS NULL",
      [userId]
    );
    if (!rowCount) return;
    const { rows } = await client.query("SELECT 1 FROM journal_entries WHERE user_id = $1 LIMIT 1", [userId]);
    if (rows.length) return;
    for (const { hoursAgo, ...entry } of EXAMPLES) {
      await insert(client, userId, entry, new Date(Date.now() - hoursAgo * 3_600_000));
    }
  });
}

/** @returns {Promise<Array>} newest first, without the examples once the user wrote something */
async function listEntries(userId) {
  const { rows } = await db.query(
    `SELECT id, ciphertext, iv, auth_tag, created_at FROM journal_entries
     WHERE user_id = $1 ORDER BY created_at DESC, id DESC`,
    [userId]
  );
  const entries = rows.flatMap((r) => {
    try {
      return [toEntry(r, userId)];
    } catch {
      return [];
    }
  });
  const examples = entries.filter((e) => e.exampleKey);
  if (examples.length && examples.length < entries.length) {
    await db.query("DELETE FROM journal_entries WHERE user_id = $1 AND id = ANY($2::bigint[])", [userId, examples.map((e) => e.id)]);
    return entries.filter((e) => !e.exampleKey);
  }
  return entries;
}

async function addEntry(userId, { book, mood, text }) {
  const body = typeof text === "string" ? text.trim() : "";
  if (!body || body.length > MAX_TEXT) throw userError(`Write something (up to ${MAX_TEXT} characters).`);
  if (!BOOKS.includes(book)) throw userError("Choose the Burden Book or the Gratitude Book.");
  return db.withTransaction(async (client) => {
    const { rows } = await client.query(
      "SELECT count(*)::int AS n FROM journal_entries WHERE user_id = $1",
      [userId]
    );
    if (rows[0].n >= MAX_ENTRIES) {
      throw userError(`Your journal has ${MAX_ENTRIES} entries. Delete some old ones first.`, "journalFull");
    }
    return insert(client, userId, { book, mood: MOODS.includes(mood) ? mood : "🙂", text: body });
  });
}

/**
 * Changes the text and mood of an entry (it stays in its book and keeps its date).
 * @returns the entry, or null if it doesn't exist
 */
async function updateEntry(userId, id, { mood, text }) {
  const body = typeof text === "string" ? text.trim() : "";
  if (!body || body.length > MAX_TEXT) throw userError(`Write something (up to ${MAX_TEXT} characters).`);
  const { rows } = await db.query(
    "SELECT id, ciphertext, iv, auth_tag, created_at FROM journal_entries WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  if (!rows.length) return null;
  const { book, exampleKey } = toEntry(rows[0], userId);
  if (exampleKey) throw userError("Examples can't be changed. Write an entry of your own.", "exampleReadOnly");
  const { ciphertext, iv, authTag } = encryptJson({ book, mood: MOODS.includes(mood) ? mood : "🙂", text: body }, context(userId));
  const updated = await db.query(
    `UPDATE journal_entries SET ciphertext = $3, iv = $4, auth_tag = $5 WHERE id = $1 AND user_id = $2
     RETURNING id, ciphertext, iv, auth_tag, created_at`,
    [id, userId, ciphertext, iv, authTag]
  );
  return updated.rows.length ? toEntry(updated.rows[0], userId) : null;
}

async function deleteEntry(userId, id) {
  await db.query("DELETE FROM journal_entries WHERE id = $1 AND user_id = $2", [id, userId]);
}

async function clearEntries(userId) {
  await db.query("DELETE FROM journal_entries WHERE user_id = $1", [userId]);
}

module.exports = { addExamplesOnce, listEntries, addEntry, updateEntry, deleteEntry, clearEntries };
