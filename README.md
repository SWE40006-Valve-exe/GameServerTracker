# CS Server Tracker

A live web dashboard that tracks CS2 game servers in real time. Built with **Next.js 14** and **Express**, deployed through a fully automated 4-stage CI/CD pipeline on **Render**.

**SWE40006 Software Deployment and Evolution — Team Valve, Semester 1, 2026**

---

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | Next.js 14 (App Router, TypeScript)     |
| Backend    | Express.js (TypeScript)                 |
| Database   | Supabase (Postgres)                     |
| Styling    | Vanilla CSS                             |
| Testing    | Jest + React Testing Library            |
| CI/CD      | GitHub Actions (4-stage pipeline)       |
| Hosting    | Render (Docker — Staging + Production)  |
| Container  | Docker (multi-stage build)              |

---

## Project Structure

```
├── SWE40006-main/          # Next.js frontend + API routes
│   ├── app/                # Pages & API endpoints
│   ├── components/         # React components
│   ├── lib/                # Utility modules (Steam API, Supabase)
│   ├── tests/              # Jest unit & component tests
│   └── Dockerfile
│
├── SWE40006-backend/       # Express.js backend API
│   └── src/
│       ├── routes/         # API route handlers
│       ├── services/       # Business logic
│       └── db/             # Database config
│
├── .github/workflows/
│   └── pipeline.yml        # CI/CD pipeline definition
│
└── render.yaml             # Render deployment config
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v20+
- npm v10+
- [Docker](https://www.docker.com/) (optional, for container builds)

### 1. Clone the repository

```bash
git clone https://github.com/SWE40006-Valve-exe/GameServerTracker.git
cd GameServerTracker
```

### 2. Frontend setup

```bash
cd SWE40006-main
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key_here
STEAM_API_KEY=your_steam_api_key
NODE_ENV=development
APP_VERSION=1.0.0
```

Start the dev server:

```bash
npm run dev
# → http://localhost:3000
```

### 3. Backend setup

```bash
cd SWE40006-backend
npm install
```

Create a `.env` file:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_service_role_key
PORT=4000
```

Start the backend:

```bash
npm run dev
# → http://localhost:4000
```

---

## CI/CD Pipeline

Every push to `main` triggers a fully automated 4-stage pipeline:

```
[1] Source Control   → GitHub (branch protection, PR required)
        ↓
[2] Build & Test     → npm ci → tsc → eslint → jest → docker build
        ↓
[3] Deploy Staging   → Render Docker deploy → smoke test /api/health
        ↓
[4] Deploy Prod      → Render Docker deploy → smoke test /api/health
```

---

## API Endpoints

| Method | Endpoint                          | Description                      |
| ------ | --------------------------------- | -------------------------------- |
| GET    | `/api/health`                     | Health check                     |
| GET    | `/api/status`                     | Uptime, environment, version     |
| GET    | `/api/servers?game=csgo`          | Live server list                 |
| GET    | `/api/games`                      | Steam top-selling games          |
| GET    | `/api/market?game=csgo&count=15`  | Steam Market skins               |
| POST   | `/api/pinned`                     | Pin a server                     |
| DELETE | `/api/pinned?addr=ip:port`        | Unpin a server                   |

---

## Running Tests

```bash
cd SWE40006-main
npm test -- --ci
```

---

## Team

**Team Valve** — SWE40006 Software Deployment and Evolution