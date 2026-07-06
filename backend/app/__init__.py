import os

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    os.makedirs(app.instance_path, exist_ok=True)
    db_path = os.path.join(app.instance_path, "cards.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(app, origins=["http://localhost:5173"])
    db.init_app(app)

    from app.routes import bp as cards_bp
    from app.translate_routes import bp as translate_bp
    from app.phrase_routes import bp as phrases_bp

    app.register_blueprint(cards_bp)
    app.register_blueprint(translate_bp)
    app.register_blueprint(phrases_bp)

    with app.app_context():
        db.create_all()
        from app.seed_data import seed_if_empty, seed_phrases_if_empty

        seed_if_empty()
        seed_phrases_if_empty()

    return app
