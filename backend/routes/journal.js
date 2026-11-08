/**
 * routes/journal.js   (all routes need a signed-in user; see services/journal.js)
 *
 * GET  /api/journal          → { entries: [{ id, book, mood, text, exampleKey, createdAt }] }  newest first
 *                              text is null for an example entry: the app shows exampleKey's
 *                              text in its language. New users get two examples the first time;
 *                              they go away once the user has an entry of their own.
 * POST /api/journal          Body: { book: "burden" | "gratitude", mood, text } → { entry }
 * POST /api/journal/update   Body: { id, mood, text } → { entry }   (an edited example becomes the user's own)
 * POST /api/journal/delete   Body: { id } → { success: true }
 */

const express = require("express");
const router = express.Router();
const { requireAuth } = require("../services/users");
const journal = require("../services/journal");

router.use(requireAuth);

// Express 4 doesn't forward rejected promises; this does, and shows safe errors.
const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    if (err.expose) return res.status(err.status || 400).json({ error: err.message, code: err.code });
    console.error("[journal] Error:", err.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};
const validId = (id) => /^\d+$/.test(String(id || ""));

router.get("/", handle(async (req, res) => {
  if (!req.user.journal_examples_at) await journal.addExamplesOnce(req.user.id);
  res.json({ entries: await journal.listEntries(req.user.id) });
}));

router.post("/", handle(async (req, res) => {
  res.json({ entry: await journal.addEntry(req.user.id, req.body || {}) });
}));

router.post("/update", handle(async (req, res) => {
  const { id, mood, text } = req.body || {};
  if (!validId(id)) return res.status(400).json({ error: "Missing entry." });
  const entry = await journal.updateEntry(req.user.id, String(id), { mood, text });
  if (!entry) return res.status(404).json({ error: "This entry was deleted." });
  res.json({ entry });
}));

router.post("/delete", handle(async (req, res) => {
  const id = req.body?.id;
  if (!validId(id)) return res.status(400).json({ error: "Missing entry." });
  await journal.deleteEntry(req.user.id, String(id));
  res.json({ success: true });
}));

module.exports = router;
