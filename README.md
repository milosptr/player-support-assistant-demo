# Player Support Assistant

A game support tool that uses AI to automatically categorize player tickets
and suggest responses. Built as a demonstration of full-stack development,
DevOps practices, and AI integration.

**[Live Demo](https://psa-xxxx.onrender.com)**
> First load may take ~30 seconds if the service is cold (free tier).

## What It Does

Players submit support tickets. The AI automatically categorizes them
(bug, billing, gameplay, abuse, feedback) and generates a suggested response.
Support agents review the suggestion, edit if needed, and resolve the ticket.

## Tech Stack

- **Backend:** Django REST Framework + PostgreSQL
- **Frontend:** React + Vite + Tailwind CSS
- **AI:** OpenRouter API (Gemini Flash) for ticket categorization and response
- **DevOps:** Docker, GitHub Actions CI/CD, deployed to Render.com

## Run Locally

### With Docker (recommended)

```bash
git clone git@github.com:milosptr/player-support-assistant-demo.git
cd player-support-assistant-demo
cp .env.example .env
# Optionally add your OPENROUTER_API_KEY to .env
docker-compose up --build
```

Visit http://localhost:8000 — the dashboard loads with pre-seeded tickets.

### Without Docker

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_tickets
python manage.py runserver

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173 (Vite proxies API calls to Django).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DJANGO_SECRET_KEY` | Yes (prod) | Django secret key |
| `DATABASE_URL` | Yes (prod) | PostgreSQL connection URL |
| `OPENROUTER_API_KEY` | No | Enables AI categorization for new tickets |

## Project Structure

```
psa/
├── backend/          # Django REST API
│   ├── psa/          # Project config
│   └── tickets/      # Main app (model, API, AI service)
├── frontend/         # React + Vite + Tailwind
│   └── src/
├── Dockerfile        # Multi-stage production build
├── docker-compose.yml
└── .github/workflows/ci.yml
```
