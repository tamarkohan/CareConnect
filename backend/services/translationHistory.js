/**
 * translationHistory.js
 *
 * Recent translations of signed-in users, encrypted. Users choose to see the
 * last 3, 5 or 10; we never keep more than MAX_KEPT, so the table stays tiny.
 */

const db = require("./db");
const { encryptJson, decryptJson } = require("./crypto");

const MAX_KEPT = 10;
const context = (userId) => `tr:${userId}`;

async function addTranslation(userId, entry) {
  const { ciphertext, iv, authTag } = encryptJson(entry, context(userId));
  return db.withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO translations (user_id, ciphertext, iv, auth_tag) VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [userId, ciphertext, iv, authTag]
    );
    await client.query(
      `DELETE FROM translations WHERE user_id = $1 AND id < (
         SELECT id FROM translations WHERE user_id = $1 ORDER BY id DESC OFFSET $2 LIMIT 1
       )`,
      [userId, MAX_KEPT - 1]
    );
    return { id: String(rows[0].id), createdAt: rows[0].created_at };
  });
}

/** @returns {Promise<Array>} newest first */
async function listTranslations(userId, limit) {
  const { rows } = await db.query(
    `SELECT id, ciphertext, iv, auth_tag, created_at FROM translations
     WHERE user_id = $1 ORDER BY id DESC LIMIT $2`,
    [userId, Math.min(limit, MAX_KEPT)]
  );
  return rows.flatMap((r) => {
    try {
      return [{ id: String(r.id), createdAt: r.created_at, ...decryptJson(r, context(userId)) }];
    } catch {
      return [];
    }
  });
}

async function clearTranslations(userId) {
  await db.query("DELETE FROM translations WHERE user_id = $1", [userId]);
}

module.exports = { addTranslation, listTranslations, clearTranslations, MAX_KEPT };
