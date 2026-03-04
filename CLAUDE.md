# 
## Project

Player Support Assistant (PSA) — full-stack demo for a CCP Games application. Players submit support tickets, AI auto-categorizes and suggests responses, agents review/edit/resolve.

## Stack

- **Backend:** Django REST Framework + PostgreSQL (`backend/`)
- **Frontend:** React + Vite + Tailwind CSS (`frontend/`)
- **AI:** OpenRouter API (`google/gemini-2.0-flash-001`) — NOT Anthropic/Claude
- **Infra:** Docker, GitHub Actions, Render.com (free tier)
- Django serves the React build in production (single service)

## Commands

```bash
# Full stack (Docker)
docker-compose up --build           # Start everything on localhost:8000

# Backend (local dev)
cd backend
python manage.py runserver          # Django on :8000
python manage.py migrate
python manage.py seed_tickets       # Idempotent: clears + re-seeds 12 tickets
python manage.py test

# Frontend (local dev)
cd frontend
npm run dev                         # Vite on :5173, proxies /api → :8000
npm run build                       # Output to frontend/dist/
npx eslint src/ --max-warnings 0

# Linting
cd backend && flake8 . --max-line-length=120 --exclude=migrations,__pycache__
```

## Environment Variables

```
DJANGO_SECRET_KEY=...               # Required in prod, has dev fallback
DATABASE_URL=postgres://...         # Required in prod, falls back to SQLite
OPENROUTER_API_KEY=...              # Optional — tickets work without it, just no AI suggestions
```

## Build Phases

This project is built in 6 sequential phases. See @phases/README.md for overview and locked-in decisions. Each phase file has full specs:

- @phases/phase-1-foundation.md — Monorepo, Docker, Django + Vite scaffold
- @phases/phase-2-backend.md — Ticket model, REST API, seed data
- @phases/phase-3-ai-integration.md — OpenRouter service, auto-categorization
- @phases/phase-4-frontend.md — React UI, dark theme, all views
- @phases/phase-5-production-wiring.md — Django serves React, multi-stage Docker
- @phases/phase-6-cicd-deployment.md — CI/CD, Render.com, README

**Current phase: 4 (Frontend)** — Phases 1–4 are complete and ready to commit.

IMPORTANT: Always check which phase we're on before making changes. Don't pull in work from later phases.

## Working Style

- During planning, always ask followup questions to understand requirements before implementing. Do not guess or predict what I want — ask.
- Minimize assumptions. If something is ambiguous or has multiple valid approaches, clarify first.

## Architecture Rules

- Monorepo: `backend/` (Django) and `frontend/` (React) at project root
- Single Django app: `tickets/` — one `Ticket` model, one ViewSet
- AI service isolated in `backend/tickets/ai_service.py` — not mixed into views
- Seed data is hardcoded — never calls AI API during seeding
- No streaming — AI calls are synchronous, frontend shows spinner then result
- Frontend routing: `/` (dashboard), `/tickets/:id` (detail), `/tickets/new` (create)
- Two status actions: "Mark In Progress" and "Send & Resolve"
- Category badge colors: red=abuse, yellow=billing, blue=gameplay, green=feedback, orange=bug

## Code Style

- Python: flake8, max line length 120, Django conventions
- TypeScript: strict mode, ESLint with React + TS plugins
- ESLint has a strict `react-hooks/set-state-in-effect` rule — no `setState` calls directly in effect bodies. Use `useReducer` with `dispatch` as a workaround.
- No component libraries — Tailwind utility classes only
- No state management libraries — React state + useEffect
- Dark theme: gray-950 backgrounds, gray-800 borders, color only on badges/buttons
- Keep it minimal — this is an internal tool aesthetic, not a marketing site

## Git Rules

IMPORTANT: Everything must look human-written. No co-author lines, no AI-style commit messages, no scaffold boilerplate left behind. Clean up Vite/Django template leftovers (generic READMEs, placeholder titles, unused logos, TypeScript types in JS projects, etc.) before committing.

- Conventional commit style: `feat:`, `fix:`, `chore:`, `docs:`
- Do not commit `.env`, API keys, or secrets
- Do not push to main without confirmation

## Key Decisions (Locked)

- No authentication — demo tool
- Desktop-first — no mobile responsiveness
- Pre-seeded data — app must feel alive on first load, no empty states
- AI suggestions are starting points — agent always has final say
- Free tier deployment — cold start ~30s is acceptable
- Render auto-deploy on push to main
