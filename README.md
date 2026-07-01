# sinhala_learning

I want to learn Sinhalese, and perhaps others do too. This project aims to help those who want to learn.

## MVP

Flashcards for the Sinhala alphabet (consonants + independent vowels), with romanization and a
plain-English pronunciation guide. Flask REST API backend, React (Vite) frontend.

Planned next: audio pronunciation, vowel diacritics/conjuncts, user accounts with spaced repetition,
and an LLM-backed Sinhala↔English translation feature.

## Project structure

```
backend/    Flask API (SQLite via SQLAlchemy, seeded from backend/seed/characters.json)
frontend/   React app (Vite)
```

## Running locally

### One-time setup

```
cd backend
python -m venv .venv
.venv\Scripts\activate      # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cd ..

cd frontend
npm install
cd ..

npm install
```

### Run both servers

```
npm run dev
```

This runs the Flask backend (http://localhost:5000) and the Vite frontend (http://localhost:5173)
together in one terminal, with `[backend]`/`[frontend]` prefixed output. On first run the backend
creates `backend/instance/cards.db` and seeds it from `backend/seed/characters.json`. Open
`http://localhost:5173` in your browser — the Vite dev server proxies `/api/*` requests to Flask.

Press `Ctrl+C` to stop both. You can also run them individually with `npm run dev:backend` /
`npm run dev:frontend`.

## API

- `GET /api/health` — liveness check
- `GET /api/cards` — all flashcards, optionally filtered with `?category=consonant` or `?category=vowel`
