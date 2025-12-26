# HubSpot CRM Simulator

A web application that generates realistic test CRM data for HubSpot sandbox environments, featuring a retro Game Boy-styled interface.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.4
- **UI**: React 18, Tailwind CSS, Framer Motion
- **State**: Zustand
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth + HubSpot OAuth2
- **AI**: OpenAI API for data generation
- **Deployment**: Railway

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main game logic (~600 lines)
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles, animations
│   └── api/               # API routes
│       ├── hubspot/       # OAuth & connection endpoints
│       └── simulation/    # Simulation start endpoint
├── components/
│   ├── game/              # GameboyShell.tsx (main UI container)
│   └── screens/           # Screen components for each game state
├── store/
│   └── gameStore.ts       # Zustand store (state management)
├── types/
│   └── index.ts           # TypeScript type definitions
└── lib/
    ├── hubspot.ts         # HubSpot API client
    ├── openai.ts          # OpenAI data generation
    ├── simulation-engine.ts # Core simulation logic
    └── prisma.ts          # Prisma client
```

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Development server (localhost:3000)
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npx prisma migrate dev  # Run database migrations
```

## Key Patterns

### State Machine (Screen Navigation)
The app uses a state machine pattern with screen types:
`'title' | 'menu' | 'select_business' | 'select_sales_style' | 'select_distribution' | 'select_timeframe' | 'select_records' | 'confirm' | 'running' | 'complete' | 'connect_hubspot'`

### Input Handling
- **D-Pad**: Arrow keys or WASD
- **A Button**: Enter, Z, or Space (select/confirm)
- **B Button**: Escape, X, or Backspace (back)

### Zustand Store
Single source of truth for game state, simulation config, progress, and HubSpot connection. Components subscribe directly to store changes.

### API Security
- httpOnly cookies for OAuth tokens
- CSRF protection via state tokens
- Automatic token refresh before expiration

### Data Generation
Uses OpenAI function calling with structured schemas for realistic CRM records (contacts, companies, deals, tickets).

## Environment Variables

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
HUBSPOT_CLIENT_ID=...
HUBSPOT_CLIENT_SECRET=...
HUBSPOT_REDIRECT_URI=http://localhost:3000/api/hubspot/callback
```

## Coding Conventions

- TypeScript strict mode
- Tailwind CSS for styling
- Screen components are presentational (props-based, no direct state)
- Types centralized in `src/types/index.ts`
- "Press Start 2P" font for Game Boy authenticity
