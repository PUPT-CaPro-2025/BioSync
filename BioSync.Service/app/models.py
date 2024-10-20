from . import db
from typing import Optional


class User(db.Model):
    __tablename__ = "users"

    id: int = db.Column(db.Integer, primary_key=True)
    first_name: str = db.Column(db.String, nullable=False)
    middle_name: Optional[str] = db.Column(db.String, nullable=True)
    last_name: str = db.Column(db.String, nullable=False)
    usercode: str = db.Column(db.String, unique=True, nullable=False)
    password: str = db.Column(db.String, nullable=False)
    suffix: Optional[str] = db.Column(db.String, nullable=True)
    email: str = db.Column(db.String, unique=True, nullable=False)
    role: str = db.Column(db.String, nullable=False)


class FaceEncoding(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    user_id: int = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False
    )
    encoding: bytes = db.Column(db.LargeBinary, nullable=False)

    def __init__(self, user_id: int, encoding: bytes) -> None:
        self.user_id = user_id
        self.encoding = encoding
