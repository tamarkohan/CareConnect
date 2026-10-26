# Users, memory and the demo account

Signed-in users get a legal chat that remembers the conversation and their
contract, and a translator that remembers their last 3, 5 or 10 translations.
People sign in with a **phone number or an email** and a one-time code (no
passwords). Their data is tied to the one they used, so the login screen tells
them to keep signing in the same way.

## 1. Update the database (once)

Supabase → **SQL Editor** → **New query** → paste all of [`db/schema.sql`](db/schema.sql)
→ **Run**. It is safe to run again: existing tables and data are kept, and the new
tables (`users`, `sessions`, `legal_messages`, `translations`, `payslips`, `payslip_files`) are added.
**Run it again after updating to the version with the Payslips page**, or uploading a
payslip fails.

Until this is done, sign-in fails with "Internal server error".

To look at the data: **Table Editor** → schema dropdown (top left) → `careconnect`.
Contracts, chats, translations and payslips show as unreadable bytes: they are encrypted
with `CONTRACT_ENCRYPTION_KEY`.

## 2. Settings (DigitalOcean → backend → Environment Variables)

| Key | Value | |
|---|---|---|
| `DEMO_LOGIN` | `true` | Phone **123** signs in to the demo account without a code. Set `false` for real users. |
| `NODE_ENV` | `production` | Already in `.do/app.yaml`. |
| `OTP_TEST_CODE` | `123456` | Test mode: **any** phone number or email signs in with this code, nothing is sent, and the login screen shows the code. For testing with many accounts. Remove before real users. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | from twilio.com | Optional: real SMS codes (paid per SMS). |
| `RESEND_API_KEY`, `OTP_EMAIL_FROM` | from resend.com | Optional: real email codes (free tier: 3,000/month, needs your own domain). |

Without an SMS/email provider, the live app shows "Sign-in by SMS isn't
available yet" and offers **Continue without an account** (nothing saved).
Locally (`npm run dev`), the code is printed in the backend terminal instead.

## 3. The demo account

```bash
cd backend
npm run demo:reset                       # uses data/demo-contract.txt
npm run demo:reset -- my-fake-contract.pdf   # or your own fake contract (PDF, Word, text)
```

Run it before each interview. It empties the demo chat, uploads the fake contract
with its summary, adds three example translations and shows the disclaimer again.
It needs the backend's `.env` with the **same** `CONTRACT_ENCRYPTION_KEY` as the
server, otherwise the server can't read what it stored.

Then in the app: **Phone → 123 → Continue**.

## Staying inside the free Supabase plan (500 MB)

Uploaded files are **never stored**. The backend reads the text out of the file
and throws the file away, so a 7 MB photo and a 100 KB PDF both end up as a
few KB of text. File size only affects upload time and the Gemini call.

| Data | Size | Limit |
|---|---|---|
| Contract + summary in 4 languages | ~5–40 KB | one per user, deleted after 90 days without use |
| Legal chat | ~1–2 KB per message | last 100 messages per user |
| Translations | ~0.5 KB each | last 10 per user |
| Sessions | ~0.2 KB | deleted when expired (daily job) |
| Accounts unused for a year | – | deleted by the daily job, with all their data |

That is about 0.3 MB for a heavy user, so a few hundred users fit easily next to
the knowledge base. Codes for sign-in live in the server's memory, and the
translator glossary is a file in git ([`data/glossary.json`](data/glossary.json)),
so neither uses the database.

## How a contract becomes text

| File | How it's read | Gemini call? |
|---|---|---|
| PDF with text | `unpdf` on the server | no |
| Scanned PDF (no text layer) | Gemini reads it | yes |
| Word `.docx` | `mammoth` on the server | no |
| Photos (1–5 pages) | Gemini reads them in one call | yes |
| Pasted text | as is | no |

Then one more Gemini call writes the "contract at a glance" summary in English,
Tagalog, Malayalam and Russian at once, so changing the app language never needs
the AI again.

"Files or Google Drive" opens the phone's own file chooser: Google Drive
(and iCloud on iPhone) appear there when their apps are installed.

## Changing language, exporting

- Switching the app language translates the earlier chat messages in **one**
  Gemini call (newest 30). The translations stay in the app's memory only, so they
  cost nothing in the database; "Show original" shows the message as written.
- **Export** (whole chat) and **Share** (one question + answer) open WhatsApp,
  the phone's share menu, or copy the text (browser).

## Translator glossary

[`data/glossary.json`](data/glossary.json) lists Israeli institutions, medicine
brands, care words, places and slang with their meaning. When a term appears in
the text, it is added to the prompt. Add the corrections caregivers give you in
interviews (`tl`, `ml`, `ru`, `hi`, `ta` fields) — that is the best way to improve the
Asian-language translations.

## Language rating sheets for caregivers (Tagalog, Hindi, Malayalam)

```bash
cd backend
npm run demo:reset                     # clean demo account with the fake contract
npm run language-test -- hi ml https://careconnect-il-app-id9mu.ondigitalocean.app
```

Sends the 25 test sentences (5 each: medical, transport, slang, general, double
meaning) and a 10-question legal conversation to the real bots, in each language
asked for (`tl` Tagalog – the default, `hi` Hindi, `ml` Malayalam), and writes
`backend/reports/language-test-<language>-<date>.html`: open it in the browser
and print it (Ctrl+P). Each item has 1–5 rating boxes and a line for a better
translation; the last page is a summary for the interviewer. Without a URL it uses
the local backend (`npm run dev`). The inputs and the sheet's wording are in
`data/language-test-<code>.json` — edit them freely.
[LANGUAGE_TEST.md](LANGUAGE_TEST.md) explains how to run the session and how to put
the caregivers' corrections back into the bots, with Hindi and Malayalam examples.

## Home-screen pages

Every card on the home screen opens a page. The texts (in all four languages),
phone numbers and links are in [`src/infoPages.ts`](../src/infoPages.ts): edit them
there. Screen texts like buttons are in `src/pageStrings.ts`.

- **Remittance**: currency converter with daily rates from ExchangeRate-API's free
  endpoint (`GET /api/rates`, cached 6 hours, no key). It starts with the currency of
  the app language (Tagalog → PHP, Malayalam → INR), then USD and ILS.
- **Payslips**: `POST /api/payslips/upload` reads a PDF, Word file or photos (like a
  contract), Gemini explains every line in all four languages. The explanation
  (`payslips`) and the original files (`payslip_files`, so users can download them
  later) are stored encrypted, max 60 payslips per user. Tapping a line asks Gemini
  for a longer explanation once, then it is saved.
- **Popular questions** at the bottom of every page are in `src/infoFaq.ts`.
- **Database size:** original files are the biggest data we keep (a PDF payslip is
  usually 50–300 KB, a photo up to ~1 MB). Check `SELECT pg_size_pretty(sum(bytes))
  FROM careconnect.payslip_files;` now and then; the free plan has 500 MB.

## Community: caregivers in your city

Run `db/schema.sql` again once to add `community_profiles` and `contact_requests`.

- Joining the list is optional. Others see only a first name (letters only, no numbers or links)
  and the city / neighborhood the user chose. No location, photos or chat.
- A contact request carries one of five fixed messages (`MESSAGE_KEYS` in
  `services/community.js`, texts in `src/communityStrings.ts`). Max 5 new requests a day,
  one request per pair.
- After the other person accepts, either side can type a phone number to share it; it is
  stored encrypted and shown only to the other person. Either side can block at any time.
- Old pending / declined requests are removed after 90 days by the nightly job.
- The map is Google's free embed (`google.com/maps?q=…&output=embed`, no API key).

## Payments page (was "Payslips")

Caregivers upload whatever they get for their salary: a payslip (PDF, Word, photo) or an
**Excel (.xlsx) / CSV** table of hours and salary (read with `exceljs`). Each one gets a
`kind` (payslip / hoursSheet / other) and is explained in every app language. The API and
tables keep the old name `payslips`.

## Languages: English, Tagalog, Malayalam, Russian, Hindi, Tamil

Gemini already reads and writes Hindi and Tamil – no training is needed. What makes a
language "full" in CareConnect:

1. **App texts** – `src/translations.ts`, `src/botStrings.ts`, `src/pageStrings.ts`,
   `src/communityStrings.ts`, and for the long page content the dictionaries
   `src/i18n/hi.ts` / `src/i18n/ta.ts` (English sentence → translation).
2. **The bots** – the language is listed in `routes/translate.js` (target + reader script),
   the contract summary (`services/contractReader.js`) and payment explanations
   (`services/payslips.js`); the legal assistant answers in whatever language the app sends.
3. **Native-speaker check** – run a language test (`npm run language-test -- <code>`, with a
   `data/language-test-<code>.json`; Tagalog, Hindi and Malayalam exist), give the sheet to
   caregivers, and put their corrections in `data/translation-style.json` – the translator and
   the legal assistant then follow them. See [LANGUAGE_TEST.md](LANGUAGE_TEST.md).

Summaries and payment explanations made before a language was added show in English.

## "I want to go" (community places)

Run `db/schema.sql` again once: it adds the `place_interests` table and a `place_id` column
on `contact_requests`. Anyone can see who wants to go to a place (e.g. Nazareth). Marking
"I want to go" and sending the fixed "visit together" invitation need the caregivers list
(a public name others can find): someone not on it gets a small join box right on the place
card (name, and the city from "Where are you now?" if they chose one), and then the tap goes
through. The city is optional everywhere: "All of Israel – I'd rather not say" is the first
choice in the picker, and without a city others see only the name. Invitations
can be accepted or declined on the place card; "Open connection" opens that connection
(phone numbers) in Near you → Caregivers.

```sql
ALTER TABLE careconnect.community_profiles ADD COLUMN IF NOT EXISTS listed BOOLEAN NOT NULL DEFAULT true;
```

- `listed = false` is left from a short time when places didn't need the list. Such people
  aren't shown anywhere until they join the list.
- Leaving the list removes the user's places and connections.

## The user's name, in every language's letters

Run these lines once in the Supabase SQL Editor (they are also in `db/schema.sql`):

```sql
ALTER TABLE careconnect.users ADD COLUMN IF NOT EXISTS display_name TEXT CHECK (char_length(display_name) <= 30);
ALTER TABLE careconnect.users ADD COLUMN IF NOT EXISTS display_name_i18n JSONB;
ALTER TABLE careconnect.users DROP CONSTRAINT IF EXISTS users_display_name_check;
ALTER TABLE careconnect.users ADD CONSTRAINT users_display_name_check CHECK (char_length(display_name) <= 30);
ALTER TABLE careconnect.community_profiles DROP CONSTRAINT IF EXISTS community_profiles_display_name_check;
ALTER TABLE careconnect.community_profiles ADD CONSTRAINT community_profiles_display_name_check CHECK (char_length(display_name) BETWEEN 1 AND 30);
```

- Home: "Good morning, <name>". The **Add your name / Change name** button opens a box that
  explains that this is also the name other caregivers see if the user joins the caregivers list.
- A first name, full name or nickname, up to 30 letters. No numbers (so nobody can show a phone
  number through their name), links or emojis.
- Names are unique, ignoring upper/lower case: a name another account already has is refused
  ("This name is already taken…"). Names that were shared before this rule stay as they are.
- One name per account: joining the caregivers list sets it too, and changing it on Home
  changes it on the list (`services/names.js`). Accounts that only had a name on the list get
  it as their account name when they next open the app; no name stays blank.
- When the name is saved, Gemini spells it once in the letters of the other app alphabets
  (Rohit → रोहित, ரோஹித், Рохит, രോഹിത്). Languages written in the alphabet it was typed in keep it
  exactly as typed (nine-to-one stays nine-to-one in English and Tagalog). Each person sees names
  in the letters of their own app language. If Gemini fails, the name is shown as typed.

## "Where are you now?" places

The city picker on the Community page lists every Israeli locality – cities, towns, kibbutzim,
moshavim, villages (about 1,260, Central Bureau of Statistics list) – plus areas such as Upper
Galilee or Arava for anyone whose place isn't listed. Search forgives spelling (kibutz =
kibbutz, Kfar = Kefar, Kiryat = Qiryat, Ein = En) and works in Hebrew; words like "kibbutz"
or "moshav" are ignored, since the list doesn't say which places are kibbutzim.

- The choice (and the 🔖 bookmarked places) is remembered on the device for each account, so
  another account on the same phone starts with nothing chosen. An account on the caregivers
  list that has nothing chosen on this device starts from its list city.
- Our main cities with neighborhoods: `src/data/israelPlaces.ts` (also the areas).
- All other localities: `src/data/israelLocalities.ts`, generated by
  `scripts/build-localities.js` from the npm package `israel-geolocation` (MIT). See the
  script for how to rebuild it.
