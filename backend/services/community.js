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
 *  - Places: anyone can see who wants to go to a place (e.g. Nazareth).
 *    People on the list can mark "I want to go" and invite each other – from
 *    any city – with the fixed "visit together" message.
 *  - listed = false: a profile from a short time when places didn't need the
 *    list. Such people aren't shown anywhere until they join the list.
 */

const db = require("./db");
const { encrypt, decrypt } = require("./crypto");
const names = require("./names");

const MESSAGE_KEYS = ["hello", "newInArea", "dayOff", "sameLanguage", "advice", "visitTogether"];
const PLACE_RE = /^[a-z0-9-]{2,40}$/;   // place keys from the app, e.g. "nazareth"
const validPlace = (id) => typeof id === "string" && PLACE_RE.test(id);
const MAX_REQUESTS_PER_DAY = 5;
const MAX_PEOPLE = 40;
const LANGS = ["en", "tl", "ml", "ru", "hi", "ta"];

/** An error whose message is safe to show to the user. */
const userError = (message, code, status = 400) => Object.assign(new Error(message), { expose: true, status, code });

// Phone numbers: digits only. An Israeli number has 9–10 digits starting with 0
// (050-1234567 is typed as 0501234567); a foreign one may start with + and
// have up to 15 digits (the international maximum).
function normalisePhone(input) {
  const p = String(input || "").replace(/[\s-]/g, "");
  if (/^0\d{8,9}$/.test(p)) return p;
  if (/^\+?[1-9]\d{7,14}$/.test(p)) return p;
  return null;
}

const clean = (v, max) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");

async function getProfile(userId) {
  const { rows } = await db.query(
    "SELECT public_id, display_name, city, neighborhood, language, listed FROM community_profiles WHERE user_id = $1",
    [userId]
  );
  const r = rows[0];
  return r ? {
    id: r.public_id, displayName: r.display_name, city: r.city, neighborhood: r.neighborhood || "", language: r.language || "",
    listed: r.listed,   // false: not on the "Near you" list (see the top of this file)
  } : null;
}

/** The list name is the account name (one name, spelled in every alphabet: see names.js). */
async function saveProfile(userId, { displayName, city, neighborhood, language }) {
  const name = names.cleanName(displayName);
  const c = clean(city, 60);
  if (!c) throw userError("Please choose your city.", "noCity");
  await names.setDisplayName(userId, name);
  await db.query(
    `INSERT INTO community_profiles (user_id, display_name, city, neighborhood, language, listed, updated_at)
     VALUES ($1, $2, $3, $4, $5, true, now())
     ON CONFLICT (user_id) DO UPDATE SET display_name = $2, city = $3, neighborhood = $4, language = $5, listed = true, updated_at = now()`,
    [userId, name, c, clean(neighborhood, 60) || null, LANGS.includes(language) ? language : null]
  );
  return getProfile(userId);
}

/** Places and invitations need a public name on the "Near you" caregivers list. */
async function requireListed(userId) {
  if (!(await getProfile(userId))?.listed) throw userError("Join the caregivers list first.", "noProfile");
}

/**
 * Leaving the list removes all the user's requests and connections, so any
 * phone number they shared disappears for the other person too (and theirs
 * for them). Blocks stay, so a blocked person stays blocked if they rejoin.
 */
async function leave(userId) {
  await db.withTransaction(async (client) => {
    await client.query("DELETE FROM community_profiles WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM contact_requests WHERE (from_user = $1 OR to_user = $1) AND status <> 'blocked'", [userId]);
    await client.query("DELETE FROM place_interests WHERE user_id = $1", [userId]);
  });
}

/** People on the list in the same city (same neighborhood first), without blocked people and yourself. */
async function listPeople(userId, city, neighborhood) {
  const c = clean(city, 60);
  if (!c) return [];
  const { rows } = await db.query(
    `SELECT p.public_id, p.display_name, p.city, p.neighborhood, p.language,
            r.id AS request_id, r.status AS request_status, (r.from_user = $1) AS sent_by_me,
            CASE WHEN u.display_name = p.display_name THEN u.display_name_i18n END AS names   -- spellings of this very name
     FROM community_profiles p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN contact_requests r
       ON (r.from_user = $1 AND r.to_user = p.user_id) OR (r.to_user = $1 AND r.from_user = p.user_id)
     WHERE p.city = $2 AND p.user_id <> $1 AND p.listed
       AND (r.status IS NULL OR r.status <> 'blocked')
     ORDER BY (p.neighborhood IS NOT DISTINCT FROM $3) DESC, p.updated_at DESC
     LIMIT $4`,
    [userId, c, clean(neighborhood, 60) || null, MAX_PEOPLE]
  );
  return rows.map(personRow);
}

const personRow = (r) => ({
  id: r.public_id,
  displayName: r.display_name,
  names: r.names || null,   // the name in each app language's letters
  city: r.city,
  neighborhood: r.neighborhood || "",
  language: r.language || "",
  requestId: r.request_id ? String(r.request_id) : null,   // to accept / decline right here
  // none | sent | received | accepted | declined
  status: !r.request_status ? "none"
    : r.request_status === "pending" ? (r.sent_by_me ? "sent" : "received")
    : r.request_status,
});

// ── "I want to go" to a place ───────────────────────────────────────────────

/**
 * For each place: how many others want to go (the people placePeople lists:
 * not me, nobody blocked with me); and the places I marked.
 */
async function placeSummary(userId) {
  const { rows } = await db.query(
    `SELECT i.place_id,
            count(*) FILTER (WHERE i.user_id <> $1 AND NOT EXISTS (
              SELECT 1 FROM contact_requests r WHERE r.status = 'blocked'
                AND ((r.from_user = $1 AND r.to_user = i.user_id) OR (r.to_user = $1 AND r.from_user = i.user_id))
            ))::int AS n,
            bool_or(i.user_id = $1) AS mine
     FROM place_interests i JOIN community_profiles p ON p.user_id = i.user_id AND p.listed
     GROUP BY i.place_id`,
    [userId]
  );
  return {
    counts: Object.fromEntries(rows.map((r) => [r.place_id, r.n])),
    mine: rows.filter((r) => r.mine).map((r) => r.place_id),
  };
}

async function setPlaceInterest(userId, placeId, interested) {
  if (!validPlace(placeId)) throw userError("Unknown place.", "badPlace");
  if (interested) {
    await requireListed(userId);
    await db.query(
      "INSERT INTO place_interests (user_id, place_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, placeId]
    );
  } else {
    await db.query("DELETE FROM place_interests WHERE user_id = $1 AND place_id = $2", [userId, placeId]);
  }
}

/** People (from any city) who want to go to a place, without blocked people and yourself. */
async function placePeople(userId, placeId) {
  if (!validPlace(placeId)) return [];
  const { rows } = await db.query(
    `SELECT p.public_id, p.display_name, p.city, p.neighborhood, p.language,
            r.id AS request_id, r.status AS request_status, (r.from_user = $1) AS sent_by_me,
            CASE WHEN u.display_name = p.display_name THEN u.display_name_i18n END AS names   -- spellings of this very name
     FROM place_interests i
     JOIN community_profiles p ON p.user_id = i.user_id AND p.listed
     JOIN users u ON u.id = p.user_id
     LEFT JOIN contact_requests r
       ON (r.from_user = $1 AND r.to_user = p.user_id) OR (r.to_user = $1 AND r.from_user = p.user_id)
     WHERE i.place_id = $2 AND i.user_id <> $1
       AND (r.status IS NULL OR r.status <> 'blocked')
     ORDER BY i.created_at DESC
     LIMIT $3`,
    [userId, placeId, MAX_PEOPLE]
  );
  return rows.map(personRow);
}

async function sendRequest(userId, toPublicId, messageKey, placeId = null) {
  if (!MESSAGE_KEYS.includes(messageKey)) throw userError("Please choose a message.", "badMessage");
  const visit = messageKey === "visitTogether";
  // "Visit together" always names the place it's about.
  if (visit ? !validPlace(placeId) : placeId) {
    throw userError("Please choose a message.", "badMessage");
  }
  await requireListed(userId);

  // "Visit together" goes only to someone who wants to go to that place.
  const { rows: [target] } = await db.query(
    `SELECT p.user_id FROM community_profiles p
     WHERE p.public_id = $1 AND p.listed AND ($2::text IS NULL OR EXISTS (
       SELECT 1 FROM place_interests i WHERE i.user_id = p.user_id AND i.place_id = $2))`,
    [toPublicId, visit ? placeId : null]
  );
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
    "INSERT INTO contact_requests (from_user, to_user, message_key, place_id) VALUES ($1, $2, $3, $4)",
    [userId, target.user_id, messageKey, placeId || null]
  );
}

/** Requests I sent and received, newest first, with the other person's public details. */
async function listRequests(userId) {
  const { rows } = await db.query(
    `SELECT r.*, p.public_id, p.display_name, p.city, p.neighborhood,
            CASE WHEN u.display_name = p.display_name THEN u.display_name_i18n END AS names   -- spellings of this very name
     FROM contact_requests r
     JOIN community_profiles p ON p.user_id = CASE WHEN r.from_user = $1 THEN r.to_user ELSE r.from_user END
     JOIN users u ON u.id = p.user_id
     WHERE (r.from_user = $1 OR r.to_user = $1) AND r.status <> 'blocked'
       AND NOT (r.status = 'declined' AND r.to_user = $1)
       -- Only while both people are still on the list (a person who left disappears, with their number).
       AND EXISTS (SELECT 1 FROM community_profiles me WHERE me.user_id = $1)
     ORDER BY r.id DESC LIMIT 100`,
    [userId]
  );
  return rows.map((r) => {
    const mine = r.from_user === userId;
    const phone = (side) => {
      const ct = r[`${side}_phone_ct`];
      if (!ct) return null;
      try {
        // normalisePhone also hides anything stored before numbers were checked strictly.
        return normalisePhone(decrypt({ ciphertext: ct, iv: r[`${side}_phone_iv`], auth_tag: r[`${side}_phone_tag`] }, `contact:${r.id}:${side}`));
      } catch {
        return null;
      }
    };
    return {
      id: String(r.id),
      direction: mine ? "sent" : "received",
      status: r.status,
      messageKey: r.message_key,
      placeId: r.place_id || null,
      other: { displayName: r.display_name, names: r.names || null, city: r.city, neighborhood: r.neighborhood || "" },
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
      // A block also erases any shared numbers.
      ? `UPDATE contact_requests SET status = 'blocked', responded_at = now(),
           from_phone_ct = NULL, from_phone_iv = NULL, from_phone_tag = NULL,
           to_phone_ct = NULL, to_phone_iv = NULL, to_phone_tag = NULL
         WHERE id = $2 AND (to_user = $1 OR from_user = $1) AND status <> 'blocked'`
      : `UPDATE contact_requests SET status = $3, responded_at = now()
         WHERE id = $2 AND to_user = $1 AND status = 'pending'`,
    status === "blocked" ? [userId, requestId] : [userId, requestId, status]
  );
  if (!rowCount) throw userError("This request was already answered.", "answered", 409);
}

/** After acceptance, either person can share a phone number with the other. */
async function sharePhone(userId, requestId, phoneInput) {
  const phone = normalisePhone(phoneInput);
  if (!phone) throw userError("Please enter a phone number with digits only: 10 digits (e.g. 0501234567), or + and the country code.", "badPhone");
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
  placeSummary, setPlaceInterest, placePeople,
};
