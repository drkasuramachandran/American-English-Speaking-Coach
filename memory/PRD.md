# PRD — American English Speaking Coach

## Original Problem Statement
Build a polished, working **frontend-only** prototype that helps users practice
conversational American English through short, interactive speaking exercises.
All AI responses, scoring, and speech recognition are simulated with mock data —
no external APIs, backend, or database. The app must be a **standard,
self-contained React/Vite/TypeScript project** with zero runtime dependency on
Emergent, exportable to GitHub and deployable for free on any static host
(GitHub Pages, Vercel, Netlify, Cloudflare Pages).

## Architecture / Tech Stack
- React 18 + Vite + TypeScript (strict mode); Tailwind CSS; lucide-react; recharts.
- Routing: React Router **HashRouter** (zero-config portability across all static hosts).
- State: local component state + React Context (`AppContext`).
- `vite.config.ts` uses `base: './'`; dev server bound to 0.0.0.0:3000 for the preview.
- No backend / DB / auth / external APIs. Fully static `dist/` build.

## User Persona
- English learners (intermediate) practicing spoken American English for
  interviews, travel, dining, meetings, and everyday conversation — privately,
  without accounts or cost.

## Core Requirements (static)
- Four routes: Dashboard `/`, Practice `/practice/:scenarioId`, Progress
  `/progress`, Settings `/settings`.
- Six scenarios; Job Interview fully scripted (5 turns) end-to-end.
- Simulated mic (recording → ~2.5s transcribing → canned transcript) + text input.
- Per-response feedback: 4 scores + "You said" / "More natural" / "Why".
- Progress: summary stats, skill breakdown, recharts line chart, recent sessions.
- Must build & run via `npm install && npm run build` in a fresh clone.

## Implemented (2026-06)
- [x] Full Vite + React 18 + TS project replacing the CRA starter (2026-06).
- [x] Types (`src/types`), mock data + scripted conversations (`src/data/mockData.ts`).
- [x] AppContext (in-memory session history + daily goal).
- [x] Components: Navbar (desktop + mobile bottom tabs), ScenarioCard, ChatMessage,
      SpeakingButton, FeedbackCard, ScoreCard, ProgressChart.
- [x] Pages: Dashboard, Practice (scripted + generic flows), Progress, Settings.
- [x] README with local dev + deploy instructions; GitHub Pages Actions workflow.
- [x] Type-check + production build both green; static `dist/` verified.
- [x] Frontend E2E tested (100% pass, no bugs) — iteration_1.json.

## Backlog
- P2: Real Speech-to-Text integration at the documented seam in `SpeakingButton.tsx`.
- P2: Real AI scoring replacing `generateGenericFeedback()`.
- P2: Persist session history (localStorage) so progress survives reloads.
- P2: Code-split recharts to shrink the main bundle; silence recharts defaultProps warnings.
- P2: Activate Settings preferences (feedback tone / voice / reminders).

## Next Tasks
- Export to GitHub and connect to a free static host per README.

## Update (2026-10) — improvement pass
- Real STT (Web Speech API) with demo fallback; TTS coach voice + Listen buttons.
- Offline rule-based feedback engine replaces random-jitter scores; scripted feedback only when the user says the demo sentence.
- localStorage persistence (sessions, settings); daily goal + streak computed from real sessions.
- Functional Settings; Progress shows real per-skill averages + empty state; "Finish early", summary, "Practice again / Next scenario".
- Fixes: stray timers leaking across scenarios, mobile input hidden behind bottom nav, UTC date shift, Vite HMR override breaking local dev, CI workflow location, recharts code-split.
