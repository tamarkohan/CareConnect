/**
 * users.js
 *
 * Users, login sessions and the auth middleware.
 *
 * A user is identified by a phone number OR an email. Signing in with a code
 * creates a session token (random, 256-bit). The app keeps the token and sends
 * it as "Authorization: Bearer <token>"; the DB stores only its SHA-256.
 *
 * Environment variables:
 *   SESSION_TTL_DAYS  days a login stays valid without use (default 180)
 */

const db = require("./db");
const { sha256, randomToken } = require("./crypto");

const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS) || 180;
const DEMO_PHONE = "123";

/**
 * Normalises what the user typed into the form we store.
 * Phone: Israeli numbers, typed with or without the leading 0 or +972.
 * @returns {{ kind: "phone"|"email", value: string } | null}
 */
function normaliseIdentifier({ phone, email }) {
  if (typeof email === "string" && email.trim()) {
    const e = email.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254 ? { kind: "email", value: e } : null;
  }
  if (typeof phone === "string" && phone.trim()) {
    let digits = phone.replace(/[^\d+]/g, "");
    if (digits === DEMO_PHONE) return { kind: "phone", value: DEMO_PHONE };
    if (digits.startsWith("+972")) digits = digits.slice(4);
    else if (digits.startsWith("972")) digits = digits.slice(3);
    if (digits.startsWith("0")) digits = digits.slice(1);
    // Israeli mobile/landline numbers have 8–9 digits after the country code.
    return /^\d{8,9}$/.test(digits) ? { kind: "phone", value: `+972${digits}` } : null;
  }
  return null;
}

const isDemoIdentifier = (id) => id.kind === "phone" && id.value === DEMO_PHONE;

function publicUser(row) {
  return {
    id: row.id,
    phone: row.phone,
    email: row.email,
    disclaimerVersion: row.disclaimer_version,
    isDemo: row.is_demo,
  };
}

/** Finds the user for this phone/email, creating them on first sign-in. */
async function findOrCreateUser(id) {
  const column = id.kind === "phone" ? "phone" : "email";
  const { rows } = await db.query(
    `INSERT INTO users (${column}, is_demo) VALUES ($1, $2)
     ON CONFLICT (${column}) DO UPDATE SET last_login_at = now()
     RETURNING *`,
    [id.value, isDemoIdentifier(id)]
  );
  return rows[0];
}

/** @returns {Promise<string>} a new session token for the user. */
async function createSession(userId) {
  const token = randomToken();
  await db.query(
    `INSERT INTO sessions (token_hash, user_id, expires_at)
     VALUES ($1, $2, now() + make_interval(days => $3))`,
    [sha256(token), userId, SESSION_TTL_DAYS]
  );
  return token;
}

async function userForToken(token) {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  // Sliding expiry: each use keeps the session alive.
  const { rows } = await db.query(
    `WITH s AS (
       UPDATE sessions SET expires_at = now() + make_interval(days => $2)
       WHERE token_hash = $1 AND expires_at > now()
       RETURNING user_id
     )
     SELECT u.* FROM users u JOIN s ON s.user_id = u.id`,
    [sha256(token), SESSION_TTL_DAYS]
  );
  return rows[0] ?? null;
}

async function deleteSession(token) {
  if (typeof token === "string") await db.query("DELETE FROM sessions WHERE token_hash = $1", [sha256(token)]);
}

async function updateUser(userId, { disclaimerVersion }) {
  const { rows } = await db.query(
    `UPDATE users SET disclaimer_version = COALESCE($2, disclaimer_version)
     WHERE id = $1 RETURNING *`,
    [userId, disclaimerVersion ?? null]
  );
  return rows[0];
}

async function purgeExpiredSessions() {
  const { rowCount } = await db.query("DELETE FROM sessions WHERE expires_at <= now()");
  return rowCount;
}

// ── Express middleware ───────────────────────────────────────────────────────

function bearer(req) {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() : null;
}

/** Sets req.user (DB row) when a valid session token is sent; never rejects. */
async function optionalAuth(req, _res, next) {
  try {
    const token = bearer(req);
    req.user = token ? await userForToken(token) : null;
    req.sessionToken = req.user ? token : null;
    next();
  } catch (err) {
    next(err);
  }
}

/** Like optionalAuth, but answers 401 when nobody is signed in. */
function requireAuth(req, res, next) {
  optionalAuth(req, res, (err) => {
    if (err) return next(err);
    if (!req.user) return res.status(401).json({ error: "Please sign in again." });
    next();
  });
}

module.exports = {
  normaliseIdentifier, isDemoIdentifier, publicUser,
  findOrCreateUser, createSession, userForToken, deleteSession, updateUser,
  purgeExpiredSessions, optionalAuth, requireAuth, DEMO_PHONE,
};
