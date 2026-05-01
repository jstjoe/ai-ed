# Task Tracker

A personal, locally-run task tracking app with a customizable Kanban board and a "What's next" view that surfaces tasks fitting your available time.

## Features

- **Kanban board** with drag-and-drop between columns.
- **"What's next"** — pick a time slot (5m, 15m, 30m, 60m, 2–3h, 3+h) and get a ranked top-5 of tasks that fit, blending overdue / priority / due-date / fit signals.
- **Required duration estimate** on every task (with an "Unknown" option).
- **Customizable statuses** — name, color, kind (Active / Done / Cancelled), reorder, add, delete.
- **Confetti** when a task is moved into a Done or Cancelled status.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Prisma + SQLite (swap to Postgres for deployment by changing the datasource)
- Tailwind CSS, Radix UI primitives, `@dnd-kit`, `canvas-confetti`, `zod`
- Vitest for the pure ranker tests

## Setup

```bash
pnpm install
cp .env.example .env             # creates DATABASE_URL=file:./dev.db
pnpm prisma migrate dev --name init
pnpm prisma db seed              # default kanban statuses
pnpm dev                         # http://localhost:3000
```

## Scripts

- `pnpm dev` — run the dev server
- `pnpm build` — production build
- `pnpm test` — run unit tests (the ranker)
- `pnpm typecheck` — TypeScript-only check
- `pnpm lint` — ESLint

## Architecture notes (deployable later)

- All data access runs through `src/lib/db/*` repositories invoked by Server Actions in `src/lib/actions/*`. The UI does not talk to the database directly, so swapping SQLite for Postgres only requires changing `prisma/schema.prisma` and `DATABASE_URL`.
- `src/lib/auth.ts` is a single-user shim returning `{ id: "local" }`. Replace with NextAuth/Auth.js when deploying.
- The ranker (`src/lib/whatsnext.ts`) is a pure function over `RankableTask[]` — fully unit-tested and trivially reusable.
