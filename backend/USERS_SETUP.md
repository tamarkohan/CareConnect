# Users, memory and the demo account

Signed-in users get a legal chat that remembers the conversation and their
contract, and a translator that remembers their last 3, 5 or 10 translations.
People sign in with a **phone number or an email** and a one-time code (no
passwords). Their data is tied to the one they used, so the login screen tells
them to keep signing in the same way.

## 1. Update the database (once)

Supabase → **SQL Editor** → **New query** → paste all of [`db/schema.sql`](db/schema.sql)
→ **Run**. It is safe to run again: existing tables and data are kept, and the new
tables (`users`, `sessions`, `legal_messages`, `translations`) are added.

Until this is done, sign-in fails with "Internal server error".

To look at the data: **Table Editor** → schema dropdown (top left) → `careconnect`.
Contracts, chats and translations show as unreadable bytes: they are encrypted
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
interviews (`tl`, `ml`, `ru` fields) — that is the best way to improve the
Asian-language translations.
