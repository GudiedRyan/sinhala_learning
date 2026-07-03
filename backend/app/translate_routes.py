from flask import Blueprint, jsonify, request

from app.transliterate import transliterate
from app.translation import translate

bp = Blueprint("translate", __name__, url_prefix="/api")

DIRECTIONS = {
    "en-si": ("en", "si"),
    "si-en": ("si", "en"),
}


@bp.post("/translate")
def translate_text():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    direction = data.get("direction")

    if not text:
        return jsonify({"error": "text is required"}), 400
    if direction not in DIRECTIONS:
        return jsonify({"error": "direction must be 'en-si' or 'si-en'"}), 400

    source, target = DIRECTIONS[direction]

    try:
        translation = translate(text, source, target)
    except Exception as exc:
        return jsonify({"error": f"Translation failed: {exc}"}), 500

    pronunciation = transliterate(translation) if target == "si" else None

    return jsonify({"translation": translation, "pronunciation": pronunciation})
