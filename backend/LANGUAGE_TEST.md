# Language tests with caregivers (Tagalog, Hindi, Malayalam)

Native speakers rate the real answers of the two bots (translator and legal
assistant) on a printed sheet, and correct them. Their corrections then go into
two files that both bots read on every request, so the next answers follow them.
No retraining is needed.

## 1. Make the sheets

```bash
cd backend
npm run demo:reset                                  # clean demo account with the fake contract
npm run language-test -- hi ml https://careconnect-il-app-id9mu.ondigitalocean.app
```

- `hi` = Hindi, `ml` = Malayalam, `tl` = Tagalog (the default). One or more codes.
- Without a URL it uses the local backend (`npm run dev`).
- If some items fail (Gemini busy), add `--retry-failed` to the same command: only those are redone.
- Output: `backend/reports/language-test-hindi-<date>.html` and `…-malayalam-<date>.html`.
  Open them in the browser and print (Ctrl+P). The last page is for you, not the raters.

### If it doesn't run

- **"running scripts is disabled on this system"** (Windows PowerShell): type `npm.cmd`
  instead of `npm`, e.g. `npm.cmd run demo:reset`. In cmd, `npm` works.
- **"certificate not trusted"**, `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`, or Gemini "fetch failed":
  something on the computer or network inspects HTTPS (an antivirus, a school or work
  network). Tell Node to trust the certificates Windows trusts, in the same window, before
  the commands: `$env:NODE_OPTIONS="--use-system-ca"` (PowerShell) or
  `set NODE_OPTIONS=--use-system-ca` (cmd). It lasts until the window is closed. Needs
  Node 22.15 or newer.
- **"blocked before it reached CareConnect"** (403, e.g. page "Access Denied"): the CareConnect
  server never answers 403; the laptop's web filter, an antivirus or the hosting's protection
  stopped the requests. The script stops and keeps the answers it got. Run the backend on the
  laptop instead (requests to `localhost` aren't filtered), in two PowerShell windows:

  ```
  # window 1 – the backend; leave it open
  cd C:\CareConnect\backend
  $env:NODE_OPTIONS="--use-system-ca"
  npm.cmd run dev

  # window 2 – once window 1 says "CareConnect backend running"
  cd C:\CareConnect\backend
  $env:NODE_OPTIONS="--use-system-ca"
  npm.cmd run language-test -- hi ml --retry-failed
  ```

  It uses `backend/.env` (same database and Gemini key as `demo:reset`). Or try another
  network (e.g. a phone hotspot) with the live URL.

Each sheet has 25 translations (Hebrew → the language: medical, transport, slang,
general, double meanings) and one 10-question conversation with the legal
assistant in that language. Of each legal answer the sheet shows only the first
3 sentences: enough to rate the language, and the legal part stays about 4 pages.
The full answers are in the `.json` file next to the sheet. To show more or fewer
sentences, change `ANSWER_SENTENCES` in `scripts/language-test.js`; to make it
shorter still, delete questions from `legal`.

Every item shows what it means in English and Hebrew, so you can follow along
without reading Hindi or Malayalam. The sentences, the questions and the wording
of the sheet are in [`data/language-test-hi.json`](data/language-test-hi.json) and
[`data/language-test-ml.json`](data/language-test-ml.json). The Hebrew sentences are
the same as in the Tagalog test, so you can compare languages.

**Before the first session:** have one Hindi speaker and one Malayalam speaker
read the sheet's wording and the 10 questions (`sheet` and `legal` in the file)
and fix anything that sounds odd. The questions should sound like a caregiver
typing on the phone.

## 2. At the session

- One sheet per person, filled alone first, then talk it through together.
- For every 1 or 2, ask "How would you say it?" and write their exact words
  on the "better translation" or "strange words → better words" line.
- Write down the person's first language (the sheet asks). Someone from Kerala
  who learned Hindi at school rates Hindi differently from a native Hindi speaker.
- 3–5 people per language is enough. Something becomes a rule when at least 2
  of them say the same thing.

## 3. Turn the corrections into feedback for the bots

Sort every correction into one of these:

| What the caregiver said | Where it goes |
|---|---|
| The meaning of **one word** is wrong (a medicine, an office, a slang word) | [`data/glossary.json`](data/glossary.json): the `hi` or `ml` field of that Hebrew term |
| The meaning is right but **"we don't talk like that"** (too formal, a word nobody uses) | [`data/translation-style.json`](data/translation-style.json): a rule, plus the sentence as a wrong/right example |
| A **legal answer** uses strange or too formal words | `translation-style.json` too: the legal assistant reads the same rules. In the example, leave out `he` |
| A legal answer is **wrong or not helpful** (wrong number, wrong law) | Not a language problem: write down which question and what is wrong, and check the sources (`rag/sources.js`) |
| "Could also mean" is wrong or missing | Write it down: it is the translator's double-meaning rules in `routes/translate.js` |
| Low scores on items the last page says came from a **backup model** | Run those again on another day before deciding anything |

### Worked examples

These four are **made up to show the format**. Replace them with what the
caregivers actually write.

**A. Hindi, translator — too formal** (meaning 5, natural 2)

> Hebrew: לבדוק סוכר לפני ארוחת בוקר ולרשום בטבלה
> App: नाश्ते से पहले रक्त शर्करा की जाँच करें और तालिका में दर्ज करें।
> Caregiver: नाश्ते से पहले शुगर चेक करें और चार्ट में लिखें।

**B. Malayalam, translator — too formal** (meaning 4, natural 1)

> Hebrew: אם יש לה חום מעל 38 – להתקשר מיד לרופא
> App: അവർക്ക് 38 ഡിഗ്രിക്ക് മുകളിൽ ശരീരതാപനില ഉണ്ടെങ്കിൽ, ഉടൻ തന്നെ വൈദ്യനെ ബന്ധപ്പെടുക.
> Caregiver: 38-ന് മുകളിൽ പനി ഉണ്ടെങ്കിൽ ഉടനെ ഡോക്ടറെ വിളിക്കണം.

**C. Malayalam, legal assistant — one word** (on the "strange words" line: തൊഴിലുടമ → എംപ്ലോയർ)

> App: നിങ്ങളുടെ തൊഴിലുടമയ്ക്ക് നിങ്ങളുടെ പാസ്പോർട്ട് കൈവശം വെക്കാൻ അവകാശമില്ല.

A, B and C go into `data/translation-style.json`. A rule says which word to use
**and** which to avoid; the example shows it in a whole sentence:

```json
"Hindi": {
  "rules": [
    "Write the everyday Hindi caregivers speak, not formal (shuddh) Hindi. Keep the English words they use every day: शुगर (not रक्त शर्करा), चार्ट (not तालिका), चेक करें (not जाँच करें), लिखें (not दर्ज करें)."
  ],
  "examples": [
    {
      "he": "לבדוק סוכר לפני ארוחת בוקר ולרשום בטבלה",
      "wrong": "नाश्ते से पहले रक्त शर्करा की जाँच करें और तालिका में दर्ज करें।",
      "right": "नाश्ते से पहले शुगर चेक करें और चार्ट में लिखें।"
    }
  ]
},
"Malayalam": {
  "rules": [
    "Write spoken Malayalam, not textbook Malayalam: പനി (not ശരീരതാപനില), ഡോക്ടർ (not വൈദ്യൻ), വിളിക്കുക (not ബന്ധപ്പെടുക).",
    "Say എംപ്ലോയർ (not തൊഴിലുടമ) for the employer."
  ],
  "examples": [
    {
      "he": "אם יש לה חום מעל 38 – להתקשר מיד לרופא",
      "wrong": "അവർക്ക് 38 ഡിഗ്രിക്ക് മുകളിൽ ശരീരതാപനില ഉണ്ടെങ്കിൽ, ഉടൻ തന്നെ വൈദ്യനെ ബന്ധപ്പെടുക.",
      "right": "38-ന് മുകളിൽ പനി ഉണ്ടെങ്കിൽ ഉടനെ ഡോക്ടറെ വിളിക്കണം."
    },
    {
      "wrong": "നിങ്ങളുടെ തൊഴിലുടമയ്ക്ക് നിങ്ങളുടെ പാസ്പോർട്ട് കൈവശം വെക്കാൻ അവകാശമില്ല.",
      "right": "നിങ്ങളുടെ എംപ്ലോയർക്ക് നിങ്ങളുടെ പാസ്പോർട്ട് കൈവശം വെക്കാൻ അവകാശമില്ല."
    }
  ]
}
```

**D. Hindi, translator — the meaning of one word is wrong** (meaning 1)

> Hebrew: הוא היום קצת סחוט, תני לו לנוח
> App: आज वह थोड़ा निचोड़ा हुआ है, उसे आराम करने दो। ("squeezed", word for word)
> Caregiver: आज वह थोड़ा थका हुआ है, उसे आराम करने दो।

D goes into `data/glossary.json`. The term סחוט is already there, so add a `hi`
field (or add a new term the same way):

```json
{ "category": "slang", "he": ["סחוט"], "en": "exhausted (lit. wrung out)", "hi": "थका हुआ (not निचोड़ा हुआ)" }
```

### Good feedback

- **Say what to use and what to avoid**: "शुगर (not रक्त शर्करा)", not just "use simple words".
- **One rule per problem**, short. Rules are in English, words in the language.
- **Only what 2 or more people agree on.** One person's taste is not a rule.
- **Few examples**: about 8 per language. They go into every request, so pick the
  ones that show the most common mistake.
- **A word that comes up in only one text** (a medicine, a place, a slang word) →
  glossary. **A habit across many texts** (too formal, English words) → style rule.

## 4. Check it worked

After the change is deployed, run the test again (`npm run language-test -- hi ml <url>`)
and compare it with the first sheet. The sentences you used as examples will of
course come out right now, so judge by the **other** items, or add 3–5 new
sentences to `data/language-test-<code>.json` for the next round.

You can also give the filled sheets (photos or typed out) to Claude Code and ask
it to add the corrections. This is how the Tagalog round was done.
