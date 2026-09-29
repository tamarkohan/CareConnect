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
const { getModel } = require("../services/geminiService");

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
    const { text, imageBase64, audioBase64, audioMimeType, targetLanguage } = req.body;

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

    const model = getModel(undefined, {
      parts: [{ text: TRANSLATOR_SYSTEM_PROMPT }],
    });

    let prompt;

    if (imageBase64) {
      // ── Vision path: extract text from image then translate ──────────────────
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg", // callers can send PNG/JPEG; Gemini handles both
        },
      };

      const extractionPrompt = `First, extract ALL readable text from this image.
Then translate that extracted text into ${targetLanguage}.
${TRANSLATOR_SYSTEM_PROMPT}`;

      const result = await model.generateContent([extractionPrompt, imagePart]);
      const raw = result.response.text().trim();
      return res.json(safeParseJSON(raw));
    }

    if (audioBase64) {
      // ── Audio / voice path: transcribe speech then translate ─────────────────
      const mimeType = audioMimeType || "audio/m4a";
      const audioPart = {
        inlineData: {
          data: audioBase64,
          mimeType,
        },
      };

      const audioPrompt = `Listen to this audio recording. Transcribe all spoken words, then translate that transcription into ${targetLanguage}.
${TRANSLATOR_SYSTEM_PROMPT}`;

      const result = await model.generateContent([audioPrompt, audioPart]);
      const raw = result.response.text().trim();
      return res.json(safeParseJSON(raw));
    }

    // ── Plain-text path ────────────────────────────────────────────────────────
    prompt = `Translate the following text into ${targetLanguage}:\n\n${text}`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    return res.json(safeParseJSON(raw));
  } catch (err) {
    console.error("[translate] Error:", err);
    return res
      .status(500)
      .json({ error: "Translation failed.", details: err.message });
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

module.exports = router;
