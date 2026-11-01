# FocusTrack

A personal work tracker that answers one question:

> Am I using my time well, and am I turning my thinking into meaningful execution?

It tracks work sessions and what each one produced. It is not a todo app, a habit tracker, or a journal.

**[Open the app](https://focustrack.sailab.dev/)**

<p align="center">
  <img src="docs/screenshots/tour.gif" alt="A running Build session, the stop dialog with a different placeholder each time it opens, then Log, Projects, and a weekly AI report on Insights" width="960">
</p>

<p align="center"><a href="docs/screenshots/tour.mp4">Watch the tour as a video</a></p>

## What it does

- **Timer.** Pick a project and a category, start, pause, stop.
- **Log.** Every session records what you worked on and what it produced, in one line.
- **Execution vs preparation.** Each category is one or the other, so every day, week, and project shows how much went to building and how much to getting ready to build.
- **Projects.** Why each project matters and where the last four weeks actually went, including time on projects with no goal.
- **Insights.** Daily, weekly, and monthly AI reports that cite your own numbers and end with one next action, beside charts of where the time went.
- **Nudges.** Computed from your own sessions and shown only in the app: take a break, still paused, pick a lapsed project back up.

AI is optional. Reports are written automatically the first time you open the app after a period ends. Without an API key, everything else works and reports are shown as off.

### Today

| Running session | Stopping it |
|---|---|
| <img src="docs/screenshots/today.png" alt="A Build session running at 47 minutes, beside today's tracked time and a new daily report"> | <img src="docs/screenshots/stop-dialog.png" alt="The stop dialog asking what got done, with a placeholder matched to the Build category"> |

### Log and Projects

| Log | Projects |
|---|---|
| <img src="docs/screenshots/log.png" alt="Sessions grouped by day, each with its one-line outcome, category, and duration"> | <img src="docs/screenshots/projects.png" alt="Project cards with why each matters, time this week and over four weeks, and the last comment"> |

### Insights

<img src="docs/screenshots/insights.png" alt="A weekly AI report with three observations backed by durations, beside a day-by-day chart of execution and preparation">

### On a phone

<p align="center">
  <img src="docs/screenshots/mobile-today.png" alt="The running timer on a phone with Pause and Stop buttons and a bottom tab bar" width="260">
  &nbsp;
  <img src="docs/screenshots/mobile-stop.png" alt="The stop dialog as a bottom sheet on a phone" width="260">
  &nbsp;
  <img src="docs/screenshots/mobile-insights.png" alt="A weekly AI report on a phone" width="260">
</p>

<sub>Screenshots and the tour show demo data, including the report text.</sub>

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase (Postgres, Auth, Row Level Security), deployed on Vercel.

## Run locally

Needs Node 24, pnpm, and Docker.

```bash
# Database: starts local Supabase and prints the API URL and publishable key
cd backend
pnpm install
pnpm start

# App
cd ../frontend
pnpm install
cp .env.example .env.local   # fill in the URL and key from above
pnpm dev                     # http://localhost:3000
```

Set `OPENAI_API_KEY` in `.env.local` to turn on AI reports.

## Test

```bash
cd frontend && pnpm test   # unit tests
cd backend && pnpm test    # database and RLS tests
```

## Deploy

Pushing to `main` runs [the deploy workflow](.github/workflows/deploy.yml): typecheck, lint, tests, then a production deploy to Vercel. Database migrations are applied separately with `pnpm db:push` from `backend/`.

## More

- [PLAN.md](PLAN.md): product spec and build plan
- [CLAUDE.md](CLAUDE.md): architecture, conventions, and working rules
