# CS:GO Server Tracker

A live web dashboard that tracks CS:GO / CS2 game servers in real time, built with Next.js 14 and deployed through a fully automated 4-stage CI/CD pipeline.

**SWE40006 Software Deployment and Evolution — Team Valve, Sem 1 2026**

---

## Features

- **Live server grid** — fetches CS2 servers from the Steam Server Browser API, refreshed every 30 seconds
- **Grid / List view** — switch between card grid and compact table layout
- **Search, sort & filter** — filter by server name, IP, or map; VAC-only toggle; sort by players, name, or map
- **Pin / bookmark servers** — save favourite servers to Supabase; pinned servers appear at the top with a custom label and tag; click the bookmark icon on any card to pin or unpin instantly
- **Stats bar** — at-a-glance counts for servers found, players online, VAC-secured, unsecured, and pinned
- **Instrumentation endpoints** — `/api/health`, `/api/status`, `/api/servers`, `/api/games`, `/api/market`, `/api/pinned`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Plain CSS (`app/globals.css`) |
| Database | Supabase (pinned servers) |
| Testing | Jest + React Testing Library |
| Container | Docker (multi-stage build) |
| CI/CD | GitHub Actions |
| Hosting | Render (Staging + Production, Docker-based) |

---

## Requirements

### System Requirements

| Tool | Min Version | Notes |
|---|---|---|
| Node.js | 20.x | [nodejs.org](https://nodejs.org) |
| npm | 10.x | Bundled with Node 20 |
| Docker | 24.x | Required for local container builds |
| Git | 2.x | Required for CI/CD |

### Dependencies

```bash
npm install
```

**Production** (`dependencies`):

| Package | Purpose |
|---|---|
| `next` 14.2.5 | React framework — App Router, SSR, API routes |
| `react` ^18 | UI rendering |
| `react-dom` ^18 | DOM bindings |
| `@supabase/supabase-js` ^2 | Supabase client |
| `@supabase/ssr` ^0.10 | Supabase SSR helpers for Next.js App Router |

**Development** (`devDependencies`):

| Package | Purpose |
|---|---|
| `typescript` | Static type checking |
| `eslint` + `eslint-config-next` | Linting |
| `jest` + `ts-jest` | Test runner |
| `jest-environment-jsdom` | Browser-like DOM for component tests |
| `@testing-library/react` + `jest-dom` | Component testing utilities |

---

## Project Structure

```
/
├── app/
│   ├── api/
│   │   ├── health/route.ts       # { status: "ok" }
│   │   ├── status/route.ts       # uptime, request count, env, version
│   │   ├── games/route.ts        # Steam top-selling games
│   │   ├── servers/route.ts      # Live server list (CS:GO, TF2, Rust, 7DTD)
│   │   ├── market/route.ts       # Steam Market hot skins
│   │   └── pinned/route.ts       # POST pin / DELETE unpin a server
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Homepage
├── components/
│   ├── Header.tsx
│   ├── ServerList.tsx            # Grid/list view, pinned section, pin buttons
│   ├── SkinList.tsx
│   └── NewsSection.tsx
├── lib/
│   ├── supabase.ts               # Lazy Supabase client (null-safe, SSR-compatible)
│   ├── pinnedServers.ts          # Read pinned servers from Supabase
│   ├── gameServers.ts            # Steam server browser API
│   ├── market.ts                 # Steam Market API + CS2 news
│   └── steam.ts                  # Steam top-sellers API
├── tests/
│   ├── api.test.ts               # API route tests (mocked external calls)
│   └── components.test.tsx       # React component tests
├── Dockerfile
├── render.yaml
└── .github/workflows/pipeline.yml
```

---

## CI/CD Pipeline

Every push to `main` triggers the full pipeline automatically — no manual steps.

```
[1] GitHub          — source control, branch protection, PR required
        │
        ▼
[2] GitHub Actions  — npm ci → tsc → eslint → jest → docker build
        │  any failure stops the pipeline
        ▼
[3] Render Staging  — Docker deploy → smoke test GET /api/health (must return 200)
        │  image digest verified before promotion
        ▼
[4] Render Prod     — Docker deploy → smoke test GET /api/health
```

Commit to live production in **≤ 5 minutes**.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/SWE40006.git
cd SWE40006
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env.local` in the project root (never commit this file):

```env
# Supabase — https://app.supabase.com → your project → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here

# Steam Web API — https://steamcommunity.com/dev/apikey
STEAM_API_KEY=your_steam_api_key_here

# App
NODE_ENV=development
APP_VERSION=1.0.0
```

> The app starts cleanly without Supabase credentials — the pinned servers section is simply empty until credentials are provided.

### 4. Start the dev server

```bash
npm run dev
# → http://localhost:3000
```

---

## Supabase — Pinned Servers Setup

### 1. Create the table

Run the following in your Supabase **SQL Editor**:

```sql
create table pinned_servers (
  id         uuid        primary key default gen_random_uuid(),
  addr       text        unique not null,  -- e.g. "1.2.3.4:27015"
  label      text,                         -- custom display name
  tag        text,                         -- e.g. "Official", "Surf", "Competitive"
  created_at timestamptz default now()
);
```

### 2. Add Row Level Security policies

RLS is enabled by default. Add these three policies so the app can read, pin, and unpin without authentication:

Go to **Authentication → Policies → pinned_servers → New Policy** and add each:

| Policy name | Command | Role | Expression |
|---|---|---|---|
| `Allow anon select` | SELECT | anon | `true` |
| `Allow anon insert` | INSERT | anon | `true` (With Check) |
| `Allow anon delete` | DELETE | anon | `true` (Using) |

Once set up, the bookmark button on every server card writes directly to Supabase — no page reload required.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check — `{ status: "ok" }` |
| GET | `/api/status` | Uptime, request count, environment, version |
| GET | `/api/servers?game=csgo` | Live servers — `csgo`, `tf2`, `rust`, `7dtd` |
| GET | `/api/games` | Steam top-selling games |
| GET | `/api/market?game=csgo&count=15` | Steam Market hot skins |
| POST | `/api/pinned` | Pin a server — body `{ addr, label?, tag? }` |
| DELETE | `/api/pinned?addr=1.2.3.4:27015` | Unpin a server |

---

## Running Tests

```bash
npm test                        # watch mode
npm test -- --ci                # single run (same flags as CI)
npm test -- --coverage --ci     # with coverage report
```

**50 tests** across API routes and React components. All external calls (Steam API, Supabase) are mocked — no live services required.

---

## Docker

```bash
# Build the production image
docker build -t csgo-server-tracker .

# Run locally
docker run -p 3000:3000 \
  -e STEAM_API_KEY=your_key \
  -e NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key \
  -e NODE_ENV=development \
  csgo-server-tracker
```

---

## Deployment (Render)

Staging and production services are defined in `render.yaml`. Both deploy automatically via GitHub Actions on every push to `main`.

Set the following in the **Render dashboard → Environment** for each service:

| Variable | Description |
|---|---|
| `STEAM_API_KEY` | Steam Web API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `APP_VERSION` | e.g. `1.0.0` |

Required GitHub secrets: `RENDER_STAGING_HOOK`, `RENDER_PRODUCTION_HOOK`, `STAGING_URL`, `PRODUCTION_URL`.

---

## Grade-Level Feature Map

| Level | Requirement |
|---|---|
| Pass | 4-stage pipeline runs end-to-end on push to `main` |
| Credit | `/api/status` returns valid JSON; Render dashboard shows CPU + Memory |
| Distinction | App publicly accessible via Render Production HTTPS URL |
| HD | Push a code change → browser shows updated production within 5 min, zero manual steps |
