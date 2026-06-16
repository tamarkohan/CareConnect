# CareConnect Israel

A mobile app built for foreign live-in caregivers working in Israel. CareConnect provides multilingual tools to help caregivers navigate their legal rights, manage their health and wellbeing, and handle the daily realities of caregiving work.

The app targets caregivers primarily from the Philippines, India (Kerala, Manipur, Karnataka), and Nepal, and is designed to break down language barriers and reduce isolation.

> **Project supervisors:** Alan Hartman (Dept. of Information Systems, University of Haifa) and Tal Kochli-Hailovski (Center for Research and Study of Aging, University of Haifa). Feedback is gathered from caregivers at Mishan Ahuza and Kibbutz Dahlia every six weeks. Contact: alan.hartman.gm@gmail.com

---

## Features

### ✅ Implemented
- **Translator** — Translate text between English, Tagalog, Malayalam, and Russian, with tagged context (Medical, Slang, Transit) and a recent translations history
- **Home Dashboard** — Quick access to tools: Arrival Guides, Safety & Shelters, Migration Support, PIBA Application help, Public Transportation, Remittance Apps, and Elder Care FAQs
- **Login Screen** — Multilingual entry point with language selection

### 🔧 Planned
**A. Working Conditions & Legal Rights Portal**
- Rights Dashboard covering Israeli labor laws (rest days, vacation, contract scope)
- Salary & Deductions Calculator with up-to-date government circulars
- Agency SOS directory to contact agencies or social workers

**B. Mental Health & Community Hub**
- Online support groups by topic (patient loss, family crisis, parenting from afar)
- Virtual community forums by region (e.g. Haifa Filipino group, Manipur group)
- Spiritual & religious streams (prayer, Bible study, devotional music)
- Digital Journal — a "burden book" for venting and a "gratitude book" for positive moments

**C. Physical Health & Safety**
- Ergonomic guides and video tutorials on safe patient transfer and equipment (manof, wheelchair)
- Self-care reminders via push notifications (rest breaks, diet, exercise)

**D. Daily Chores & Care Assistant**
- In-app camera translation optimized for Hebrew medical letters and pill boxes
- Dementia management quick-reference tips
- Daily task scheduler for medications, bathing, and care routines

---

## Languages Supported

Currently: English, Tagalog, Malayalam, Russian

Planned: Hebrew, Hindi, Nepali, Arabic, Urdu, Uzbek, Ukrainian, Bulgarian, Romanian

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo ~56 |
| Language | TypeScript |
| Navigation | React Navigation v7 |
| Styling | GlobalStyles.ts (design tokens) |
| AI | Anthropic Claude API |
| Database | Firebase |

---

## Getting Started

See [SETUP.md](./SETUP.md) for full setup instructions. Quick version:

```bash
# 1. Clone the repo
git clone https://github.com/tamarkohan/CareConnect.git
cd CareConnect

# 2. Install dependencies
npm install

# 3. Start the dev server
npx expo start --web
```

To run on a physical device, install **Expo Go** (iOS/Android), ensure your phone and laptop are on the same WiFi, and scan the QR code shown in the terminal.

> **API keys:** The app requires an Anthropic Claude API key and a Firebase config file. Contact Tamar to obtain these.

---

## Project Structure

```
CareConnect/
├── App.tsx                  # Root navigator (Login → Home → Translator)
├── index.ts                 # Entry point
├── app.json                 # Expo config
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── HomeDashboard.tsx
│   │   └── TranslatorScreen.tsx
│   ├── components/          # Reusable UI pieces
│   ├── GlobalStyles.ts      # Colors, fonts, spacing tokens
│   └── assets/              # Icons, fonts, images
└── SETUP.md                 # Developer onboarding guide
```

---

## Development Notes

- All files use TypeScript (`.tsx` / `.ts`) — avoid plain `.js`
- Colors and spacing come from `GlobalStyles.ts`; don't hardcode values
- Refer to the [Expo v56 docs](https://docs.expo.dev/versions/v56.0.0/) before using any Expo APIs

---

## Contributing

1. Clone the repo and follow [SETUP.md](./SETUP.md)
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes and open a pull request

Working prototypes are delivered to caregivers at Mishan Ahuza and Kibbutz Dahlia every six weeks for feedback.

---

## License

Private repository — all rights reserved.
