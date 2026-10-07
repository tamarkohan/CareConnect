/**
 * crypto.js
 *
 * AES-256-GCM encryption for everything personal we store (contracts,
 * contract summaries, legal chat messages, translations). The database only
 * ever holds ciphertext; the key lives in the server environment.
 *
 * Every value is bound to a "context" string (e.g. "msg:<userId>") through the
 * GCM additional data, so a row copied into another user's place fails to
 * decrypt instead of leaking.
 *
 * Environment variables:
 *   CONTRACT_ENCRYPTION_KEY  (required) 32 random bytes, base64.
 *                            Generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */

const crypto = require("crypto");

const KEY = Buffer.from(process.env.CONTRACT_ENCRYPTION_KEY || "", "base64");
if (KEY.length !== 32) {
  console.error(
    "[crypto] CONTRACT_ENCRYPTION_KEY must be 32 bytes encoded as base64 (see RAG_SETUP.md)."
  );
  process.exit(1);
}

/** @returns {{ ciphertext: Buffer, iv: Buffer, authTag: Buffer }} */
function encrypt(plaintext, context) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  cipher.setAAD(Buffer.from(context));
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return { ciphertext, iv, authTag: cipher.getAuthTag() };
}

/** Accepts a DB row with ciphertext / iv / auth_tag columns. */
function decrypt({ ciphertext, iv, auth_tag }, context) {
  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAAD(Buffer.from(context));
  decipher.setAuthTag(auth_tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

const encryptJson = (value, context) => encrypt(JSON.stringify(value), context);
const decryptJson = (row, context) => JSON.parse(decrypt(row, context));

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

/** Random URL-safe token (43 chars). The DB only ever stores its SHA-256. */
const randomToken = () => crypto.randomBytes(32).toString("base64url");

module.exports = { encrypt, decrypt, encryptJson, decryptJson, sha256, randomToken };
