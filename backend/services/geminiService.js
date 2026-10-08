/**
 * geminiService.js
 *
 * Centralised Gemini client. All routes call `generate()` so that:
 *  - the API key is read from the environment in one place,
 *  - temporary Gemini errors (503 "high demand", 429 rate limit, 500) are
 *    retried automatically, and
 *  - if a model stays unavailable, the next model in the list is tried.
 *
 * Environment variables:
 *   GEMINI_API_KEY          (required)
 *   GEMINI_MODEL            first model to try      (default: gemini-3.5-flash)
 *   GEMINI_FALLBACK_MODELS  comma-separated backups (default below)
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "[geminiService] GEMINI_API_KEY is not set. " +
    "Please create backend/.env and add the key."
  );
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const FALLBACK_MODELS = (
  process.env.GEMINI_FALLBACK_MODELS ||
  "gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-flash-latest"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

// Primary first, no duplicates.
const MODELS = [...new Set([PRIMARY_MODEL, ...FALLBACK_MODELS])];

const RETRIES_PER_MODEL = 2;        // attempts per model for temporary errors
const RETRY_DELAYS_MS = [800, 2000];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Temporary problems on Google's side – worth retrying. */
function isTemporary(err) {
  return [429, 500, 502, 503, 504].includes(err?.status);
}

/**
 * Models whose daily free quota is used up: skip them until Google says the
 * quota is back, instead of failing twice on every request.
 * modelName → time (ms) it may be tried again.
 */
const exhaustedUntil = new Map();

/** A 429 for a per-DAY quota (not a short per-minute burst). @returns retry delay in ms, or 0 */
function dailyQuotaDelay(err) {
  const msg = String(err?.message || "");
  if (err?.status !== 429 || !/PerDay/i.test(msg)) return 0;
  const seconds = Number(msg.match(/"retryDelay":"(\d+)s"/)?.[1]);
  return (Number.isFinite(seconds) && seconds > 0 ? seconds : 3600) * 1000;
}

/** First line of a Gemini error, without the long JSON details. */
const shortError = (err) => `${err?.status || ""} ${String(err?.message || "").split("\n")[0].slice(0, 160)}`;

/** The model name doesn't exist / isn't available for this key – skip it. */
function isModelUnavailable(err) {
  return err?.status === 404 || /not found|not supported/i.test(err?.message || "");
}

/**
 * Generate content with automatic retry + model fallback.
 *
 * @param {object}  opts
 * @param {string}  opts.system   System instruction text.
 * @param {string|Array} opts.contents  Prompt string, or array of parts
 *                                 (strings / { inlineData }).
 * @param {boolean} [opts.json]   Ask Gemini to answer with JSON only.
 * @returns {Promise<{ text: string, model: string }>}
 */
async function generate({ system, contents, json = false }) {
  let lastErr;

  for (const modelName of MODELS) {
    if ((exhaustedUntil.get(modelName) || 0) > Date.now()) continue;
    const model = genAI.getGenerativeModel({
      model: modelName,
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      ...(json ? { generationConfig: { responseMimeType: "application/json" } } : {}),
    });

    for (let attempt = 0; attempt < RETRIES_PER_MODEL; attempt++) {
      try {
        const result = await model.generateContent(contents);
        const text = result.response.text().trim();
        if (attempt > 0) console.log(`[gemini] answered by ${modelName} (attempt ${attempt + 1})`);
        return { text, model: modelName };
      } catch (err) {
        lastErr = err;
        const quotaDelay = dailyQuotaDelay(err);
        if (quotaDelay) {
          exhaustedUntil.set(modelName, Date.now() + quotaDelay);
          console.warn(`[gemini] ${modelName}: daily free quota used up — using the backup models for ` +
            `${Math.round(quotaDelay / 3_600_000)}h`);
          break;                                     // next model, no pointless retry
        }
        console.warn(`[gemini] ${modelName} attempt ${attempt + 1} failed: ${shortError(err)}`);

        if (isModelUnavailable(err)) break;          // try next model now
        if (!isTemporary(err)) throw err;            // real error (bad key, bad input…)
        if (attempt < RETRIES_PER_MODEL - 1) await sleep(RETRY_DELAYS_MS[attempt]);
      }
    }
  }

  const e = new Error(
    "The AI service is busy right now. Please try again in a minute."
  );
  e.status = 503;
  e.cause = lastErr;
  throw e;
}

/** Kept for backwards compatibility with older code. */
function getModel(model = PRIMARY_MODEL, systemInstruction = null) {
  const opts = { model };
  if (systemInstruction) opts.systemInstruction = systemInstruction;
  return genAI.getGenerativeModel(opts);
}

module.exports = { genAI, getModel, generate, MODELS };
