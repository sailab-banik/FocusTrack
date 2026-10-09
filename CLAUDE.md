# FocusTrack — Personal Work Intelligence System

A personal, work-focused AI intelligence and execution tracker. It answers one question:

> "Am I using my current time and freedom well, and am I converting my thinking into meaningful execution?"

It is **not** a generic todo app, habit tracker, life tracker, or journal.

- Product spec, data model, and phased build plan: [PLAN.md](PLAN.md). Read it before starting a feature.
- Repo: https://github.com/sailab-banik/FocusTrack.git

## Status

Milestones 0–5 (scaffold, authentication, categories, projects, timer, session logging) are in place. Next is milestone 6 (session history) in PLAN.md.

## Commands

Package manager is pnpm. `frontend/` and `backend/` are separate packages; run commands from inside each.

Frontend (`frontend/`):

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server on http://localhost:3000 |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest, single run |
| `pnpm dlx shadcn@latest add <component>` | Add a shadcn/ui component |

Backend (`backend/`, local Supabase, needs Docker):

| Command | Purpose |
|---|---|
| `pnpm start` / `pnpm stop` | Start/stop the local Supabase stack; `start` prints the API URL and publishable key |
| `pnpm status` | Show local URLs and keys |
| `pnpm migration:new <name>` | Create a migration in `supabase/migrations/` |
| `pnpm db:reset` | Rebuild the local database from migrations (wipes local data) |
| `pnpm db:migrate` | Apply pending migrations to the local database, keeping data |
| `pnpm db:push` | Apply migrations to the linked hosted project |
| `pnpm test` | Run pgTAP database tests in `supabase/tests/` (RLS checks) |
| `pnpm types` | Regenerate `frontend/src/lib/supabase/database.types.ts` from the local database |

Environment: copy `frontend/.env.example` to `frontend/.env.local` and fill in the Supabase URL and publishable key.

Hosted Supabase auth setup (dashboard, not in code): set Site URL to the deployed app URL, and change the "Confirm signup" email template link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`. Local Supabase skips email confirmation.

## Architecture

```
frontend/                  Next.js app (UI, server actions, route handlers)
  src/app/                 Routes only; keep pages thin
  src/features/<feature>/  Feature code: components, server actions, pure business logic + tests
  src/components/ui/       shadcn/ui components (generated; style "base-nova", Base UI primitives)
  src/lib/supabase/        Supabase clients: client.ts (browser), server.ts (server components/actions)
  src/app/(app)/           Signed-in pages; the layout calls requireUser()
  src/app/(auth)/          Sign-in and sign-up pages
  src/proxy.ts             Refreshes the Supabase session cookie; redirects signed-out users to /login
backend/                   Database and auth
  supabase/config.toml     Local Supabase config
  supabase/migrations/     SQL migrations: schema and RLS policies
  supabase/tests/          pgTAP tests; every user-owned table gets RLS tests here
```

- There is no separate backend service. Server logic lives in Next.js server actions and route handlers; `backend/` owns the schema, RLS policies, and Supabase config.
- Next.js 16: request interception is `src/proxy.ts`, not `middleware.ts`. Current docs ship in `frontend/node_modules/next/dist/docs/`.
- Tests sit next to the code they cover as `*.test.ts`.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, responsive PWA |
| Backend | Next.js server actions / route handlers |
| Data | Supabase: PostgreSQL, Supabase Auth, Row Level Security; pgvector only when semantic search is needed |
| AI | Abstract provider interface (candidates: OpenAI, Anthropic, Gemini, Qwen/local Ollama) |
| Deploy | Vercel + Supabase |

Framework APIs change quickly: check current docs before using Next.js, Supabase, or AI SDK APIs rather than relying on memory.

## Scope guardrails

In scope: software/career work, learning and skill development, personal projects, music/creative work, and goals/achievements related to those.

Never track: sleep, food, health, location, generic personal habits, personal diary/life events.

Never add: habit tracking, sleep tracking, generic reminders, calendar replacement, social feeds, gamification-heavy systems, complex notifications, team surveillance, employee monitoring.

Do not add a feature because it is common in productivity apps. Every feature must support **better allocation of time toward meaningful long-term work**.

## Product principles

1. Execution over complexity.
2. Track meaningful work, not every aspect of life.
3. Measure time → output → impact. Never optimize for hours worked.
4. Distinguish productive deep thinking from overthinking.
5. AI challenges the user when appropriate; it does not simply praise.
6. Optimize for long-term compounding, not maximum hours.
7. The system must remain useful without AI: no core flow (timer, logging, history) may depend on an AI call succeeding.
8. Single-user UX now, multi-user-ready architecture from the start.
9. Build the smallest useful version first; follow the phase order in PLAN.md.

## AI behavior rules

- Be specific and evidence-based: cite durations, ratios, and prior sessions; end with a concrete next action.
- Identify overthinking, excessive planning, low-value learning, repeated work, and lack of execution, as well as strong patterns.
- Compare what the user **says** (goals, principles), **knows** (documents, notes), and **does** (sessions, outputs).
- Scores are AI-assisted estimates. Never present them as objective measurements.
- No psychological or medical diagnoses.
- Send external providers only the personal context needed for the task.
- Keep prompts versioned and maintainable; keep the provider abstraction clean.

Tone reference:

- Bad: "Great job! You were very productive today."
- Good: "You spent 2h 20m planning this project but only 35m implementing it. Based on previous sessions, additional planning is unlikely to provide proportional value. Start implementing the simplest version."

## Security rules

- Supabase Auth for authentication; RLS on every user-owned table.
- Every user-owned row has `user_id`. Never trust a `user_id` from the client; resolve the authenticated user server-side.
- Never expose API keys or secrets to the client.
- Validate all server-side inputs. Validate uploaded files and restrict their size and type.

## Engineering rules

- Prefer simple solutions. No new infrastructure, microservices, or caching until clearly needed.
- No unnecessary dependencies.
- Strong TypeScript typing; small, composable components; prefer server-side operations when appropriate.
- Keep database queries efficient.
- Test important business logic (durations, metrics, ratios).

Before implementing a feature:

1. Understand the existing architecture.
2. Check related database models.
3. Check existing components and utilities; reuse existing patterns.
4. Avoid duplicate abstractions.
5. Make the smallest change that solves the problem. Do not rewrite working code without a strong reason.

## Code conventions

Simple:

- Write the most direct code that solves the problem. Prefer plain functions and data over classes, patterns, and layers.
- No abstraction until there are at least two real callers. No speculative options, flags, or config for needs that do not exist yet.
- Prefer early returns over nested conditionals. Keep functions short and single-purpose.
- Clear names over clever code; a good name replaces a comment.

Modular:

- One responsibility per file. Group code by feature, not by technical type.
- Keep business logic (durations, metrics, ratios) in pure functions, separate from UI, database, and AI provider code.
- Depend on small explicit interfaces; no circular imports, no catch-all `utils` dumping ground.

No defensive programming:

- Validate at system boundaries only: user input, uploaded files, external API and AI provider responses. Inside the codebase, trust the types.
- No null checks, fallbacks, or default values for cases the types rule out.
- No `try/catch` unless the error is handled meaningfully at that point. Never swallow errors or catch just to log and rethrow; let them propagate.
- No backwards-compatibility shims or dead code paths. Delete unused code instead of keeping it.

Comments:

- Default to no comments. Do not restate what the code does, narrate changes, or leave commented-out code.
- Comment only the non-obvious **why**: a constraint, a workaround, or a surprising decision.

## UI rules

- Clean, fast, minimal, work-focused, data-driven. Avoid dashboard clutter.
- The timer is one of the most prominent interactions.
- Mobile: fast session start/stop, quick category/project selection, minimal typing.
- Desktop: rich analytics, timeline, project view, AI insights, goal progress.

## Definition of done

- Works on mobile and desktop.
- Authentication and security are respected.
- Data persists correctly.
- Loading, error, and empty states exist.
- Core business logic is tested where appropriate.
- UI is consistent with the existing design.
- No unnecessary dependencies introduced.
- Non-obvious implementation is documented.
