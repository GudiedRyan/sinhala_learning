from flask import Blueprint, jsonify

from app.models import Phrase

bp = Blueprint("phrases", __name__, url_prefix="/api")


@bp.get("/phrases")
def list_phrases():
    query = Phrase.query.order_by(Phrase.sort_order)
    return jsonify([phrase.to_dict() for phrase in query.all()])
