"""
C3 - Backend API Server for Realtime Traffic Analytics
Receives events from inference engine
Serves latest event to dashboard frontend
Supports multiple cameras
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Global shared state - stores data per camera_id
camera_data = {}  # { "camera_id": { "data": {...}, "last_update": timestamp } }
lock = threading.Lock()


@app.route("/update", methods=["POST"])
def update():
    """
    Inference engine sends data here every frame.
    Expects camera_id in the payload.
    """
    global camera_data
    data = request.json

    # Extract camera_id from payload, default to "default" if not provided
    camera_id = data.get("camera_id", "default")

    with lock:
        camera_data[camera_id] = {
            "data": data,
            "last_update": datetime.now().isoformat(),
        }

    return {"status": "ok", "camera_id": camera_id}, 200


@app.route("/cameras", methods=["GET"])
def get_cameras():
    """
    Returns list of available camera IDs.
    """
    with lock:
        cameras = [
            {"id": camera_id, "last_update": info["last_update"]}
            for camera_id, info in camera_data.items()
        ]
    return jsonify({"cameras": cameras})


@app.route("/latest", methods=["GET"])
def latest():
    """
    Dashboard fetches latest analytics here.
    Accepts optional camera_id query parameter.
    """
    camera_id = request.args.get("camera_id", "default")

    with lock:
        if camera_id in camera_data:
            return jsonify(camera_data[camera_id]["data"])
        else:
            return jsonify({})


if __name__ == "__main__":
    print("[INFO] Starting Backend API on port 5001")
    app.run(host="0.0.0.0", port=5001, debug=False)
