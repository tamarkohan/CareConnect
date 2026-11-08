/**
 * routes/tasks.js   (all routes need a signed-in user; see services/tasks.js)
 *
 * Every route answers with the whole list: { tasks: [{ id, label, lang, translations,
 *   exampleKey, time, days, lastDoneOn, fromTaskId, doneOn, doneAt, createdAt }] }
 *   label is null for an example task: the app shows exampleKey's text in its language.
 *   time is "HH:MM" or null; days (0 = Sunday … 6) set = repeats; doneAt set = completed.
 *
 * GET  /api/tasks              New users get a few example tasks the first time.
 * POST /api/tasks              Body: { label, time?, days?, lang }   add
 * POST /api/tasks/update       Body: { id, label, time?, days?, lang }   edit (not examples)
 * POST /api/tasks/done         Body: { id, done: boolean, date: "YYYY-MM-DD" }   tick / untick
 *                              (date = the user's today; a repeating task is ticked for that day)
 * POST /api/tasks/delete       Body: { id }
 * POST /api/tasks/translate    Body: { lang }   translates tasks written in other languages
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
    console.error("[tasks] Error:", err.cause?.message || err.message);
    res.status(err.status === 503 ? 503 : 500).json({ error: "Something went wrong. Please try again." });
  }
};
const validId = (id) => /^\d+$/.test(String(id || ""));
const notFound = (res) => res.status(404).json({ error: "This task was deleted." });

router.get("/", handle(async (req, res) => {
  if (!req.user.tasks_examples_at) await tasks.addExamplesOnce(req.user.id);
  res.json({ tasks: await tasks.listTasks(req.user.id) });
}));

router.post("/", handle(async (req, res) => {
  res.json({ tasks: await tasks.addTask(req.user.id, req.body || {}) });
}));

router.post("/update", handle(async (req, res) => {
  const { id, ...changes } = req.body || {};
  if (!validId(id)) return res.status(400).json({ error: "Missing task." });
  const list = await tasks.updateTask(req.user.id, String(id), changes);
  if (!list) return notFound(res);
  res.json({ tasks: list });
}));

router.post("/done", handle(async (req, res) => {
  const { id, done, date } = req.body || {};
  if (!validId(id) || typeof done !== "boolean") return res.status(400).json({ error: "Missing task." });
  const list = await tasks.setDone(req.user.id, String(id), done, date);
  if (!list) return notFound(res);
  res.json({ tasks: list });
}));

router.post("/delete", handle(async (req, res) => {
  const id = req.body?.id;
  if (!validId(id)) return res.status(400).json({ error: "Missing task." });
  res.json({ tasks: await tasks.deleteTask(req.user.id, String(id)) });
}));

router.post("/translate", handle(async (req, res) => {
  res.json({ tasks: await tasks.translateTasks(req.user.id, req.body?.lang) });
}));

module.exports = router;
