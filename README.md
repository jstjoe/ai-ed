# Tasks

Personal task tracker. Local-first (browser localStorage), with a kanban board,
"What's next" planner, customizable statuses, and confetti when you finish.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Features

- **Kanban board** with drag-and-drop between columns
- **What's next**: pick how much time you have (5m / 15m / 30m / 1h / 2-3h / 3+h
  / unknown) and see the top tasks that fit, sorted by priority
- **Customizable statuses**: rename, recolor, reorder, add, delete in
  `/settings`. Mark statuses as "done" or "cancelled" to trigger confetti
- **Required time estimate** on every task (with an "Unknown" option)
- All data lives in `localStorage` under the key `ai-ed-tasks/v1`

## Architecture (deploy-ready later)

Storage is behind a small `StorageAdapter` interface in `src/lib/storage.ts`.
Today the only adapter is `localStorageAdapter`. To deploy as a multi-user
web app:

1. Add a server-side persistence layer (e.g. Postgres + a `/api/data` route)
2. Implement a second adapter that calls that API
3. Swap with `setStorageAdapter(...)` at app start

The schema carries a `version` field so future migrations can run in
`migrate()` in `src/lib/storage.ts`.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS
- Zustand (state)
- @dnd-kit (drag-and-drop)
- canvas-confetti
