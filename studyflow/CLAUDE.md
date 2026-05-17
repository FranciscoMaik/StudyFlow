# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (Vite)
npm run build      # tsc -b && vite build
npm run test       # vitest --run (all tests, no watch)
npm run lint       # eslint .
npm run preview    # preview production build
```

Run a single test file:
```bash
npx vitest run src/__tests__/dashboard-preservation.test.tsx
```

## Environment

Copy `.env.example` to `.env` and fill in:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Architecture

**Stack:** React 19 + TypeScript + Vite, Tailwind CSS v4, React Query v5, Zustand v5, React Router v7, Supabase (auth + DB), Framer Motion, Recharts, Zod + react-hook-form.

**App layout:** `App.tsx` defines all routes. Protected routes render inside `AppLayout` which wraps content in `NavBar` (collapsible sidebar). Public routes: `/login`, `/register`.

**Pages** (`src/pages/`): `Contents` (home `/`), `Categories`, `Schedule`, `Profile`, `Reports`.

**Data layer pattern:** All Supabase queries live in `src/hooks/`. Each hook file exports focused React Query `useQuery`/`useMutation` hooks — no data fetching in components or stores. Auth identity comes from `useAuthStore` (Zustand), not React context.

**Stores** (`src/stores/`):
- `authStore` — Supabase `User`/`Session`, loaded once at app start
- `timerStore` — per-session countdown timers, persisted to `localStorage` under `studyflow:timers`; survives rehydration across tabs
- `notificationStore` — ephemeral XP/achievement toast queue

**Business logic** (`src/lib/`):
- `planner.ts` — `generatePlan()` schedules future study sessions from active contents + user's weekly schedule; sorts by nearest deadline → priority → fewest remaining hours; respects a consecutive-day avoidance rule; horizon defaults to 4 weeks
- `xp-engine.ts` — `calculateLevel()` maps total XP to one of 6 named levels (Iniciante → Mestre, thresholds: 0/500/1500/3500/7500/15000)
- `achievement-engine.ts` — `checkAchievements()` is pure: receives a context snapshot, returns newly-unlocked `AchievementKey[]`; called client-side after each session completion
- `streak.ts`, `calendar.ts`, `timer.ts` — supporting utilities

**DB schema** (`supabase/migrations/`): tables are `schedules`, `categories`, `contents`, `sessions`, `xp_transactions`, `achievements`, `streaks`. RLS policies in `002_rls_policies.sql`; DB triggers (streak update, XP on session done) in `003_triggers.sql`. Session completion XP (50 XP) is credited by a DB trigger, not client code.

**XP events (client-side):** content creation = 10 XP, daily login = 15 XP (idempotent check). Session completion = 50 XP via DB trigger.

**Type system:** `src/types/index.ts` is the single source of truth for all shared interfaces (`Content`, `Session`, `ScheduleDay`, `Category`, `XPTransaction`, `Achievement`, `UserProfile`, `PlannerInput/Output`, `AchievementCheckContext`). DB column names use snake_case; TypeScript types use camelCase — mapping happens in each hook's `map*` function.

**Testing:** Vitest + jsdom + Testing Library. Setup in `src/test-setup.ts`. Tests live in `src/__tests__/`.
