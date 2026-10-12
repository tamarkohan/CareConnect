/**
 * community.js
 *
 * "Caregivers near you" without sharing location or chatting with strangers:
 *  - A user may join the list with a first name and the city / neighborhood
 *    they choose. Others see only that (and the app language).
 *  - Contact requests carry one of a few fixed messages (MESSAGE_KEYS); no
 *    free text, no photos, so nothing to harass with.
 *  - Only after the other person accepts can either side share a phone
 *    number, which they type in. It is stored encrypted and shown only to
 *    the other person of that request.
 *  - Limits: a few new requests a day, one request per pair (either way),
 *    and a block hides both people from each other for good.
 */

const db = require("./db");
const { encrypt, decrypt } = require("./crypto");

const MESSAGE_KEYS = ["hello", "newInArea", "dayOff", "sameLanguage", "advice"];
const MAX_REQUESTS_PER_DAY = 5;
const MAX_PEOPLE = 40;
const LANGS = ["en", "tl", "ml", "ru"];

/** An error whose message is safe to show to the user. */
const userError = (message, code, status = 400) => Object.assign(new Error(message), { expose: true, status, code });

const NAME_RE = /^[\p{L}][\p{L}\p{M} .'-]{0,19}$/u;   // letters only: no numbers, links or emojis
const PHONE_RE = /^\+?[\d\s-]{7,20}$/;

const clean = (v, max) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");

async function getProfile(userId) {
  const { rows } = await db.query(
    "SELECT public_id, display_name, city, neighborhood, language FROM community_profiles WHERE user_id = $1",
    [userId]
  );
  const r = rows[0];
  return r ? { id: r.public_id, displayName: r.display_name, city: r.city, neighborhood: r.neighborhood || "", language: r.language || "" } : null;
}

async function saveProfile(userId, { displayName, city, neighborhood, language }) {
  const name = clean(displayName, 20);
  if (!NAME_RE.test(name)) throw userError("Please write only your first name, in letters.", "badName");
  const c = clean(city, 60);
  if (!c) throw userError("Please choose your city.", "noCity");
  await db.query(
    `INSERT INTO community_profiles (user_id, display_name, city, neighborhood, language, updated_at)
     VALUES ($1, $2, $3, $4, $5, now())
     ON CONFLICT (user_id) DO UPDATE SET display_name = $2, city = $3, neighborhood = $4, language = $5, updated_at = now()`,
    [userId, name, c, clean(neighborhood, 60) || null, LANGS.includes(language) ? language : null]
  );
  return getProfile(userId);
}

/** Leaving the list also withdraws the requests that weren't answered yet (blocks stay). */
async function leave(userId) {
  await db.withTransaction(async (client) => {
    await client.query("DELETE FROM community_profiles WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM contact_requests WHERE (from_user = $1 OR to_user = $1) AND status = 'pending'", [userId]);
  });
}

/** People on the list in the same city (same neighborhood first), without blocked people and yourself. */
async function listPeople(userId, city, neighborhood) {
  const c = clean(city, 60);
  if (!c) return [];
  const { rows } = await db.query(
    `SELECT p.public_id, p.display_name, p.city, p.neighborhood, p.language,
            r.status AS request_status, (r.from_user = $1) AS sent_by_me
     FROM community_profiles p
     LEFT JOIN contact_requests r
       ON (r.from_user = $1 AND r.to_user = p.user_id) OR (r.to_user = $1 AND r.from_user = p.user_id)
     WHERE p.city = $2 AND p.user_id <> $1
       AND (r.status IS NULL OR r.status <> 'blocked')
     ORDER BY (p.neighborhood IS NOT DISTINCT FROM $3) DESC, p.updated_at DESC
     LIMIT $4`,
    [userId, c, clean(neighborhood, 60) || null, MAX_PEOPLE]
  );
  return rows.map((r) => ({
    id: r.public_id,
    displayName: r.display_name,
    city: r.city,
    neighborhood: r.neighborhood || "",
    language: r.language || "",
    // none | sent | received | accepted | declined
    status: !r.request_status ? "none"
      : r.request_status === "pending" ? (r.sent_by_me ? "sent" : "received")
      : r.request_status,
  }));
}

async function sendRequest(userId, toPublicId, messageKey) {
  if (!MESSAGE_KEYS.includes(messageKey)) throw userError("Please choose a message.", "badMessage");
  if (!(await getProfile(userId))) throw userError("Join the caregivers list first.", "noProfile");

  const { rows: [target] } = await db.query("SELECT user_id FROM community_profiles WHERE public_id = $1", [toPublicId]);
  if (!target || target.user_id === userId) throw userError("This person is no longer on the list.", "notFound", 404);

  const { rows: [{ n }] } = await db.query(
    "SELECT count(*)::int AS n FROM contact_requests WHERE from_user = $1 AND created_at > now() - interval '1 day'",
    [userId]
  );
  if (n >= MAX_REQUESTS_PER_DAY) throw userError(`You can send up to ${MAX_REQUESTS_PER_DAY} requests a day.`, "tooMany", 429);

  const { rows: existing } = await db.query(
    `SELECT 1 FROM contact_requests
     WHERE (from_user = $1 AND to_user = $2) OR (from_user = $2 AND to_user = $1)`,
    [userId, target.user_id]
  );
  if (existing.length) throw userError("You already have a request with this person.", "exists", 409);

  await db.query(
    "INSERT INTO contact_requests (from_user, to_user, message_key) VALUES ($1, $2, $3)",
    [userId, target.user_id, messageKey]
  );
}

/** Requests I sent and received, newest first, with the other person's public details. */
async function listRequests(userId) {
  const { rows } = await db.query(
    `SELECT r.*, p.public_id, p.display_name, p.city, p.neighborhood
     FROM contact_requests r
     LEFT JOIN community_profiles p ON p.user_id = CASE WHEN r.from_user = $1 THEN r.to_user ELSE r.from_user END
     WHERE (r.from_user = $1 OR r.to_user = $1) AND r.status <> 'blocked'
       AND NOT (r.status = 'declined' AND r.to_user = $1)
     ORDER BY r.id DESC LIMIT 100`,
    [userId]
  );
  return rows.map((r) => {
    const mine = r.from_user === userId;
    const phone = (side) => {
      const ct = r[`${side}_phone_ct`];
      if (!ct) return null;
      try {
        return decrypt({ ciphertext: ct, iv: r[`${side}_phone_iv`], auth_tag: r[`${side}_phone_tag`] }, `contact:${r.id}:${side}`);
      } catch {
        return null;
      }
    };
    return {
      id: String(r.id),
      direction: mine ? "sent" : "received",
      status: r.status,
      messageKey: r.message_key,
      other: { displayName: r.display_name || "—", city: r.city || "", neighborhood: r.neighborhood || "" },
      // Phones only once accepted; "mine" is the number I shared, "theirs" what they shared with me.
      myPhone: r.status === "accepted" ? phone(mine ? "from" : "to") : null,
      theirPhone: r.status === "accepted" ? phone(mine ? "to" : "from") : null,
      createdAt: r.created_at,
    };
  });
}

/**
 * The person who received the request accepts or declines it. Either person
 * can block the other at any time (also after accepting).
 */
async function respond(userId, requestId, action) {
  const status = { accept: "accepted", decline: "declined", block: "blocked" }[action];
  if (!status) throw userError("Unknown answer.", "badAction");
  const { rowCount } = await db.query(
    status === "blocked"
      ? `UPDATE contact_requests SET status = 'blocked', responded_at = now()
         WHERE id = $2 AND (to_user = $1 OR from_user = $1) AND status <> 'blocked'`
      : `UPDATE contact_requests SET status = $3, responded_at = now()
         WHERE id = $2 AND to_user = $1 AND status = 'pending'`,
    status === "blocked" ? [userId, requestId] : [userId, requestId, status]
  );
  if (!rowCount) throw userError("This request was already answered.", "answered", 409);
}

/** After acceptance, either person can share a phone number with the other. */
async function sharePhone(userId, requestId, phoneInput) {
  const phone = clean(phoneInput, 20);
  if (!PHONE_RE.test(phone)) throw userError("Please enter a valid phone number.", "badPhone");
  const { rows: [r] } = await db.query(
    "SELECT from_user, to_user FROM contact_requests WHERE id = $1 AND status = 'accepted' AND (from_user = $2 OR to_user = $2)",
    [requestId, userId]
  );
  if (!r) throw userError("You can share your number only after the request is accepted.", "notAccepted", 409);
  const side = r.from_user === userId ? "from" : "to";
  const enc = encrypt(phone, `contact:${requestId}:${side}`);
  await db.query(
    `UPDATE contact_requests SET ${side}_phone_ct = $2, ${side}_phone_iv = $3, ${side}_phone_tag = $4 WHERE id = $1`,
    [requestId, enc.ciphertext, enc.iv, enc.authTag]
  );
}

module.exports = {
  MESSAGE_KEYS, getProfile, saveProfile, leave, listPeople, sendRequest, listRequests, respond, sharePhone,
};
