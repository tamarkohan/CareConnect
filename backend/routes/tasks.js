/**
 * routes/tasks.js   (all routes need a signed-in user; see services/tasks.js)
 *
 * GET  /api/tasks           → { tasks: [{ id, label, exampleKey, time, doneAt, createdAt }] }
 *                             label is null for an example task: the app shows exampleKey's
 *                             text in its language. time is "HH:MM" or null; doneAt set = completed.
 *                             New users get a few example tasks the first time.
 * POST /api/tasks           Body: { label, time?: "HH:MM" } → { task }
 * POST /api/tasks/done      Body: { id, done: boolean }    → { task }   (tick / untick)
 * POST /api/tasks/delete    Body: { id }                   → { success: true }
 */

const express = require("express");
const router = express.Router();
const { requireAuth } = require("../services/users");
const tasks = require("../services/tasks");

router.use(requireAuth);

// Express 4 doesn't forward rejected promises; this does, and shows safe errors.
const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    if (err.expose) return res.status(err.status || 400).json({ error: err.message, code: err.code });
    console.error("[tasks] Error:", err.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};
const validId = (id) => /^\d+$/.test(String(id || ""));

router.get("/", handle(async (req, res) => {
  if (!req.user.tasks_examples_at) await tasks.addExamplesOnce(req.user.id);
  res.json({ tasks: await tasks.listTasks(req.user.id) });
}));

router.post("/", handle(async (req, res) => {
  res.json({ task: await tasks.addTask(req.user.id, req.body || {}) });
}));

router.post("/done", handle(async (req, res) => {
  const { id, done } = req.body || {};
  if (!validId(id) || typeof done !== "boolean") return res.status(400).json({ error: "Missing task." });
  const task = await tasks.setDone(req.user.id, String(id), done);
  if (!task) return res.status(404).json({ error: "This task was deleted." });
  res.json({ task });
}));

router.post("/delete", handle(async (req, res) => {
  const id = req.body?.id;
  if (!validId(id)) return res.status(400).json({ error: "Missing task." });
  await tasks.deleteTask(req.user.id, String(id));
  res.json({ success: true });
}));

module.exports = router;
