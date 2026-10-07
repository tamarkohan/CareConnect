/**
 * scripts/demo-reset.js  —  `npm run demo:reset`
 *
 * Resets the demo account (phone "123", needs DEMO_LOGIN=true on the server):
 *   - deletes its chat, translations and contract
 *   - uploads the fake contract (data/demo-contract.txt, or the file you pass)
 *     with its summary, so the demo starts with a contract already there
 *   - adds three example translations
 *   - shows the legal disclaimer again on the next visit
 *
 * Run it before each interview so earlier testers' messages are gone.
 * Needs the same .env as the backend (DATABASE_URL, GEMINI_API_KEY,
 * CONTRACT_ENCRYPTION_KEY) — the key must be the same one the server uses.
 *
 * Usage:
 *   npm run demo:reset
 *   npm run demo:reset -- path/to/other-contract.pdf
 */

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const db = require("../services/db");
const users = require("../services/users");
const contracts = require("../services/contractStore");
const legalHistory = require("../services/legalHistory");
const translations = require("../services/translationHistory");
const { readContractFiles, summariseContract } = require("../services/contractReader");

const EXAMPLE_TRANSLATIONS = [
  {
    inputType: "text", targetLanguage: "Tagalog", category: "medical", detectedLanguage: "Hebrew",
    sourceText: "לקחת פעמיים ביום אחרי האוכל",
    translatedText: "Inumin nang dalawang beses sa isang araw pagkatapos kumain.",
    phonetic: "Lakachat pa'amayim bayom acharei ha'ochel", note: "",
  },
  {
    inputType: "text", targetLanguage: "English", category: "transit", detectedLanguage: "Hebrew",
    sourceText: "קחי את קו 5 מהתחנה המרכזית",
    translatedText: "Take bus line 5 from the Central Bus Station (Tachana Merkazit).",
    phonetic: "Kchi et kav chamesh mehatachana hamerkazit", note: "",
  },
  {
    inputType: "text", targetLanguage: "English", category: "slang", detectedLanguage: "Hebrew",
    sourceText: "הוא היום קצת סחוט",
    translatedText: "He's a bit exhausted today.",
    phonetic: "Hu hayom ktzat sachut", note: "Literally: \"he is wrung out\".",
  },
];

async function main() {
  const file = process.argv[2] || path.join(__dirname, "../data/demo-contract.txt");
  const buffer = fs.readFileSync(file);
  const { text, fileName } = await readContractFiles([
    { base64: buffer.toString("base64"), name: path.basename(file) },
  ]);

  const user = await users.findOrCreateUser({ kind: "phone", value: users.DEMO_PHONE });
  await db.query("UPDATE users SET disclaimer_version = NULL, translation_history_size = 5 WHERE id = $1", [user.id]);
  await legalHistory.clearMessages(user.id);
  await translations.clearTranslations(user.id);

  console.log("Summarising the demo contract with Gemini…");
  const summary = await summariseContract(text);
  await contracts.saveUserContract(user.id, text, { fileName: "Demo contract", summary });

  // Oldest first, so the list shows them newest first in this order.
  for (const t of [...EXAMPLE_TRANSLATIONS].reverse()) await translations.addTranslation(user.id, t);

  console.log(`Demo account reset: contract "${fileName}" (${text.length} chars, summary ${summary ? "ok" : "FAILED"}), ` +
    `${EXAMPLE_TRANSLATIONS.length} translations, empty chat.`);
  await db.pool.end();
}

main().catch(async (err) => {
  console.error(err.message || err);
  await db.pool.end().catch(() => {});
  process.exit(1);
});
