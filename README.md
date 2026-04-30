# Tasks

A personal, local-first task tracker with a kanban board, a "What's next"
recommender that filters by available time, and confetti when you finish (or
cancel) a task.

Built with Vite + React + TypeScript. All data lives in your browser via
IndexedDB (Dexie) — no server, no account, no telemetry.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173.

Other scripts:

- `npm run build` — production build (static bundle in `dist/`)
- `npm run preview` — preview the production build
- `npm run typecheck` — TypeScript only

## Features

### What's next
Pick how much time you have (5m, 15m, 30m, 1h, 2–3h, 3+h) and the app surfaces
tasks whose estimate fits. Tasks with an "unknown" estimate are always shown
so you can decide. Ranking favors overdue → high priority → soon-due → in
progress.

### Kanban board
Drag tasks between columns. Reorder within a column. Click a card to edit;
click `+` in a column header to add a task there.

Default statuses: **Backlog**, **To Do**, **In Progress**, **Blocked**,
**Done**, **Cancelled**.

### Confetti
Moving a task into a status marked as `Done` fires colorful confetti. Moving
into a status marked `Cancelled` fires a small monochrome burst. No re-fire
when shuffling within a terminal column.

### Settings
Add, rename, recolor, reorder, and delete statuses. Mark any status as
"Done" or "Cancelled" to make it trigger confetti. Deleting a status with
tasks prompts you to move them first.

## Architecture (deploy-ready)

All persistence is behind a `Repository` interface
(`src/data/repository.ts`). Today the only implementation is
`IndexedDbRepository`. To deploy this as a multi-device web app:

1. Implement `ApiRepository` against your backend (REST/GraphQL/tRPC).
2. Swap `repository` in `src/data/repository.ts`.
3. Add auth — the `userId` field is already on every task.

UUIDs are client-generated, so offline-created rows can sync to a server
without ID rewrites.

The Vite build outputs a static SPA, hostable on any static host
(Vercel, Netlify, S3, GitHub Pages). When you add a backend, the same
React app fronts it — no UI rewrite.
