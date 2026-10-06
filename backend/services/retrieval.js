/**
 * retrieval.js
 *
 * Finds the knowledge-base chunks most relevant to a question.
 */

const db = require("./db");
const { embedQuery } = require("./embeddingService");

const TOP_K = 6;
// Cosine distance (0 = identical, 2 = opposite). Chunks further away than
// this are probably unrelated, so we don't show them to the model.
const MAX_DISTANCE = 0.6;

/**
 * @param {string} question
 * @returns {Promise<Array<{ title: string, url: string, content: string, distance: number }>>}
 */
async function searchKnowledgeBase(question) {
  const vector = await embedQuery(question);
  const { rows } = await db.query(
    `SELECT p.title, p.url, c.content, c.embedding <=> $1::vector AS distance
     FROM chunks c
     JOIN pages p ON p.url = c.page_url
     ORDER BY c.embedding <=> $1::vector
     LIMIT $2`,
    [db.toVector(vector), TOP_K]
  );
  return rows.filter((r) => r.distance <= MAX_DISTANCE);
}

module.exports = { searchKnowledgeBase };
