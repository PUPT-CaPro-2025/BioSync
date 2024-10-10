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

app = Flask(__name__)
CORS(
    app,
    resource={r"*": {"origins": "http://localhost:4200", "supports_credentials": True}},
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
        return jsonify({"status": "error", "message": "name and image are required"}), 400

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
        image_data = image_data.split(",")[1]
        image_data = base64.b64decode(image_data);
        
        image = face_recognition.load_image_file(BytesIO(image_data))
        unknown_face_encodings = face_recognition.face_encodings(image)
        
        if len(unknown_face_encodings) == 0:
            return jsonify({
                "status": "error",
                "message": "No Face Found"
            }), 400
        
        unknown_face_encodings = unknown_face_encodings[0]
        
        students = db.session.execute(
            text('SELECT * FROM schedule_students WHERE schedule_id = :schedule_id'),
            { 'schedule_id': schedule_id }
        ).fetchall()
        
        if len(students) == 0:
            return jsonify({
                "status": "error",
                "message": "No students gathered"
            })
        
        known_face_encodings = []
        known_face_user_id = []
        
        for student in students:
            print(student)
            # index 3 is where student id is 1
            student_id = student[3]
            face_encoding_entry = db.session.query(FaceEncoding).filter(FaceEncoding.user_id == student_id).first()
            if face_encoding_entry:
                known_face_encodings.append(np.frombuffer(face_encoding_entry.encoding))
                known_face_user_id.append(f"{student_id}")
        
        matches = face_recognition.compare_faces(known_face_encodings, unknown_face_encodings)
        response = {"status": "success", "matches": []}
        
        for i, match in enumerate(matches):
            if match:
                response["matches"].append(known_face_user_id[i])
        
        return jsonify(response), 200
        
    except   Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }) , 500
        


if __name__ == '__main__':
    app.run(debug=True)