# Deploying CareConnect to DigitalOcean

CareConnect runs as **one DigitalOcean App Platform app** with two parts on the same URL:

| Path | Component | What it is |
|---|---|---|
| `/` | `web` (static site) | Expo web build (`npx expo export --platform web` → `dist/`) |
| `/api/*`, `/health` | `backend` (service) | Express + Gemini server from `backend/` |

The whole setup is in `.do/app.yaml`.

**Cost:** the static site is free (App Platform includes 3 free static sites). The backend uses the smallest paid size, `apps-s-1vcpu-0.5gb`, at about $5/month. The GitHub Student Pack includes DigitalOcean credit.

---

## 1. Push the deploy files to GitHub

DigitalOcean builds from GitHub, not from your computer. Commit and push the new files:

```cmd
cd C:\Users\eden.landesman\CareConnect
git checkout -b deploy/digitalocean
git add .do DEPLOY_DIGITALOCEAN.md package.json backend/package.json backend/services/geminiService.js backend/routes src/api/client.ts
git commit -m "Add DigitalOcean App Platform deployment"
git push -u origin deploy/digitalocean
```

Then open a PR and merge it into `main`, because the spec deploys from `main`.

> ⚠️ Never commit `backend/.env`. It is already in `.gitignore`.

**Repo access:** the repo is `tamarkohan/CareConnect`. When DigitalOcean asks for GitHub access, the account that authorizes it must be able to see that repo. Either Tamar connects it, or you fork it and change `repo:` in `.do/app.yaml` (it appears twice).

## 2. Create the app

1. Go to https://cloud.digitalocean.com/apps and click **Create App**.
2. Choose **GitHub**, authorize DigitalOcean, and pick `tamarkohan/CareConnect` on branch `main`.
3. DigitalOcean will try to detect components automatically. Instead, open **Edit App Spec** (or "Upload app spec"), paste the whole `.do/app.yaml`, and save.
4. You should now see two components: **backend** (Web Service) and **web** (Static Site).

*CLI alternative:* `doctl apps create --spec .do/app.yaml`

## 3. Add the Gemini API key (required)

In **backend → Settings → Environment Variables**:

| Key | Value | Encrypt |
|---|---|---|
| `GEMINI_API_KEY` | your key from https://aistudio.google.com/app/apikey | ✔ |
| `DATABASE_URL` | Supabase "Session pooler" connection string (see `backend/RAG_SETUP.md`) | ✔ |
| `CONTRACT_ENCRYPTION_KEY` | 32 random bytes, base64 (see `backend/RAG_SETUP.md`) | ✔ |

`PORT=8080` and `GEMINI_MODEL=gemini-flash-latest` are already set in the spec. Without the key, the backend exits on startup and the deploy fails its health check.

## 4. Deploy and test

Click **Create Resources** or **Deploy**. The first build takes about 5–8 minutes. When it finishes you'll have a URL like `https://careconnect-xxxxx.ondigitalocean.app`. Check:

- `https://careconnect-xxxxx.ondigitalocean.app/health` should return `{"status":"ok",...}`
- `https://careconnect-xxxxx.ondigitalocean.app/` should load the app. The Translator and Assistant call `/api/...` on the same domain automatically.

With `deploy_on_push: true`, every push to `main` redeploys automatically.

## 5. Point the phone app at the new backend

The web build finds the API on its own domain. Expo Go and native builds use the fallback URL in `src/api/client.ts`. After the first deploy, replace:

```ts
const FALLBACK_API_URL = "https://careconnect-pw7n.onrender.com";
```

with your DigitalOcean URL, for example `https://careconnect-xxxxx.ondigitalocean.app`.

You can also leave the file unchanged and set the URL when you start the app:
`set EXPO_PUBLIC_API_URL=https://careconnect-xxxxx.ondigitalocean.app && npx expo start`.

Once everything works on DigitalOcean, you can shut down the Render service.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Backend deploy fails its health check | `GEMINI_API_KEY` is missing. Check the runtime logs for `GEMINI_API_KEY is not set`. |
| `/api/translate` returns 404 or "model not found" | Set `GEMINI_MODEL` to a current model from https://ai.google.dev/gemini-api/docs/models |
| Web build fails with a Node version error | Both `package.json` files require Node ≥ 20. Check the build logs for the Node version DigitalOcean picked. |
| Backend crashes on start with `DATABASE_URL is not set` or `CONTRACT_ENCRYPTION_KEY must be 32 bytes` | Add the missing variable (see `backend/RAG_SETUP.md`). |
| Legal answers come without sources | The knowledge base is empty. Run the **Sync legal knowledge base** GitHub Action (or `npm run sync` in `backend/`). |
| You want your own domain | Go to **Settings → Domains → Add Domain** in the app. |

## What was changed in the code for this

- `.do/app.yaml`: new App Platform spec.
- `src/api/client.ts`: the API URL is no longer hard-coded. It uses `EXPO_PUBLIC_API_URL` first, then the page's own domain on the web, then a fallback.
- `backend/services/geminiService.js` and `backend/routes/*.js`: the model now comes from `GEMINI_MODEL`, with `gemini-flash-latest` as the default. `gemini-1.5-flash-latest` is retired by Google.
- `package.json`: adds a `build:web` script and `engines.node >= 20`. `backend/package.json` also gets `engines.node >= 20`.
