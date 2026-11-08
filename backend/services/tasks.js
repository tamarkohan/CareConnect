/**
 * tasks.js
 *
 * The caregiver's to-do list, encrypted (tasks can name medicines and the
 * patient). A task is open until it is ticked; ticked tasks are kept as
 * "completed" (the last MAX_DONE), so the user can look back at them.
 *
 * New users get a few example tasks, once (users.tasks_examples_at). They are
 * stored with an exampleKey instead of a label, so the app shows them in its
 * current language.
 */

const db = require("./db");
const { encryptJson, decryptJson } = require("./crypto");

const MAX_OPEN = 100;           // open tasks per user
const MAX_DONE = 100;           // completed tasks kept per user; older ones are removed
const MAX_LABEL = 200;
const context = (userId) => `task:${userId}`;

// exampleKey = a text the app has in every language (T.task1… in src/translations.ts).
const EXAMPLES = [
  { exampleKey: "task1", time: "08:00", done: true },
  { exampleKey: "task5", time: "14:00" },
  { exampleKey: "task4", time: "16:00" },
];

const isTime = (v) => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

const userError = (message, code, status = 400) => Object.assign(new Error(message), { expose: true, status, code });

function toTask(row, userId) {
  const { label = null, exampleKey = null, time = null } = decryptJson(row, context(userId));
  return { id: String(row.id), label, exampleKey, time, doneAt: row.done_at, createdAt: row.created_at };
}

async function insert(client, userId, task, doneAt = null) {
  const { ciphertext, iv, authTag } = encryptJson(task, context(userId));
  const { rows } = await client.query(
    `INSERT INTO tasks (user_id, ciphertext, iv, auth_tag, done_at) VALUES ($1, $2, $3, $4, $5)
     RETURNING id, ciphertext, iv, auth_tag, done_at, created_at`,
    [userId, ciphertext, iv, authTag, doneAt]
  );
  return toTask(rows[0], userId);
}

/** Adds the example tasks the first time, unless the user already has tasks. */
async function addExamplesOnce(userId) {
  await db.withTransaction(async (client) => {
    // Only the request that sets the date adds them (two at once can't add them twice).
    const { rowCount } = await client.query(
      "UPDATE users SET tasks_examples_at = now() WHERE id = $1 AND tasks_examples_at IS NULL",
      [userId]
    );
    if (!rowCount) return;
    const { rows } = await client.query("SELECT 1 FROM tasks WHERE user_id = $1 LIMIT 1", [userId]);
    if (rows.length) return;
    for (const { done, ...task } of EXAMPLES) await insert(client, userId, task, done ? new Date() : null);
  });
}

/** @returns {Promise<Array>} every task, oldest first (the app sorts them) */
async function listTasks(userId) {
  const { rows } = await db.query(
    "SELECT id, ciphertext, iv, auth_tag, done_at, created_at FROM tasks WHERE user_id = $1 ORDER BY id",
    [userId]
  );
  return rows.flatMap((r) => {
    try {
      return [toTask(r, userId)];
    } catch {
      return [];
    }
  });
}

async function addTask(userId, { label, time }) {
  const text = typeof label === "string" ? label.trim() : "";
  if (!text || text.length > MAX_LABEL) throw userError(`Write the task (up to ${MAX_LABEL} characters).`);
  if (time != null && time !== "" && !isTime(time)) throw userError("The time must look like 08:30.");
  return db.withTransaction(async (client) => {
    const { rows } = await client.query(
      "SELECT count(*)::int AS n FROM tasks WHERE user_id = $1 AND done_at IS NULL",
      [userId]
    );
    if (rows[0].n >= MAX_OPEN) {
      throw userError(`You have ${MAX_OPEN} open tasks. Tick or delete some first.`, "tooManyTasks");
    }
    return insert(client, userId, { label: text, time: isTime(time) ? time : null });
  });
}

/** Ticks a task (completed) or unticks it (open again). @returns the task, or null if not found */
async function setDone(userId, id, done) {
  return db.withTransaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE tasks SET done_at = CASE WHEN $3 THEN COALESCE(done_at, now()) ELSE NULL END
       WHERE id = $1 AND user_id = $2
       RETURNING id, ciphertext, iv, auth_tag, done_at, created_at`,
      [id, userId, !!done]
    );
    if (!rows.length) return null;
    // Keep only the most recent completed tasks.
    await client.query(
      `DELETE FROM tasks WHERE user_id = $1 AND done_at IS NOT NULL AND id NOT IN (
         SELECT id FROM tasks WHERE user_id = $1 AND done_at IS NOT NULL ORDER BY done_at DESC, id DESC LIMIT $2
       )`,
      [userId, MAX_DONE]
    );
    return toTask(rows[0], userId);
  });
}

async function deleteTask(userId, id) {
  await db.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2", [id, userId]);
}

async function clearTasks(userId) {
  await db.query("DELETE FROM tasks WHERE user_id = $1", [userId]);
}

module.exports = { addExamplesOnce, listTasks, addTask, setDone, deleteTask, clearTasks };
