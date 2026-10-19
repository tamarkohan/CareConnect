// ── moreLanguages.ts ─────────────────────────────────────────────────
// Hindi and Tamil for the long page content (infoPages.ts, infoFaq.ts), kept
// as dictionaries from the English text: { "English sentence": "translation" }.
// The pages are written with English, Tagalog, Malayalam and Russian side by
// side; Hindi and Tamil are looked up here, and fall back to English if a
// sentence is missing (e.g. a new one nobody translated yet).
// To add another language later: add a dictionary file and a line below.
import { HI } from "./hi";
import { TA } from "./ta";

const DICTS = { hi: HI, ta: TA };

/** Hindi and Tamil for one English text. */
export const more = (en: string) => ({ hi: HI[en] ?? en, ta: TA[en] ?? en });

/** Hindi and Tamil for a list of English texts (bullet points). */
export const moreList = (en: string[]) => ({
    hi: en.map((x) => HI[x] ?? x),
    ta: en.map((x) => TA[x] ?? x),
});

/** English texts with no translation yet, per language (used by a check script). */
export const missing = (texts: string[]) =>
    Object.fromEntries(Object.entries(DICTS).map(([lang, d]) => [lang, texts.filter((x) => !(x in d))]));
