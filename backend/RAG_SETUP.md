# Legal bot: RAG + database setup

The legal assistant answers from **websites you choose** (crawled into a vector
database and refreshed every day) plus the user's **contract**, which is stored
encrypted. Everything below runs on free tiers.

```
            daily (GitHub Actions)                         every question
 websites ──► crawl ─► chunk ─► embed ─► Supabase ◄── search ◄── /api/legal/ask ──► Gemini ──► answer + [1][2] sources
 (rag/sources.js)              (Gemini)  Postgres +                     ▲
                                         pgvector    encrypted contract ┘
```

| Piece | Service | Cost |
|---|---|---|
| Database + vectors | Supabase (Postgres + pgvector) | Free: 500 MB DB |
| Embeddings | Gemini `gemini-embedding-001` (768 dims) | Free tier of your existing key |
| Daily website sync | GitHub Actions (`.github/workflows/sync-knowledge.yml`) | Free |
| Backend | DigitalOcean (unchanged) | – |

## 1. Create the database (Supabase, free)

1. Sign up at <https://supabase.com> → **New project**. Pick region **Frankfurt (eu-central-1)**
   (next to the DigitalOcean backend) and a strong database password (save it).
2. **SQL Editor** → **New query** → paste all of [`db/schema.sql`](db/schema.sql) → **Run**.
3. **Connect** (top bar) → **Connection string** → choose **Session pooler** and copy it.
   It looks like
   `postgresql://postgres.<ref>:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`.
   Put your password in place of `[YOUR-PASSWORD]`. This is your `DATABASE_URL`.
   - Use the **Session** pooler (port 5432), not "Direct connection" (IPv6-only, which
     DigitalOcean and GitHub Actions can't reach) and not "Transaction pooler".

> Free projects are paused after 7 days without activity. The daily sync job
> keeps it active; if it ever pauses, press **Restore** in the dashboard.

## 2. Create the contract encryption key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

This is `CONTRACT_ENCRYPTION_KEY`. Keep a copy in a password manager — if it is
lost or changed, the stored contracts can't be read any more (users just upload again).
Put it **only** on the backend (DigitalOcean + your local `.env`), never in GitHub.

## 3. Configure

**Local:** copy `backend/.env.example` to `backend/.env` and fill in the three values.

**DigitalOcean:** App → backend component → **Settings → Environment Variables** →
add `DATABASE_URL` and `CONTRACT_ENCRYPTION_KEY` (tick **Encrypt**). They are
already declared in `.do/app.yaml`.

**GitHub (for the daily sync):** repo → **Settings → Secrets and variables → Actions** →
add `DATABASE_URL` and `GEMINI_API_KEY`.

## 4. Choose the websites

Edit [`rag/sources.js`](rag/sources.js). Each entry is one website (or one part of
it): where to start, which URL prefixes belong to it, how many links deep to go,
what to skip and a page limit. HTML pages **and PDFs** are read.

It is set up for the gov.il topic
[Employment of foreign workers](https://www.gov.il/en/departments/topics/foreign_workers_employment)
plus the Population and Immigration Authority's Foreign Workers' Rights booklet (PDF).

If a site blocks bots, or builds its pages with JavaScript, the sync log shows
`HTTP 403` or `almost no text` for those pages. For such pages, add the direct
link to the PDF/document version to `startUrls` instead.

## 5. Fill the knowledge base

```bash
cd backend
npm install
npm run sync                 # all sources
npm run sync -- kolzchut-en  # just one
```

or GitHub → **Actions → Sync legal knowledge base → Run workflow**.

The first run embeds every page, so it can take a while and may hit Gemini's
free-tier limits. That's fine: the run stops cleanly, and the next run carries
on from where it stopped (pages that are already stored and unchanged are skipped).

### How updates work

Every day the job re-crawls each site and, per page, compares a hash of its text:

- **new page** → stored and embedded
- **changed page** → its old chunks are replaced
- **unchanged page** → skipped (no Gemini calls)
- **page gone** (404/410 or no longer linked) → deleted, but only after a complete
  crawl — if the site was down or the page limit was reached, nothing is deleted.

## 6. Run

```bash
npm run dev
```

`POST /api/legal/ask` now returns `sources` (title + URL for each `[n]` in the answer),
which the app shows under each reply.

## How the contract is protected

| Risk | Protection |
|---|---|
| Someone reads the database (leak, stolen password) | Text is encrypted with AES-256-GCM by the backend before saving. The key is never stored in the DB. |
| Someone guesses another user's ID | No user IDs any more. Upload returns a random 256-bit token; only its SHA-256 is stored. |
| Access through Supabase's public API | Tables are in a private `careconnect` schema that the API doesn't expose, RLS is on, and API roles have no grants. |
| Token stolen from the phone | Stored in the iOS Keychain / Android Keystore (`expo-secure-store`). On the web build: `localStorage`. |
| Data kept forever | Contracts expire after 90 days (`CONTRACT_TTL_DAYS`) and are purged by the daily job. Users can delete theirs at any time ("Remove my contract"). |
| In transit | HTTPS app → backend, TLS backend → Supabase. |
| Logs | The backend never logs contract text or tokens. |

**One thing to know about Gemini:** the contract is sent to Gemini to answer
questions. On the **free** tier, Google's terms allow it to use the submitted
content to improve its products (human reviewers may see it). That's acceptable
for a demo with test contracts. Before real users upload real contracts, enable
billing on the Gemini API key (the paid tier isn't used that way). Check the
current Gemini API terms to confirm.

## Database size

Each chunk is about 1,200 characters of text plus a 768-number vector, which
works out to roughly 10 KB with indexes. The free 500 MB is enough for tens of
thousands of chunks (several thousand web pages). You can check usage in
Supabase → **Database → Database size**.
