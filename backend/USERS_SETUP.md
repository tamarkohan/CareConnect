# Users, memory and the demo account

Signed-in users get a legal chat that remembers the conversation and their
contract, and a translator that remembers their last 3, 5 or 10 translations.
People sign in with a **phone number or an email** and a one-time code (no
passwords). Their data is tied to the one they used, so the login screen tells
them to keep signing in the same way.

**Email shortcuts:** while typing an email (sign-in, and adding one in Profile), a list under the
field offers the common endings – `@gmail.com`, `@campus.haifa.ac.il`, `@icloud.com`,
`@rafael.co.il`, `@outlook.com` first, then `@hotmail.com`, `@yahoo.com`, `@walla.co.il` after
typing their first letters. Tapping one fills it in and the field stays plain text, so it can still
be edited (e.g. `@campus.haifa.ac.il` → `@is.haifa.ac.il`); an ending that isn't on the list is
just typed. The list is `EMAIL_DOMAINS` in `src/components/EmailInput.tsx`.

## 1. Update the database (once)

Supabase → **SQL Editor** → **New query** → paste all of [`db/schema.sql`](db/schema.sql)
→ **Run**. It is safe to run again: existing tables and data are kept, and the new
tables (`users`, `sessions`, `legal_messages`, `translations`, `payslips`, `payslip_files`) are added.
**Run it again after updating to the version with the Payslips page**, or uploading a
payslip fails, and **after updating to the version where tasks and the journal are saved**
(it adds `tasks` and `journal_entries`), or those pages show "Couldn't load", and **after updating
to the version where the welcome guide opens only after the first sign-in** (it adds
`users.guide_seen_at`), or the guide keeps opening at every sign-in.

Until this is done, sign-in fails with "Internal server error".

To look at the data: **Table Editor** → schema dropdown (top left) → `careconnect`.
Contracts, chats, translations, payslips, tasks and journal entries show as unreadable
bytes: they are encrypted with `CONTRACT_ENCRYPTION_KEY`.

## 2. Settings (DigitalOcean → backend → Environment Variables)

| Key | Value | |
|---|---|---|
| `DEMO_LOGIN` | `true` | Phone **123** signs in to the demo account without a code. Set `false` for real users. |
| `NODE_ENV` | `production` | Already in `.do/app.yaml`. |
| `OTP_TEST_CODE` | `123456` | Test mode: **any** phone number or email signs in with this code, and the login screen shows it. Where a real code can be sent (email via Gmail or Resend), it is sent too and **either one** works; where nothing can be sent (SMS without Twilio), only this code works. For testing with many accounts. Anyone who knows it can sign in to any account: remove it before real users. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | from twilio.com | Optional: real SMS codes (paid per SMS). |
| `GMAIL_SCRIPT_URL`, `GMAIL_SCRIPT_SECRET` | see below | Optional: real email codes from a Gmail account. Free, no domain, about 100 emails a day. |
| `RESEND_API_KEY`, `OTP_EMAIL_FROM` | from resend.com | Optional: real email codes (free tier: 3,000/month, needs your own domain). Used instead of Gmail when both are set. |

Without an SMS/email provider, the live app shows "Sign-in by SMS isn't
available yet" and offers **Continue without an account** (nothing saved).
Locally (`npm run dev`), the code is printed in the backend terminal instead.

### Email codes from Gmail (free, no domain)

The codes are sent from a Gmail account by a small Google Apps Script
([`gmail-sender/Code.gs`](gmail-sender/Code.gs)) that the backend calls over HTTPS.
(Gmail's usual SMTP way doesn't work here: DigitalOcean blocks the email ports.)
About 15 minutes, once:

1. **A Gmail account for the app**, e.g. `careconnect.codes@gmail.com` – the codes come from this
   address. (Your own works too, but a separate one keeps your inbox apart.)
2. **A secret:** make up a long random text, e.g. 30 letters and numbers. It only lets the backend
   use the script.
3. Signed in with that Gmail, open **script.google.com** → **New project**. Name it
   `CareConnect codes`. Delete what's in `Code.gs` and paste all of
   [`gmail-sender/Code.gs`](gmail-sender/Code.gs). On the line
   `const SECRET = "PASTE-THE-SAME-SECRET-AS-GMAIL_SCRIPT_SECRET";` put your secret between the
   quotes. **Save** (💾).
4. **Allow it to send email:** in the list at the top choose `testSend` → **▶ Run** →
   **Review permissions** → choose the Gmail account. Google shows "Google hasn't verified this
   app" (it's your own script): **Advanced** → **Go to CareConnect codes (unsafe)** → **Allow**.
   A "CareConnect test" email arrives in that Gmail.
5. **Deploy** (top right) → **New deployment** → ⚙️ **Select type** → **Web app**.
   *Execute as:* **Me**. *Who has access:* **Anyone**. → **Deploy** → copy the **Web app URL**
   (`https://script.google.com/macros/s/…/exec`). ("Anyone" is needed so the backend can reach it;
   without the secret it sends nothing.)
6. **DigitalOcean** → the app → backend → **Settings → Environment Variables** → add
   `GMAIL_SCRIPT_URL` = the Web app URL and `GMAIL_SCRIPT_SECRET` = your secret (mark it
   **Encrypt**) → **Save** (the backend restarts).
7. **Try it:** in the app, **Email** → your address → **Continue**. The email
   "CareConnect code: …" arrives within a few seconds (look in Spam the first time and
   mark it "Not spam"). With `OTP_TEST_CODE` still set, the emailed code and `123456` both work.

If no email comes, the backend log (DigitalOcean → **Runtime Logs**) says why, e.g.
`Gmail script answered 200: wrong secret` (the secrets differ), or "not the expected reply"
(the URL is wrong or the deployment isn't "Anyone"). After changing `Code.gs`, deploy again with
**Deploy → Manage deployments → ✏️ → Version: New version → Deploy** – the URL stays the same.
Gmail allows about 100 emails a day from a script; after that, codes stop until the next day
(with `OTP_TEST_CODE` set, `123456` still works).

## 3. The demo account

```bash
cd backend
npm run demo:reset                       # uses data/demo-contract.txt
npm run demo:reset -- my-fake-contract.pdf   # or your own fake contract (PDF, Word, text)
```

Run it before each interview. It empties the demo chat, uploads the fake contract
with its summary, adds three example translations, deletes the demo's tasks and journal
entries (the examples come back on the next visit) and shows the disclaimer again.
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
| Tasks | ~0.2 KB each | 100 open + the last 100 completed per user |
| Journal entries | ~0.5–5 KB each | 1000 per user (then the user must delete old ones) |
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

## A question waiting for its answer

A signed-in user's question is saved as soon as it is asked, and the answer when it
comes. Until then the chat shows the question with the "thinking" dots – also after
leaving the page, reloading it, or closing and reopening the app (the app checks every
few seconds until the answer is saved). If the answer fails, the question isn't kept and
the app shows the error. If the backend restarts while answering (e.g. a new deploy),
that answer is lost: the chat shows "No answer came for this question. Please ask again."

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
interviews (`tl`, `ml`, `ru` fields) — that is the best way to improve the
Asian-language translations.

## Tagalog rating sheet for caregivers

```bash
cd backend
npm run demo:reset                     # clean demo account with the fake contract
npm run language-test -- https://careconnect-il-app-id9mu.ondigitalocean.app
```

Sends the 25 test sentences (5 each: medical, transport, slang, general, double
meaning) and a 10-question legal conversation to the real bots, in Tagalog, and
writes `backend/reports/language-test-tagalog-<date>.html`: open it in the browser
and print it (Ctrl+P). Each item has 1–5 rating boxes and a line for a better
translation; the last page is a summary for the interviewer. Without a URL it uses
the local backend (`npm run dev`). The inputs are in
[`data/language-test-tl.json`](data/language-test-tl.json) — edit them freely.

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
3. **Native-speaker check** – run a language test like the Tagalog one
   (`npm run language-test`, with a `data/language-test-<lang>.json`), give the sheet to
   caregivers, and put their corrections in `data/translation-style.json` – the translator
   then follows them, as it does for Tagalog.

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

## Tasks and journal

Both pages save to the server, per account, encrypted (`services/tasks.js`,
`services/journal.js`), so they're the same on every device and survive a reload.

- **Tasks:** "+ Add task" opens a form: the text, a time picked from a list (every 15 minutes,
  like Google Calendar; optional) and **Repeat**: doesn't repeat, every day, or on chosen days.
  Every task has **Edit**, **Share** (the phone's share menu; on a computer it copies the text,
  since the Windows share window that Chrome / Edge open doesn't pass the text on reliably)
  and **Delete**. Ticking a one-off task moves it to **Completed tasks** with the day and time it
  was done; unticking brings it back. A repeating task is ticked for today only: that day goes to
  Completed tasks and the task comes back on its next day ("today" is the phone's day). Repeating
  tasks that aren't for today are under **Other days**. Open tasks are sorted by time; one whose
  time has passed is outlined. The purple reminder card has ✕, remembered on the device per account.
- **Tasks and journal entries in the app language:** what users write is shown translated into
  the app language (`POST /api/tasks/translate`, `POST /api/journal/translate`, Gemini, see
  `services/translateItems.js`). People often type in another language than the app's, so every
  text is sent; one already in that language comes back unchanged. Translations are stored
  (encrypted, with the text), so each is translated into each language only once; editing drops
  them. The journal translates the 30 newest entries at a time and has "Show original" on each
  translated entry; editing an entry always starts from the words as written.
- **Journal:** three tabs: **All entries** (the start: both books together, newest first; the
  page asks you to choose a book to write in), **Burden Book** and **Gratitude Book** (only that
  book's entries, and the writing box for it). "Show all entries" above the list also goes back to
  All entries. Every entry has **Edit** (text and mood), **Share** and **Delete**.
- **Examples for new users:** the first time someone opens Tasks they get 3 example tasks
  (one completed, one repeating every day), and the first time they open the Journal 2 example
  entries. They are marked "Example" and show in the current app language (the texts are
  `task1`… and `journalEntry1`… in `src/translations.ts`). They can be ticked, shared and
  deleted but not edited, so they always stay examples. Like on the translator, the user's
  first own task or entry replaces them. They are added once per account
  (`users.tasks_examples_at` / `journal_examples_at`); `npm run demo:reset` resets this for the demo.
- Texts of the buttons and messages: `src/tasksJournalStrings.ts`; the time list is
  `src/components/TimePicker.tsx`, the add / edit form `src/components/TaskForm.tsx`.

## Menu: Profile and Settings

- **Profile:** the name others see (the same editor as "Add name" on Home), and the ways to sign
  in. A phone number and an email can both be on one account: "Add" sends a one-time code to the
  new one (`POST /api/auth/link/request-code`, then `/link/verify`), and from then on either one
  signs in to the same account. A phone or email that another account already uses is refused
  ("already used by another account"); accounts are never merged. The menu's "Signed in as"
  shows both. The demo account's sign-in can't be changed.
- **Settings:** app language; **appearance** (light, dark or the phone's setting, see below); **task reminders**; **Legal**: privacy policy, terms of use and the
  legal assistant's disclaimer (info pages `privacy`, `terms`, `disclaimer` in
  `src/infoPages.ts`; the privacy policy and terms are plain-language drafts written from how the
  app really works – have them reviewed before real users); **Delete my account**
  (`POST /api/auth/delete-account`): after a confirmation, the account and everything in it
  (contract, chats, translations, payments, community, tasks, journal) are deleted for good –
  every table references `users` with `ON DELETE CASCADE`. Not for the demo account.
- **Task reminders** (`src/reminders.ts`): local notifications on the phone at the time of each
  open task that has a time, also on its repeat days (not again on a day it was already ticked).
  They are set for the next 7 days (at most 60) and set again whenever the task list changes or
  reminders are turned on; turning them off or signing out removes them. On / off is kept on the
  phone, per account. They need the phone app (`expo-notifications`); a web page can't remind
  anyone once it's closed, so the web build shows that note instead of the switch. If the app isn't
  opened for a week, reminders stop until it is opened again.
- **The guide to the six pages:** after an account's first sign-in it opens with just a short
  text for each page. From **Menu → App Guide** it has a "More" button on each page with a few
  tips (`GUIDE_DETAILS` in `src/guideStrings.ts`). A tap outside the card closes it, like the menu.
- **Appearance (dark mode):** Light, Dark or "Same as phone" (the default: it follows the phone's
  setting, also when it changes while the app is open). The sign-in page has a quick switch too
  (top left, "🌙 Dark" / "☀️ Light"): it sets Light or Dark, the same choice as in Settings. The choice is kept on the device
  (`careconnect.appearance`). The status bar, the phone's window and, on the web, the browser page
  behind the app follow it too. "Same as phone" needs `"userInterfaceStyle": "automatic"` in
  `app.json` (with `expo-system-ui` for Android); with `"light"` the phone always reports light.
- Texts: `src/menuStrings.ts`.

### How dark mode works in the code (`src/theme.ts`)

Each screen still writes its colours and styles once, for the light look. `themedColors({...})`
(the screen's colour list) and `themedStyles({...})` (in place of `StyleSheet.create`) give back
the same names, but while the dark look is on every colour is swapped for its dark partner: the
`DARK` table in `src/theme.ts` for the app's own colours (page background, cards, lines, text,
blues, reds, greens…), a computed one for any other colour. Dark see-through layers behind
pop-ups stay as they are. `AppContext` switches the look before the screens draw, and every
screen re-draws when it changes; the light look is exactly as before.

When adding a screen or a colour:
- Put colours in the screen's colour list or style sheet, and use `themedStyles`. A colour written
  straight into the JSX goes through `tc("#...")`.
- Don't read a colour once at the top of a file (e.g. `const X = { bg: Color.blue }`): it would
  stay in the look the app started with. Read it while drawing.
- A new light colour gets a computed dark partner; to choose it yourself, add it to `DARK`.
- Something that must look different from the swap (e.g. white text on a photo, which stays
  white) goes in `themedStyles`'s second argument: `themedStyles(styles, { creditText: { color: "#fff" } })`.
