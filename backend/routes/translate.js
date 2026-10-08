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
 *     context?:      string   – optional hint: "medical", "transit", "slang"; by
 *                               default the model decides (and returns `category`)
 *     readerLanguage?: string – the app language of the user (e.g. "Tagalog"),
 *                               used to write Hebrew pronunciation in their alphabet
 *     save?:         boolean  – false to not add it to the history (default true)
 *   }
 *
 * Response:
 *   { translatedText, detectedLanguage, sourceText, phonetic, note, category,
 *     alternatives: [{ language, meaning }], id? }
 *   `alternatives` lists other likely readings when the text is ambiguous
 *   (e.g. "hola" = Spanish "hello", or Hebrew חולה "sick" written in Latin letters).
 *   Signed-in users' translations are saved (encrypted) and `id` is returned.
 *
 * GET /api/translate/history   (signed in) → { translations: [...] }
 *   The user's last 10 translations.
 * POST /api/translate/clear-history (signed in) → { success: true }
 */

const express = require("express");
const router = express.Router();
const { generate } = require("../services/geminiService");
const { glossaryFor } = require("../services/glossary");
const { parseJsonReply } = require("../services/jsonReply");
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

Kind of text: decide it yourself and follow the matching rules.
- medical (prescription, medicine box, doctor's letter, care instructions): keep dosages, frequencies and units exact,
  explain medical abbreviations, and mention in the note if something looks like a warning.
- transit (buses, trains, stations, directions): keep line numbers, station and street names exactly, as on Israeli signs.
- slang: ONLY when the text contains slang words or idioms whose literal meaning is different (e.g. סבבה, יאללה,
  תכלס, בקטנה, סחוט, חבל על הזמן). Translate the meaning, not the words; give the literal meaning in the note.
- general: everything else, including ordinary everyday sentences from the family (visits, letters, meals, thanks)
  that contain no slang words. Being spoken or friendly does NOT make a text slang.

Double meanings: check EVERY input for these cases, and when one applies set "ambiguous" to true, translate the
most likely meaning for a caregiver in Israel, and list the other real readings of the SAME text in "alternatives":
1. Latin letters that could also be Hebrew written as it sounds. Caregivers often type Hebrew they heard in Latin
   letters, so always ask yourself: "read aloud, is this a Hebrew word?" If it is, and it is also a word in another
   language, give both readings (one as the translation, the other in "alternatives", with its Hebrew spelling).
2. Hebrew written without vowels that can be read as different words (e.g. ספר = book / barber / he told).
3. A word or phrase with several common meanings where the text gives no context (slang vs. literal, a name vs. a word).
4. A very short text whose language is unclear.
For each alternative give its language and its meaning in the target language; for a Hebrew reading also add the
Hebrew word in brackets: "<meaning> (<Hebrew word>)". Max 3. If none of the cases applies, "ambiguous" is false and
"alternatives" is []. Only list readings of the text you were given — never examples or unrelated words.

Scripts: Malayalam in Malayalam script, Russian in Cyrillic, Hebrew in Hebrew letters, Tagalog and English in Latin letters.

Respond ONLY with valid JSON in this exact shape (no extra text, no markdown fences):
{"translatedText":"<translation>",
 "detectedLanguage":"<language of the original, in English>",
 "sourceText":"<the original text you translated (what you read in the image or heard), max 500 characters>",
 "phonetic":"<see below, or empty>",
 "note":"<one short sentence in the reader's language about anything important: an Israeli brand, an idiom's literal meaning, a medical warning, or empty>",
 "category":"<medical | transit | slang | general>",
 "ambiguous":<true when one of the double-meaning cases applies>,
 "alternatives":[{"language":"<language of that reading, in English>","meaning":"<that meaning, in the target language>"}]}

phonetic: the Hebrew text written as it sounds, in the reader's alphabet, so they can read it aloud.
If the original is Hebrew, spell the original; if the translation is Hebrew, spell the translation; otherwise "".`;

// Optional hint from the app; normally the model decides the kind of text itself.
const CONTEXT_HINTS = {
  general: "",
  medical: "The user says this is a MEDICAL text.",
  transit: "The user says this is about TRANSPORT.",
  slang: "The user says this is spoken language / slang.",
};

const READER_LANGS = { en: "English", tl: "Tagalog", ml: "Malayalam", ru: "Russian" };

/**
 * Short inputs are where double meanings happen, and the general rule in the
 * system prompt is easy for the model to skip — so say it on that request.
 */
function ambiguityHint(text) {
  const t = String(text || "").trim();
  const words = t.split(/\s+/).filter(Boolean);
  if (!t || words.length > 3) return "";
  if (/^[A-Za-z' -]+$/.test(t)) {
    return `This is a short text in Latin letters. Caregivers often write Hebrew words the way they sound, so first ` +
      `work out which Hebrew word(s) "${t}" sounds like when read aloud (a Latin "h" or "j" is often Hebrew ח/כ, "ch"/"kh" too). ` +
      `If "${t}" is ALSO a word in another language (e.g. Spanish, English, Tagalog), set "ambiguous" to true, translate ` +
      `the most likely reading, and put the other reading in "alternatives" — the Hebrew one with its Hebrew spelling. ` +
      `An alternative must have a different meaning from the translation; never repeat the translation there.`;
  }
  if (/^[\u0590-\u05FF"'׳״ -]+$/.test(t)) {
    return `This is a short Hebrew text without vowels. If it can be read as different words with different meanings, ` +
      `set "ambiguous" to true and list the other readings in "alternatives" (never repeat the translation there).`;
  }
  return "";
}

function buildInstructions({ targetLanguage, context, readerLanguage, glossary, text }) {
  const reader = LANGUAGES.includes(readerLanguage) && readerLanguage !== "Hebrew" ? readerLanguage : "English";
  return [
    `Translate into ${targetLanguage}.`,
    ambiguityHint(text),
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
      text: imageBase64 || audioBase64 ? "" : text,
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

    // Gemini sometimes adds junk around its JSON; parseJsonReply handles that.
    // If there's still no usable answer, ask once more rather than showing raw text.
    let parsed = null;
    for (let attempt = 0; attempt < 2 && !parsed?.translatedText; attempt++) {
      const { text: raw } = await generate({ system: TRANSLATOR_SYSTEM_PROMPT, contents, json: true });
      parsed = parseJsonReply(raw);
      if (!parsed?.translatedText) console.warn(`[translate] unreadable reply (attempt ${attempt + 1}): ${raw.slice(0, 120)}`);
    }
    if (!parsed?.translatedText) throw new Error("Unreadable reply from Gemini");
    const result = normaliseResult(parsed, { text, context });

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
    return res.json({ translations: await translations.listTranslations(req.user.id, translations.MAX_KEPT) });
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
/** For comparing meanings: lowercase, no brackets, no punctuation. */
const sameMeaning = (a, b) => {
  const n = (x) => x.toLowerCase().replace(/\([^)]*\)|\[[^\]]*\]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  return n(a) === n(b);
};

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
    // Only when the model says it had to guess, and never the same as the main answer.
    alternatives: ((r.ambiguous === true || r.ambiguous === "true") && Array.isArray(r.alternatives) ? r.alternatives : [])
      .map((a) => ({ language: str(a?.language, 40), meaning: str(a?.meaning, 200) }))
      .filter((a) => a.meaning && !sameMeaning(a.meaning, str(r.translatedText, 10_000)))
      .slice(0, 3),
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
