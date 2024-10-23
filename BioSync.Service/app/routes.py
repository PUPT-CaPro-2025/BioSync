from flask import jsonify, request
from . import app, db
from .models import FaceEncoding
import base64
import numpy as np
from io import BytesIO
import face_recognition
from sqlalchemy import text

route_prefix = "/api/v1/flask"


@app.route(f"{route_prefix}/health", methods=["GET"])
def test():
    return jsonify({"status": "OK"})


@app.route(f"{route_prefix}/encode_face", methods=["POST"])
def encode_face():
    data = request.json

    if not data:
        return jsonify({"status": "error", "message": "no request received"})

    user = data.get("user")
    image_data = data.get("image_data")

    if not user or not image_data:
        return (
            jsonify({"status": "error", "message": "user or image required"}),
            400,
        )

    try:
        image_data = image_data.split(",")[1]
        image_data = base64.b64decode(image_data)

        image = face_recognition.load_image_file(BytesIO(image_data))

        face_encodings = face_recognition.face_encodings(image)

        if len(face_encodings) == 0:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "No face found in the image.",
                    }
                ),
                400,
            )

        face_encoding = face_encodings[0]
        face_encoding_bytes = face_encoding.tobytes()

        new_encoding = FaceEncoding(
            user_id=user["id"], encoding=face_encoding_bytes
        )
        db.session.add(new_encoding)
        db.session.commit()

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Face encoding saved successfully.",
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


def get_face_encoding(user_id):
    face_encoding_entry = (
        db.session.query(FaceEncoding)
        .filter(FaceEncoding.user_id == user_id)
        .execution_options(no_cache=True)
        .first()
    )
    if face_encoding_entry:
        return np.frombuffer(face_encoding_entry.encoding)
    return None


@app.route(f"{route_prefix}/recognize_professor", methods=["POST"])
def recognize_professor():
    data = request.json
    
    if not data:
        return jsonify({"status": "error", "message": "No request received"}), 400
    
    professor_id = data.get("professor_id")
    image_data = data.get("image_data")
    
    if not image_data:
        return jsonify({"status": "error", "message": "Image is required"}), 400
    
    try:
        image_data = base64.b64decode(image_data.split(",")[1])
        image = face_recognition.load_image_file(BytesIO(image_data))
        
        face_locations = face_recognition.face_locations(image);
        
        if not face_locations:
            return (
                jsonify({"status": "error", "message": "No Face Found"}),
                400
            )
        
        unknown_face_encoding = face_recognition.face_encodings(
           image, face_locations 
        )[0]
        
        professor_face_encoding = []
        
        face_encoding = get_face_encoding(professor_id)
        
        if face_encoding is not None:
            professor_face_encoding.append(face_encoding)

        if professor_face_encoding:
            matches = face_recognition.compare_faces(
                professor_face_encoding, unknown_face_encoding
            )

            if any(matches):
                return jsonify({"status": "success"}), 200
            else:
                return (
                    jsonify(
                        {"status": "error", "message": "Person Not Recognized"}
                    ),
                    401,
                )
        else: 
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "No face encodings found for students",
                    }
                ),
                400,
            )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route(f"{route_prefix}/recognize_face", methods=["POST"])
def recognize_face():
    data = request.json

    if not data:
        return jsonify({"status": "error", "message": "no request received"})

    schedule_id = data.get("schedule_id")
    image_data = data.get("image_data")

    if not image_data:
        return (
            jsonify({"status": "error", "message": "Image is required"}),
            400,
        )

    try:
        image_data = base64.b64decode(image_data.split(",")[1])
        image = face_recognition.load_image_file(BytesIO(image_data))

        face_locations = face_recognition.face_locations(image)
        if not face_locations:
            return (
                jsonify({"status": "error", "message": "No Face Found"}),
                400,
            )

        unknown_face_encoding = face_recognition.face_encodings(
            image, face_locations
        )[0]

        students = db.session.execute(
            text(
                """SELECT DISTINCT ss.student_id FROM schedule_students ss
                    WHERE ss.schedule_id = :schedule_id"""
            ),
            {"schedule_id": schedule_id},
        ).fetchall()

        if not students:
            return jsonify(
                {"status": "error", "message": "No students gathered"}
            )

        known_face_encodings = []
        known_face_user_ids = []

        for student in students:
            student_id = student[0]
            face_encoding = get_face_encoding(student_id)
            if face_encoding is not None:
                known_face_encodings.append(face_encoding)
                known_face_user_ids.append(str(student_id))

        if known_face_encodings:
            matches = face_recognition.compare_faces(
                known_face_encodings, unknown_face_encoding
            )
            matched_ids = [
                user_id
                for match, user_id in zip(matches, known_face_user_ids)
                if match
            ]

            if len(matched_ids) == 0:
                return (
                    jsonify(
                        {"status": "error", "message": "Person Not Recognized"}
                    ),
                    401,
                )

            return jsonify({"status": "success", "match": matched_ids[0]}), 200
        else:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "No face encodings found for students",
                    }
                ),
                400,
            )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
