# Smart Parking Demo App

An offline-first smart parking demonstration built with **Next.js 16**, **TypeScript**, and **Tailwind CSS v4**. The app simulates QR-based entry/exit, spot recommendations, interactive parking maps, live timers, and Ethiopian payment methods — all powered by mock data with no backend required.

## Features

- **Dashboard** — Stats cards, availability chart, floor breakdown, active sessions, revenue chart
- **QR entry/exit** — Camera scanner + simulate buttons for desktop demo
- **Spot recommendation** — Nearest free spot with alternatives based on floor preference and exit proximity
- **Interactive map** — React Flow floor map with zoom, spot selection, and route line to entrance
- **Active session** — Live timer, running cost estimate, extend/change/end actions
- **Payments** — Telebirr, CBE Birr, Chapa, Cash, Visa/Mastercard (simulated)
- **i18n** — English and Amharic (`next-intl`)
- **Theming** — Light/dark/system (`next-themes`)
- **PWA / offline** — Serwist service worker, IndexedDB caches, payment queue sync

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (recommended)

## Setup

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
pnpm build
pnpm start
```

## Demo walkthrough

1. **Home** (`/`) — Start parking or open dashboard
2. **Scan entry** (`/scan-entry`) — Click **Simulate Entry Scan** (or scan QR with token `entry-demo`)
3. **Recommendation** — Accept recommended spot or pick an alternative / map
4. **Active session** (`/session`) — Watch timer and estimated cost; navigate via map
5. **Scan exit** (`/scan-exit`) — **Simulate Exit Scan** (`exit-demo`)
6. **Payment** (`/payment`) — Review breakdown, select method, pay
7. **Receipt** (`/receipt`) — Printable confirmation

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | ESLint check |
| `pnpm lint:fix` | ESLint with auto-fix |
| `pnpm prepare` | Install Husky git hooks |

## Architecture

```
src/
├── app/              # Next.js App Router pages
├── components/       # Shared UI + layout + providers
├── features/         # Domain UI (dashboard, parking, payment, qr)
├── hooks/            # useParkingTimer, useOnlineStatus
├── i18n/             # next-intl request config
├── lib/              # Utils, constants, mock data, IndexedDB
├── services/         # Business logic (pricing, QR, recommendations)
├── store/            # Zustand stores (persisted)
├── translations/     # en.json, am.json
└── types/            # TypeScript interfaces
```

### Data flow

```
UI (features) → Zustand stores → services → mock data / IndexedDB
                     ↓
              localStorage persist (sessions, spots)
```

### Offline behavior

| Feature | Offline support |
|---------|-----------------|
| Dashboard | Cached spot stats (Zustand persist) |
| Map | Cached layout (IndexedDB) |
| Active session / timer | Fully local |
| QR validation | Cached tokens (IndexedDB) |
| Payments | Queued in IndexedDB; synced on `online` |

### PWA install

1. Run production build (`pnpm build && pnpm start`) or deploy to HTTPS
2. In Chrome/Edge: **Install app** from the address bar menu
3. Test offline: DevTools → Network → **Offline**, reload — cached routes and active session still work

## i18n

Add strings to `src/translations/en.json` and `src/translations/am.json`. Use `useTranslations("namespace")` in client components. Toggle language via the header button (sets `locale` cookie).

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand + persist |
| i18n | next-intl |
| Theme | next-themes |
| Charts | Recharts |
| Map | @xyflow/react |
| QR | html5-qrcode |
| PWA | @serwist/next |
| Offline DB | idb (IndexedDB) |
| Git hooks | Husky + lint-staged |

## Configuration

| Constant | Default | File |
|----------|---------|------|
| Hourly rate | 50 ETB | `src/lib/constants.ts` |
| VAT | 15% | `src/lib/constants.ts` |
| Total spots | 100 (3 floors) | `src/lib/constants.ts` |
| Entry QR token | `entry-demo` | `src/lib/constants.ts` |
| Exit QR token | `exit-demo` | `src/lib/constants.ts` |

## Git hooks

Husky runs `lint-staged` on pre-commit, which ESLint-fixes staged `*.ts` and `*.tsx` files.

## Accessibility

- Semantic landmarks (`header`, `main`, `nav`)
- `aria-label` / `aria-current` on navigation and controls
- Map spots expose status via `aria-label` and `aria-pressed`
- Color + text labels for spot status (not color-only)
- `lang` attribute follows selected locale

## Performance

- `dynamic()` imports for Recharts, React Flow, and QR scanner
- Route-level code splitting via App Router
- `next/font` with `display: swap` for Geist + Noto Sans Ethiopic

## Future improvements

- Real backend and IoT sensors
- License plate recognition
- Push notifications and reservations
- Multi-branch admin analytics
- Real payment gateway integration

## License

Private demo project.
