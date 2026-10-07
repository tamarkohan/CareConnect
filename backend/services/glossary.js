/**
 * glossary.js
 *
 * Loads data/glossary.json (kept in git, not in the database) and picks the
 * terms that appear in a text, so only those are added to the prompt.
 */

const { terms } = require("../data/glossary.json");

const normalise = (s) => s.replace(/[֑-ׇ]/g, "").replace(/[״"׳']/g, '"'); // drop niqqud, unify quotes

const indexed = terms.map((t) => ({ ...t, keys: t.he.map(normalise) }));

function format(t) {
  const extra = ["tl", "ml", "ru"].filter((l) => t[l]).map((l) => `${l}: ${t[l]}`);
  return `- ${t.he[0]} = ${t.en}${t.note ? ` (${t.note})` : ""}${extra.length ? ` [${extra.join("; ")}]` : ""}`;
}

/**
 * @param {string|null} text  the text to translate; null (photo / voice) → the
 *                            core institution + medical terms, since we can't
 *                            see the text before Gemini reads it
 * @returns {string} lines for a <glossary> block, or "" if none apply
 */
function glossaryFor(text) {
  const picked = text
    ? indexed.filter((t) => t.keys.some((k) => normalise(text).includes(k)))
    : indexed.filter((t) => t.category === "institution" || t.category === "medical");
  return picked.map(format).join("\n");
}

module.exports = { glossaryFor };
