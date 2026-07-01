import json
from pathlib import Path

from app import db
from app.models import Card

SEED_FILE = Path(__file__).resolve().parent.parent / "seed" / "characters.json"


def seed_if_empty():
    if Card.query.first() is not None:
        return

    with open(SEED_FILE, encoding="utf-8") as f:
        characters = json.load(f)

    db.session.bulk_insert_mappings(Card, characters)
    db.session.commit()
