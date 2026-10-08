/**
 * jsonReply.js
 *
 * Reads the JSON object out of a Gemini reply. Gemini usually answers with
 * clean JSON, but sometimes wraps it in ``` fences or adds stray characters
 * after it (e.g. `{...}\n":[]}`), which makes a plain JSON.parse fail.
 * We take the first complete {...} object and ignore anything around it.
 */

/** @returns {object|null} the parsed object, or null if there is none */
function parseJsonReply(raw) {
  if (typeof raw !== "string") return null;
  const text = raw.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  try {
    const v = JSON.parse(text);
    if (v && typeof v === "object") return v;
  } catch {
    // fall through to the scan below
  }

  // Find the first balanced { ... }, skipping braces inside strings.
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') inString = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) {
      try {
        const v = JSON.parse(text.slice(start, i + 1));
        return v && typeof v === "object" ? v : null;
      } catch {
        return null;
      }
    }
  }
  return null;
}

module.exports = { parseJsonReply };
