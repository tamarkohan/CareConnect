/**
 * legalHistory.js
 *
 * The legal chat of signed-in users, encrypted like contracts.
 * Only the newest MAX_MESSAGES per user are kept, so the database stays small.
 */

const db = require("./db");
const { encryptJson, decryptJson } = require("./crypto");

const MAX_MESSAGES = 100;
const context = (userId) => `msg:${userId}`;

async function addMessages(userId, messages) {
  await db.withTransaction(async (client) => {
    for (const { role, text, sources } of messages) {
      const { ciphertext, iv, authTag } = encryptJson({ text, sources: sources || [] }, context(userId));
      await client.query(
        "INSERT INTO legal_messages (user_id, role, ciphertext, iv, auth_tag) VALUES ($1, $2, $3, $4, $5)",
        [userId, role, ciphertext, iv, authTag]
      );
    }
    await client.query(
      `DELETE FROM legal_messages WHERE user_id = $1 AND id < (
         SELECT id FROM legal_messages WHERE user_id = $1 ORDER BY id DESC OFFSET $2 LIMIT 1
       )`,
      [userId, MAX_MESSAGES - 1]
    );
  });
}

/** @returns {Promise<Array<{ id, role, text, sources, createdAt }>>} oldest first */
async function listMessages(userId, limit = MAX_MESSAGES) {
  const { rows } = await db.query(
    `SELECT id, role, ciphertext, iv, auth_tag, created_at FROM legal_messages
     WHERE user_id = $1 ORDER BY id DESC LIMIT $2`,
    [userId, limit]
  );
  return rows.reverse().flatMap((r) => {
    try {
      const { text, sources } = decryptJson(r, context(userId));
      return [{ id: String(r.id), role: r.role, text, sources, createdAt: r.created_at }];
    } catch {
      return []; // unreadable (e.g. key changed): skip it rather than fail the chat
    }
  });
}

async function clearMessages(userId) {
  await db.query("DELETE FROM legal_messages WHERE user_id = $1", [userId]);
}

module.exports = { addMessages, listMessages, clearMessages, MAX_MESSAGES };
