# CLAUDE.md — Steam Game Tracker (Team Valve)
# SWE40006 Software Deployment and Evolution — Sem 1 2026

This file tells Claude Code exactly what this project is, how it is structured,
and what the rules are when writing or modifying code.

---

## Project Overview

**App:** Steam Game Tracker — a web dashboard that displays Steam top-selling
games, real-time server status, and runtime instrumentation metrics.

**Stack:**
- Framework: Next.js 14 with TypeScript (App Router)
- Testing: Jest + React Testing Library
- Database: Supabase (client initialised in `lib/supabase.ts`; Steam public API is the current data source)
- Containerisation: Docker (single image built once, deployed everywhere)
- CI/CD: GitHub Actions (triggered on every push to `main`)
- Hosting: Render (Staging + Production web services, both Docker-based; config in `render.yaml`)
- Monitoring: Render native dashboard + `/api/status` instrumentation endpoint

---

## Repository Structure

```
/
├── app/                        # Next.js 14 App Router pages and layouts
│   ├── api/
│   │   ├── health/
│   │   │   └── route.ts        # Health check — returns { status: "ok" }
│   │   ├── games/
│   │   │   └── route.ts        # Steam top-sellers from public Steam API
│   │   └── status/
│   │       └── route.ts        # Instrumentation — uptime, request count, env, version
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Steam Game Tracker homepage
├── components/                 # Reusable React components
│   ├── GameCard.tsx
│   ├── GameTable.tsx
│   └── Header.tsx
├── lib/                        # Supabase client, Steam API helpers, shared utilities
│   ├── steam.ts
│   └── supabase.ts
├── tests/                      # Jest test files (api + component tests)
│   ├── api.test.ts
│   └── components.test.tsx
├── Dockerfile                  # Production Docker image definition
├── render.yaml                 # Render staging + production service definitions
├── .github/
│   └── workflows/
│       └── pipeline.yml        # GitHub Actions CI/CD workflow
├── jest.config.ts
├── tsconfig.json
├── next.config.mjs
└── CLAUDE.md                   # ← This file
```

---

## The Four-Stage CI/CD Pipeline

Every `git push` to `main` triggers the full pipeline automatically.
**No manual steps exist between commit and production.**

```
[1] GitHub (Source Control)
      │  branch protection on main, PR required before merge
      ▼
[2] GitHub Actions (CI/Build)
      │  tsc  →  eslint  →  jest  →  docker build
      │  any failure here stops the pipeline
      ▼
[3] Render Staging (Test Server)
      │  Docker image deployed, smoke test runs against /api/health
      │  image digest verified before promotion
      ▼
[4] Render Production (Live)
         HTTPS, zero-downtime rolling deploy, /api/health monitored
```

---

## Instrumentation Endpoints

These three API routes are required deliverables — do not delete or rename them.

| Route | Purpose | Expected Response Shape |
|---|---|---|
| `/api/health` | Pipeline health check | `{ status: "ok" }` |
| `/api/games` | Steam top-sellers from public API | `{ games: SteamGame[] }` |
| `/api/status` | Runtime instrumentation | `{ status: "ok", uptime_seconds: number, request_count: number, environment: string, version: string }` |
| `/api/servers` | Live server list for all tracked games | `{ servers: { csgo, "7dtd", rust, tf2 } }` or single-game `{ game, label, servers[] }` with `?game=csgo\|7dtd\|rust\|tf2` |
| `/api/market` | Hot-selling skins from Steam Market | `{ game, items: MarketItem[] }` — defaults to CS:GO; supports `?game=csgo\|tf2` and `?count=N` (max 50) |

When modifying `/api/status`, always preserve all five fields.
`uptime_seconds` is seconds since process start. `request_count` is total requests
handled since startup. `environment` reads `process.env.NODE_ENV`. `version` reads
`process.env.APP_VERSION` (defaults to `"1.0.0"`).

---

## Coding Rules

### TypeScript
- Strict mode is enabled in `tsconfig.json` — no `any`, no implicit returns.
- All App Router route handlers must use `NextResponse` for responses.
- Run `tsc --noEmit` before committing to catch type errors locally.

### Testing
- Every new component needs a test in `tests/components.test.tsx`.
- Every new API route needs at least one Jest test covering the happy path in `tests/api.test.ts`.
- Use React Testing Library (`@testing-library/react`) for components.
- Use `jest.mock()` for Supabase calls — never hit the real database in tests.
- Tests must pass with `npm test` before any push.

### Docker
- The `Dockerfile` uses a multi-stage build. Do not collapse the stages.
- Do not add runtime `apt-get` installs to the final stage — keep the image lean.
- Environment variables are injected at runtime via Render env vars, not baked in.
- After any Dockerfile change, verify the image builds locally:
  ```bash
  docker build -t steam-game-tracker .
  docker run -p 3000:3000 steam-game-tracker
  ```

### Database (Supabase)
- The Supabase client is initialised in `lib/supabase.ts` — import from there.
- Never expose `SUPABASE_ANON_KEY` in client-side code.
- All DB access goes through `app/api/` route handlers — never query Supabase
  directly from a React component.

### Styling
- Use CSS classes defined in `app/globals.css` — do not add inline `style={}` props to new code.
- Keep components small — if a component exceeds ~150 lines, split it.

---

## Environment Variables

| Variable | Where used | Required in |
|---|---|---|
| `SUPABASE_URL` | Supabase client (`lib/supabase.ts`) | All environments |
| `SUPABASE_ANON_KEY` | Supabase client (public reads) | All environments |
| `STEAM_API_KEY` | Game server list (`lib/gameServers.ts`) | Render env vars only |
| `NODE_ENV` | `/api/status` instrumentation | Set automatically by Render |
| `APP_VERSION` | `/api/status` instrumentation | Render env vars (defaults to `1.0.0`) |

Set these in the Render dashboard under **Environment → Environment Variables**.
Never commit `.env.local` or any file containing real keys.

---

## GitHub Actions Workflow Rules

File: `.github/workflows/pipeline.yml`

The workflow does exactly this, in order:

1. `npm ci` — install dependencies from lock file
2. `npx tsc --noEmit` — TypeScript check
3. `npm run lint` — ESLint
4. `npm test -- --coverage --ci` — Jest with `--ci` flag (no watch mode)
5. `docker build -t steam-game-tracker .` — build the production image
6. Deploy to **Render Staging** via `RENDER_STAGING_HOOK` secret
7. Smoke test: `curl` against `$STAGING_URL/api/health` — must return HTTP 200
8. Deploy to **Render Production** via `RENDER_PRODUCTION_HOOK` secret (only if smoke test passes)
9. Smoke test: `curl` against `$PRODUCTION_URL/api/health` — must return HTTP 200

Steps 6–9 only run on pushes to `main` (not on pull requests).

Do not reorder these steps. Do not skip any step.
If a step is failing, fix the root cause — do not comment the step out.

Required GitHub secrets: `RENDER_STAGING_HOOK`, `RENDER_PRODUCTION_HOOK`,
`STAGING_URL`, `PRODUCTION_URL`.

---

## Grade-Level Feature Map

Use this to understand which features correspond to which assessment tier.

| Level | What must work |
|---|---|
| **Pass** | 4-stage pipeline runs end-to-end on push to main |
| **Credit** | `/api/status` returns valid JSON; Render dashboard shows CPU + Memory |
| **Distinction** | App is publicly accessible via Render Production HTTPS URL |
| **HD** | Push a code change → browser refresh shows updated production within 5 min, zero manual steps |

---

## Success Metrics (do not break these)

- Pipeline triggers on **100%** of pushes to `main`
- Jest must pass before any deploy proceeds
- Commit → live production update in **≤ 5 minutes**
- Production uptime **≥ 99.9%** (Render health check auto-restarts on failure)
- Docker image digest in Staging **must match** Production (no drift)
- `/api/status` returns valid JSON at all times

---

## Out of Scope — Do Not Implement

- Mobile apps (iOS / Android)
- User authentication or login
- Manual QA / UAT steps
- Self-hosted servers or on-prem infrastructure
- Load balancing, auto-scaling, multi-region
- Payment or subscription features
- Analytics beyond `/api/status`

If asked to add any of the above, decline and explain it is out of scope for this project.

---

## Common Tasks

### Run the app locally
```bash
npm install
# Create .env.local and set SUPABASE_URL, SUPABASE_ANON_KEY, NODE_ENV, APP_VERSION
npm run dev                  # http://localhost:3000
```

### Run tests
```bash
npm test                     # watch mode
npm test -- --ci             # single run (same as CI)
```

### Build and run Docker locally
```bash
docker build -t steam-game-tracker .
docker run -e NODE_ENV=development -p 3000:3000 steam-game-tracker
```

### Trigger a full pipeline run
```bash
git add .
git commit -m "your message"
git push origin main         # GitHub Actions starts automatically
```

Check progress at: `https://github.com/<org>/SWE40006/actions`

---
