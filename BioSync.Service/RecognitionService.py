import base64
from io import BytesIO

import face_recognition
import numpy as np
from flask import Flask, jsonify, request
from flask.wrappers import json
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from PIL import Image
from sqlalchemy.sql.functions import user
from sqlalchemy import text
from functools import lru_cache

app = Flask(__name__)
CORS(
    app,
    resources={r"*": {"origins": "http://localhost:4200", "supports_credentials": True}},
)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:jhean@localhost/BioSync"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String, nullable=False)
    middle_name = db.Column(db.String, nullable=True)
    last_name = db.Column(db.String, nullable=False)
    usercode = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    suffix = db.Column(db.String, nullable=True)
    email = db.Column(db.String, unique=True, nullable=False)
    role = db.Column(db.String, nullable=False)


class FaceEncoding(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    encoding = db.Column(db.LargeBinary, nullable=False)


with app.app_context():
    db.create_all()


@app.route("/flask/test", methods=["GET"])
def test():
    return jsonify({"message": "Test Working"})

@app.route("/encode_face", methods=["POST"])
def encode_face():
    data = request.json
    user = data.get("user")
    image_data = data.get("image_data")

    if not user or not image_data:
        return jsonify({"status": "error", "message": "user or image required"}), 400

    try:
        image_data = image_data.split(",")[1]
        image_data = base64.b64decode(image_data)

        image = face_recognition.load_image_file(BytesIO(image_data))

        face_encodings = face_recognition.face_encodings(image)

        if len(face_encodings) == 0:
            return jsonify({
                "status": "error",
                "message": "No face found in the image."
            }), 400
        
        face_encoding = face_encodings[0]
        face_encoding_bytes = face_encoding.tobytes()
        
        new_encoding = FaceEncoding(user_id=user['id'], encoding=face_encoding_bytes)
        db.session.add(new_encoding)
        db.session.commit()
        
        return jsonify({"status": "success", "message": "Face encoding saved successfully."}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@lru_cache(maxsize=1000)
def get_face_encoding(user_id):
    face_encoding_entry = db.session.query(FaceEncoding).filter(FaceEncoding.user_id == user_id).first()
    if face_encoding_entry:
        return np.frombuffer(face_encoding_entry.encoding)
    return None

@app.route("/recognize_face", methods=['POST'])
def recognize_face():
    data = request.json
    schedule_id = data.get("schedule_id")
    image_data = data.get('image_data')
    
    if not image_data:
        return jsonify({
            "status": "error",
            "message": "Image is required"
        }), 400
        
    try: 
        image_data = base64.b64decode(image_data.split(",")[1])
        image = face_recognition.load_image_file(BytesIO(image_data))
        
        face_locations = face_recognition.face_locations(image)
        if not face_locations:
            return jsonify({"status": "error", "message": "No Face Found"}), 400
        
        unknown_face_encoding = face_recognition.face_encodings(image, face_locations)[0]
        
        students = db.session.execute(
            text('SELECT DISTINCT ss.student_id FROM schedule_students ss WHERE ss.schedule_id = :schedule_id'),
            {'schedule_id': schedule_id}
        ).fetchall()
        
        if not students:
            return jsonify({"status": "error", "message": "No students gathered"})
        
        known_face_encodings = []
        known_face_user_ids = []
        
        for student in students:
            student_id = student[0]
            face_encoding = get_face_encoding(student_id)
            if face_encoding is not None:
                known_face_encodings.append(face_encoding)
                known_face_user_ids.append(str(student_id))
        
        if known_face_encodings:
            matches = face_recognition.compare_faces(known_face_encodings, unknown_face_encoding)
            matched_ids = [user_id for match, user_id in zip(matches, known_face_user_ids) if match]
        
            if len(matched_ids) == 0:
                return jsonify({ "status": "error", "message": "Person Not Recognized" }), 401  
            
            return jsonify({"status": "success", "match": matched_ids[0]}), 200
        else:
            return jsonify({"status": "error", "message": "No face encodings found for students"}), 400
    except   Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }) , 500
        


if __name__ == '__main__':
    app.run(debug=True)