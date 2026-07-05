# sinhala_learning

I want to learn Sinhalese, and perhaps others do too. This project aims to help those who want to learn.

## MVP

Flashcards for the Sinhala alphabet (consonants + independent vowels), with romanization and a
plain-English pronunciation guide. Flask REST API backend, React (Vite) frontend.

Also includes a Sinhala↔English translation tool, powered by [facebook/nllb-200-distilled-600M](https://huggingface.co/facebook/nllb-200-distilled-600M)
running locally in the backend via Hugging Face `transformers` (no API key needed, works offline
after the first download).

Planned next: audio pronunciation, vowel diacritics/conjuncts, user accounts with spaced repetition.

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

# CPU-only PyTorch build — plain `pip install torch` pulls a much larger CUDA build by default.
pip install torch --index-url https://download.pytorch.org/whl/cpu

pip install -r requirements.txt
cd ..

cd frontend
npm install
cd ..

npm install
```

The translation model (~2.4GB) downloads automatically from Hugging Face the first time you submit
a translation, and is cached in `~/.cache/huggingface` for reuse after that. CPU inference takes a
few seconds per translation.

Optional: to avoid the "unauthenticated requests" warning and get higher download rate limits,
copy `backend/.env.example` to `backend/.env` and paste in a free token from
[huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) (read access is enough).
Not required — it only affects download speed, not translation quality.

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
- `POST /api/translate` — body `{"text": "...", "direction": "en-si" | "si-en"}`, returns `{"translation": "..."}`
