# FocusTrack — Product Spec and Build Plan

Working rules, guardrails, and the definition of done live in [CLAUDE.md](CLAUDE.md). This file holds what to build and in what order.

Items marked **(proposed)** are not in the original requirements. They are suggested resolutions of gaps and need confirmation; see [Open decisions](#open-decisions).

## 1. Purpose

A personal, work-focused AI intelligence and execution tracker that helps the user answer:

> "Am I using my current time and freedom well, and am I converting my thinking into meaningful execution?"

Tracked: software/career work, learning and skill development, personal projects, music/creative work, and related goals and achievements.

Not tracked: sleep, food, health, location, generic personal habits, personal diary/life events.

## 2. Domain model

Every user-owned entity carries `user_id` and is protected by RLS. Design for multi-user from the start; build single-user UX.

### Goal

A long-term outcome the user wants to achieve.

Examples: become a stronger AI/backend engineer; build meaningful software projects; improve music skills; release original music.

### Project

A concrete project contributing to a goal.

Examples: Personal Work Intelligence System; AI Document Extractor; Song #1.

### Category

The type of work. Configurable per user. Initial set:

| Category | Kind **(proposed)** |
|---|---|
| Build | execution |
| Create | execution |
| Work | execution |
| Practice | execution |
| Learn | preparation |
| Brainstorm | preparation |
| Review | preparation |

The `kind` attribute is proposed because the execution-ratio metric needs to know which categories count as execution. The mapping above is a starting guess and is user-editable.

### Session

A timed piece of work.

| Field | Required | Notes |
|---|---|---|
| Project | yes | |
| Category | yes | |
| Start time | yes | |
| End time | yes | Empty while the timer is running **(proposed)** |
| Duration | yes | Derived from start/end, minus paused time |
| Description of work | yes | |
| Outcome | yes | What was actually produced |
| Energy | no | |
| Difficulty | no | |
| User notes | no | |

### AI evaluation

An evaluation of a completed session. Initial dimensions:

- Output
- Skill growth
- Goal alignment
- Leverage
- Strategic value
- Overall contribution

These are AI-assisted estimates, not objective measurements, and the UI must present them that way.

**(proposed)** Store the provider, model, and prompt version with each evaluation so scores stay comparable when prompts change. Evaluation runs after the session is saved and never blocks saving.

### Todo

Goal/project-oriented and AI-assisted. Not a generic todo application. AI can:

- Create todos
- Prioritize todos
- Complete todos based on session outcomes
- Break large tasks into smaller tasks
- Recommend the next task

### Personal Context Library

Information that helps the AI understand the user. Two separate stores:

- **Structured personal context**: long-term goals, principles, career plans, music goals, mindset, preferences.
- **Unstructured documents**: project documentation, notes, PDFs, text files, reference documents.

Use RAG/vector retrieval (pgvector) only when it is useful.

The AI reasons across three sources and compares them when appropriate:

| Source | Contents |
|---|---|
| What the user says | Goals, principles, priorities, ambitions |
| What the user knows | Documents, notes, technical knowledge, research |
| What the user does | Tracked sessions, outputs, projects, historical activity |

Example:

- Stated goal: become a stronger engineer.
- Observed behavior: 30% learning, 12% building.
- Observation: current behavior may be overly weighted toward consumption.

## 3. Metrics

The system should eventually measure the following. It never optimizes for hours worked.

| Metric | Definition | Source |
|---|---|---|
| Time allocation | How time is distributed across categories/projects | Sessions |
| Output | What was actually produced | Session outcomes |
| Contribution | How strongly the work contributes to the user's goals | AI evaluation |
| Execution ratio | Execution time relative to planning/learning/brainstorming | Sessions + category kind |
| Time to first meaningful output | How long it takes to move from an idea to tangible output | Sessions per project |
| Completion velocity | How quickly meaningful work is completed | Sessions, todos, projects |
| Compounding work | How much work creates reusable or long-term value | AI evaluation (leverage) |
| Goal alignment | How much tracked effort contributes to stated goals | Sessions → projects → goals |
| Future contribution | High-level AI-assisted estimate of how current work contributes to the longer-term direction | AI analysis |

Time allocation, execution ratio, and goal alignment by time are computable without AI and should be built that way.

## 4. AI behavior

The AI should not simply praise. It should:

- Identify overthinking
- Identify excessive planning
- Identify low-value learning
- Identify repeated work
- Identify lack of execution
- Identify strong patterns
- Recommend concrete next actions
- Challenge assumptions when appropriate

It distinguishes productive deep thinking from unproductive hesitation/overthinking, and makes no psychological or medical diagnoses.

Provider access goes through one abstract interface. Candidates: OpenAI, Anthropic, Gemini, Qwen/local Ollama.

## 5. UI

Clean, fast, minimal, work-focused, data-driven. The timer is one of the most prominent interactions. Avoid dashboard clutter.

| Mobile | Desktop |
|---|---|
| Fast session start/stop | Rich analytics |
| Quick category/project selection | Timeline |
| Minimal typing | Project view |
| | AI insights |
| | Goal progress |

### Nudges

In-app only: no push, email, or scheduled reminders. A nudge is computed from tracked sessions when a page renders, states its evidence, and offers one concrete action. None depends on AI.

| Nudge | Shown when | Where |
|---|---|---|
| Take a break | 90 minutes of work without a pause | Running timer, and the tab title |
| Still paused | A pause has lasted 30 minutes | Running timer, and the tab title |
| Pick it back up | A project was worked on at least 2 of the 7 days up to its last session, then left for 3 to 14 days | Timer page, when no session is running |

"Keep going" quiets the break nudge for 30 minutes. A dismissed "pick it back up" nudge stays dismissed for that lapse, on that device.

## 6. Build plan

Build the smallest useful version first. Do not implement the long-term vision at once. Each milestone must meet the definition of done in CLAUDE.md before the next starts.

### Phase 1 — Smallest useful version

| # | Milestone | Done when |
|---|---|---|
| 0 | Scaffold | Next.js + TypeScript + Tailwind + shadcn/ui app runs locally, Supabase project is connected, and CLAUDE.md has real commands |
| 1 | Authentication | User can sign up, sign in, and sign out; unauthenticated users cannot reach app pages; the user is resolved server-side |
| 2 | Categories | Initial categories are seeded for a new user; user can add, rename, and remove them; RLS is verified |
| 3 | Projects | User can create, edit, and archive projects |
| 4 | Timer | User can start and stop a session with project and category in a few taps on mobile; a running timer survives a reload |
| 5 | Session logging | Stopping the timer captures description and outcome, plus optional energy, difficulty, and notes; duration is tested |
| 6 | Session history | User can browse past sessions and edit or delete them |
| 7 | Basic goals | User can create goals and link projects to them |
| 8 | Basic AI evaluation | A completed session receives scores on the six dimensions with a short critical rationale; the app works fully if the AI call fails or no provider is configured |

### Phase 2 — Progressive additions, in order

1. AI todos
2. Personal Context Library
3. RAG
4. Daily/weekly analysis
5. Long-term contribution analytics
6. Multi-user SaaS capabilities
7. Billing

## Open decisions

These are gaps in the requirements. Each has a proposed default that will be used unless changed.

| # | Question | Proposed default |
|---|---|---|
| 1 | Which AI provider is implemented first? | Decided: OpenAI behind the provider interface |
| 2 | Which categories count as execution for the execution ratio? | The `kind` mapping in section 2 |
| 3 | Can a project belong to several goals? | One optional goal per project |
| 4 | Is a session's project mandatory for quick starts? | Yes, as specified; revisit if it slows mobile start |
| 5 | Where does the running timer live? | In the database, so it carries across phone and desktop |
| 6 | Does the timer support pause/resume? | Decided: yes. Paused time is left out of the duration; a session stopped while paused ends when the pause began |
| 7 | Can sessions be added manually after the fact? | Yes, via session history |
| 8 | What does PWA mean for Phase 1? | Installable and responsive; no offline sync |
| 9 | What scale do evaluation scores use? | 1–5 per dimension |
| 10 | Which sign-in methods? | Email-based Supabase Auth |
| 11 | Package manager and test runner? | Decided: pnpm and Vitest |
