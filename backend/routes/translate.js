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
 *     targetLanguage: string  – "Hebrew", "English", "Tagalog", "Malayalam", "Russian"
 *     context?:      string   – "general" (default), "medical", "transit", "slang"
 *     readerLanguage?: string – the app language of the user (e.g. "Tagalog"),
 *                               used to write Hebrew pronunciation in their alphabet
 *     save?:         boolean  – false to not add it to the history (default true)
 *   }
 *
 * Response:
 *   { translatedText, detectedLanguage, sourceText, phonetic, note, category, id? }
 *   Signed-in users' translations are saved (encrypted) and `id` is returned.
 *
 * GET /api/translate/history   (signed in) → { translations: [...], size }
 *   The last 3 / 5 / 10 translations, as the user chose in their settings.
 * POST /api/translate/clear-history (signed in) → { success: true }
 */

const express = require("express");
const router = express.Router();
const { generate } = require("../services/geminiService");
const { glossaryFor } = require("../services/glossary");
const translations = require("../services/translationHistory");
const { optionalAuth, requireAuth } = require("../services/users");

router.use(optionalAuth);

const LANGUAGES = ["Hebrew", "English", "Tagalog", "Malayalam", "Russian"];
const MAX_TEXT_CHARS = 5_000;

// ── System prompt ─────────────────────────────────────────────────────────────
const TRANSLATOR_SYSTEM_PROMPT = `You are a professional translator for foreign live-in caregivers in Israel,
with deep expertise in Hebrew, English, Tagalog, Malayalam and Russian.
The users care for elderly people. They read Israeli medical letters, pill boxes, messages from the family,
bus signs and official letters, and they need to be understood by Israelis.

Translations must be:
- Accurate and natural, in simple everyday language (not formal or literary, not word-for-word).
- Faithful with numbers: keep every dosage, time, date, amount, phone number and unit exactly.
  Never round, simplify or drop a medical instruction.
- Culturally aware of Israel (health funds, National Insurance, Shabbat, Israeli slang).

Names and places:
- Never translate names of people, streets, cities, brands or medicines: write them in the target
  language's alphabet (e.g. בני ברק → Bnei Brak / ബ്നെയ് ബ്രാക്ക് / Бней-Брак).
- The first time an Israeli institution or brand appears, add what it is in brackets,
  e.g. "Acamol (paracetamol)", "Maccabi (health fund)".
- Use the <glossary> when given: it is the correct meaning of those terms.

Scripts: Malayalam in Malayalam script, Russian in Cyrillic, Hebrew in Hebrew letters, Tagalog and English in Latin letters.

Respond ONLY with valid JSON in this exact shape (no extra text, no markdown fences):
{"translatedText":"<translation>",
 "detectedLanguage":"<language of the original, in English>",
 "sourceText":"<the original text you translated (what you read in the image or heard), max 500 characters>",
 "phonetic":"<see below, or empty>",
 "note":"<one short sentence in the reader's language about anything important: an Israeli brand, an idiom's literal meaning, a medical warning, or empty>",
 "category":"<medical | transit | slang | general>"}

phonetic: the Hebrew text written as it sounds, in the reader's alphabet, so they can read it aloud.
If the original is Hebrew, spell the original; if the translation is Hebrew, spell the translation; otherwise "".`;

const CONTEXT_HINTS = {
  general: "",
  medical:
    "Context: MEDICAL (prescription, medicine box, doctor's letter, care instructions). Keep dosages, frequencies and units exact, " +
    "explain medical abbreviations, and mention in the note if something looks like a warning.",
  transit:
    "Context: TRANSPORT (buses, trains, stations, directions). Keep line numbers, station and street names exactly; " +
    "write place names the way they appear on Israeli signs.",
  slang:
    "Context: SPOKEN / SLANG (family members, the patient, WhatsApp messages). Translate the meaning, not the words, " +
    "and give the literal meaning in the note when it helps.",
};

const READER_LANGS = { en: "English", tl: "Tagalog", ml: "Malayalam", ru: "Russian" };

function buildInstructions({ targetLanguage, context, readerLanguage, glossary }) {
  const reader = LANGUAGES.includes(readerLanguage) && readerLanguage !== "Hebrew" ? readerLanguage : "English";
  return [
    `Translate into ${targetLanguage}.`,
    `The reader's language is ${reader}: write "phonetic" in ${reader === "Malayalam" ? "Malayalam script" : reader === "Russian" ? "Cyrillic" : "Latin letters"} and "note" in ${reader}.`,
    CONTEXT_HINTS[context] || "",
    glossary ? `<glossary>\n${glossary}\n</glossary>` : "",
  ].filter(Boolean).join("\n");
}

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
      context = "general",
      readerLanguage,
      save = true,
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
    if (text && String(text).length > MAX_TEXT_CHARS) {
      return res.status(400).json({ error: "The text is too long." });
    }

    const reader = READER_LANGS[readerLanguage] || readerLanguage;
    const instructions = buildInstructions({
      targetLanguage,
      context,
      readerLanguage: reader,
      glossary: glossaryFor(imageBase64 || audioBase64 ? null : String(text)),
    });

    let contents;
    let inputType = "text";

    if (imageBase64) {
      // ── Vision path: extract text from image then translate ──────────────────
      inputType = "image";
      contents = [
        `First, extract ALL readable text from this image (it may be a Hebrew medical letter, a pill box or a form).
Then translate that extracted text.\n${instructions}`,
        {
          inlineData: {
            data: stripDataUrl(imageBase64),
            mimeType: imageMimeType || "image/jpeg",
          },
        },
      ];
    } else if (audioBase64) {
      // ── Audio / voice path: transcribe speech then translate ─────────────────
      inputType = "audio";
      contents = [
        `Listen to this audio recording. Transcribe all spoken words, then translate that transcription.\n${instructions}`,
        {
          inlineData: {
            data: stripDataUrl(audioBase64),
            mimeType: normaliseAudioMime(audioMimeType),
          },
        },
      ];
    } else {
      // ── Plain-text path ──────────────────────────────────────────────────────
      contents = `${instructions}\n\nText to translate:\n${text}`;
    }

    const { text: raw } = await generate({
      system: TRANSLATOR_SYSTEM_PROMPT,
      contents,
      json: true,
    });
    const result = normaliseResult(safeParseJSON(raw), { text, context });

    if (req.user && save !== false) {
      const saved = await translations.addTranslation(req.user.id, { inputType, targetLanguage, ...result });
      Object.assign(result, saved);
    }
    return res.json(result);
  } catch (err) {
    console.error("[translate] Error:", err.cause || err);
    return res
      .status(err.status === 503 ? 503 : 500)
      .json({ error: err.status === 503 ? err.message : "Translation failed." });
  }
});

router.get("/history", requireAuth, async (req, res) => {
  try {
    const size = req.user.translation_history_size;
    return res.json({ translations: await translations.listTranslations(req.user.id, size), size });
  } catch (err) {
    console.error("[translate/history] Error:", err.message);
    return res.status(500).json({ error: "Could not load your translations." });
  }
});

router.post("/clear-history", requireAuth, async (req, res) => {
  try {
    await translations.clearTranslations(req.user.id);
    return res.json({ success: true });
  } catch (err) {
    console.error("[translate/clear-history] Error:", err.message);
    return res.status(500).json({ error: "Could not clear your translations." });
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

/** Always the same fields, as short strings. */
function normaliseResult(r, { text, context }) {
  const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const category = ["medical", "transit", "slang", "general"].includes(r.category)
    ? r.category
    : CONTEXT_HINTS[context] !== undefined ? context : "general";
  return {
    translatedText: str(r.translatedText, 10_000),
    detectedLanguage: str(r.detectedLanguage, 40) || "unknown",
    sourceText: str(text, 500) || str(r.sourceText, 500),
    phonetic: str(r.phonetic, 1_000),
    note: str(r.note, 300),
    category,
  };
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
