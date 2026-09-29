/**
 * geminiService.js
 *
 * Centralised Gemini client initialisation.
 * All routes import this module so the API key is read from the
 * environment in one place and never hard-coded.
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

/**
 * Returns a configured GenerativeModel instance.
 *
 * @param {string} [model] - Gemini model name. Defaults to the GEMINI_MODEL
 *                           env var, or "gemini-flash-latest" if unset.
 * @param {object} [systemInstruction]        - Optional system instruction object.
 * @returns {import("@google/generative-ai").GenerativeModel}
 */
// Gemini 1.5 models have been retired by Google; use an env var so the model
// can be changed on the server without a code change.
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

function getModel(model = DEFAULT_MODEL, systemInstruction = null) {
  const opts = { model };
  if (systemInstruction) opts.systemInstruction = systemInstruction;
  return genAI.getGenerativeModel(opts);
}

module.exports = { genAI, getModel };
