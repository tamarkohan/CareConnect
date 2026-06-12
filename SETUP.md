# CareConnect — Developer Setup Guide

## Prerequisites (install in this order)

1. **Node.js LTS** — https://nodejs.org  
   Download the LTS version (v22+). Verify: `node --version`

2. **Git** — https://git-scm.com  
   Default install settings. Verify: `git --version`

3. **Antigravity IDE** — https://antigravity.dev  
   Our team IDE. Sign in with Google.

4. **Expo Go** (on your phone)  
   iOS: App Store → "Expo Go"  
   Android: Play Store → "Expo Go"

## Clone & Run the project

### Step 1 — Clone the repo
In Antigravity, click **Clone Repository** and paste:
https://github.com/tamarkohan/CareConnect.git
Save it to a folder like `C:\Projects\` (NOT OneDrive)

### Step 2 — Open a terminal (cmd, not PowerShell)
Navigate into the project:
cd CareConnect

### Step 3 — Install dependencies
npm install

### Step 4 — Run the app
npx expo start --web
Opens in browser at http://localhost:8081

### Step 5 — Run on your phone
Make sure your phone and laptop are on the **same WiFi**.  
Scan the QR code in the terminal with Expo Go.  
If it doesn't connect, run: `npx expo start --web` and use the browser for now.

## Project structure
src/
├── screens/       ← one file per screen
├── components/    ← reusable UI pieces
├── bots/          ← translator + legal bot logic
│   ├── translator/
│   └── legal/
├── navigation/    ← screen routing
└── services/      ← API calls (Claude, Firebase)
GlobalStyles.ts    ← colors, fonts, spacing tokens

## Notes
- We use **TypeScript** — all files are `.tsx` or `.ts`
- Colors and spacing come from `GlobalStyles.ts` — don't hardcode values
- The AI bots use the **Anthropic Claude API** — ask Tamar for the API key
- Database is **Firebase** — ask Tamar for the config file
