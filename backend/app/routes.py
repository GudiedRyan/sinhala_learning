from flask import Blueprint, jsonify, request

from app.models import Card

bp = Blueprint("cards", __name__, url_prefix="/api")


@bp.get("/health")
def health():
    return jsonify({"status": "ok"})


@bp.get("/cards")
def list_cards():
    query = Card.query.order_by(Card.sort_order)

    category = request.args.get("category")
    if category:
        query = query.filter_by(category=category)

    return jsonify([card.to_dict() for card in query.all()])
