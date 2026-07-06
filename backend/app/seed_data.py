import json
from pathlib import Path

from app import db
from app.models import Card, Phrase

SEED_FILE = Path(__file__).resolve().parent.parent / "seed" / "characters.json"
PHRASES_SEED_FILE = Path(__file__).resolve().parent.parent / "seed" / "phrases.json"


def seed_if_empty():
    if Card.query.first() is not None:
        return

    with open(SEED_FILE, encoding="utf-8") as f:
        characters = json.load(f)

    db.session.bulk_insert_mappings(Card, characters)
    db.session.commit()


def seed_phrases_if_empty():
    if Phrase.query.first() is not None:
        return

    with open(PHRASES_SEED_FILE, encoding="utf-8") as f:
        phrases = json.load(f)

    db.session.bulk_insert_mappings(Phrase, phrases)
    db.session.commit()
