/**
 * routes/translate.js
 *
 * POST /api/translate
 *
 * Body (JSON):
 *   {
 *     text?:         string   – plain text to translate
 *     imageBase64?:  string   – base64-encoded image; Gemini Vision extracts
 *                               the text from it first, then translates
 *     imageMimeType?: string  – e.g. "image/jpeg" (default) or "image/png"
 *     audioBase64?:  string   – base64-encoded audio; Gemini transcribes
 *                               then translates the spoken content
 *     audioMimeType?: string  – MIME type of the audio (e.g. "audio/m4a")
 *     targetLanguage: string  – e.g. "Hebrew", "English", "Tagalog",
 *                               "Malayalam", "Russian"
 *   }
 *
 * Response:
 *   { translatedText: string, detectedLanguage: string }
 */

const express = require("express");
const router = express.Router();
const { generate } = require("../services/geminiService");

// ── System prompt ─────────────────────────────────────────────────────────────
const TRANSLATOR_SYSTEM_PROMPT = `You are a professional translator with deep expertise in the following languages: Hebrew, English, Tagalog, Malayalam, and Russian.

These languages are commonly spoken by foreign workers in Israel. Your translations must be:
- Accurate and natural-sounding (not robotic or literal)
- Culturally sensitive and appropriate for a caregiving / labour context
- Aware of Israeli administrative and legal terminology when relevant

Instructions:
1. Auto-detect the source language of the provided text.
2. Translate that text faithfully into the requested target language.
3. Respond ONLY with valid JSON in this exact shape (no extra text, no markdown fences):
   {"translatedText":"<translation>","detectedLanguage":"<detected language name in English>"}`;

// ── Route ─────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const {
      text,
      imageBase64,
      imageMimeType,
      audioBase64,
      audioMimeType,
      targetLanguage,
    } = req.body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!targetLanguage || typeof targetLanguage !== "string") {
      return res
        .status(400)
        .json({ error: "targetLanguage is required." });
    }

    if (!text && !imageBase64 && !audioBase64) {
      return res
        .status(400)
        .json({ error: "Provide either text, imageBase64, or audioBase64." });
    }

    let contents;

    if (imageBase64) {
      // ── Vision path: extract text from image then translate ──────────────────
      contents = [
        `First, extract ALL readable text from this image (it may be a Hebrew medical letter, a pill box or a form).
Then translate that extracted text into ${targetLanguage}.`,
        {
          inlineData: {
            data: stripDataUrl(imageBase64),
            mimeType: imageMimeType || "image/jpeg",
          },
        },
      ];
    } else if (audioBase64) {
      // ── Audio / voice path: transcribe speech then translate ─────────────────
      contents = [
        `Listen to this audio recording. Transcribe all spoken words, then translate that transcription into ${targetLanguage}.`,
        {
          inlineData: {
            data: stripDataUrl(audioBase64),
            mimeType: normaliseAudioMime(audioMimeType),
          },
        },
      ];
    } else {
      // ── Plain-text path ──────────────────────────────────────────────────────
      contents = `Translate the following text into ${targetLanguage}:\n\n${text}`;
    }

    const { text: raw } = await generate({
      system: TRANSLATOR_SYSTEM_PROMPT,
      contents,
      json: true,
    });
    return res.json(safeParseJSON(raw));
  } catch (err) {
    console.error("[translate] Error:", err.cause || err);
    return res
      .status(err.status === 503 ? 503 : 500)
      .json({ error: err.status === 503 ? err.message : "Translation failed.", details: err.message });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Attempts to parse the model's response as JSON.
 * Falls back gracefully if the model returns stray markdown fences.
 */
function safeParseJSON(raw) {
  try {
    // Strip optional ```json … ``` fences some models add
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    // If we can't parse JSON, return the raw text as the translation
    return { translatedText: raw, detectedLanguage: "unknown" };
  }
}

/** Accepts plain base64 or a data: URL and returns plain base64. */
function stripDataUrl(b64) {
  const i = typeof b64 === "string" ? b64.indexOf("base64,") : -1;
  return i >= 0 ? b64.slice(i + 7) : b64;
}

/** Maps recorder MIME types to ones Gemini accepts. */
function normaliseAudioMime(mime) {
  const m = (mime || "audio/m4a").split(";")[0].trim().toLowerCase();
  if (m === "audio/m4a" || m === "audio/x-m4a") return "audio/mp4";
  return m;
}

module.exports = router;
