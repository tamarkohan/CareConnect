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

/** Saves messages in order. @returns {Promise<string[]>} their ids */
async function addMessages(userId, messages) {
  const ids = [];
  await db.withTransaction(async (client) => {
    for (const { role, text, sources, language } of messages) {
      const { ciphertext, iv, authTag } = encryptJson({ text, sources: sources || [], language }, context(userId));
      const { rows } = await client.query(
        "INSERT INTO legal_messages (user_id, role, ciphertext, iv, auth_tag) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [userId, role, ciphertext, iv, authTag]
      );
      ids.push(String(rows[0].id));
    }
    await client.query(
      `DELETE FROM legal_messages WHERE user_id = $1 AND id < (
         SELECT id FROM legal_messages WHERE user_id = $1 ORDER BY id DESC OFFSET $2 LIMIT 1
       )`,
      [userId, MAX_MESSAGES - 1]
    );
  });
  return ids;
}

async function hasMessage(userId, id) {
  const { rows } = await db.query("SELECT 1 FROM legal_messages WHERE user_id = $1 AND id = $2", [userId, id]);
  return rows.length > 0;
}

async function deleteMessage(userId, id) {
  await db.query("DELETE FROM legal_messages WHERE user_id = $1 AND id = $2", [userId, id]);
}

// Questions being answered right now (kept in this server's memory: there is one
// backend instance). Lets the app show "thinking" for a saved question after a
// restart, and tell it apart from one whose answer never came (server restarted).
const answering = new Map();   // userId → Set of question ids
const startAnswering = (userId, id) => answering.set(userId, (answering.get(userId) ?? new Set()).add(id));
function doneAnswering(userId, id) {
  answering.get(userId)?.delete(id);
  if (!answering.get(userId)?.size) answering.delete(userId);
}
const isAnswering = (userId) => answering.has(userId);

/** @returns {Promise<Array<{ id, role, text, sources, language, createdAt }>>} oldest first */
async function listMessages(userId, limit = MAX_MESSAGES) {
  const { rows } = await db.query(
    `SELECT id, role, ciphertext, iv, auth_tag, created_at FROM legal_messages
     WHERE user_id = $1 ORDER BY id DESC LIMIT $2`,
    [userId, limit]
  );
  return rows.reverse().flatMap((r) => {
    try {
      const { text, sources, language } = decryptJson(r, context(userId));
      return [{ id: String(r.id), role: r.role, text, sources, language: language ?? null, createdAt: r.created_at }];
    } catch {
      return []; // unreadable (e.g. key changed): skip it rather than fail the chat
    }
  });
}

async function clearMessages(userId) {
  await db.query("DELETE FROM legal_messages WHERE user_id = $1", [userId]);
}

module.exports = {
  addMessages, listMessages, clearMessages, hasMessage, deleteMessage,
  startAnswering, doneAnswering, isAnswering, MAX_MESSAGES,
};
