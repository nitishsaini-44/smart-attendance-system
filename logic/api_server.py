# Flask API for Face Recognition with MongoDB Integration
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import os
from datetime import datetime
from pymongo import MongoClient

from models.insightface_model import load_model

app = Flask(__name__)
CORS(app)

# MongoDB Connection
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/attendance_system')
client = MongoClient(MONGO_URI)
db = client.get_default_database() if 'attendance_system' in MONGO_URI else client['attendance_system']
students_collection = db['students']

# Load model once at startup (SAFE - runs once per container)
print("🚀 Loading InsightFace model...")
model = load_model()
print("✅ Model loaded successfully!")

THRESHOLD = 0.5


def cosine_similarity(a, b):
    """Calculate cosine similarity between two vectors"""
    a = np.array(a)
    b = np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def decode_base64_image(base64_string):
    """Convert base64 string to OpenCV image"""
    try:
        if not base64_string:
            print("Error: Empty base64 string")
            return None

        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]

        base64_string = base64_string.strip().replace('\n', '').replace('\r', '').replace(' ', '')

        padding = 4 - len(base64_string) % 4
        if padding != 4:
            base64_string += '=' * padding

        img_data = base64.b64decode(base64_string)

        if len(img_data) == 0:
            return None

        nparr = np.frombuffer(img_data, np.uint8)

        if nparr.size == 0:
            return None

        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return None

        return img
    except Exception as e:
        print(f"Error decoding image: {str(e)}")
        return None


def get_all_students_with_embeddings():
    """Get all students who have face embeddings registered"""
    students = students_collection.find({}, {"studentId": 1, "name": 1, "faceEmbedding": 1})

    result = {}
    for student in students:
        embedding = student.get('faceEmbedding')
        if embedding and isinstance(embedding, list) and len(embedding) > 0:
            result[student['studentId']] = {
                "name": student['name'],
                "embedding": np.array(embedding)
            }
    print(f"[DEBUG] Found {len(result)} students with face embeddings")
    return result


@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        client.admin.command('ping')
        students_with_embeddings = get_all_students_with_embeddings()
        student_count = len(students_with_embeddings)
        return jsonify({
            "success": True,
            "message": "Face recognition API is running",
            "database": "MongoDB connected",
            "registeredFaces": student_count
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"API running but database error: {str(e)}"
        }), 500


# ================== IMPORTANT: FIXED STARTUP BLOCK FOR RAILWAY ==================
if __name__ == '__main__':
    print(f"🔗 Connecting to MongoDB: {MONGO_URI}")

    # 🚨 CRITICAL: Railway provides PORT via environment variable
    # If you hardcode 5001, Railway health check fails → container restarts → model reload loop
    port = int(os.environ.get("PORT", 5001))

    print(f"🚀 Starting Face Recognition API on port {port}...")
    
    # 🔥 use_reloader=False prevents double model loading
    app.run(
        host='0.0.0.0',
        port=port,
        debug=False,
        use_reloader=False,
        threaded=True
    )
