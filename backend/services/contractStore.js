/**
 * contractStore.js
 *
 * Stores employment contracts encrypted in the database.
 *
 *  - On upload the server creates a random 256-bit "contract token" and gives
 *    it to the app once. Only the app knows it; the DB stores its SHA-256.
 *  - The contract text is encrypted with AES-256-GCM using
 *    CONTRACT_ENCRYPTION_KEY (kept in the server environment, never in the DB).
 *    A database leak therefore exposes neither the text nor usable tokens.
 *  - Contracts expire after CONTRACT_TTL_DAYS and are purged automatically.
 *
 * Environment variables:
 *   CONTRACT_ENCRYPTION_KEY  (required) 32 random bytes, base64.
 *                            Generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 *   CONTRACT_TTL_DAYS        default 90
 */

const crypto = require("crypto");
const db = require("./db");

const KEY = Buffer.from(process.env.CONTRACT_ENCRYPTION_KEY || "", "base64");
if (KEY.length !== 32) {
  console.error(
    "[contractStore] CONTRACT_ENCRYPTION_KEY must be 32 bytes encoded as base64 (see RAG_SETUP.md)."
  );
  process.exit(1);
}

const TTL_DAYS = Number(process.env.CONTRACT_TTL_DAYS) || 90;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Tokens we issue are 43 base64url characters; reject anything else early. */
function isValidToken(token) {
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);
}

function encrypt(plaintext, tokenHash) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  // Bind the ciphertext to its row so rows can't be swapped in the DB.
  cipher.setAAD(Buffer.from(tokenHash));
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return { ciphertext, iv, authTag: cipher.getAuthTag() };
}

function decrypt({ ciphertext, iv, auth_tag }, tokenHash) {
  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAAD(Buffer.from(tokenHash));
  decipher.setAuthTag(auth_tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

/**
 * Save a contract. Pass the existing token to replace that contract,
 * or nothing to create a new one.
 * @returns {Promise<string>} the contract token (send it to the app).
 */
async function saveContract(text, existingToken) {
  const token = isValidToken(existingToken)
    ? existingToken
    : crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const { ciphertext, iv, authTag } = encrypt(text, tokenHash);

  await db.query(
    `INSERT INTO contracts (token_hash, ciphertext, iv, auth_tag, expires_at)
     VALUES ($1, $2, $3, $4, now() + make_interval(days => $5))
     ON CONFLICT (token_hash) DO UPDATE
       SET ciphertext = EXCLUDED.ciphertext,
           iv         = EXCLUDED.iv,
           auth_tag   = EXCLUDED.auth_tag,
           updated_at = now(),
           expires_at = EXCLUDED.expires_at`,
    [tokenHash, ciphertext, iv, authTag, TTL_DAYS]
  );
  return token;
}

/** @returns {Promise<string|null>} decrypted contract text, or null. */
async function getContract(token) {
  if (!isValidToken(token)) return null;
  const tokenHash = hashToken(token);
  const { rows } = await db.query(
    `SELECT ciphertext, iv, auth_tag FROM contracts
     WHERE token_hash = $1 AND expires_at > now()`,
    [tokenHash]
  );
  if (!rows.length) return null;
  return decrypt(rows[0], tokenHash);
}

/** @returns {Promise<boolean>} true if a contract was deleted. */
async function deleteContract(token) {
  if (!isValidToken(token)) return false;
  const { rowCount } = await db.query(
    "DELETE FROM contracts WHERE token_hash = $1",
    [hashToken(token)]
  );
  return rowCount > 0;
}

/** Remove expired contracts. @returns {Promise<number>} rows deleted. */
async function purgeExpired() {
  const { rowCount } = await db.query("DELETE FROM contracts WHERE expires_at <= now()");
  return rowCount;
}

module.exports = { saveContract, getContract, deleteContract, purgeExpired, isValidToken };
