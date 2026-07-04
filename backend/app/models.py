from app import db


class Card(db.Model):
    __tablename__ = "cards"

    id = db.Column(db.Integer, primary_key=True)
    sinhala_char = db.Column(db.String(8), nullable=False)
    romanization = db.Column(db.String(32), nullable=False)
    sound_description = db.Column(db.String(256), nullable=False)
    category = db.Column(db.String(16), nullable=False)  # "consonant" | "vowel" | "mahaprana"
    linked_char = db.Column(db.Integer, nullable=True)  # sort_order of the related unaspirated consonant
    sort_order = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "sinhala_char": self.sinhala_char,
            "romanization": self.romanization,
            "sound_description": self.sound_description,
            "category": self.category,
            "linked_char": self.linked_char,
            "sort_order": self.sort_order,
        }
