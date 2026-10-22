# DuesUp

**Know what you pay for, before it renews.**

DuesUp is an Android app for tracking recurring subscriptions — streaming, software, gym memberships, anything that bills on a schedule. Add your subscriptions, see what you spend each month and year, and get reminded before a charge hits.

Built by [Courage Labs](https://couragelabs.dev).

> **Status:** in active development, working toward v1 on Google Play.

---

## Features

### v1 (in progress)
- Add, edit and remove subscriptions
- Renewal list sorted by next charge date
- Monthly and annual spend totals
- Categories
- Renewal reminders before each charge
- Local-first storage — works fully offline

### v1.1 (planned)
- Cloud sync and backup across devices
- Spending insights and charts
- Multiple, customisable reminders per subscription
- Price-change history
- Multi-currency with conversion to a home currency
- Home screen widget and CSV export
- Premium tier via Google Play Billing

---

## Tech stack

| Area | Choice |
|---|---|
| App | React Native with [Expo](https://expo.dev), TypeScript |
| Navigation | Expo Router |
| Native modules (v1.1) | Kotlin, via the Expo Modules API — Play Billing and background reminders |
| Backend (v1.1) | Supabase (Postgres, row-level security, edge functions) |

Key technical decisions are recorded as Architecture Decision Records in [`docs/adr`](docs/adr).

---

## Getting started

### Prerequisites
- Node.js (LTS)
- An Android device with [Expo Go](https://expo.dev/go), or an Android emulator

### Run locally
```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on your Android device. If your device can't connect over the local network, try:

```bash
npx expo start --tunnel
```

---

## Project structure

```
app/          Screens and routes (Expo Router)
components/   Reusable UI components
assets/       Images, icons and fonts
docs/adr/     Architecture Decision Records
```

---

## Architecture decisions

| ADR | Decision |
|---|---|
| [0001](docs/adr/0001-use-expo.md) | Use Expo for the React Native app |

---

## Author

**Courage Eboigbe** — [Courage Labs](https://couragelabs.dev)