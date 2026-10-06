/**
 * embeddingService.js
 *
 * Turns text into vectors with Gemini embeddings (free tier works).
 *
 * Environment variables:
 *   GEMINI_API_KEY      (required)
 *   GEMINI_EMBED_MODEL  default: gemini-embedding-001
 */

const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
  console.error("[embeddingService] GEMINI_API_KEY is not set.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || "gemini-embedding-001";
// Must match vector(768) in db/schema.sql.
const EMBED_DIM = 768;
const BATCH_SIZE = 20;
const RETRY_DELAYS_MS = [2000, 5000, 15000, 30000, 60000];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isTemporary(err) {
  return [429, 500, 502, 503, 504].includes(err?.status);
}

async function embedBatch(texts, taskType) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await ai.models.embedContent({
        model: EMBED_MODEL,
        contents: texts,
        config: { taskType, outputDimensionality: EMBED_DIM },
      });
      return res.embeddings.map((e) => e.values);
    } catch (err) {
      if (!isTemporary(err) || attempt >= RETRY_DELAYS_MS.length) throw err;
      console.warn(`[embed] ${err.status} – retrying in ${RETRY_DELAYS_MS[attempt] / 1000}s`);
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
}

/**
 * Embed many texts (batched).
 * @param {string[]} texts
 * @param {"RETRIEVAL_DOCUMENT"|"RETRIEVAL_QUERY"} taskType
 * @returns {Promise<number[][]>}
 */
async function embedMany(texts, taskType = "RETRIEVAL_DOCUMENT") {
  const out = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    out.push(...(await embedBatch(texts.slice(i, i + BATCH_SIZE), taskType)));
  }
  return out;
}

/** Embed a user question for searching. */
async function embedQuery(text) {
  const [vector] = await embedBatch([text], "RETRIEVAL_QUERY");
  return vector;
}

module.exports = { embedMany, embedQuery, EMBED_DIM, EMBED_MODEL };
