/**
 * routes/community.js   (all routes need a signed-in user; see services/community.js)
 *
 * GET  /api/community/me                 → { profile | null, requests: [...] }
 * POST /api/community/profile            Body: { displayName, city, neighborhood?, language? } → { profile }
 * POST /api/community/leave              → { success: true }   (removes you from the list)
 * GET  /api/community/people?city=&neighborhood=  → { people: [{ id, displayName, city, neighborhood, language, status }] }
 * POST /api/community/request            Body: { to: <person id>, messageKey } → { success: true }
 * POST /api/community/respond            Body: { requestId, action: "accept" | "decline" | "block" } → { success: true }
 * POST /api/community/share-phone        Body: { requestId, phone } → { success: true }
 */

const express = require("express");
const router = express.Router();
const { requireAuth } = require("../services/users");
const community = require("../services/community");

router.use(requireAuth);

// Express 4 doesn't forward rejected promises; this does, and shows safe errors.
const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    if (err.expose) return res.status(err.status || 400).json({ error: err.message, code: err.code });
    console.error("[community] Error:", err.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};
const validId = (id) => /^\d+$/.test(String(id || ""));
const validUuid = (id) => /^[0-9a-f-]{36}$/i.test(String(id || ""));

router.get("/me", handle(async (req, res) => {
  const [profile, requests] = await Promise.all([
    community.getProfile(req.user.id),
    community.listRequests(req.user.id),
  ]);
  res.json({ profile, requests });
}));

router.post("/profile", handle(async (req, res) => {
  res.json({ profile: await community.saveProfile(req.user.id, req.body || {}) });
}));

router.post("/leave", handle(async (req, res) => {
  await community.leave(req.user.id);
  res.json({ success: true });
}));

router.get("/people", handle(async (req, res) => {
  res.json({ people: await community.listPeople(req.user.id, req.query.city, req.query.neighborhood) });
}));

router.post("/request", handle(async (req, res) => {
  const { to, messageKey } = req.body || {};
  if (!validUuid(to)) return res.status(400).json({ error: "Missing person." });
  await community.sendRequest(req.user.id, to, messageKey);
  res.json({ success: true });
}));

router.post("/respond", handle(async (req, res) => {
  const { requestId, action } = req.body || {};
  if (!validId(requestId)) return res.status(400).json({ error: "Missing request." });
  await community.respond(req.user.id, String(requestId), action);
  res.json({ success: true });
}));

router.post("/share-phone", handle(async (req, res) => {
  const { requestId, phone } = req.body || {};
  if (!validId(requestId)) return res.status(400).json({ error: "Missing request." });
  await community.sharePhone(req.user.id, String(requestId), phone);
  res.json({ success: true });
}));

module.exports = router;
