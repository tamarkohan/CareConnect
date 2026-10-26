/**
 * translationStyle.js
 *
 * How caregivers really speak each language: rules + corrected examples from the
 * caregivers' language test (see LANGUAGE_TEST.md). Both bots add it to their
 * prompt: the translator for the target and reader language, the legal
 * assistant for the answer language. Edit data/translation-style.json to add more.
 */

const STYLE = require("../data/translation-style.json");

/** @returns {string} a <style> block for the prompt, or "" if there are no rules for that language */
function styleGuide(language) {
  const style = STYLE[language];
  if (!style?.rules?.length) return "";
  // "he" is left out for corrections of the legal assistant's answers (no Hebrew original).
  const examples = (style.examples || [])
    .map((e) => `${e.he ? `Hebrew: ${e.he}\n` : ""}Not: ${e.wrong}\nBut: ${e.right}`)
    .join("\n\n");
  return `<style language="${language}">\nCaregivers corrected earlier texts in ${language}. Write ${language} like this:\n` +
    style.rules.map((r) => `- ${r}`).join("\n") +
    (examples ? `\nCorrected examples (learn the style, don't copy them into unrelated texts):\n${examples}` : "") +
    `\n</style>`;
}

module.exports = { styleGuide };
