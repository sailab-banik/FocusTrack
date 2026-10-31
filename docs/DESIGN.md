# FocusTrack Design: "Daylight"

The design system and flow for the FocusTrack redesign. Product truth (who it's for, what it must and must not do) lives in [PRODUCT.md](PRODUCT.md); this file covers how it looks, moves and flows.

Status: designed on the FocusTrack Redesign canvas (October 31, 2026) and built, unreleased. Section 9 records what changed in the code.

---

## 1. Direction

**Light, warm and calm, like the first quiet hour of a working day.** The tone borrows from calm journaling apps (The Five Minute Journal): friendly serif headlines, soft color, small illustrations that move when something happens. FocusTrack is still not a journal. The inspiration is tone and craft, not features.

The one idea that runs through everything: **the day as light.** The sky in onboarding and on Today rises from dawn to day; the monthly report is a night sky. Light tells you where you are in time.

Rejected along the way, so nobody walks back into them:

- A bookish ledger metaphor (paper, ink, page turns). Too much of a costume.
- A dark, Linear-style product look. Precise but cold and forgettable.

Principles:

1. **Output over hours.** The comment ("what did you get done?") is typeset in the serif and treated as the most important text on any screen. Durations are secondary.
2. **Two kinds of time, never confused.** Execution and preparation each own a color and a shape, everywhere.
3. **Calm by default, generous at one moment.** Only the running clock breathes. Saving a session is the one celebrated moment.
4. **Honest data.** Sample data is labelled. AI reads are labelled "AI-assisted". Pending things say when they'll arrive instead of faking content.

---

## 2. Color

### Core

| Token | Hex | Use |
|---|---|---|
| `mist` | `#F7F5FB` | Page background |
| `paper` | `#FFFFFF` | Cards, sheets, inputs |
| `wash` | `#F1EEF8` | Hover, wells, secondary buttons, segmented-control tracks |
| `line` | `#E6E2F0` | Input borders, dividers |
| `line-soft` | `#EFECF6` | Row separators inside cards |
| `line-strong` | `#D6D1E6` | Secondary button borders, dashed "add" affordances |
| `ink` | `#1F1B3D` | Primary text (15:1 on mist) |
| `ink-soft` | `#5B5878` | Body and secondary text (6.2:1) |
| `ink-muted` | `#6C6989` | Captions, meta (4.8:1) |
| `indigo` | `#2E2A78` | Primary actions, active tab, brand mark |

Never use pure grey; every neutral is tinted toward lilac.

### Execution and preparation

These two are reserved. They never decorate, and they always come with their shape.

| | Mark/bar | Text | Soft fill | Shape |
|---|---|---|---|---|
| Execution (Tangerine) | `#E8742A` | `#B4511A` | `#FDE7D6` | Square mark (2px radius) |
| Preparation (Periwinkle) | `#5E73E8` | `#4B4FC9` | `#E3E7FD` | Round mark |

Validated with the dataviz palette checker on white: passes lightness band, chroma, colorblind separation (ΔE 28.8) and 3:1 contrast. Split bars always put execution first, with a 2–3px gap between segments.

### Tints (illustration and project tiles only)

Peach `#FFD9C2` · Butter `#FFEFB8` · Mint `#CFF0E1` · Sky `#D6E6FF` · Lilac `#E4DEFF` · Rose `#FFD6DF`

Each project gets a tint for its initial tile. Tints never mean execution or preparation.

### Status

| | Background | Text |
|---|---|---|
| Good / done | Mint `#CFF0E1` | `#1E5C43` |
| Needs attention | Butter `#FFEFB8` | `#6B4E00` |
| New / info | `#E3E7FD` | `#3B3FB0` |
| Destructive text | — | `#B42318` |

Status chips always pair color with an icon or label.

### Sky gradients

| Phase | Gradient (top → bottom) | Used |
|---|---|---|
| Dawn | `#2E2A78 → #6B4FA8 → #D98DA8 → #FFC9A8` | Onboarding welcome |
| Morning | `#FFE3CF → #F8DCEB → #E4DEFF` | Today header, tour, daily report |
| Day | `#D7E8FF → #EDE8FF → #FFF1E4` | Sign-up and setup |
| Night | `#2E2A78 → #4B4FC9` | Monthly report, report-ready card, Settings AI card |

Sun: `#FFB27D` at dawn, `#FF9A5A` in the morning, `#FFC56B` by day, with a blurred glow behind it. Hills: `#D9D1F6` back, `#C4BAF0` front (`#7C5FB0` / `#5A4796` at dawn).

### Chart colors

- Execution vs preparation: the kind colors above.
- Admin report types (a separate categorical set, so kinds keep their meaning): Daily `#2E9C8A`, Weekly `#8B6CE0`, Monthly `#D99A1E`. Gold is below 3:1 on white, so these charts always carry a legend and a table.
- Calendar heatmap (sequential, one hue): `#EEEBFA → #CFC9F5 → #A49BEA → #6E63D6 → #3E33A8` for 0 → 3h+.

---

## 3. Type

| Role | Face | Size / line | Notes |
|---|---|---|---|
| Clock | Young Serif | 104 desktop, 76–80 phone | letter-spacing −0.03em |
| Display | Young Serif | 40–44 / 46–50 | Greetings, page titles |
| Heading | Young Serif | 22–30 | Section and card titles, prompts |
| Comment | Young Serif | 15–18 / 22–25 | Every session comment, goals, "Next" actions |
| Title | Onest 600 | 16–20 | Project names, card labels |
| Body | Onest 400 | 14–16 / 21–24 | |
| Label | Onest 500–600 | 12–13 | Field labels, chips, meta |

- Two families only. Young Serif carries the human moments (greetings, prompts, comments, the clock); Onest carries everything you operate.
- Numbers use tabular figures.
- Sentence case everywhere. No kickers or eyebrows above headings.

Google Fonts: `family=Onest:wght@400;500;600;700&family=Young+Serif`.

---

## 4. Shape, space and depth

- Radius: 12 for controls, 14–16 for primary buttons and inputs, 20–28 for cards and sheets, pills at 999.
- Card shadow: `0 1px 2px rgba(31,27,61,.05), 0 8px 24px rgba(46,42,120,.06)`. Raised (timer, sheets): `0 16px 40px rgba(46,42,120,.10–.16)`.
- Primary button shadow: `0 8px 20px rgba(46,42,120,.25)`.
- Touch targets ≥ 44px; primary phone buttons 56px.
- Desktop shell: 236px sidebar on the mist background; content on mist with white cards, max width ~1160px. Phone: floating white tab bar 66px tall, 14px from the bottom.

---

## 5. Components

- **Buttons.** Primary: indigo fill, white text. Secondary: white with a `line-strong` border. Soft: `wash` fill with indigo text. Ghost: text only.
- **Kind chip.** Soft fill, kind text color and the kind mark ("■ Build", "● Learn").
- **Project tile.** Rounded square in the project's tint with its initial.
- **Session row.** Tile · serif comment · meta line (project · kind mark + category · time range) · duration on the right.
- **Comment field.** Serif input with a periwinkle focus ring and an orange caret. Helper: "One line is enough. It's what your reports read."
- **Split bar.** Execution then preparation, rounded ends, legend underneath with marks.
- **Segmented control.** White pill track; the selected option is filled indigo (or the kind's soft fill when filtering by kind).
- **Sheets and dialogs.** Bottom sheets on phone (28px top radius, grab handle). Centered dialog on desktop (28px radius, dimmed and slightly blurred backdrop).
- **Toast.** Ink-filled pill, bottom-right on desktop and top-center on phone, with a check.
- **Empty and pending states.** Always say what will appear and when. For example: "October's report is written the first time you open FocusTrack after the month ends."

---

## 6. Illustrations

Flat shapes, soft tints, no outlines, drawn as inline SVG.

| Name | Where | What it does |
|---|---|---|
| Morning sky | Today header, daily report | Sun sits where the clock is; clouds drift slowly |
| Dawn sky | Onboarding welcome | Stars twinkle, sun rises from behind the hills |
| Night sky | Monthly report, report-ready card, Settings AI | Crescent moon, twinkling stars |
| Desk | Empty states, new-project card | Steam rises from a mug |
| Note drop | Saving a session | A note falls into a box: "Added to today" |
| Paper plane | Check your inbox | Flies in once |
| Phone | Install card | Bobs gently |

---

## 7. Motion

1. **Settle, don't bounce.** Ease-out `cubic-bezier(.16,1,.3,1)`, 300–500ms. Things arrive from 8–16px below with a short blur (6px → 0).
2. **Only the clock breathes.** A running session pulses one tangerine dot. Skies drift on 18–28s loops. Nothing else loops while you work.
3. **Reward the comment.** Saving a session is the one celebrated moment: the note drops and the new row arrives highlighted, fading from peach.
4. **Direction-aware.** Going forward, content rises; going back, it falls. Progress bars fill one segment per step.
5. **Continuity over cuts.** In onboarding the sky never remounts. Its height (phone) or width (desktop), colors and sun position transition over 1.1–1.5s.
6. **Reduced motion.** Under `prefers-reduced-motion`, every animation jumps to its final state, transitions are off, and count-ups show final numbers.

Signature sequences:

- **Category sort:** chips fly from scattered positions and rotations into the Execution and Preparation groups (950ms, staggered 100ms).
- **Stop and comment:** Stop presses → the screen dims → a sheet slides up → the comment types out with a caret → Save presses with a drawn check → "Added to today".
- **Charts:** bars rise from the baseline, staggered; split bars grow from the left.

---

## 8. Flow and information architecture

### Navigation

| Before | After |
|---|---|
| Timer | **Today**: home, timer, today's sessions, nudges, report-ready card |
| History | **Log**: sessions by day with each day's split; filter by kind |
| Work (goals → projects → categories) | **Projects**: cards with an optional goal; categories move to Settings |
| Review | **Insights**: a Daily / Weekly / Monthly read, each with its own chart |
| Account menu | **Settings**: profile, categories, reports and AI, time, app, account |
| — | **Admin** (admins only): users, AI spend, report health |

Desktop has a sidebar with "Start a session" always on top. Phone has a floating tab bar: Today · Log · Projects · Insights.

### Onboarding: one continuous sunrise

Before sign-in, a story walkthrough, then account creation, then setup inside the app.

1. **Welcome (dawn).** "Hours aren't output." Buttons: "Show me how it works" and "I already have an account".
2. **Tour (morning)**, four pages with Skip and a progress bar. The sun moves across the sky page by page.
   1. *Every session is execution or preparation.* Category chips sort themselves.
   2. *Projects hold your sessions.* Project rows pop in, and their "why" lines type out.
   3. *End each session with one line.* Stop → sheet → comment → saved.
   4. *A weekly read that won't flatter you.* Bars rise, then a headline and a "Next" action.
3. **Make it yours (day).** Google, or an email form that opens in place → **Check your inbox**.
4. **Setup**, two steps:
   1. *What are you working on?* A name (required) with suggestions, and an optional "Why does it matter?"
   2. *What counts as making things?* Tap categories to move them between groups.
5. **Your day starts now.** The first project is pre-filled with one Start button.

Returning users sign in from the welcome screen and never see the tour.

### Sessions

- Start: pick a project tile and a category chip, or tap "start where you left off" on phone.
- Running: a big serif clock, a bar for the current hour, Pause / Resume, "Stop and add a comment", Discard.
- Stop: a single required field, **"What did you get done?"** Save stays disabled until it has text. Energy, difficulty and the separate "worked on" / "outcome" fields are gone.

### Projects

- Projects are primary. A goal is an optional one-line **"Why it matters"** on the project, editable on the card.
- A project without a goal shows "+ Add a goal" and counts as off-goal time.
- Each card shows this week's time, a 4-week split bar, the last comment, Start and See sessions.

### Insights

| Period | Illustration | Chart |
|---|---|---|
| Daily | Morning sky | The day as an hour-by-hour timeline of sessions |
| Weekly | Week of bars | Day-by-day stacked bars you can click, plus where the week went by project |
| Monthly | Night sky | Calendar heatmap of the month you can click, plus where the month went by project; the AI read shows its arrival date until written |

Every report: period, "AI-assisted read" badge, a serif headline, 2–3 findings with evidence, a tangerine "Next" card, and a footnote with the model and when it was written.

### Settings

Section list on the left, cards on the right:

- **Profile:** name, used in the greeting.
- **Categories:** tap to move between groups; add as execution or preparation.
- **Reports and AI:** status, model, what the model sees and what is never sent.
- **Time and days:** time zone; weeks start on Monday.
- **App:** install card.
- **Account:** email, password, sign out.

### Admin

For admins only. Totals and usage, never session comments or project names.

- 7 / 30 / 90-day range.
- Key numbers: people, active, sessions, AI reports, AI spend.
- People active each day; AI spend each day stacked by report type (spikes on Mondays and the 1st).
- Spend by report type table: reports, input and output tokens, per-report cost.
- Editable model pricing ($ per 1M input and output tokens) that recalculates every cost.
- Users table with search, filters (Active, Quiet, New, AI off) and sorting.
- Report health: first-try rate, retries, write time, AI off, recent failures.

---

## 9. What the code needs to change

These follow from the confirmed redesign decisions and are not built yet.

- **Session model (built):** the one required comment is stored in `sessions.outcome`. `description`, `energy`, `difficulty` and `notes` are out of the UI; the columns keep their data until someone decides to retire them.
- **Goals → project "why" (built):** `projects.why` is the optional goal, migrated from linked active goal titles, so projects that shared a goal share the text. "On goals" now means "projects with a why". `public.goals` and `projects.goal_id` are unused and can be dropped later.
- **Navigation:** routes become Today, Log, Projects, Insights, Settings, with categories moving to Settings.
- **Onboarding:** a pre-auth tour route, plus post-confirmation setup (first project and categories) before Today.
- **Fonts and tokens:** replace Archivo and the current kind colors in `globals.css` with the tokens above. CLAUDE.md's UI rules (Archivo only, no toggle) need updating to match.
- **Admin (built):** admins are listed in `ADMIN_EMAILS`, and their email must be confirmed. Token counts and write health are stored per report from now on. New: joined in the last 7 days. Active: a session in the last 7 days. Quiet: none in 14 days or more. Between 7 and 14 days there is no status. The design's "AI off" is per-person, but AI is on or off for the whole app, so that filter is "No reports" instead.
- **Dark theme:** not designed yet. Daylight is light-first; a dark "night" theme would derive from the night-sky palette.

---

## 10. Canvas index

All screens live on the **FocusTrack Redesign** canvas:

- Flow map: the whole journey, from welcome to the four tabs, Settings and Admin, with each card linking to its prototype
- Design sheet: Daylight
- Onboarding: phone (full flow) and desktop (tour and sign-up)
- Today, Log, Projects, Insights and Settings (desktop)
- Today (phone)
- Admin overview
