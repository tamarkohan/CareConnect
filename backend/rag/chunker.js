/**
 * rag/chunker.js
 *
 * Splits page text into overlapping chunks of roughly CHUNK_SIZE characters,
 * cutting at line (paragraph) boundaries where possible.
 */

const CHUNK_SIZE = 1200;
const OVERLAP = 200;

/** Splits one over-long line into sentence-ish pieces under CHUNK_SIZE. */
function splitLongLine(line) {
  if (line.length <= CHUNK_SIZE) return [line];
  const pieces = [];
  let current = "";
  for (const sentence of line.split(/(?<=[.!?。])\s+/)) {
    if (current && current.length + sentence.length + 1 > CHUNK_SIZE) {
      pieces.push(current);
      current = "";
    }
    // A single "sentence" longer than CHUNK_SIZE: hard cut.
    for (let i = 0; i < sentence.length; i += CHUNK_SIZE) {
      const part = sentence.slice(i, i + CHUNK_SIZE);
      if (current && current.length + part.length + 1 > CHUNK_SIZE) {
        pieces.push(current);
        current = "";
      }
      current = current ? `${current} ${part}` : part;
    }
  }
  if (current) pieces.push(current);
  return pieces;
}

/**
 * @param {string} text  Page text with "\n" between paragraphs.
 * @returns {string[]}
 */
function chunkText(text) {
  const lines = text.split("\n").flatMap(splitLongLine);
  const chunks = [];
  let current = [];
  let length = 0;

  for (const line of lines) {
    if (length && length + line.length + 1 > CHUNK_SIZE) {
      chunks.push(current.join("\n"));
      // Carry the last lines over so a fact split between chunks isn't lost.
      const carry = [];
      let carryLen = 0;
      for (let i = current.length - 1; i >= 0 && carryLen + current[i].length <= OVERLAP; i--) {
        carry.unshift(current[i]);
        carryLen += current[i].length + 1;
      }
      current = carry;
      length = carryLen;
    }
    current.push(line);
    length += line.length + 1;
  }
  if (current.length) chunks.push(current.join("\n"));
  return chunks;
}

module.exports = { chunkText, CHUNK_SIZE };
