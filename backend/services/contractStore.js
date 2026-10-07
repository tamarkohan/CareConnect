/**
 * contractStore.js
 *
 * Stores employment contracts encrypted in the database. Uploaded files are
 * never stored: only the extracted text (a few KB, whatever the file size).
 *
 * Two kinds of owner:
 *  - Signed-in users: one contract per user, plus an encrypted summary.
 *    The expiry is pushed forward every time it is used.
 *  - Guests: the server creates a random 256-bit "contract token" and gives it
 *    to the app once. Only the app knows it; the DB stores its SHA-256.
 *
 * The text is encrypted with AES-256-GCM (services/crypto.js), so a database
 * leak exposes neither the text nor usable tokens.
 *
 * Environment variables:
 *   CONTRACT_ENCRYPTION_KEY  (required) see services/crypto.js
 *   CONTRACT_TTL_DAYS        days without use before deletion (default 90)
 */

const db = require("./db");
const { encrypt, decrypt, encryptJson, decryptJson, sha256, randomToken } = require("./crypto");

const TTL_DAYS = Number(process.env.CONTRACT_TTL_DAYS) || 90;

/** Tokens we issue are 43 base64url characters; reject anything else early. */
function isValidToken(token) {
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);
}

// A user's row is keyed like a token row, so both share the same table and code.
const userKey = (userId) => sha256(`user:${userId}`);
const summaryContext = (tokenHash) => `summary:${tokenHash}`;

async function upsert(tokenHash, text, { userId = null, fileName = null, summary = null } = {}) {
  // The text is bound to its row (AAD = token hash) so rows can't be swapped.
  const { ciphertext, iv, authTag } = encrypt(text, tokenHash);
  const s = summary ? encryptJson(summary, summaryContext(tokenHash)) : null;

  await db.query(
    `INSERT INTO contracts (token_hash, ciphertext, iv, auth_tag, expires_at, user_id, file_name,
                            summary_ciphertext, summary_iv, summary_auth_tag)
     VALUES ($1, $2, $3, $4, now() + make_interval(days => $5), $6, $7, $8, $9, $10)
     ON CONFLICT (token_hash) DO UPDATE
       SET ciphertext = EXCLUDED.ciphertext,
           iv         = EXCLUDED.iv,
           auth_tag   = EXCLUDED.auth_tag,
           file_name  = EXCLUDED.file_name,
           summary_ciphertext = EXCLUDED.summary_ciphertext,
           summary_iv         = EXCLUDED.summary_iv,
           summary_auth_tag   = EXCLUDED.summary_auth_tag,
           updated_at = now(),
           expires_at = EXCLUDED.expires_at`,
    [tokenHash, ciphertext, iv, authTag, TTL_DAYS, userId, fileName,
      s?.ciphertext ?? null, s?.iv ?? null, s?.authTag ?? null]
  );
}

async function load(tokenHash) {
  const { rows } = await db.query(
    `SELECT ciphertext, iv, auth_tag, file_name, updated_at,
            summary_ciphertext, summary_iv, summary_auth_tag
     FROM contracts WHERE token_hash = $1 AND expires_at > now()`,
    [tokenHash]
  );
  if (!rows.length) return null;
  const r = rows[0];
  let summary = null;
  if (r.summary_ciphertext) {
    try {
      summary = decryptJson(
        { ciphertext: r.summary_ciphertext, iv: r.summary_iv, auth_tag: r.summary_auth_tag },
        summaryContext(tokenHash)
      );
    } catch {
      summary = null; // a broken summary shouldn't hide the contract itself
    }
  }
  return { text: decrypt(r, tokenHash), summary, fileName: r.file_name, updatedAt: r.updated_at };
}

// ── Guests (token) ───────────────────────────────────────────────────────────

/**
 * Save a contract. Pass the existing token to replace that contract,
 * or nothing to create a new one.
 * @returns {Promise<string>} the contract token (send it to the app).
 */
async function saveContract(text, existingToken, extra) {
  const token = isValidToken(existingToken) ? existingToken : randomToken();
  await upsert(sha256(token), text, extra);
  return token;
}

/** @returns {Promise<string|null>} decrypted contract text, or null. */
async function getContract(token) {
  if (!isValidToken(token)) return null;
  return (await load(sha256(token)))?.text ?? null;
}

/** @returns {Promise<boolean>} true if a contract was deleted. */
async function deleteContract(token) {
  if (!isValidToken(token)) return false;
  const { rowCount } = await db.query("DELETE FROM contracts WHERE token_hash = $1", [sha256(token)]);
  return rowCount > 0;
}

// ── Signed-in users ──────────────────────────────────────────────────────────

async function saveUserContract(userId, text, { fileName, summary } = {}) {
  await upsert(userKey(userId), text, { userId, fileName, summary });
}

/** @returns {Promise<{text, summary, fileName, updatedAt}|null>} */
async function getUserContract(userId) {
  const key = userKey(userId);
  const contract = await load(key);
  if (contract) {
    // Still in use, so keep it: the countdown restarts from today.
    await db.query(
      "UPDATE contracts SET expires_at = now() + make_interval(days => $2) WHERE token_hash = $1",
      [key, TTL_DAYS]
    );
  }
  return contract;
}

async function deleteUserContract(userId) {
  const { rowCount } = await db.query("DELETE FROM contracts WHERE token_hash = $1", [userKey(userId)]);
  return rowCount > 0;
}

/** Remove expired contracts. @returns {Promise<number>} rows deleted. */
async function purgeExpired() {
  const { rowCount } = await db.query("DELETE FROM contracts WHERE expires_at <= now()");
  return rowCount;
}

module.exports = {
  saveContract, getContract, deleteContract,
  saveUserContract, getUserContract, deleteUserContract,
  purgeExpired, isValidToken, TTL_DAYS,
};
