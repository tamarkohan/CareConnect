# CareConnect

A mobile app built with React Native and Expo to support migrant care workers in Israel. CareConnect provides language tools, arrival guides, and resources to help workers navigate daily life and their rights.

---

## Features

- **Translator** — Translate text between English, Tagalog, Malayalam, and Russian, with support for medical, slang, and transit contexts
- **Home Dashboard** — Quick access to tools including Arrival Guides, Safety & Shelters, Migration Support, PIBA Application help, Public Transportation, Remittance Apps, and Elder Care FAQs
- **AI Assistant** — Powered by the Anthropic Claude API *(in development)*
- **Community, Tasks, Journal** — Additional screens *(in development)*

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

---

## License

Private repository — all rights reserved.
